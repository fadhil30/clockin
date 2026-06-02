import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(department?: string, page = 1, limit = 10) {
    const qb = this.usersRepository.createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    if (department) {
      qb.andWhere('user.department = :department', { department });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getOne();
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepository.create({ ...dto, passwordHash });
    return this.usersRepository.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const updates: Partial<User> & { password?: string } = { ...dto };

    if (dto.password) {
      (updates as any).passwordHash = await bcrypt.hash(dto.password, 12);
      delete (updates as any).password;
    }

    Object.assign(user, updates);
    return this.usersRepository.save(user);
  }

  async softDelete(id: number): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.usersRepository.save(user);
  }
}
