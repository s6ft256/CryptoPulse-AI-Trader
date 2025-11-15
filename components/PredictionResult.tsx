
import React, { useState, useMemo } from 'react';
// FIX: Import missing types 'ForexPrediction' and 'ChartDataPoint'.
import type { ForexPrediction, ChartDataPoint } from '../types';
// FIX: Import missing type 'Suggestion'.
import { PredictionTrend, Suggestion } from '../types';
// FIX: Import missing icons.
import { ArrowUpIcon, ArrowDownIcon, LoadingSpinner, BrainCircuitIcon, GaugeIcon, StopLossIcon, TakeProfitIcon, TrendingUpIcon } from './icons';
import { ForexChart } from './ForexChart';

// Define a type for the combined prediction data
type DisplayPrediction = ForexPrediction & {
  fromAsset: string;
  toAsset: string;
  sources?: any[];
};

interface PredictionResultProps {
  prediction: DisplayPrediction | null;
  isLoading: boolean;
  error: string | null;
  chartData?: ChartDataPoint[] | null;
  futureChartData?: ChartDataPoint[] | null;
}

const AnalysisModeIndicator: React.FC<{ mode: 'Standard' | 'Adaptive' }> = ({ mode }) => {
    const isAdaptive = mode === 'Adaptive';
    const config = {
        'Adaptive': {
            text: 'Adaptive',
            description: 'AI is prioritizing geopolitical and fundamental data over technicals.',
            bgColor: 'bg-indigo-500/10',
            textColor: 'text-indigo-400',
            borderColor: 'border-indigo-500/30',
        },
        'Standard': {
            text: 'Standard',
            description: 'AI is using a balanced approach of all available market data.',
            bgColor: 'bg-slate-500/10',
            textColor: 'text-slate-300',
            borderColor: 'border-slate-500/30',
        }
    };
    const currentConfig = config[mode];

    return (
        <div>
            <h4 className="font-semibold text-slate-200">Analysis Mode</h4>
            <div className={`mt-2 p-3 rounded-lg border flex items-center gap-4 ${currentConfig.bgColor} ${currentConfig.borderColor}`}>
                <div className={`flex-shrink-0 p-2 rounded-full ${currentConfig.textColor} ${isAdaptive ? 'bg-indigo-500/20' : 'bg-slate-500/20'}`}>
                    <BrainCircuitIcon className="h-6 w-6"/>
                </div>
                <div>
                    <p className={`font-bold text-lg ${currentConfig.textColor}`}>{currentConfig.text}</p>
                    <p className="text-sm text-slate-400">{currentConfig.description}</p>
                </div>
            </div>
        </div>
    );
};


const QuantitativeSentiment: React.FC<{ sentiment: ForexPrediction['quantitativeSentiment'] }> = ({ sentiment }) => {
    const scoreColor = sentiment.newsScore > 20 ? 'text-brand-green' : sentiment.newsScore < -20 ? 'text-brand-red' : 'text-slate-300';
    const rotation = Math.max(-90, Math.min(90, sentiment.newsScore * 1.8)); // map -50 to 50 -> -90 to 90
    
    return (
        <div>
            <h4 className="font-semibold text-slate-200">Quantitative Sentiment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="p-3 rounded-lg border border-brand-border bg-brand-bg-dark flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-slate-400 mb-2">News Sentiment Score</p>
                    <div className="relative w-24 h-16 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[96px] border-[12px] border-slate-700 rounded-t-full border-b-0" style={{ clipPath: 'inset(0 0 50% 0)' }}></div>
                        <div 
                           className="absolute top-0 left-0 w-full h-[96px] border-[12px] border-brand-green rounded-t-full border-b-0 transition-all duration-500"
                           style={{ clipPath: 'inset(0 0 50% 0)', transform: `rotate(${Math.min(0, rotation / 2)}deg)`, transformOrigin: 'bottom center' }}
                        ></div>
                        <div 
                            className="absolute top-0 left-0 w-full h-[96px] border-[12px] border-brand-red rounded-t-full border-b-0 transition-all duration-500"
                            style={{ clipPath: 'inset(0 0 50% 0)', transform: `rotate(${Math.max(0, rotation / 2)}deg) scaleX(-1)`, transformOrigin: 'bottom center' }}
                        ></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-12 bg-white transition-transform duration-500" style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transformOrigin: 'bottom center' }}></div>
                    </div>
                     <p className={`text-2xl font-bold font-mono mt-1 ${scoreColor}`}>{sentiment.newsScore}</p>
                </div>
                <div className="p-3 rounded-lg border border-brand-border bg-brand-bg-dark flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-slate-400 mb-1">Retail Positioning</p>
                    <p className="text-2xl font-bold font-mono text-white">{sentiment.retailPositioning}</p>
                    <p className="text-xs text-slate-500 mt-1">(Contrarian Indicator)</p>
                </div>
            </div>
        </div>
    );
};

const MacroOutlook: React.FC<{ outlook: ForexPrediction['macroOutlook'] }> = ({ outlook }) => {
    const getVixInfo = (vix: number) => {
        if (vix < 20) return { level: 'Low', description: 'Indicates low market fear and stability.', color: 'text-green-400', bgColor: 'bg-green-500/10' };
        if (vix <= 30) return { level: 'Moderate', description: 'Suggests caution, with rising uncertainty.', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
        return { level: 'High', description: 'Signals high market fear and potential volatility.', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    };
    const vixInfo = getVixInfo(outlook.vix);

    const getYieldSpreadInfo = (spread: 'Normal' | 'Inverting' | 'Inverted') => {
        switch (spread) {
            case 'Inverted': return { description: 'Often precedes an economic recession.', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
            case 'Inverting': return { description: 'Shows weakening economic expectations.', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
            default: return { description: 'Indicates healthy economic expectations.', color: 'text-green-400', bgColor: 'bg-green-500/10' };
        }
    };
    const yieldSpreadInfo = getYieldSpreadInfo(outlook.yieldSpread);

    return (
        <div>
            <h4 className="font-semibold text-slate-200">Macro Outlook</h4>
            <div className="mt-2 space-y-4">
                <div className={`p-3 rounded-lg border border-brand-border ${vixInfo.bgColor}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-300">VIX (Volatility Index)</span>
                        <span className={`text-xl font-mono font-bold ${vixInfo.color}`}>{outlook.vix.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                        <div className={`h-1.5 rounded-full ${vixInfo.color.replace('text-', 'bg-')}`} style={{ width: `${Math.min(100, (outlook.vix / 50) * 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2"><span className='font-bold'>{vixInfo.level}:</span> {vixInfo.description}</p>
                </div>
                <div className={`p-3 rounded-lg border border-brand-border ${yieldSpreadInfo.bgColor}`}>
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-300">10Y-2Y Yield Spread</span>
                        <span className={`text-xl font-mono font-bold ${yieldSpreadInfo.color}`}>{outlook.yieldSpread}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{yieldSpreadInfo.description}</p>
                </div>
            </div>
        </div>
    );
};


const OrderLevelsIndicator: React.FC<{
    suggestion: Suggestion;
    currentPrice: number;
    stopLossPercent: number;
    setStopLossPercent: (v: number) => void;
    takeProfitPercent: number;
    setTakeProfitPercent: (v: number) => void;
    stopLossPrice: number;
    takeProfitPrice: number;
}> = ({
    suggestion, currentPrice, stopLossPercent, setStopLossPercent,
    takeProfitPercent, setTakeProfitPercent, stopLossPrice, takeProfitPrice
}) => {
    const isCrypto = currentPrice > 100;
    const priceFixedPoints = isCrypto ? 2 : 5;
    const riskRewardRatio = stopLossPercent > 0 ? (takeProfitPercent / stopLossPercent).toFixed(2) : '∞';

    return (
        <div>
            <h4 className="font-semibold text-slate-200">Risk Management Levels</h4>
            <div className="flex justify-between items-baseline mt-2 p-2 rounded-md bg-brand-bg-dark">
                <span className="text-sm text-slate-400">Risk/Reward Ratio:</span>
                <span className="font-mono text-lg font-semibold text-white">{riskRewardRatio}:1</span>
            </div>
            <div className="mt-3 space-y-3">
                {/* Take Profit */}
                <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full text-brand-green bg-green-500/20">
                        <TakeProfitIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center">
                            <label htmlFor="take-profit" className="font-bold text-brand-green">Take-Profit</label>
                            <span className="text-lg font-mono text-white">{takeProfitPrice.toFixed(priceFixedPoints)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="number"
                                id="take-profit"
                                value={takeProfitPercent}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) setTakeProfitPercent(val);
                                }}
                                min="0"
                                step="0.05"
                                className="w-20 bg-brand-bg-dark border border-brand-border rounded-md text-center text-sm py-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <span className="text-slate-400 text-sm">% from current price</span>
                        </div>
                    </div>
                </div>

                {/* Stop Loss */}
                 <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 flex items-center gap-4">
                    <div className="flex-shrink-0 p-2 rounded-full text-brand-red bg-red-500/20">
                        <StopLossIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center">
                            <label htmlFor="stop-loss" className="font-bold text-brand-red">Stop-Loss</label>
                            <span className="text-lg font-mono text-white">{stopLossPrice.toFixed(priceFixedPoints)}</span>
                        </div>
                         <div className="flex items-center gap-2 mt-1">
                            <input
                                type="number"
                                id="stop-loss"
                                value={stopLossPercent}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) setStopLossPercent(val);
                                }}
                                min="0"
                                step="0.05"
                                className="w-20 bg-brand-bg-dark border border-brand-border rounded-md text-center text-sm py-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <span className="text-slate-400 text-sm">% from current price</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SuggestionIndicator: React.FC<{ suggestion: Suggestion }> = ({ suggestion }) => {
    const suggestionConfig = {
      [Suggestion.BUY]: {
        text: 'BUY',
        description: 'The model recommends buying, anticipating a price increase.',
        bgColor: 'bg-green-500/10',
        textColor: 'text-brand-green',
        borderColor: 'border-green-500/30',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
      },
      [Suggestion.SELL]: {
        text: 'SELL',
        description: 'The model recommends selling, anticipating a price decrease.',
        bgColor: 'bg-red-500/10',
        textColor: 'text-brand-red',
        borderColor: 'border-red-500/30',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg>
      },
      [Suggestion.HOLD]: {
        text: 'HOLD',
        description: 'The model recommends holding, as market conditions are uncertain or stable.',
        bgColor: 'bg-slate-500/10',
        textColor: 'text-slate-300',
        borderColor: 'border-slate-500/30',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      }
    };
  
    if (!suggestion) return null;
  
    const config = suggestionConfig[suggestion];
  
    return (
      <div>
          <h4 className="font-semibold text-slate-200">Recommended Action</h4>
          <div className={`mt-2 p-3 rounded-lg border flex items-center ${config.bgColor} ${config.borderColor}`}>
              <div className={`flex-shrink-0 p-2 rounded-full ${config.textColor} ${config.bgColor === 'bg-slate-500/10' ? 'bg-slate-500/20' : config.bgColor}`}>
                  {config.icon}
              </div>
              <div className="ml-4">
                  <p className={`font-bold text-lg ${config.textColor}`}>{config.text}</p>
                  <p className="text-sm text-slate-400">{config.description}</p>
              </div>
          </div>
      </div>
    );
};

const PredictionCard: React.FC<{ 
    prediction: DisplayPrediction,
    chartData?: ChartDataPoint[] | null,
    futureChartData?: ChartDataPoint[] | null,
}> = ({ prediction, chartData, futureChartData }) => {
  // FIX: 'PredictionTrend' is a type, not a value. Use string literal for comparison.
  const isIncrease = prediction.prediction === 'BULLISH';
  const trendColor = isIncrease ? 'text-brand-green' : 'text-brand-red';
  const bgColor = isIncrease ? 'bg-green-500/10' : 'bg-red-500/10';
  const Icon = isIncrease ? ArrowUpIcon : ArrowDownIcon;
  const currentPrice = chartData?.[chartData.length - 1]?.price;

  const [stopLossPercent, setStopLossPercent] = useState(0.75);
  const [takeProfitPercent, setTakeProfitPercent] = useState(1.5);

  const { stopLossPrice, takeProfitPrice } = useMemo(() => {
    if (!currentPrice) return { stopLossPrice: 0, takeProfitPrice: 0 };
    const slp = prediction.suggestion === Suggestion.BUY 
        ? currentPrice * (1 - stopLossPercent / 100) 
        : currentPrice * (1 + stopLossPercent / 100);
    const tpp = prediction.suggestion === Suggestion.BUY 
        ? currentPrice * (1 + takeProfitPercent / 100) 
        : currentPrice * (1 - takeProfitPercent / 100);
    return { stopLossPrice: slp, takeProfitPrice: tpp };
  }, [currentPrice, stopLossPercent, takeProfitPercent, prediction.suggestion]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">AI Prediction for {prediction.fromAsset}/{prediction.toAsset}</h3>
        <p className="text-sm text-slate-400">Short-term (24-48 hours)</p>
      </div>
      <div className={`p-4 rounded-lg flex items-center gap-4 ${bgColor}`}>
        <div className={`flex-shrink-0 p-2 rounded-full ${trendColor} ${isIncrease ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="w-full">
            <p className={`text-2xl font-bold ${trendColor}`}>{prediction.prediction}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-500 ${isIncrease ? 'bg-brand-green' : 'bg-brand-red'}`} 
                    style={{ width: `${prediction.confidence}%` }}>
                  </div>
              </div>
              <span className={`font-semibold text-sm ${trendColor} w-10 text-right`}>{prediction.confidence}%</span>
            </div>
        </div>
      </div>

      <AnalysisModeIndicator mode={prediction.analysisMode} />
      <QuantitativeSentiment sentiment={prediction.quantitativeSentiment} />
      <MacroOutlook outlook={prediction.macroOutlook} />

      <SuggestionIndicator suggestion={prediction.suggestion} />
      
      {(prediction.suggestion === Suggestion.BUY || prediction.suggestion === Suggestion.SELL) && currentPrice && (
        <OrderLevelsIndicator 
            suggestion={prediction.suggestion} 
            currentPrice={currentPrice}
            stopLossPercent={stopLossPercent}
            setStopLossPercent={setStopLossPercent}
            takeProfitPercent={takeProfitPercent}
            setTakeProfitPercent={setTakeProfitPercent}
            stopLossPrice={stopLossPrice}
            takeProfitPrice={takeProfitPrice}
        />
      )}

      <div>
        <h4 className="font-semibold text-slate-200">Full Rationale</h4>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">{prediction.rationale}</p>
      </div>

       {prediction.sources && prediction.sources.length > 0 && (
            <div>
                <h4 className="font-semibold text-slate-200">Sources</h4>
                <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                    {prediction.sources.map((source, index) => (
                       source.web && source.web.uri && (
                            <li key={index}>
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-indigo-400 hover:underline"
                                >
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                       )
                    ))}
                </ul>
            </div>
        )}

      {chartData && (
          <div className="h-[28rem] mt-2 flex flex-col">
              <ForexChart
                  data={chartData}
                  trend={prediction.prediction}
                  lineName="Live Price"
                  showIndicatorControls={true}
                  stopLossPrice={(prediction.suggestion === Suggestion.BUY || prediction.suggestion === Suggestion.SELL) && stopLossPrice > 0 ? stopLossPrice : undefined}
                  takeProfitPrice={(prediction.suggestion === Suggestion.BUY || prediction.suggestion === Suggestion.SELL) && takeProfitPrice > 0 ? takeProfitPrice : undefined}
              />
          </div>
      )}
      {futureChartData && (
          <div className="h-[28rem] mt-2 flex flex-col">
               <h4 className="text-md font-semibold text-slate-100 mb-2 flex-shrink-0">24-Hour AI Forecast</h4>
              <div className="flex-grow min-h-0">
                <ForexChart
                    data={futureChartData}
                    trend={prediction.prediction}
                    lineName="Predicted Price"
                    isFuture={true}
                />
              </div>
          </div>
      )}
    </div>
  );
};


export const PredictionResult: React.FC<PredictionResultProps> = ({ prediction, isLoading, error, chartData, futureChartData }) => {
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <LoadingSpinner />
          <p className="mt-4 text-slate-300">AI is analyzing the market...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-brand-red">
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      );
    }

    if (!prediction) {
      return <p className="text-slate-400 text-center">Select an asset pair and click 'Predict' to see the analysis.</p>;
    }

    return (
        <div className="flex flex-col w-full animate-fade-in">
            <PredictionCard
                prediction={prediction}
                chartData={chartData}
                futureChartData={futureChartData}
            />
        </div>
    );
  };
  
  const hasContent = !!(prediction || isLoading || error);

  return (
    <div className={`bg-brand-bg-light p-6 rounded-lg border border-brand-border h-full ${!hasContent ? 'flex items-center justify-center' : ''}`}>
        {renderContent()}
    </div>
  );
};
