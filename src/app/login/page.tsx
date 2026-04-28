'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/logo.png';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Insira seu CPF ou E-mail'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      // Se tiver '@', trata como email. Se não, trata como CPF e converte para email interno.
      const isEmail = data.identifier.includes('@');
      const systemEmail = isEmail 
        ? data.identifier 
        : `${data.identifier.replace(/\D/g, '')}@lexfluencia.com`;
        
      await authService.login(systemEmail, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary-800">
        <CardHeader className="space-y-1 text-center flex flex-col items-center pb-6">
          <Image src={logo} alt="Logo fluênciaCAP" width={200} height={80} className="w-auto h-16 mb-4 object-contain" />
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            fluênciaCAP
          </CardTitle>
          <CardDescription>
            Acesso ao sistema educacional
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="identifier">CPF ou E-mail</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Seu CPF ou E-mail cadastrado"
                {...register('identifier')}
                className={errors.identifier ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.identifier && (
                <p className="text-xs text-red-500">{errors.identifier.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input id="password" type="password" {...register('password')} />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center justify-center space-y-2 text-sm">
          <div className="text-gray-500">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-primary-800 hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
