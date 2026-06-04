import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Installs a MySQL BEFORE UPDATE trigger on attendance_records that rejects
 * changes to immutable columns once they are set:
 *   - clock_in_at  (always immutable after INSERT)
 *   - latitude     (always immutable after INSERT)
 *   - longitude    (always immutable after INSERT)
 *   - photo_url    (immutable once a non-NULL value has been written)
 *
 * Allowed mutations: clock_out_at (clock-out), and the FIRST write of photo_url
 * (initial upload). Both pass through without triggering the signal.
 */
export class ImmutabilityTrigger1748764800002 implements MigrationInterface {
  name = 'ImmutabilityTrigger1748764800002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS `trg_attendance_immutable`');

    await queryRunner.query(`
      CREATE TRIGGER trg_attendance_immutable
      BEFORE UPDATE ON attendance_records
      FOR EACH ROW
      BEGIN
        IF (OLD.clock_in_at <> NEW.clock_in_at)
        OR (OLD.photo_url IS NOT NULL AND OLD.photo_url <> NEW.photo_url)
        OR (OLD.latitude  <=> NEW.latitude)  = 0
        OR (OLD.longitude <=> NEW.longitude) = 0
        THEN
          SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Attendance record fields are immutable once set';
        END IF;
      END
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER IF EXISTS `trg_attendance_immutable`');
  }
}
