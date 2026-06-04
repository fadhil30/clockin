import { MigrationInterface, QueryRunner } from "typeorm";

export class AttendanceModeStatus1780577483211 implements MigrationInterface {
    name = '1748764800004AttendanceModeStatus1780577483211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attendance_records\` DROP FOREIGN KEY \`FK_attendance_user\``);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` ADD \`mode\` enum ('HOME', 'OFFICE') NOT NULL DEFAULT 'HOME'`);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` ADD \`status\` enum ('PRESENT', 'LATE', 'LEAVE') NOT NULL DEFAULT 'PRESENT'`);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` ADD CONSTRAINT \`FK_10e9fc7100cb48ace47a91ee1ce\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attendance_records\` DROP FOREIGN KEY \`FK_10e9fc7100cb48ace47a91ee1ce\``);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'PRESENT'`);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` DROP COLUMN \`mode\``);
        await queryRunner.query(`ALTER TABLE \`attendance_records\` ADD CONSTRAINT \`FK_attendance_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
