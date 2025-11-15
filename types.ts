
export interface CryptoPair {
  base: string;
  quote: string;
  symbol: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema12?: number;
  ema26?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  rsi?: number;
}

// FIX: Added ChartDataPoint interface
export interface ChartDataPoint extends Candle {
  price: number; // usually same as close
  pattern?: {
    name: string;
    type: 'bullish' | 'bearish' | 'neutral';
  };
  bollingerUpper?: number;
  bollingerLower?: number;
  patternMarkerY?: number | null;
}

export type PredictionTrend = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface AIPrediction {
  prediction: PredictionTrend;
  confidence: number;
  priceTarget: number;
  potentialHigh: number;
  potentialLow: number;
  summary: string;
  keyDrivers: string;
  strategy: string;
  quantitativeSentiment: {
    newsScore: number;
    retailPositioning: string;
  };
}

export type OrderType = 'BUY' | 'SELL';
export type OrderMode = 'Market' | 'Limit' | 'Stop-Limit';

export interface Order {
  id: string;
  symbol: string;
  type: OrderType;
  mode: OrderMode;
  price: number; // Limit price for Limit/Stop-Limit, execution price for Market
  amount: number;
  stopPrice?: number; // Trigger price for Stop-Limit
  date: string;
}


// FIX: Added Suggestion enum
export enum Suggestion {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
}

// FIX: Added ForexPrediction interface
export interface ForexPrediction {
  prediction: PredictionTrend;
  confidence: number;
  analysisMode: 'Standard' | 'Adaptive';
  quantitativeSentiment: {
    newsScore: number;
    retailPositioning: string;
  };
  macroOutlook: {
    vix: number;
    yieldSpread: 'Normal' | 'Inverting' | 'Inverted';
  };
  suggestion: Suggestion;
  rationale: string;
  sources?: { web: { uri: string; title: string } }[];
}

// FIX: Added MarketType enum
export enum MarketType {
  FOREX = 'Forex',
  CRYPTO = 'Crypto',
}

// FIX: Added PredictionAnalysis interface
export interface PredictionAnalysis {
  sharpeRatio: number;
  maxDrawdown: string;
  equityCurve: { period: number; profit: number }[];
  performanceSummary: string;
  errorRootCauses: string[];
  recommendedAdjustments: string[];
  expectedOutcome: string;
  reinforcementStrategy: string;
  confidenceEvaluation: string;
}