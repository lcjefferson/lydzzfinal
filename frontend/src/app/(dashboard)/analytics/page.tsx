'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Bot } from 'lucide-react';
import { useDashboardMetrics, useConversationStats, useLeadStats, useContractsReport, useConsultantReport } from '@/hooks/api/use-analytics';

export default function AnalyticsPage() {
    const { data: metrics } = useDashboardMetrics();
    const { data: convStats } = useConversationStats();
    const { data: leadStats } = useLeadStats();
    const { data: contracts } = useContractsReport();
    const { data: consultants } = useConsultantReport();

    const downloadCSV = (rows: Array<Record<string, unknown>>, filename: string) => {
        const headers = Object.keys(rows[0] || {});
        const csv = [headers.join(','), ...rows.map(r => headers.map(h => String(r[h] ?? '')).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const printPage = () => {
        window.print();
    };

    const kpis = [
        { label: 'Conversas Totais', value: (metrics?.totalConversations ?? 0).toString(), icon: MessageSquare },
        { label: 'Leads Ativos', value: (metrics?.activeLeads ?? 0).toString(), icon: Users },
        { label: 'Mensagens Totais', value: (metrics?.totalMessages ?? 0).toString(), icon: MessageSquare },
        { label: 'Agentes', value: (metrics?.totalAgents ?? 0).toString(), icon: Bot },
    ];

    return (
        <div>
            <Header
                title="Analytics"
                description="Análise detalhada de performance"
                actions={
                    <Button variant="secondary">Exportar Relatório</Button>
                }
            />

            <div className="p-6 space-y-6">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {kpis.map((kpi) => (
                        <Card key={kpi.label} className="p-6 bg-white">
                            <div className="flex items-center justify-between mb-2">
                                <kpi.icon className="h-5 w-5 text-accent-primary" />
                                <span className="text-sm text-success">&nbsp;</span>
                            </div>
                            <p className="text-2xl font-bold text-neutral-900">{kpi.value}</p>
                            <p className="text-sm text-neutral-800">{kpi.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-neutral-900">Conversas por Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(convStats?.byStatus ?? []).map((s) => (
                                    <div key={s.status} className="flex items-center justify-between">
                                        <span className="text-sm capitalize text-neutral-900">{s.status}</span>
                                        <span className="text-sm font-medium text-neutral-900">{s._count.id}</span>
                                    </div>
                                ))}
                                {(!convStats || (convStats.byStatus?.length ?? 0) === 0) && (
                                    <div className="h-32 flex items-center justify-center text-neutral-700">Sem dados</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-neutral-900">Leads por Temperatura</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {(leadStats?.byTemperature ?? []).map((t) => (
                                    <div key={t.temperature} className="flex items-center justify-between">
                                        <span className="text-sm capitalize text-neutral-900">{t.temperature}</span>
                                        <span className="text-sm font-medium text-neutral-900">{t._count.id}</span>
                                    </div>
                                ))}
                                {(!leadStats || (leadStats.byTemperature?.length ?? 0) === 0) && (
                                    <div className="h-32 flex items-center justify-center text-neutral-700">Sem dados</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Relatórios */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-neutral-900">Contratos Fechados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(!contracts || contracts.length === 0) ? (
                            <div className="h-32 flex items-center justify-center text-neutral-700">Sem dados</div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => downloadCSV(
                                        (contracts || []).map(c => ({
                                            id: c.id,
                                            nome: c.name,
                                            consultor: c.assignedTo?.name || '',
                                            email: c.assignedTo?.email || '',
                                            atualizadoEm: new Date(c.updatedAt as unknown as string).toISOString(),
                                        })),
                                        'contratos-fechados.csv'
                                    )}>Exportar CSV</Button>
                                    <Button variant="secondary" onClick={printPage}>Exportar PDF</Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Lead</th>
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Consultor</th>
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Atualizado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(contracts || []).map((c) => (
                                                <tr key={c.id} className="border-b border-border">
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.name}</td>
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.assignedTo?.name || '-'}</td>
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{new Date(c.updatedAt as unknown as string).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-neutral-900">Relatório por Consultor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(!consultants || consultants.length === 0) ? (
                            <div className="h-32 flex items-center justify-center text-neutral-700">Sem dados</div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={() => downloadCSV(
                                        (consultants || []).map(c => ({
                                            consultor: c.name,
                                            email: c.email,
                                            fechados: c.closed,
                                            ativos: c.active,
                                            total: c.total,
                                            conversao: `${c.conversionRate}%`,
                                        })),
                                        'relatorio-consultores.csv'
                                    )}>Exportar CSV</Button>
                                    <Button variant="secondary" onClick={printPage}>Exportar PDF</Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Consultor</th>
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Fechados</th>
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Ativos</th>
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Total</th>
                                                <th className="text-left py-2 px-4 text-sm text-neutral-900">Conversão</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(consultants || []).map((c) => (
                                                <tr key={c.userId} className="border-b border-border">
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.name}</td>
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.closed}</td>
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.active}</td>
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.total}</td>
                                                    <td className="py-2 px-4 text-sm text-neutral-900">{c.conversionRate}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
