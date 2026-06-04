import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Smartphone, Clock, Shield, MapPin } from 'lucide-react';
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

const DEMO = {
  employee: { email: 'sari@clockin.com', password: 'Employee@123' },
  admin: { email: 'admin@clockin.com', password: 'Admin@123' },
};

const FEATURES = [
  { icon: Clock, text: 'Timestamped clock-in with GPS proof' },
  { icon: Shield, text: 'Immutable attendance records' },
  { icon: MapPin, text: 'Location-verified from anywhere' },
];

type RoleTab = 'employee' | 'admin';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [role, setRole] = useState<RoleTab>('employee');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data.email, data.password);
      setAuth(result.access_token, result.user);
      navigate(result.user.role === Role.ADMIN ? '/admin' : '/dashboard', { replace: true });
    } catch {
      toast.error('Invalid email or password');
    }
  };

  const fillDemo = (type: RoleTab) => {
    setValue('email', DEMO[type].email);
    setValue('password', DEMO[type].password);
    setRole(type);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left brand panel */}
      <div className="login-brand-panel hidden flex-col justify-between p-12 md:flex">
        <div className="login-orb-top" />
        <div className="login-orb-bottom" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/15">
            <Smartphone size={20} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold text-white">ClockIn</p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Attendance</p>
          </div>
        </div>

        {/* Headline + feature chips */}
        <div className="relative">
          <h2 className="mb-6 text-4xl font-extrabold leading-tight text-white">
            Clock in from anywhere,<br />
            <span className="text-accent">with proof in a tap.</span>
          </h2>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white/10">
                  <Icon size={15} className="text-white" />
                </div>
                <p className="text-sm font-medium text-white/80">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/30">© 2026 ClockIn — All rights reserved</p>
      </div>

      {/* Right form column */}
      <div className="flex flex-1 items-center justify-center bg-appbg px-6 py-12">
        <div className="w-full max-w-[392px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primary">
              <Smartphone size={16} className="text-white" />
            </div>
            <p className="font-bold text-foreground">ClockIn</p>
          </div>

          <h1 className="mb-1 text-2xl font-extrabold text-foreground">Welcome back 👋</h1>
          <p className="mb-6 text-sm text-muted-foreground">Sign in to your attendance workspace</p>

          {/* Role segmented control */}
          <div className="mb-6 flex rounded-[10px] bg-muted p-1">
            {(['employee', 'admin'] as RoleTab[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-sm py-2 text-sm font-semibold transition-all ${
                  role === r ? 'bg-white text-primary shadow-1' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {r === 'employee' ? 'Employee' : 'HR Admin'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('email')}
              id="email"
              label="Email"
              type="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              leadingIcon={<Mail size={16} />}
              autoComplete="email"
            />
            <Input
              {...register('password')}
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              leadingIcon={<Lock size={16} />}
              suffix={
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input type="checkbox" className="rounded border-border accent-primary" />
                <span className="text-muted-foreground">Keep me signed in</span>
              </label>
              <button type="button" className="font-semibold text-primary hover:text-primary-600 transition-colors">
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign in as {role === 'employee' ? 'Employee' : 'HR Admin'}
            </Button>
          </form>

          {/* Demo quick access */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Demo Quick Access</span>
            <div className="flex-1 border-t border-border" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fillDemo('employee')}>
              Employee app
            </Button>
            <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fillDemo('admin')}>
              HR console
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
