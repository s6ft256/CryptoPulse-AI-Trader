import type { Candle, CryptoPair, MarketData } from '../types';

const BASE_PRICES: { [key: string]: number } = {
  BTC: 68000, ETH: 3800, SOL: 165, BNB: 600, XRP: 0.52,
  DOGE: 0.16, ADA: 0.45, AVAX: 37, SHIB: 0.000025,
  DOT: 7.2, LINK: 17.5, MATIC: 0.7, TRX: 0.11,
  LTC: 83, BCH: 470,
  TON: 7.5, NEAR: 5.5, UNI: 10, ICP: 8.5, FIL: 4.5,
  ETC: 23, XLM: 0.09, ATOM: 6.8, HBAR: 0.07, APT: 6.9,
  ARB: 0.8, VET: 0.025, OP: 1.8, AAVE: 90, GRT: 0.2,
  FTM: 0.6, PEPE: 0.000012, RNDR: 7.7, INJ: 23, MANA: 0.33,
};

const VOLATILITY: { [key: string]: number } = {
  BTC: 0.015, ETH: 0.02, SOL: 0.04, BNB: 0.025, XRP: 0.03,
  DOGE: 0.05, ADA: 0.035, AVAX: 0.045, SHIB: 0.06,
  DOT: 0.03, LINK: 0.03, MATIC: 0.035, TRX: 0.025,
  LTC: 0.028, BCH: 0.032,
  TON: 0.05, NEAR: 0.04, UNI: 0.045, ICP: 0.038, FIL: 0.042,
  ETC: 0.03, XLM: 0.035, ATOM: 0.04, HBAR: 0.03, APT: 0.05,
  ARB: 0.045, VET: 0.035, OP: 0.045, AAVE: 0.04, GRT: 0.04,
  FTM: 0.05, PEPE: 0.08, RNDR: 0.06, INJ: 0.055, MANA: 0.04,
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

export const getMarketDataSnapshot = (pair: CryptoPair): MarketData => {
    const candles = generateInitialCandles(pair, 24); // Use 24 candles for 24h stats
    if (candles.length === 0) {
        // Handle edge case where no candles are generated
        const price = BASE_PRICES[pair.base] || 0;
        return {
            symbol: pair.symbol,
            price,
            change24h: 0,
            high24h: price,
            low24h: price,
            volume24h: 0,
        };
    }
    const lastCandle = candles[candles.length - 1];
    const firstCandle = candles[0];
    
    const high24h = Math.max(...candles.map(c => c.high));
    const low24h = Math.min(...candles.map(c => c.low));
    const volume24h = candles.reduce((acc, c) => acc + c.volume, 0);
    const change24h = firstCandle.open !== 0 ? ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100 : 0;

    return {
      symbol: pair.symbol,
      price: lastCandle.close,
      change24h,
      high24h,
      low24h,
      volume24h,
    };
};
