'use client';

import { useEffect, useState, useActionState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Loader2,
  LocateFixed,
  Upload,
  Camera,
  BookImage,
  CheckCircle2,
  Mail,
} from 'lucide-react';

import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types';
import { generateAlertAction, type FormState } from '@/app/actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert as AlertComponent, AlertTitle, AlertDescription } from '@/components/ui/alert';

type IncidentReporterProps = {
  onAlertGenerated: (alert: Alert) => void;
};

const initialState: FormState = { success: false, message: '' };

export default function IncidentReporter({ onAlertGenerated }: IncidentReporterProps) {
  const [imageDataUri, setImageDataUri] = useState<string>('');
  const [location, setLocation] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(generateAlertAction, initialState);
  const [internalState, setInternalState] = useState<FormState>(initialState);

  const stableOnAlertGenerated = useCallback(onAlertGenerated, []);

  useEffect(() => {
    if (state.success && state.alert) {
      stableOnAlertGenerated(state.alert);
      resetFormState(false); // don't reset image
    }
    setInternalState(state);
  }, [state, stableOnAlertGenerated]);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° W`);
          setIsFetchingLocation(false);
        },
        () => {
          setIsFetchingLocation(false);
        }
      );
    } else {
      setIsFetchingLocation(false);
    }
  };

  useEffect(() => {
    fetchLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }

  const handleTabChange = (value: string) => {
    resetFormState();
    if (value === 'webcam') {
      getCameraPermission();
    } else {
      stopCamera();
    }
  }

  const resetFormState = (clearImage = true) => {
    if (clearImage) {
      setImageDataUri('');
    }
    if (formRef.current) {
        const fileInput = formRef.current.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }
    setInternalState(initialState);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInternalState(initialState); // Clear previous messages
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUri(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    resetFormState();
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImageDataUri(dataUri);
      }
    }
  };

  const handleSelectPlaceholder = (image: ImagePlaceholder) => {
    resetFormState();
    setImageDataUri(image.imageUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Report New Incident</CardTitle>
        <CardDescription>
          Upload an image, use your webcam, or select a sample to generate an emergency alert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="grid gap-6">
          <Tabs defaultValue="upload" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4" />Upload</TabsTrigger>
              <TabsTrigger value="webcam"><Camera className="mr-2 h-4 w-4" />Webcam</TabsTrigger>
              <TabsTrigger value="sample"><BookImage className="mr-2 h-4 w-4" />Samples</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="grid gap-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="picture">Upload Image</Label>
                <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
              </div>

            </TabsContent>
            <TabsContent value="webcam" className="grid gap-4 pt-4">
              <div className="relative">
                <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <AlertComponent variant="destructive" className="mt-2">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable camera permissions in your browser settings to use this feature.
                        </AlertDescription>
                    </AlertComponent>
                )}
              </div>
              <Button type="button" onClick={handleCapture} disabled={!hasCameraPermission}>
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
            </TabsContent>
            <TabsContent value="sample" className="grid gap-4 pt-4">
               <div className="grid grid-cols-2 gap-4">
                {PlaceHolderImages.map((image) => (
                  <div
                    key={image.id}
                    className={cn(
                      'relative cursor-pointer rounded-lg border-2 transition-all',
                      imageDataUri === image.imageUrl ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-transparent'
                    )}
                    onClick={() => handleSelectPlaceholder(image)}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.description}
                      width={400}
                      height={300}
                      className="aspect-[4/3] w-full rounded-md object-cover"
                      data-ai-hint={image.imageHint}
                    />
                     <div className="absolute bottom-0 w-full rounded-b-md bg-black/50 p-2">
                       <p className="text-xs text-white">{image.description}</p>
                     </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <input type="hidden" name="imageDataUri" value={imageDataUri} />
          
          {imageDataUri && (
            <div className="grid gap-2">
              <Label>Image Preview</Label>
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image src={imageDataUri} alt="Incident preview" fill className="object-cover" />
              </div>
              {internalState?.isNoIncident && !isPending && (
                <AlertComponent className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Analysis Complete</AlertTitle>
                  <AlertDescription>
                    {internalState.message}
                  </AlertDescription>
                </AlertComponent>
              )}
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="location">Device Location</Label>
            <div className="relative">
              <Input
                id="location"
                name="location"
                placeholder={isFetchingLocation ? 'Fetching location...' : 'e.g., 45.4215° N, 75.6972° W'}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 pr-10"
                required
                disabled={isFetchingLocation}
              />
              <button type="button" onClick={fetchLocation} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Get current location">
                 <LocateFixed className={cn("h-4 w-4 text-muted-foreground", isFetchingLocation && "animate-spin")} />
              </button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="recipientEmails">Recipient Emails (optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="recipientEmails"
                name="recipientEmails"
                type="text"
                placeholder="email1@example.com, email2@example.com"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button type="submit" disabled={isPending || !imageDataUri} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Report Incident'
            )}
          </Button>
            {
                !isPending && !internalState.success && internalState.message && !internalState.isNoIncident && (
                    <AlertComponent variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{internalState.message}</AlertDescription>
                    </AlertComponent>
                )
            }
        </form>
      </CardContent>
    </Card>
  );
}
