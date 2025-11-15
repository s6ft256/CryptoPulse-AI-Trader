import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { OrderType, CryptoPair, MarketData, OrderMode, Order } from '../types';

interface TradePanelProps {
  selectedPair: CryptoPair;
  marketData: MarketData | null;
  onPlaceOrder: (orderParams: Omit<Order, 'id' | 'symbol' | 'date'>) => void;
}

export const TradePanel: React.FC<TradePanelProps> = ({ selectedPair, marketData, onPlaceOrder }) => {
  const [activeTab, setActiveTab] = useState<OrderType>('BUY');
  const [orderMode, setOrderMode] = useState<OrderMode>('Limit');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [priceFlash, setPriceFlash] = useState('');
  const prevPriceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (marketData?.price) {
      setPrice(marketData.price.toFixed(4));
      setStopPrice(marketData.price.toFixed(4));
    } else {
      setPrice('');
      setStopPrice('');
    }
  }, [marketData?.symbol]);

  useEffect(() => {
    if (marketData && prevPriceRef.current !== undefined && marketData.price !== prevPriceRef.current) {
      setPriceFlash(marketData.price > prevPriceRef.current ? 'bg-accent-green/20' : 'bg-accent-red/20');
      const timer = setTimeout(() => setPriceFlash(''), 300);
      return () => clearTimeout(timer);
    }
  }, [marketData?.price]);

  useEffect(() => {
    if (marketData) {
      prevPriceRef.current = marketData.price;
    }
  }, [marketData?.price]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceNum = parseFloat(price);
    const amountNum = parseFloat(amount);
    const stopPriceNum = parseFloat(stopPrice);

    if (!amountNum || amountNum <= 0) return;

    let orderParams: Omit<Order, 'id' | 'symbol' | 'date'> | null = null;

    switch (orderMode) {
        case 'Market':
            if (marketData?.price) {
                orderParams = { type: activeTab, mode: 'Market', price: marketData.price, amount: amountNum };
            }
            break;
        case 'Limit':
            if (priceNum > 0) {
                orderParams = { type: activeTab, mode: 'Limit', price: priceNum, amount: amountNum };
            }
            break;
        case 'Stop-Limit':
            if (priceNum > 0 && stopPriceNum > 0) {
                orderParams = { type: activeTab, mode: 'Stop-Limit', price: priceNum, amount: amountNum, stopPrice: stopPriceNum };
            }
            break;
    }
    
    if (orderParams) {
      onPlaceOrder(orderParams);
    }
  };
  
  const total = useMemo(() => {
    const priceToCalc = orderMode === 'Market' ? marketData?.price : parseFloat(price);
    const amountNum = parseFloat(amount);
    if (priceToCalc && amountNum) {
        return (priceToCalc * amountNum).toFixed(2);
    }
    return '0.00';
  }, [price, amount, orderMode, marketData]);

  const marketPriceDisplay = marketData ? marketData.price.toFixed(4) : '---';
  const changeColor = marketData ? (marketData.change24h >= 0 ? 'text-accent-green' : 'text-accent-red') : 'text-dark-text-primary';

  return (
    <div className="bg-dark-surface h-full p-3 flex flex-col">
      <div className="flex border-b border-dark-border">
        <button
          onClick={() => setActiveTab('BUY')}
          className={`flex-1 p-2 text-sm font-bold ${activeTab === 'BUY' ? 'text-accent-green border-b-2 border-accent-green' : 'text-dark-text-secondary'}`}
        >
          BUY
        </button>
        <button
          onClick={() => setActiveTab('SELL')}
          className={`flex-1 p-2 text-sm font-bold ${activeTab === 'SELL' ? 'text-accent-red border-b-2 border-accent-red' : 'text-dark-text-secondary'}`}
        >
          SELL
        </button>
      </div>
      <div className={`flex justify-between items-center my-2 p-2 rounded transition-colors duration-300 ${priceFlash}`}>
        <span className="text-sm text-dark-text-secondary">Market Price</span>
        <span className={`text-lg font-mono font-bold ${changeColor}`}>{marketPriceDisplay}</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex rounded-md bg-dark-bg p-1 text-xs">
          {(['Limit', 'Market', 'Stop-Limit'] as OrderMode[]).map((mode) => (
              <button
                  type="button"
                  key={mode}
                  onClick={() => setOrderMode(mode)}
                  className={`flex-1 p-1 rounded transition-colors ${orderMode === mode ? 'bg-dark-border text-white font-semibold' : 'text-dark-text-secondary hover:bg-dark-surface'}`}
              >
                  {mode}
              </button>
          ))}
        </div>

        {orderMode === 'Market' && (
          <div>
            <label className="text-xs text-dark-text-secondary block mb-1">Price ({selectedPair.quote})</label>
            <input type="text" disabled value="Market" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border text-dark-text-secondary focus:outline-none" />
          </div>
        )}
        {orderMode === 'Limit' && (
          <div>
            <label className="text-xs text-dark-text-secondary block mb-1">Price ({selectedPair.quote})</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue" />
          </div>
        )}
        {orderMode === 'Stop-Limit' && (
          <>
            <div>
              <label className="text-xs text-dark-text-secondary block mb-1">Stop Price ({selectedPair.quote})</label>
              <input type="number" step="0.01" value={stopPrice} onChange={e => setStopPrice(e.target.value)} placeholder="0.00" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue" />
            </div>
            <div>
              <label className="text-xs text-dark-text-secondary block mb-1">Limit Price ({selectedPair.quote})</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue" />
            </div>
          </>
        )}
        
        <div>
          <label className="text-xs text-dark-text-secondary block mb-1">Amount ({selectedPair.base})</label>
          <input type="number" step="0.0001" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-dark-bg p-2 rounded-md border border-dark-border text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue" />
        </div>

        <div>
          <p className="text-xs text-dark-text-secondary">Total: <span className="font-mono text-dark-text-primary">{total} {selectedPair.quote}</span></p>
        </div>

        <button
          type="submit"
          className={`w-full p-2 rounded-md font-bold text-white ${activeTab === 'BUY' ? 'bg-accent-green hover:bg-green-600' : 'bg-accent-red hover:bg-red-600'}`}
        >
          {activeTab === 'BUY' ? `Buy ${selectedPair.base}` : `Sell ${selectedPair.base}`}
        </button>
      </form>
    </div>
  );
};