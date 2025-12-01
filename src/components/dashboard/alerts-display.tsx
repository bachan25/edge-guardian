'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, List, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Alert } from '@/types';
import AlertCard from './alert-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

export default function AlertsDisplay({ alerts }: { alerts: Alert[] }) {
  const [filter, setFilter] = useState<SeverityFilter>('all');

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') {
      return alerts;
    }
    return alerts.filter((alert) => alert.severity.toLowerCase() === filter);
  }, [alerts, filter]);

  const severityFilters: {
    label: string;
    value: SeverityFilter;
    icon: React.ElementType;
  }[] = [
    { label: 'All', value: 'all', icon: List },
    { label: 'High', value: 'high', icon: ShieldAlert },
    { label: 'Medium', value: 'medium', icon: Shield },
    { label: 'Low', value: 'low', icon: ShieldCheck },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-headline text-lg">Real-time Alerts</CardTitle>
        <div className="flex items-center space-x-2">
          {severityFilters.map(({ label, value, icon: Icon }) => (
            <Button
              key={value}
              variant={filter === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(value)}
              className={cn(
                'capitalize',
                filter === value && value === 'high' && 'bg-destructive hover:bg-destructive/90',
                filter === value && value === 'medium' && 'bg-accent text-accent-foreground hover:bg-accent/90'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {filteredAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center h-[70vh]">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              No alerts to display
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {alerts.length > 0 && filteredAlerts.length === 0 ? `No ${filter} severity alerts to display.` : 'Generate an alert to see it here.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
