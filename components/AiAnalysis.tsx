
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

const QuantitativeSentimentSection: React.FC<{ sentiment: AIPrediction['quantitativeSentiment'] }> = ({ sentiment }) => {
    if (!sentiment) return null;
    
    const scoreColor = sentiment.newsScore > 20 ? 'text-accent-green' : sentiment.newsScore < -20 ? 'text-accent-red' : 'text-slate-300';
    
    return (
        <AnalysisSection title="Quantitative Sentiment">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-dark-surface p-2 rounded">
                    <p className="text-dark-text-secondary mb-1">News Score</p>
                    <p className={`font-mono font-bold text-lg ${scoreColor}`}>{sentiment.newsScore}</p>
                </div>
                 <div className="bg-dark-surface p-2 rounded">
                    <p className="text-dark-text-secondary mb-1">Retail Position</p>
                    <p className="font-mono font-bold text-lg text-white">{sentiment.retailPositioning}</p>
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

        const { prediction: trend, confidence, priceTarget, potentialHigh, potentialLow, summary, keyDrivers, strategy, quantitativeSentiment } = prediction;
        
        const trendColor = 
            trend === 'BULLISH' ? 'text-accent-green' :
            trend === 'BEARISH' ? 'text-accent-red' :
            'text-dark-text-secondary';
        
        const trendBg = 
            trend === 'BULLISH' ? 'bg-accent-green' :
            trend === 'BEARISH' ? 'bg-accent-red' :
            'bg-dark-text-secondary';


        return (
            <div className="p-3 space-y-3 text-sm">
                <div>
                    <h4 className="font-bold text-white mb-2">Monthly Outlook</h4>
                    <div className="bg-dark-bg p-3 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                           <span className={`text-lg font-bold ${trendColor}`}>{trend}</span>
                           <span className="text-sm text-dark-text-secondary">Confidence</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-full bg-dark-surface rounded-full h-2">
                               <div className={`h-2 rounded-full ${trendBg}`} style={{width: `${confidence}%`}}></div>
                           </div>
                           <span className={`font-mono font-bold ${trendColor}`}>{confidence}%</span>
                        </div>
                    </div>
                </div>

                <div>
                     <h4 className="font-bold text-white mb-2">Price Projections</h4>
                     <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                           <div className="bg-dark-bg p-2 rounded"><span className="text-dark-text-secondary block">Low</span> <span className="text-accent-red font-semibold text-sm">{potentialLow.toFixed(2)}</span></div>
                           <div className="bg-dark-bg p-2 rounded border-2 border-accent-blue"><span className="text-dark-text-secondary block">Target</span> <span className="text-accent-blue font-bold text-base">{priceTarget.toFixed(2)}</span></div>
                           <div className="bg-dark-bg p-2 rounded"><span className="text-dark-text-secondary block">High</span> <span className="text-accent-green font-semibold text-sm">{potentialHigh.toFixed(2)}</span></div>
                     </div>
                </div>

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