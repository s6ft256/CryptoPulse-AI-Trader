import { GoogleGenAI, Type } from '@google/genai';
import type { AIPrediction } from '../types';

const aiPredictionSchema = {
  type: Type.OBJECT,
  properties: {
    prediction: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
    confidence: { type: Type.NUMBER },
    priceTarget: { type: Type.NUMBER, description: "The most likely price target for the end of the next 30 days." },
    potentialHigh: { type: Type.NUMBER, description: "A realistic potential high price within the next 30 days." },
    potentialLow: { type: Type.NUMBER, description: "A realistic potential low price within the next 30 days." },
    summary: { type: Type.STRING, description: "A concise, overall summary of the monthly forecast." },
    keyDrivers: { type: Type.STRING, description: "A paragraph explaining the key factors (technical, fundamental, sentimental) driving this forecast." },
    strategy: { type: Type.STRING, description: "A suggested trading or investment strategy for the upcoming month." },
  },
  required: ['prediction', 'confidence', 'priceTarget', 'potentialHigh', 'potentialLow', 'summary', 'keyDrivers', 'strategy'],
};


export const getAIPrediction = async (pairSymbol: string, lastPrice: number): Promise<AIPrediction> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not set. Returning mock AI prediction.");
    return new Promise(resolve => setTimeout(() => {
        const isBullish = Math.random() > 0.5;
        resolve({
            prediction: isBullish ? 'BULLISH' : 'BEARISH',
            confidence: 75,
            priceTarget: lastPrice * (isBullish ? 1.15 : 0.90),
            potentialHigh: lastPrice * (isBullish ? 1.25 : 1.02),
            potentialLow: lastPrice * (isBullish ? 1.05 : 0.85),
            summary: "Mock: The asset is positioned for a significant move this month, driven by prevailing market sentiment and key technical levels. Volatility is expected.",
            keyDrivers: "Mock: Key drivers include the upcoming protocol upgrade, recent whale activity showing accumulation, and the current price holding strong above the 50-day moving average.",
            strategy: "Mock: A suitable strategy would be to accumulate on dips towards the potential low, with an initial profit target near the monthly price target. Keep a close eye on regulatory news.",
        } as AIPrediction);
    }, 2000));
  }


  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are a professional cryptocurrency trading analyst.
    Provide a detailed, expert-level trading forecast for the crypto pair ${pairSymbol} for the next one month (30 days).
    The current price is approximately ${lastPrice.toFixed(4)}.

    Your analysis should include:
    1. An overall prediction for the month (BULLISH, BEARISH, or NEUTRAL).
    2. A confidence score for this prediction (0-100).
    3. A specific price target for the end of the 30-day period.
    4. A realistic potential high and potential low for the month.
    5. A summary of your forecast.
    6. An explanation of the key drivers (e.g., market sentiment, technical patterns on daily/weekly charts, upcoming news or events).
    7. A suggested trading/investment strategy for the month.

    Your response MUST be a single, valid, minified JSON object that adheres to the provided schema. Do not include any other text or markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: aiPredictionSchema,
        temperature: 0.4,
        thinkingConfig: { thinkingBudget: 8192 }
      },
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as AIPrediction;

  } catch (error) {
    console.error("Error fetching AI prediction from Gemini API:", error);
    throw new Error("Failed to get a valid analysis from the AI. The model may be overloaded or the request was malformed.");
  }
};