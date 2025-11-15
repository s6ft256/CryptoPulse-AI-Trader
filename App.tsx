import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CRYPTO_PAIRS } from './constants';
import type { CryptoPair, MarketData, Candle, AIPrediction, Order } from './types';
import { generateInitialCandles, generateNextCandle } from './services/marketDataService';
import { getAIPrediction } from './services/geminiService';
import { MarketList } from './components/MarketList';
import { ChartHeader } from './components/ChartHeader';
import { TradingChart } from './components/TradingChart';
import { TradePanel } from './components/TradePanel';
import { AiAnalysis } from './components/AiAnalysis';

const App: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<CryptoPair>(CRYPTO_PAIRS[0]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Initialize and update candle data
  useEffect(() => {
    setCandles(generateInitialCandles(selectedPair));
    setAiPrediction(null);
    setAiError(null);

    const interval = setInterval(() => {
      setCandles(prevCandles => {
        const nextCandle = generateNextCandle(prevCandles);
        const newCandles = [...prevCandles, nextCandle];
        return newCandles.slice(-200); // Keep the last 200 candles
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedPair]);

  const marketData: MarketData | null = useMemo(() => {
    if (candles.length < 24) return null;
    const relevantCandles = candles.slice(-24); // Simulate 24h data
    const lastCandle = relevantCandles[relevantCandles.length - 1];
    const firstCandle = relevantCandles[0];
    
    const high24h = Math.max(...relevantCandles.map(c => c.high));
    const low24h = Math.min(...relevantCandles.map(c => c.low));
    const volume24h = relevantCandles.reduce((acc, c) => acc + c.volume, 0);
    const change24h = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;

    return {
      symbol: selectedPair.symbol,
      price: lastCandle.close,
      change24h,
      high24h,
      low24h,
      volume24h,
    };
  }, [candles, selectedPair]);

  const handleGetPrediction = useCallback(async () => {
    if (!marketData) return;
    setIsLoadingAi(true);
    setAiError(null);
    setAiPrediction(null);
    try {
      const prediction = await getAIPrediction(selectedPair.symbol, marketData.price);
      setAiPrediction(prediction);
    } catch (err: any) {
      setAiError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoadingAi(false);
    }
  }, [selectedPair, marketData]);
  
  const handlePlaceOrder = (orderParams: Omit<Order, 'id' | 'symbol' | 'date'>) => {
    const newOrder: Order = {
        id: Date.now().toString(),
        symbol: selectedPair.symbol,
        date: new Date().toISOString(),
        ...orderParams
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <div className="h-screen w-screen text-dark-text-primary font-sans text-xs flex flex-col">
      <header className="p-2 border-b border-dark-border flex-shrink-0">
        <h1 className="text-lg font-bold">CryptoPulse <span className="text-accent-blue">AI</span></h1>
      </header>
      <main className="flex-grow grid grid-cols-[250px_auto_300px] grid-rows-[auto_1fr] gap-1 p-1 overflow-hidden">
        <div className="col-start-1 col-end-2 row-start-1 row-end-3 border border-dark-border rounded-md">
          <MarketList pairs={CRYPTO_PAIRS} selectedPair={selectedPair} onSelectPair={setSelectedPair} />
        </div>

        <div className="col-start-2 col-end-3 row-start-1 row-end-2 border border-dark-border rounded-md">
           <ChartHeader marketData={marketData} />
        </div>

        <div className="col-start-2 col-end-3 row-start-2 row-end-3 border border-dark-border rounded-md p-1">
          <TradingChart data={candles} prediction={aiPrediction} />
        </div>

        <div className="col-start-3 col-end-4 row-start-1 row-end-2 border border-dark-border rounded-md">
          <TradePanel selectedPair={selectedPair} marketData={marketData} onPlaceOrder={handlePlaceOrder} />
        </div>

        <div className="col-start-3 col-end-4 row-start-2 row-end-3 border border-dark-border rounded-md">
           <AiAnalysis 
                prediction={aiPrediction}
                isLoading={isLoadingAi}
                error={aiError}
                onGetPrediction={handleGetPrediction}
            />
        </div>
      </main>
    </div>
  );
};

export default App;