import type { Candle, CryptoPair } from '../types';

const BASE_PRICES: { [key: string]: number } = {
  BTC: 68000, ETH: 3800, SOL: 165, BNB: 600, XRP: 0.52,
  DOGE: 0.16, ADA: 0.45, AVAX: 37, SHIB: 0.000025,
  DOT: 7.2, LINK: 17.5, MATIC: 0.7, TRX: 0.11,
  LTC: 83, BCH: 470,
};

const VOLATILITY: { [key: string]: number } = {
  BTC: 0.015, ETH: 0.02, SOL: 0.04, BNB: 0.025, XRP: 0.03,
  DOGE: 0.05, ADA: 0.035, AVAX: 0.045, SHIB: 0.06,
  DOT: 0.03, LINK: 0.03, MATIC: 0.035, TRX: 0.025,
  LTC: 0.028, BCH: 0.032,
};

export const generateInitialCandles = (pair: CryptoPair, count = 100): Candle[] => {
  const candles: Candle[] = [];
  let lastClose = BASE_PRICES[pair.base] || 100;
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const open = lastClose;
    const volatility = VOLATILITY[pair.base] || 0.03;
    const movement = (Math.random() - 0.49) * open * volatility;
    const close = open + movement;
    
    const high = Math.max(open, close) + Math.random() * open * (volatility / 4);
    const low = Math.min(open, close) - Math.random() * open * (volatility / 4);
    
    const volume = (Math.random() * 1000) + (BASE_PRICES[pair.base] / 1000);

    const date = new Date(now - (count - i) * 60000); // 1-minute candles

    candles.push({
      date: date.toLocaleTimeString('en-GB'),
      open, high, low, close, volume,
    });
    lastClose = close;
  }
  return candles;
};

export const generateNextCandle = (previousCandles: Candle[]): Candle => {
  if (previousCandles.length === 0) {
    return generateInitialCandles({base: 'BTC', quote: 'USDT', symbol: 'BTC/USDT'}, 1)[0];
  }
  const lastCandle = previousCandles[previousCandles.length - 1];
  const lastClose = lastCandle.close;
  const baseAsset = lastCandle.date.split('/')[0] || 'BTC'; // Simple way to guess, not robust
  
  const open = lastClose;
  const volatility = VOLATILITY[baseAsset] || 0.03;
  const movement = (Math.random() - 0.49) * open * volatility;
  const close = open + movement;
  
  const high = Math.max(open, close) + Math.random() * open * (volatility / 4);
  const low = Math.min(open, close) - Math.random() * open * (volatility / 4);
  
  const volume = (Math.random() * 1000) + (BASE_PRICES[baseAsset] / 1000);

  return {
    date: new Date().toLocaleTimeString('en-GB'),
    open, high, low, close, volume,
  };
};
