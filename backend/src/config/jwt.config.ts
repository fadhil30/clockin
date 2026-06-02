import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as any },
});
