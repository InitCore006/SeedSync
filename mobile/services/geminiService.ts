import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyCKRZRDMoE_Cs0lFdAVqU0dLlOeaUZ90Ak';
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Common Gemini AI Service
 * Reusable for various AI features: disease detection, chat, market analysis, etc.
 */
export const geminiService = {
  /**
   * Generate content with custom prompt
   */
  generateContent: async (prompt: string, useProModel: boolean = false): Promise<string> => {
    try {
      const model = genAI.getGenerativeModel({
        model: useProModel ? 'gemini-1.5-pro-latest' : 'gemini-2.5-flash',
      });

      const result = await model.generateContent(prompt);
      return (await result.response).text().trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  },

  /**
   * Generate structured JSON response
   */
  generateJSON: async <T = any>(prompt: string): Promise<T> => {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash', // Best for structured JSON
      });

      const result = await model.generateContent(prompt);
      const text = (await result.response).text().trim();

      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json|```/g, '').trim();

      return JSON.parse(cleaned);
    } catch (error) {
      console.error('Gemini JSON Error:', error);
      throw new Error('Failed to parse AI response. Please try again.');
    }
  },

  /**
   * Farming advice chat
   */
  getFarmingAdvice: async (question: string, context?: string): Promise<string> => {
    const prompt = `
You are a practical farming advisor in India. Keep answers short and actionable (2-3 paragraphs).

${context ? `Context: ${context}\n` : ''}
Question: ${question}

Provide practical advice that Indian farmers can easily implement.`;

    return geminiService.generateContent(prompt);
  },

  /**
   * Analyze crop disease from image description
   */
  analyzeCropDisease: async (
    cropName: string,
    symptoms: string,
    location?: string
  ): Promise<{
    disease: string;
    severity: 'Mild' | 'Moderate' | 'Severe';
    treatment: string[];
    prevention: string[];
  }> => {
    const prompt = `
You are a plant pathologist. Analyze this crop disease:

Crop: ${cropName}
Symptoms: ${symptoms}
${location ? `Location: ${location}` : ''}

Return ONLY valid JSON:
{
  "disease": "disease name",
  "severity": "Mild/Moderate/Severe",
  "treatment": ["step 1", "step 2"],
  "prevention": ["tip 1", "tip 2"]
}`;

    return geminiService.generateJSON(prompt);
  },

  /**
   * Get market insights for crops
   */
  getMarketInsights: async (cropName: string, location: string): Promise<string> => {
    const prompt = `
Provide current market insights for ${cropName} in ${location}, India.
Include: demand trends, price expectations, best selling time.
Keep it concise (2-3 sentences).`;

    return geminiService.generateContent(prompt);
  },
};
