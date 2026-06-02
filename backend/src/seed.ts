import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { Role } from './common/enums/role.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  await usersService.create({
    name: 'HR Admin',
    email: 'admin@clockin.com',
    password: 'Admin@123',
    role: Role.ADMIN,
    department: 'HR',
  });

  await usersService.create({
    name: 'John Employee',
    email: 'john@clockin.com',
    password: 'Employee@123',
    role: Role.EMPLOYEE,
    department: 'Engineering',
  });

  console.log('Seed completed');
  await app.close();
}
seed();
