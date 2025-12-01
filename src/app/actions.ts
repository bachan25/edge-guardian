'use server';

import { generateEmergencyAlert } from '@/ai/flows/generate-emergency-alert';
import { z } from 'zod';
import type { Alert } from '@/types';
import { randomBytes } from 'crypto';
import { sendAlertEmail } from '@/lib/email';

const formSchema = z.object({
  imageDataUri: z.string().min(1, { message: 'Please provide an image.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  recipientEmails: z.string().optional(),
});

export type FormState = {
  success: boolean;
  message: string;
  isNoIncident?: boolean;
  alert?: Alert;
};

// Helper to convert data URI to a Buffer on the server
function dataUriToBuffer(dataUri: string): { buffer: Buffer; contentType: string } {
  const match = dataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URI');
  }
  const contentType = match[1];
  const data = match[2];
  const buffer = Buffer.from(data, 'base64');
  return { buffer, contentType };
}


export async function generateAlertAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    imageDataUri: formData.get('imageDataUri'),
    location: formData.get('location'),
    recipientEmails: formData.get('recipientEmails'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message:
        validatedFields.error.errors[0]?.message ??
        'Invalid input. Please check the fields.',
    };
  }
  
  // Critical: Check for environment variables first
  if (!process.env.EDGE_IMPULSE_API_URL) {
    console.error('Missing Edge Impulse environment variable.');
    return {
      success: false,
      message: 'The image analysis service is not configured. Please set the EDGE_IMPULSE_API_URL environment variable.'
    };
  }

  const { imageDataUri, location, recipientEmails } = validatedFields.data;
  
  let classificationResult;
  try {
      const { buffer } = dataUriToBuffer(imageDataUri);
      const apiFormData = new FormData();
      apiFormData.append('file', new Blob([buffer]), 'image.jpg');

      const apiResponse = await fetch(process.env.EDGE_IMPULSE_API_URL!, {
          method: 'POST',
          headers: {
              'Bypass-Tunnel-Reminder': 'true',
          },
          body: apiFormData,
      });

      if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          console.error('Edge Impulse API Error:', errorText);
          throw new Error(`The analysis service returned an error (status ${apiResponse.status}). Please try again.`);
      }
      
      const responseText = await apiResponse.text();
      if (!responseText) {
          throw new Error('The analysis service returned an empty response.');
      }
      classificationResult = JSON.parse(responseText);

  } catch (error) {
      console.error('Failed to call or parse Edge Impulse API response:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with the analysis service.';
       if (errorMessage.includes('fetch failed')) {
          return {
              success: false,
              message: 'Could not connect to the analysis service. Please check your network connection and try again.'
          }
      }
      return { success: false, message: errorMessage };
  }
  
  try {
    // Step 2: Process classification result
    if (!classificationResult?.result?.classification) {
        console.error('Invalid classification result structure:', classificationResult);
        throw new Error('The analysis service returned an unexpected data structure.');
    }

    const classifications = classificationResult.result.classification;

    let highestClassification = 'No_Incident';
    let highestScore = 0;

    for (const key in classifications) {
        if (classifications[key] > highestScore) {
            highestScore = classifications[key];
            highestClassification = key;
        }
    }

    if (highestClassification === 'No_Incident') {
        return {
            success: true,
            message: 'No incident was detected in the provided image.',
            isNoIncident: true,
        };
    }

    // Step 3: Generate emergency alert using AI flow
    let result;
    try {
        result = await generateEmergencyAlert({
          imageUrl: imageDataUri,
          deviceLocation: location,
        });
    } catch (error) {
        console.error('Error in generateEmergencyAlert flow:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI alert generation.';
        return {
            success: false,
            message: `AI alert generation failed: ${errorMessage}`
        };
    }


    const newAlert: Alert = {
      ...result,
      id: `${Date.now()}-${randomBytes(4).toString('hex')}`,
      timestamp: Date.now(),
      imageUrl: imageDataUri,
      location,
    };
    
    // Step 4: Send email notification
    if (recipientEmails) {
        try {
            await sendAlertEmail(newAlert, recipientEmails);
        } catch (error) {
            console.error('Failed to send notification email:', error);
            // Don't block the UI for this. Return success but add a warning message.
            return {
                success: true,
                message: 'Alert generated, but failed to send email notification. Please check your SMTP configuration.',
                alert: newAlert,
            };
        }
    }


    return {
      success: true,
      message: 'Alert generated successfully.',
      alert: newAlert,
    };
  } catch (error) {
    console.error('Error in generateAlertAction:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      success: false,
      message: errorMessage,
    };
  }
}
