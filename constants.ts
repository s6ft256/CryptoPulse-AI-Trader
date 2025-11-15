
import type { CryptoPair } from './types';

export const CRYPTO_PAIRS: CryptoPair[] = [
  { base: 'BTC', quote: 'USDT', symbol: 'BTC/USDT' },
  { base: 'ETH', quote: 'USDT', symbol: 'ETH/USDT' },
  { base: 'SOL', quote: 'USDT', symbol: 'SOL/USDT' },
  { base: 'BNB', quote: 'USDT', symbol: 'BNB/USDT' },
  { base: 'XRP', quote: 'USDT', symbol: 'XRP/USDT' },
  { base: 'DOGE', quote: 'USDT', symbol: 'DOGE/USDT' },
  { base: 'ADA', quote: 'USDT', symbol: 'ADA/USDT' },
  { base: 'AVAX', quote: 'USDT', symbol: 'AVAX/USDT' },
  { base: 'SHIB', quote: 'USDT', symbol: 'SHIB/USDT' },
  { base: 'DOT', quote: 'USDT', symbol: 'DOT/USDT' },
  { base: 'LINK', quote: 'USDT', symbol: 'LINK/USDT' },
  { base: 'MATIC', quote: 'USDT', symbol: 'MATIC/USDT' },
  { base: 'TRX', quote: 'USDT', symbol: 'TRX/USDT' },
  { base: 'LTC', quote: 'USDT', symbol: 'LTC/USDT' },
  { base: 'BCH', quote: 'USDT', symbol: 'BCH/USDT' },
];

// FIX: Add CURRENCIES
export const CURRENCIES: { code: string; name: string }[] = [
    { code: 'USDT', name: 'Tether' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
];

// FIX: Add CRYPTO_ASSETS
export const CRYPTO_ASSETS: { code: string; name: string }[] = [
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'ETH', name: 'Ethereum' },
  { code: 'SOL', name: 'Solana' },
  { code: 'BNB', name: 'Binance Coin' },
  { code: 'XRP', name: 'Ripple' },
  { code: 'DOGE', name: 'Dogecoin' },
  { code: 'ADA', name: 'Cardano' },
  { code: 'AVAX', name: 'Avalanche' },
  { code: 'SHIB', name: 'Shiba Inu' },
  { code: 'DOT', name: 'Polkadot' },
  { code: 'LINK', name: 'Chainlink' },
  { code: 'MATIC', name: 'Polygon' },
  { code: 'TRX', name: 'Tron' },
  { code: 'LTC', name: 'Litecoin' },
  { code: 'BCH', name: 'Bitcoin Cash' },
];
