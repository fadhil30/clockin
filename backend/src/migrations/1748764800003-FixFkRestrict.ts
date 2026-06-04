import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Changes the attendance_records → users FK from CASCADE to RESTRICT.
 * The entity was updated (onDelete: 'RESTRICT') in P0.4, but the existing
 * DB schema still has CASCADE from the previous synchronize:true era.
 * This migration aligns the DB with the entity.
 */
export class FixFkRestrict1748764800003 implements MigrationInterface {
  name = 'FixFkRestrict1748764800003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find and drop the existing CASCADE FK (name is TypeORM-generated)
    const [rows]: any = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.REFERENTIAL_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'attendance_records'
        AND DELETE_RULE = 'CASCADE'
    `);

    const fkName = rows?.[0]?.CONSTRAINT_NAME ?? rows?.CONSTRAINT_NAME;
    if (fkName) {
      await queryRunner.query(`ALTER TABLE \`attendance_records\` DROP FOREIGN KEY \`${fkName}\``);
    }

    // Add the RESTRICT FK (matches the entity and InitialSchema migration)
    await queryRunner.query(`
      ALTER TABLE \`attendance_records\`
        ADD CONSTRAINT \`FK_attendance_user\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `attendance_records` DROP FOREIGN KEY `FK_attendance_user`');
    await queryRunner.query(`
      ALTER TABLE \`attendance_records\`
        ADD CONSTRAINT \`FK_attendance_user_cascade\`
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
    `);
  }
}
