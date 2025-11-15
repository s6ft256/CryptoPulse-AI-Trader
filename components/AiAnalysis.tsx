
import React from 'react';
import type { AIPrediction } from '../types';
import { BrainCircuitIcon, LoadingSpinner } from './icons';

interface AiAnalysisProps {
  prediction: AIPrediction | null;
  isLoading: boolean;
  error: string | null;
  onGetPrediction: () => void;
}

const AnalysisSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="bg-dark-bg p-3 rounded-md">
        <h4 className="font-bold text-white mb-2">{title}</h4>
        <div className="text-dark-text-primary text-xs leading-relaxed">{children}</div>
    </div>
);

const ConfidenceGauge: React.FC<{ confidence: number; trend: string }> = ({ confidence, trend }) => {
    const radius = 40;
    const circumference = Math.PI * radius; // This is for a half-circle
    const offset = circumference - (confidence / 100) * circumference;

    const trendColor =
        trend === 'BULLISH' ? '#26a69a' :
        trend === 'BEARISH' ? '#ef5350' :
        '#8b92a1';

    return (
        <div className="relative flex justify-center items-center h-20">
            <svg className="w-40 h-20 transform">
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    strokeWidth="10"
                    stroke="#1e222d"
                    fill="transparent"
                    strokeLinecap="round"
                />
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    strokeWidth="10"
                    stroke={trendColor}
                    fill="transparent"
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                />
            </svg>
            <span className="absolute text-2xl font-bold font-mono" style={{ color: trendColor }}>
                {confidence}%
            </span>
        </div>
    );
};

const getRsiStatus = (rsi: number) => {
    if (rsi > 70) return { text: 'Overbought', color: 'text-accent-red' };
    if (rsi < 30) return { text: 'Oversold', color: 'text-accent-green' };
    return { text: 'Neutral', color: 'text-dark-text-secondary' };
};

const RsiGauge: React.FC<{ rsi: number }> = ({ rsi }) => {
    const status = getRsiStatus(rsi);
    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="font-semibold text-white">RSI (14)</span>
                <span className={`font-mono font-bold ${status.color}`}>{rsi.toFixed(1)}</span>
            </div>
            <div className="w-full bg-dark-surface rounded-full h-1.5 relative">
                <div className="absolute w-full h-full bg-gradient-to-r from-accent-green via-slate-500 to-accent-red rounded-full opacity-50"></div>
                <div 
                    className="absolute top-1/2 -translate-y-1/2 h-2.5 w-1 bg-white rounded-full transition-all duration-500" 
                    style={{ left: `calc(${rsi}% - 2px)` }}
                ></div>
            </div>
            <p className={`text-right text-xs mt-1 font-semibold ${status.color}`}>{status.text}</p>
        </div>
    );
};

const IndicatorRow: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const isBullish = value.toLowerCase().includes('bullish') || value.toLowerCase().includes('above');
    const isBearish = value.toLowerCase().includes('bearish') || value.toLowerCase().includes('below');
    const color = isBullish ? 'text-accent-green' : isBearish ? 'text-accent-red' : 'text-dark-text-secondary';

    return (
        <div className="flex justify-between items-center py-2 border-b border-dark-border/50 last:border-b-0">
            <span className="font-semibold text-dark-text-secondary">{label}</span>
            <span className={`font-mono font-bold text-sm ${color}`}>{value}</span>
        </div>
    );
};

const TechnicalIndicatorsSection: React.FC<{ indicators: AIPrediction['technicalIndicators'] }> = ({ indicators }) => {
    if (!indicators) return null;
    
    return (
        <AnalysisSection title="Technical Indicators">
            <div className="space-y-4">
                <RsiGauge rsi={indicators.rsi14} />
                <div className="bg-dark-surface p-2 rounded-md">
                    <IndicatorRow label="MACD" value={indicators.macdStatus} />
                    <IndicatorRow label="Moving Avg." value={indicators.movingAverageSignal} />
                </div>
            </div>
        </AnalysisSection>
    );
};


const QuantitativeSentimentSection: React.FC<{ sentiment: AIPrediction['quantitativeSentiment'] }> = ({ sentiment }) => {
    if (!sentiment) return null;

    const { newsScore, retailPositioning } = sentiment;
    const scoreColor = newsScore > 15 ? 'text-accent-green' : newsScore < -15 ? 'text-accent-red' : 'text-slate-300';
    // Map score from -50 to 50 range to -80 to 80 degree range for the needle
    const rotation = Math.max(-80, Math.min(80, newsScore * (80 / 50)));

    return (
        <AnalysisSection title="Quantitative Sentiment">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-dark-surface p-3 rounded-md flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-dark-text-secondary mb-2">News Score</p>
                    <div className="relative w-24 h-12">
                        {/* Gauge background arc */}
                        <svg viewBox="0 0 100 50" className="w-full h-full">
                            <path d="M 10 45 A 40 40 0 0 1 90 45" stroke="#2a2e39" strokeWidth="8" fill="none" strokeLinecap="round" />
                        </svg>
                        {/* Needle */}
                        <div
                            className="absolute bottom-1 left-1/2 w-0.5 h-10 bg-white rounded-full transition-transform duration-500 origin-bottom"
                            style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                        />
                         {/* Needle pivot */}
                        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
                    </div>
                    <p className={`font-mono font-bold text-xl mt-2 ${scoreColor}`}>{newsScore}</p>
                </div>
                <div className="bg-dark-surface p-3 rounded-md flex flex-col items-center justify-center text-center">
                    <p className="text-xs text-dark-text-secondary mb-1">Retail Position</p>
                    <p className="font-mono font-bold text-lg text-white">{retailPositioning}</p>
                </div>
            </div>
        </AnalysisSection>
    );
};

export const AiAnalysis: React.FC<AiAnalysisProps> = ({ prediction, isLoading, error, onGetPrediction }) => {

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <LoadingSpinner className="h-8 w-8" />
                    <p className="mt-4 text-dark-text-secondary">AI is analyzing the market...</p>
                    <p className="text-xs text-dark-text-secondary mt-1">This may take a moment.</p>
                </div>
            );
        }
        if (error) {
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-accent-red font-semibold">Analysis Failed</p>
                    <p className="text-xs mt-2 text-dark-text-secondary">{error}</p>
                    <button onClick={onGetPrediction} className="mt-4 bg-accent-blue text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-blue-500">
                        Retry
                    </button>
                </div>
            );
        }
        if (!prediction) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <BrainCircuitIcon className="w-12 h-12 text-accent-blue mb-4" />
                    <h3 className="font-bold text-white">AI Monthly Forecast</h3>
                    <p className="text-sm text-dark-text-secondary mt-2">Get a detailed 30-day forecast for the selected market, including price targets and strategy.</p>
                    <button onClick={onGetPrediction} className="mt-6 bg-accent-blue text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-blue-500">
                        Get AI Forecast
                    </button>
                </div>
            );
        }

        const { prediction: trend, confidence, priceTarget, potentialHigh, potentialLow, summary, keyDrivers, strategy, technicalIndicators, quantitativeSentiment } = prediction;
        
        const trendColor = 
            trend === 'BULLISH' ? 'text-accent-green' :
            trend === 'BEARISH' ? 'text-accent-red' :
            'text-dark-text-secondary';
            
        const priceRange = potentialHigh - potentialLow;
        const targetPosition = priceRange > 0 ? ((priceTarget - potentialLow) / priceRange) * 100 : 50;

        return (
            <div className="p-3 space-y-4 text-sm">
                <div className="bg-dark-bg p-3 rounded-md">
                    <h4 className="font-bold text-white mb-1 text-center">Monthly Outlook</h4>
                    <ConfidenceGauge confidence={confidence} trend={trend} />
                    <p className={`text-2xl font-bold text-center -mt-2 ${trendColor}`}>{trend}</p>
                </div>

                <div className="bg-dark-bg p-3 rounded-md">
                     <h4 className="font-bold text-white mb-4">Price Projections</h4>
                     <div className="relative">
                        <div className="h-1.5 bg-gradient-to-r from-accent-red via-slate-500 to-accent-green rounded-full"></div>
                        <div 
                            className="absolute -top-2.5 w-1 h-6 bg-accent-blue rounded-full transform -translate-x-1/2"
                            style={{ left: `${targetPosition}%`}}
                        >
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-accent-blue">
                                {priceTarget.toFixed(2)}
                            </div>
                        </div>
                     </div>
                     <div className="flex justify-between mt-2 text-xs font-mono">
                        <span className="text-accent-red">{potentialLow.toFixed(2)}</span>
                        <span className="text-accent-green">{potentialHigh.toFixed(2)}</span>
                     </div>
                </div>

                <TechnicalIndicatorsSection indicators={technicalIndicators} />

                <QuantitativeSentimentSection sentiment={quantitativeSentiment} />
                
                <AnalysisSection title="Analysis Summary">
                    <p>{summary}</p>
                </AnalysisSection>
                <AnalysisSection title="Key Drivers">
                    <p>{keyDrivers}</p>
                </AnalysisSection>
                <AnalysisSection title="Suggested Strategy">
                     <p>{strategy}</p>
                </AnalysisSection>
            </div>
        )
    };
  
    return (
        <div className="bg-dark-surface h-full flex flex-col">
            <h3 className="p-3 text-base font-bold text-white border-b border-dark-border flex items-center gap-2">
                <BrainCircuitIcon className="w-5 h-5 text-accent-blue" />
                AI Analysis
            </h3>
            <div className="flex-grow overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};