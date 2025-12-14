'use client';

import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/api/use-users';
import type { CreateUserDto } from '@/types/api';
import { useAuth } from '@/contexts/auth-context';
import { useState } from 'react';

export default function UsersPage() {
  const { user } = useAuth();
  const { data: users } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [form, setForm] = useState<CreateUserDto>({ name: '', email: '', password: '', role: 'consultant' });

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <Header title="Usuários" description="Gerencie consultores e administradores" />
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Lista</h3>
          <div className="space-y-2">
            {(users || []).map((u) => (
              <div key={u.id} className="flex items-center justify-between border border-border rounded-md p-2">
                <div>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-text-secondary">{u.email} • {u.role}</p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => updateUser.mutate({ id: u.id, data: { role: u.role === 'consultant' ? 'admin' : 'consultant' } })}>Alternar Função</Button>
                    <Button size="sm" variant="danger" onClick={() => deleteUser.mutate(u.id)} isLoading={deleteUser.isPending}>Excluir</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Adicionar Usuário</h3>
          {isAdmin ? (
            <div className="space-y-3">
              <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Senha" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <div className="flex gap-2">
                {(['consultant','admin'] as const).map((r) => (
                  <Button key={r} variant={form.role===r? 'primary':'secondary'} onClick={() => setForm({ ...form, role: r })}>{r}</Button>
                ))}
              </div>
              <Button onClick={() => createUser.mutate(form)} isLoading={createUser.isPending}>Criar</Button>
            </div>
          ) : (
            <p className="text-sm text-text-secondary">Apenas administradores podem criar usuários.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
