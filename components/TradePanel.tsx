import React, { useState, useEffect, useMemo } from 'react';
import type { OrderType, CryptoPair, MarketData, OrderMode, Order } from '../types';

interface TradePanelProps {
  selectedPair: CryptoPair;
  marketData: MarketData | null;
  onPlaceOrder: (orderParams: Omit<Order, 'id' | 'symbol' | 'date'>) => void;
}

const InputField: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    unit: string;
    type?: string;
    disabled?: boolean;
}> = ({ label, value, onChange, placeholder, unit, type = "number", disabled = false }) => (
    <div>
        <label className="block text-xs font-medium text-dark-text-secondary mb-1.5">{label}</label>
        <div className="relative">
            <input 
                type={type} 
                step="any"
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-dark-bg p-2.5 rounded-md border border-dark-border text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors disabled:bg-dark-border disabled:text-dark-text-secondary pr-14" 
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-dark-text-secondary text-xs font-mono pointer-events-none">{unit}</span>
        </div>
    </div>
);


export const TradePanel: React.FC<TradePanelProps> = ({ selectedPair, marketData, onPlaceOrder }) => {
  const [activeTab, setActiveTab] = useState<OrderType>('BUY');
  const [orderMode, setOrderMode] = useState<OrderMode>('Limit');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (marketData?.price) {
      if (document.activeElement?.tagName.toLowerCase() !== 'input') {
        setPrice(marketData.price.toFixed(4));
      }
      setStopPrice(marketData.price.toFixed(4));
    } else {
      setPrice('');
      setStopPrice('');
    }
  }, [marketData?.symbol]);

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
      setAmount('');
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

  return (
    <div className="bg-dark-surface h-full p-3 flex flex-col text-sm">
      <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-dark-bg">
        <button
          onClick={() => setActiveTab('BUY')}
          className={`w-full text-center font-semibold rounded py-2 transition-colors duration-200 ${activeTab === 'BUY' ? 'bg-accent-green text-white' : 'text-dark-text-secondary hover:bg-dark-border'}`}
        >
          BUY
        </button>
        <button
          onClick={() => setActiveTab('SELL')}
          className={`w-full text-center font-semibold rounded py-2 transition-colors duration-200 ${activeTab === 'SELL' ? 'bg-accent-red text-white' : 'text-dark-text-secondary hover:bg-dark-border'}`}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-grow mt-3">
        <div className="flex justify-around items-center text-xs mb-3">
          {(['Limit', 'Market', 'Stop-Limit'] as OrderMode[]).map((mode) => (
              <button
                  type="button"
                  key={mode}
                  onClick={() => setOrderMode(mode)}
                  className={`px-3 py-1 rounded transition-colors ${orderMode === mode ? 'text-white font-semibold' : 'text-dark-text-secondary hover:text-white'}`}
              >
                  {mode}
              </button>
          ))}
        </div>

        <div className="space-y-3">
          {orderMode === 'Stop-Limit' && (
            <InputField label="Stop Price" value={stopPrice} onChange={e => setStopPrice(e.target.value)} placeholder="0.00" unit={selectedPair.quote} />
          )}

          {orderMode !== 'Market' ? (
            <InputField label={orderMode === 'Limit' ? 'Price' : 'Limit Price'} value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" unit={selectedPair.quote} />
          ) : (
            <InputField label="Price" value="Market" onChange={() => {}} placeholder="Market" unit={selectedPair.quote} disabled={true} type="text" />
          )}
          
          <InputField label="Amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" unit={selectedPair.base} />
        </div>
        
        <div className="flex-grow" />

        <div className="flex justify-between items-center text-sm pt-3 border-t border-dark-border mt-3">
          <span className="text-dark-text-secondary">Total</span>
          <span className="font-mono text-white">{total} {selectedPair.quote}</span>
        </div>

        <button
          type="submit"
          disabled={!parseFloat(amount) || parseFloat(amount) <= 0}
          className={`w-full p-3 mt-3 rounded-md font-bold text-white transition-colors duration-200 disabled:bg-dark-border disabled:text-dark-text-secondary disabled:cursor-not-allowed ${activeTab === 'BUY' ? 'bg-accent-green hover:bg-green-700' : 'bg-accent-red hover:bg-red-700'}`}
        >
          {activeTab === 'BUY' ? `Buy ${selectedPair.base}` : `Sell ${selectedPair.base}`}
        </button>
      </form>
    </div>
  );
};
