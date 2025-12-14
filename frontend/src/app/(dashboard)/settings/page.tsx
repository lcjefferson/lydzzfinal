'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationsForm } from '@/components/settings/integrations-form';
import { useAuth } from '@/contexts/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function SettingsPage() {
    const { user } = useAuth();
    const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: () => api.getUsers(),
        enabled: isAdmin,
    });
    const users = usersQuery.data || [];
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'consultant' as 'admin' | 'manager' | 'consultant' });
    return (
        <div>
            <Header title="Configurações" description="Gerencie suas preferências e conta" />

            <div className="p-6 max-w-4xl space-y-6">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
                        <TabsTrigger value="profile">Perfil</TabsTrigger>
                        <TabsTrigger value="organization">Organização</TabsTrigger>
                        <TabsTrigger value="integrations">Integrações</TabsTrigger>
                        {isAdmin && <TabsTrigger value="users">Usuários</TabsTrigger>}
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6 mt-6">
                        {/* Profile */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Perfil do Usuário</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar fallback="JS" size="lg" />
                                    <Button variant="secondary">Alterar Foto</Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Nome Completo" defaultValue="João Silva" />
                                    <Input label="Email" type="email" defaultValue="joao@empresa.com" />
                                    <Input label="Telefone" defaultValue="+55 11 99999-9999" />
                                    <Input label="Cargo" defaultValue="Admin" />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button>
                                <Save className="h-4 w-4" />
                                Salvar Alterações
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="organization" className="space-y-6 mt-6">
                        {/* Organization */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Organização</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="Nome da Empresa" defaultValue="Minha Empresa" />
                                    <Input label="Plano" defaultValue="Professional" disabled />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="flex justify-end">
                            <Button>
                                <Save className="h-4 w-4" />
                                Salvar Alterações
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="integrations" className="mt-6">
                        <IntegrationsForm />
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="users" className="space-y-6 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Gerenciar Usuários</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Nome" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                                        <Input label="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                                        <Input label="Senha" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Papel</label>
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'manager' | 'consultant' })}
                                                className="input w-full"
                                            >
                                                <option value="consultant">Consultor</option>
                                                <option value="manager">Gerente</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={async () => {
                                            try {
                                                await api.createUser(newUser);
                                                setNewUser({ name: '', email: '', password: '', role: 'consultant' });
                                                void usersQuery.refetch();
                                            } catch {}
                                        }}>Adicionar Usuário</Button>
                                    </div>
                                    <div className="pt-4 border-t border-border">
                                        <p className="text-sm text-text-tertiary mb-2">Usuários da organização</p>
                                        {users.length === 0 ? (
                                            <p className="text-sm text-text-secondary">Sem usuários cadastrados</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {users.map((u) => (
                                                    <div key={u.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                                                        <div>
                                                            <p className="text-sm font-medium text-neutral-900">{u.name}</p>
                                                            <p className="text-xs text-text-tertiary">{u.email} • {u.role}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'Ativo' : 'Inativo'}</Badge>
                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={async () => {
                                                                    try {
                                                                        if (u.id === user?.id) return; // evitar remover a si mesmo
                                                                        await api.deleteUser(u.id);
                                                                        void usersQuery.refetch();
                                                                    } catch {}
                                                                }}
                                                            >
                                                                Excluir
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
