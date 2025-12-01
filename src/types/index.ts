import type { GenerateEmergencyAlertOutput } from '@/ai/flows/generate-emergency-alert';

export type EmergencyType = 'fire' | 'road accident' | 'other';

export type Alert = GenerateEmergencyAlertOutput & {
  id: string;
  timestamp: number;
  imageUrl: string;
  location: string;
};
