import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { login } from '../../api/auth.api';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Role } from '../../types/user.types';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data.email, data.password);
      setAuth(result.access_token, result.user);
      navigate(result.user.role === Role.ADMIN ? '/admin' : '/dashboard', { replace: true });
    } catch {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">ClockIn</h1>
        <p className="mb-6 text-sm text-gray-500">Sign in to your account</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register('email')} id="email" label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} />
          <Input {...register('password')} id="password" label="Password" type="password" placeholder="••••••••" error={errors.password?.message} />
          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Sign In</Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
