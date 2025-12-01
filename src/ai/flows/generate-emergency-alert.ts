'use server';

/**
 * @fileOverview Generates a real-time alert with contextual information, including severity and recommended actions, when an emergency is detected in an image.
 *
 * - generateEmergencyAlert - A function that handles the emergency alert generation process.
 * - GenerateEmergencyAlertInput - The input type for the generateEmergencyAlert function.
 * - GenerateEmergencyAlertOutput - The return type for the generateEmergencyAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmergencyAlertInputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "A URL or data URI of an image where an emergency may be detected. Data URI must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  deviceLocation: z.string().describe('The location of the device.'),
});
export type GenerateEmergencyAlertInput = z.infer<typeof GenerateEmergencyAlertInputSchema>;

const GenerateEmergencyAlertOutputSchema = z.object({
  alertMessage: z.string().describe('The generated emergency alert message.'),
  severity: z.string().describe('The severity of the emergency.'),
  recommendedActions: z.string().describe('A detailed, step-by-step guide of actions to take, including precautions and immediate guidance.'),
  emergencyType: z.enum(['fire', 'road accident', 'other']).describe('The type of emergency detected.'),
  locationDetails: z.string().describe('A descriptive summary of the incident location.'),
});
export type GenerateEmergencyAlertOutput = z.infer<typeof GenerateEmergencyAlertOutputSchema>;

export async function generateEmergencyAlert(input: GenerateEmergencyAlertInput): Promise<GenerateEmergencyAlertOutput> {
  return generateEmergencyAlertFlow(input);
}

const getNextActions = ai.defineTool(
  {
    name: 'getNextActions',
    description: 'Generates a detailed, step-by-step guide of actions, precautions, and guidance based on the emergency type and severity.',
    inputSchema: z.object({
      emergencyType: z.string().describe('The type of emergency detected.'),
      severity: z.string().describe('The severity of the emergency.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // This can call any typescript function.
    // Return the recommended actions...
    console.log('Tool called with input:', input);
    if (input.emergencyType === 'road accident') {
      if (input.severity === 'high') {
        return '1. Call emergency services (e.g., 911) immediately. 2. Do not move injured individuals unless they are in immediate danger. 3. Secure the scene by turning on hazard lights. 4. Provide first aid if you are trained and it is safe to do so.';
      } else {
        return '1. Assess the situation for any injuries. 2. Move vehicles to a safe location if possible. 3. Exchange insurance and contact information with other parties. 4. Document the scene with photos.';
      }
    } else if (input.emergencyType === 'fire') {
        return '1. Evacuate the area immediately. 2. Activate the nearest fire alarm. 3. Call the fire department from a safe location. 4. Close doors behind you to slow the spread of fire. Do not use elevators.';
    } else {
      return '1. Assess the situation for immediate dangers. 2. Call for help if needed. 3. Provide assistance to others if it is safe to do so. 4. Follow instructions from emergency personnel when they arrive.';
    }
  }
);

const getLocationDetails = ai.defineTool(
    {
      name: 'getLocationDetails',
      description: 'Provides a descriptive summary of a location based on coordinates.',
      inputSchema: z.object({
        deviceLocation: z.string().describe('The coordinates of the device.'),
      }),
      outputSchema: z.string(),
    },
    async (input) => {
        // In a real app, you would use a reverse geocoding API.
        // For this demo, we'll use another LLM call to generate a plausible, descriptive address.
        const { text } = await ai.generate({
            prompt: `Convert the following coordinates into a plausible, descriptive, human-readable address. For example, "near the old town square" or "on the corner of Main St and 2nd Ave". Coordinates: ${input.deviceLocation}`,
            config: {
                temperature: 0.7 // A little creative
            }
        });
        return text;
    }
);

const prompt = ai.definePrompt({
  name: 'generateEmergencyAlertPrompt',
  input: {schema: GenerateEmergencyAlertInputSchema},
  output: {schema: GenerateEmergencyAlertOutputSchema},
  tools: [getNextActions, getLocationDetails],
  prompt: `You are an AI assistant designed to generate real-time emergency alerts with contextual information.

  An emergency has been detected in an image.
  
  Your task is to:
  1. Analyze the image to determine the type of emergency (e.g., 'fire', 'road accident', or 'other').
  2. Generate a concise and informative alert message based on the image.
  3. Determine the severity of the incident (low, medium, high).
  4. Use the getLocationDetails tool to get a descriptive summary of the incident location.
  5. Use the getNextActions tool to provide a detailed, step-by-step guide of actions to take. This should include precautions and immediate guidance.

  Image: {{media url=imageUrl}}
  Device Location: {{{deviceLocation}}}
  
  Generate the alert.`,
});

const generateEmergencyAlertFlow = ai.defineFlow(
  {
    name: 'generateEmergencyAlertFlow',
    inputSchema: GenerateEmergencyAlertInputSchema,
    outputSchema: GenerateEmergencyAlertOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
