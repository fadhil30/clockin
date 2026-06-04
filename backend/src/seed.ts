import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { Role } from './common/enums/role.enum';
import { EmploymentType } from './common/enums/employment-type.enum';
import { UserStatus } from './common/enums/user-status.enum';

const USERS = [
  {
    name: 'Sarah Wijaya',
    email: 'admin@clockin.com',
    password: 'Admin@123',
    role: Role.ADMIN,
    department: 'Human Resources',
    jobTitle: 'HR Manager',
    phone: '+62-811-234-5678',
    employmentType: EmploymentType.FULL_TIME,
    status: UserStatus.ACTIVE,
    defaultLocation: 'Head Office — Jakarta',
    joinedAt: '2022-03-01',
  },
  {
    name: 'John Doe',
    email: 'john@clockin.com',
    password: 'Employee@123',
    role: Role.EMPLOYEE,
    department: 'Engineering',
    jobTitle: 'Software Engineer',
    phone: '+62-812-987-6543',
    employmentType: EmploymentType.FULL_TIME,
    status: UserStatus.ACTIVE,
    defaultLocation: 'Home Office',
    joinedAt: '2023-07-15',
  },
  {
    name: 'Sari Dewi',
    email: 'sari@clockin.com',
    password: 'Employee@123',
    role: Role.EMPLOYEE,
    department: 'Marketing',
    jobTitle: 'Marketing Specialist',
    phone: '+62-813-456-7890',
    employmentType: EmploymentType.FULL_TIME,
    status: UserStatus.ACTIVE,
    defaultLocation: 'Home Office',
    joinedAt: '2024-01-10',
  },
];

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  for (const userData of USERS) {
    const existing = await usersService.findByEmail(userData.email);
    if (existing) {
      console.log(`  skip  ${userData.email} (already exists)`);
    } else {
      await usersService.create(userData);
      console.log(`  added ${userData.email}`);
    }
  }

  console.log('Seed completed');
  await app.close();
}
seed();
