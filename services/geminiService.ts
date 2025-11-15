
import { GoogleGenAI, Type } from '@google/genai';
import type { AIPrediction, CoinScreenerPrediction } from '../types';

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
    technicalIndicators: {
        type: Type.OBJECT,
        description: "Analysis of key technical indicators on the daily chart.",
        properties: {
            rsi14: { type: Type.NUMBER, description: "The current 14-day Relative Strength Index (RSI) value." },
            macdStatus: { type: Type.STRING, description: "A brief summary of the MACD status (e.g., 'Bullish Crossover', 'Bearish Divergence', 'Below Signal Line')." },
            movingAverageSignal: { type: Type.STRING, description: "A brief summary of key moving averages (e.g., 'Price above 50-day MA')." }
        },
        required: ['rsi14', 'macdStatus', 'movingAverageSignal']
    },
    quantitativeSentiment: {
        type: Type.OBJECT,
        description: "Analysis of quantitative sentiment indicators.",
        properties: {
            newsScore: { type: Type.NUMBER, description: "A score from -50 to 50 based on recent news sentiment." },
            retailPositioning: { type: Type.STRING, description: "Summary of retail trader positioning, e.g., '65% Long'." }
        },
        required: ['newsScore', 'retailPositioning']
    },
  },
  required: ['prediction', 'confidence', 'priceTarget', 'potentialHigh', 'potentialLow', 'summary', 'keyDrivers', 'strategy', 'technicalIndicators', 'quantitativeSentiment'],
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
            technicalIndicators: {
                rsi14: isBullish ? 62 : 38,
                macdStatus: isBullish ? 'Bullish Crossover' : 'Below Signal Line',
                movingAverageSignal: isBullish ? 'Price above 50-day MA' : 'Price below 50-day MA',
            },
            quantitativeSentiment: {
                newsScore: isBullish ? 25 : -15,
                retailPositioning: isBullish ? '68% Long' : '72% Short',
            },
        } as AIPrediction);
    }, 2000));
  }


  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are a professional cryptocurrency trading analyst.
    Provide a detailed, expert-level trading forecast for the crypto pair ${pairSymbol} for the next one month (30 days), based on its daily chart.
    The current price is approximately ${lastPrice.toFixed(4)}.

    Your analysis should include:
    1. An overall prediction for the month (BULLISH, BEARISH, or NEUTRAL).
    2. A confidence score for this prediction (0-100).
    3. A specific price target for the end of the 30-day period.
    4. A realistic potential high and potential low for the month.
    5. A summary of your forecast.
    6. An explanation of the key drivers (e.g., market sentiment, technical patterns on daily/weekly charts, upcoming news or events).
    7. A suggested trading/investment strategy for the month.
    8. A summary of key daily technical indicators: the current 14-day RSI value, the MACD status (e.g., 'Bullish Crossover'), and a signal from key moving averages (e.g., 'Price crossing above 50-day MA').
    9. Quantitative sentiment analysis, including a news sentiment score (-50 to 50) and a summary of retail trader positioning (e.g., "65% Long").

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

const coinScreenerSchema = {
    type: Type.OBJECT,
    properties: {
        topPick: {
            type: Type.OBJECT,
            properties: {
                symbol: { type: Type.STRING },
                reasoning: { type: Type.STRING, description: "Detailed reasoning for why this is the top pick for the month." },
                confidence: { type: Type.NUMBER, description: "Confidence score (0-100) for this pick." },
                potentialGain: { type: Type.STRING, description: "Estimated potential percentage gain, e.g., '15-25%'." }
            },
            required: ['symbol', 'reasoning', 'confidence', 'potentialGain']
        },
        contenders: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    symbol: { type: Type.STRING },
                    summary: { type: Type.STRING, description: "A brief, one-sentence summary of why this coin is a contender." }
                },
                required: ['symbol', 'summary']
            }
        },
        marketOverview: { type: Type.STRING, description: "A brief overview of the general crypto market sentiment for the upcoming month." }
    },
    required: ['topPick', 'contenders', 'marketOverview']
};

export const getBestCoinPrediction = async (pairSymbols: string[]): Promise<CoinScreenerPrediction> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set. Returning mock coin screener prediction.");
        return new Promise(resolve => setTimeout(() => {
            resolve({
                topPick: {
                    symbol: "SOL/USDT",
                    reasoning: "Mock: Solana is showing exceptional strength, with high developer activity and growing network usage. Key technical indicators on the daily chart are bullish, and recent news flow has been overwhelmingly positive, suggesting strong upward momentum.",
                    confidence: 88,
                    potentialGain: "30-40%"
                },
                contenders: [
                    { symbol: "BTC/USDT", summary: "Mock: As the market leader, Bitcoin provides a stable foundation and is showing signs of accumulation by large holders." },
                    { symbol: "TON/USDT", summary: "Mock: The Telegram ecosystem integration offers a massive user base and unique utility, driving potential demand." }
                ],
                marketOverview: "Mock: The overall market sentiment is cautiously optimistic. While Bitcoin sets the general tone, specific altcoins with strong fundamentals and narratives are expected to outperform in the short to medium term. Volatility is expected to remain elevated."
            } as CoinScreenerPrediction);
        }, 2500));
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
        You are an expert cryptocurrency market analyst. Your task is to analyze the following list of crypto pairs and determine which single coin has the highest potential for a significant positive price movement over the next 30 days.

        List of pairs to analyze: ${pairSymbols.join(', ')}

        Your analysis must consider technical indicators (like RSI, MACD on daily/weekly charts), fundamental factors (like upcoming upgrades, ecosystem growth, tokenomics), and current market sentiment.

        Provide a structured response that includes:
        1.  Your single "topPick" for the month. Include detailed "reasoning" for your choice, a "confidence" score (0-100), and an estimated "potentialGain" as a percentage range.
        2.  A list of exactly two other "contenders" with a brief "summary" for each.
        3.  A general "marketOverview" of the crypto landscape for the upcoming month.

        Your response MUST be a single, valid, minified JSON object that adheres to the provided schema. Do not include any other text, explanations, or markdown formatting.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: coinScreenerSchema,
                temperature: 0.5,
                thinkingConfig: { thinkingBudget: 16384 }
            },
        });

        const parsedResponse = JSON.parse(response.text);
        // Ensure contenders has at most 2 items
        if (parsedResponse.contenders && parsedResponse.contenders.length > 2) {
            parsedResponse.contenders = parsedResponse.contenders.slice(0, 2);
        }
        return parsedResponse as CoinScreenerPrediction;

    } catch (error) {
        console.error("Error fetching coin screener prediction from Gemini API:", error);
        throw new Error("Failed to get a valid analysis from the AI. The model may be overloaded or the request was malformed.");
    }
};
