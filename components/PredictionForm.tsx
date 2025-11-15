
import React from 'react';
import { AssetSelector } from './CurrencySelector';
// FIX: Import missing icon 'SwapIcon'.
import { LoadingSpinner, SwapIcon } from './icons';
// FIX: Import missing constants 'CURRENCIES' and 'CRYPTO_ASSETS'.
import { CURRENCIES, CRYPTO_ASSETS } from '../constants';
// FIX: Import missing type 'MarketType'.
import { MarketType } from '../types';

interface PredictionFormProps {
  fromAsset: string;
  setFromAsset: (value: string) => void;
  toAsset: string;
  setToAsset: (value: string) => void;
  marketType: MarketType;
  setMarketType: (value: MarketType) => void;
  isAdaptive: boolean;
  setIsAdaptive: (value: boolean) => void;
  handlePrediction: () => void;
  isLoading: boolean;
  handleAnalysis: () => void;
  isAnalyzing: boolean;
  canAnalyze: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  fromAsset,
  setFromAsset,
  toAsset,
  setToAsset,
  marketType,
  setMarketType,
  isAdaptive,
  setIsAdaptive,
  handlePrediction,
  isLoading,
  handleAnalysis,
  isAnalyzing,
  canAnalyze,
}) => {
    
  const handleSwap = () => {
    const temp = fromAsset;
    setFromAsset(toAsset);
    setToAsset(temp);
  };

  const isButtonDisabled = isLoading || fromAsset === toAsset || isAnalyzing;
  const assets = marketType === MarketType.FOREX ? CURRENCIES : CRYPTO_ASSETS;
  const toAssets = marketType === MarketType.CRYPTO ? [CURRENCIES[0], ...CRYPTO_ASSETS] : CURRENCIES;


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handlePrediction();
      }}
      className="space-y-6"
    >
        <div>
            <label className="block text-sm font-medium text-slate-400 mb-3">Market Type</label>
            <div className="flex gap-4 p-1 rounded-lg bg-brand-bg-dark">
                {Object.values(MarketType).map((value) => (
                    <button
                        type="button"
                        key={value}
                        onClick={() => setMarketType(value)}
                        className={`w-full text-center text-sm rounded-md py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-dark focus:ring-indigo-500 ${
                        marketType === value ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-300 hover:bg-brand-bg-light'
                        }`}
                    >
                        {value}
                    </button>
                ))}
            </div>
        </div>

      <div className="flex items-center justify-center space-x-4">
        <AssetSelector
          id="from"
          label="From Asset"
          value={fromAsset}
          onChange={(e) => setFromAsset(e.target.value)}
          assets={assets}
        />
        <button type="button" onClick={handleSwap} disabled={isLoading || isAnalyzing} className="p-2 mt-7 rounded-full text-slate-400 hover:bg-brand-bg-light hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-dark focus:ring-indigo-500 disabled:opacity-50">
            <SwapIcon className="w-6 h-6" />
        </button>
        <AssetSelector
          id="to"
          label="To Asset"
          value={toAsset}
          onChange={(e) => setToAsset(e.target.value)}
          assets={toAssets}
        />
      </div>

      <div className="flex items-center justify-between bg-brand-bg-dark p-3 rounded-lg">
        <div>
          <label htmlFor="adaptive-mode" className="font-medium text-slate-200">
            Adaptive Analysis
          </label>
          <p className="text-xs text-slate-400">Prioritize events over technicals.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isAdaptive}
          onClick={() => setIsAdaptive(!isAdaptive)}
          className={`${isAdaptive ? 'bg-indigo-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-brand-bg-dark`}
        >
          <span
            className={`${isAdaptive ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </button>
      </div>


       {fromAsset === toAsset && (
        <p className="text-center text-sm text-yellow-400">Please select two different assets.</p>
       )}

      <div>
        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <LoadingSpinner /> : 'Predict Trend'}
        </button>
      </div>
      
      <div className="pt-4 border-t border-brand-border">
          <button
            type="button"
            onClick={handleAnalysis}
            disabled={!canAnalyze || isAnalyzing || isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? <LoadingSpinner /> : 'Analyze Prediction Performance'}
          </button>
          {!canAnalyze && <p className="text-center text-xs text-slate-500 mt-2">Make at least 2 predictions to enable analysis.</p>}
      </div>
    </form>
  );
};
