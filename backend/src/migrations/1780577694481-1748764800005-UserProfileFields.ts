import { MigrationInterface, QueryRunner } from "typeorm";

export class UserProfileFields1780577694481 implements MigrationInterface {
    name = '1748764800005UserProfileFields1780577694481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`job_title\` varchar(150) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`phone\` varchar(20) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`employment_type\` enum ('FULL_TIME', 'PART_TIME', 'CONTRACT') NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`status\` enum ('ACTIVE', 'INVITED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`default_location\` varchar(150) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`joined_at\` date NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`joined_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`default_location\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`employment_type\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`phone\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`job_title\``);
    }

}
