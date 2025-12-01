import data from './placeholder-images.json';
import { EmergencyType } from '@/types';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  emergencyType: "fire" | "road accident";
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
