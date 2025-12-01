'use client';

import { useState, useCallback } from 'react';
import type { Alert } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import IncidentReporter from '@/components/dashboard/incident-reporter';
import AlertsDisplay from '@/components/dashboard/alerts-display';

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const handleAlertGenerated = useCallback((newAlert: Alert) => {
    setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="lg:col-span-4">
            <IncidentReporter onAlertGenerated={handleAlertGenerated} />
          </div>
          <div className="lg:col-span-3">
            <AlertsDisplay alerts={alerts} />
          </div>
        </div>
      </main>
    </div>
  );
}
