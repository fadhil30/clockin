import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the initial tables if they don't already exist.
 *
 * EXISTING DEPLOYMENTS: because synchronize:true was previously enabled, your
 * tables already exist. Before running `npm run migration:run`, insert this
 * migration's name into the typeorm_migrations table so it is treated as
 * already applied:
 *
 *   INSERT INTO typeorm_migrations (name, timestamp)
 *   VALUES ('InitialSchema1748764800001', 1748764800001);
 *
 * NEW DEPLOYMENTS: just run `npm run migration:run` — this migration creates
 * both tables from scratch.
 */
export class InitialSchema1748764800001 implements MigrationInterface {
  name = 'InitialSchema1748764800001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`name\` varchar(100) NOT NULL,
        \`email\` varchar(150) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`role\` enum('EMPLOYEE','ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
        \`department\` varchar(100) DEFAULT NULL,
        \`is_active\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_users_email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`attendance_records\` (
        \`id\` int unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` int unsigned NOT NULL,
        \`date\` date NOT NULL,
        \`clock_in_at\` datetime NOT NULL,
        \`clock_out_at\` datetime DEFAULT NULL,
        \`latitude\` decimal(10,7) DEFAULT NULL,
        \`longitude\` decimal(11,7) DEFAULT NULL,
        \`photo_url\` varchar(1000) DEFAULT NULL,
        \`photo_uploaded_at\` datetime DEFAULT NULL,
        \`status\` varchar(255) NOT NULL DEFAULT 'PRESENT',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_attendance_user_date\` (\`user_id\`, \`date\`),
        CONSTRAINT \`FK_attendance_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `attendance_records`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
  }
}
