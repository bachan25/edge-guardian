import Image from 'next/image';
import { formatRelative } from 'date-fns';
import {
  Car,
  Flame,
  ShieldAlert,
  ShieldCheck,
  Shield,
  MapPin,
  Siren,
  ClipboardCheck,
} from 'lucide-react';
import type { Alert } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const emergencyIcons = {
  fire: Flame,
  'road accident': Car,
  other: Siren,
};

const severityInfo = {
  high: { icon: ShieldAlert, variant: 'destructive', label: 'High' },
  medium: { icon: Shield, variant: 'default', label: 'Medium' },
  low: { icon: ShieldCheck, variant: 'secondary', label: 'Low' },
};

export default function AlertCard({ alert }: { alert: Alert }) {
  const EmergencyIcon = emergencyIcons[alert.emergencyType] || Siren;
  const severityKey = alert.severity.toLowerCase() as keyof typeof severityInfo;
  const {
    icon: SeverityIcon,
    variant: severityVariant,
    label: severityLabel,
  } = severityInfo[severityKey] || severityInfo.medium;
  const timeAgo = formatRelative(new Date(alert.timestamp), new Date());

  return (
    <Card className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{alert.alertMessage}</CardTitle>
          <CardDescription className="capitalize">{timeAgo}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant={severityVariant} className={cn(severityKey === 'medium' && 'bg-accent text-accent-foreground hover:bg-accent/90')}>
                <SeverityIcon className="mr-1 h-3 w-3" />
                {severityLabel}
            </Badge>
            <EmergencyIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video w-full overflow-hidden rounded-md">
            <Image
                src={alert.imageUrl}
                alt={`Incident: ${alert.alertMessage}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                data-ai-hint={alert.emergencyType === 'fire' ? 'building fire' : 'car accident'}
            />
        </div>

        <Separator />

        <div className="grid gap-2 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 text-accent mt-1" />
                 <div>
                    <span className="font-medium text-foreground">Location:</span>
                    <p className="text-foreground/90">{alert.locationDetails || alert.location}</p>
                 </div>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
                <ClipboardCheck className="h-4 w-4 flex-shrink-0 text-accent mt-1" />
                <div>
                  <span className="font-medium text-foreground">Recommended Actions:</span>
                  <p className="text-foreground/90">{alert.recommendedActions}</p>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
