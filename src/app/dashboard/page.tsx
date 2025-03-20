'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import { supabase } from '@/utils/supabase';
import { Tables } from '@/utils/supabase';
import { useAuth } from '@/context/auth-context';

type DashboardMetrics = {
  activeServices: number;
  pendingTickets: number;
  totalOrders: number;
  recentPayments: Tables['payments'][];
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeServices: 0,
    pendingTickets: 0,
    totalOrders: 0,
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      try {
        // Fetch active services
        const { count: activeServicesCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenant_id);

        // Fetch pending tickets
        const { count: pendingTicketsCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenant_id)
          .eq('status', 'pending');

        // Fetch total orders
        const { count: totalOrdersCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', user.tenant_id);

        // Fetch recent payments
        const { data: recentPayments } = await supabase
          .from('payments')
          .select('*')
          .eq('tenant_id', user.tenant_id)
          .order('created_at', { ascending: false })
          .limit(5);

        setMetrics({
          activeServices: activeServicesCount ?? 0,
          pendingTickets: pendingTicketsCount ?? 0,
          totalOrders: totalOrdersCount ?? 0,
          recentPayments: recentPayments ?? [],
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeServices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pendingTickets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>${payment.amount.toFixed(2)}</span>
                    <span className="text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
} 