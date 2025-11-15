import React, { useState, useEffect, useRef } from 'react';
import type { MarketData } from '../types';

interface ChartHeaderProps {
  marketData: MarketData | null;
}

const Stat: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
  <div>
    <p className="text-xs text-dark-text-secondary">{label}</p>
    <p className={`text-sm font-mono ${className || 'text-dark-text-primary'}`}>{value}</p>
  </div>
);

export const ChartHeader: React.FC<ChartHeaderProps> = ({ marketData }) => {
  const [priceFlash, setPriceFlash] = useState('');
  // FIX: The useRef hook requires an initial value.
  const prevPriceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (marketData && prevPriceRef.current !== undefined && marketData.price !== prevPriceRef.current) {
      if (marketData.price > prevPriceRef.current) {
        setPriceFlash('bg-accent-green/20');
      } else {
        setPriceFlash('bg-accent-red/20');
      }
      const timer = setTimeout(() => setPriceFlash(''), 300);
      return () => clearTimeout(timer);
    }
  }, [marketData?.price]);

  useEffect(() => {
    if (marketData) {
      prevPriceRef.current = marketData.price;
    }
  }, [marketData?.price]);


  if (!marketData) {
    return (
      <div className="p-4 border-b border-dark-border animate-pulse">
        <div className="h-6 w-1/4 bg-dark-border rounded"></div>
      </div>
    );
  }

  const changeColor = marketData.change24h >= 0 ? 'text-accent-green' : 'text-accent-red';

  return (
    <div className="p-3 border-b border-dark-border flex items-center space-x-6">
      <h2 className="text-xl font-bold text-white">{marketData.symbol}</h2>
      <div className={`px-2 py-1 rounded transition-colors duration-300 ${priceFlash}`}>
        <Stat label="Last Price" value={marketData.price.toFixed(4)} className={`text-lg ${changeColor}`} />
      </div>
      <Stat label="24h Change" value={`${marketData.change24h.toFixed(2)}%`} className={changeColor} />
      <Stat label="24h High" value={marketData.high24h.toFixed(4)} />
      <Stat label="24h Low" value={marketData.low24h.toFixed(4)} />
      <Stat label="24h Volume" value={marketData.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
    </div>
  );
};
