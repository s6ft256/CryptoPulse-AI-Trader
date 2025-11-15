import React, { useState, useEffect, useRef } from 'react';
import type { MarketData } from '../types';

interface ChartHeaderProps {
  marketData: MarketData | null;
}

const Stat: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
  <div className="text-right">
    <p className="text-xs text-dark-text-secondary">{label}</p>
    <p className={`text-sm font-mono ${className || 'text-dark-text-primary'}`}>{value}</p>
  </div>
);

export const ChartHeader: React.FC<ChartHeaderProps> = ({ marketData }) => {
  const [priceFlash, setPriceFlash] = useState('');
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
      <div className="p-3 border-b border-dark-border animate-pulse flex justify-between items-center">
        <div className="h-6 w-1/4 bg-dark-border rounded"></div>
        <div className="flex items-center gap-x-5">
            <div className="h-10 w-24 bg-dark-border rounded-md"></div>
            <div className="h-8 w-px bg-dark-bg"></div>
            <div className="h-8 w-20 bg-dark-border rounded"></div>
            <div className="h-8 w-20 bg-dark-border rounded"></div>
            <div className="h-8 w-20 bg-dark-border rounded"></div>
            <div className="h-8 w-24 bg-dark-border rounded"></div>
        </div>
      </div>
    );
  }

  const changeColor = marketData.change24h >= 0 ? 'text-accent-green' : 'text-accent-red';

  return (
    <div className="p-3 border-b border-dark-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-white">{marketData.symbol}</h2>
      </div>
      <div className="flex items-center gap-x-5">
        <div className={`px-2 py-1 rounded-md transition-colors duration-300 ${priceFlash}`}>
           <p className={`text-xl text-right font-mono font-semibold ${changeColor}`}>{marketData.price.toFixed(4)}</p>
        </div>
        <div className="h-8 w-px bg-dark-border"></div>
        <Stat label="24h Change" value={`${marketData.change24h.toFixed(2)}%`} className={changeColor} />
        <Stat label="24h High" value={marketData.high24h.toFixed(4)} />
        <Stat label="24h Low" value={marketData.low24h.toFixed(4)} />
        <Stat label="24h Volume" value={marketData.volume24h.toLocaleString(undefined, { maximumFractionDigits: 0 })} />
      </div>
    </div>
  );
};
