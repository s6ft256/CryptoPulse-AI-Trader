
import React from 'react';
import type { CoinScreenerPrediction } from '../types';
import { LoadingSpinner, CloseIcon, TrophyIcon, BrainCircuitIcon } from './icons';

interface CoinScreenerModalProps {
  prediction: CoinScreenerPrediction | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-dark-bg p-4 rounded-lg">
    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
      {icon}
      {title}
    </h3>
    <div className="text-dark-text-primary text-sm space-y-2 leading-relaxed">{children}</div>
  </div>
);

const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toPrecision(2);
};


export const CoinScreenerModal: React.FC<CoinScreenerModalProps> = ({ prediction, isLoading, error, onClose }) => {

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <LoadingSpinner className="h-8 w-8" />
                <p className="mt-4 text-dark-text-primary">AI is analyzing all markets...</p>
                <p className="text-xs text-dark-text-secondary mt-2">This comprehensive analysis may take a moment.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-accent-red min-h-[300px] flex flex-col items-center justify-center p-4">
                    <p className="font-bold text-lg">Analysis Failed</p>
                    <p className="text-sm mt-2">{error}</p>
                    <button onClick={onClose} className="mt-6 bg-accent-blue text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-blue-500">
                        Close
                    </button>
                </div>
            );
        }

        if (!prediction) return null;

        const { topPick, contenders, marketOverview } = prediction;

        return (
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-accent-blue/20 to-dark-bg p-4 rounded-lg border border-accent-blue/30">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <TrophyIcon className="w-6 h-6 text-yellow-400" />
                        AI Top Pick for the Month
                    </h3>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <span className="text-3xl font-bold text-white">{topPick.symbol}</span>
                        <div className="text-right">
                            <p className="text-sm text-dark-text-secondary">Confidence</p>
                            <p className="text-2xl font-mono font-bold text-accent-green">{topPick.confidence}%</p>
                        </div>
                         <div className="text-right">
                            <p className="text-sm text-dark-text-secondary">Potential Gain</p>
                            <p className="text-2xl font-mono font-bold text-accent-green">{topPick.potentialGain}</p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-dark-surface p-3 rounded-md border border-dark-border">
                            <p className="text-dark-text-secondary mb-1">Recommended Exchange</p>
                            <p className="font-semibold text-white">{topPick.site}</p>
                        </div>
                        <div className="bg-dark-surface p-3 rounded-md border border-dark-border">
                            <p className="text-dark-text-secondary mb-1">Suggested Buy Condition</p>
                            <p className="font-semibold text-white">{topPick.when}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-dark-text-primary text-sm leading-relaxed border-t border-dark-border pt-4">{topPick.reasoning}</p>
                </div>

                <Section title="Top Contenders" icon={<BrainCircuitIcon className="w-5 h-5 text-indigo-400" />}>
                   <ul className="space-y-3">
                        {contenders.map((contender, index) => {
                             const changeColor = contender.change24h && contender.change24h >= 0 ? 'text-accent-green' : 'text-accent-red';
                             return (
                                <li key={index} className="p-3 bg-dark-surface rounded-md border border-dark-border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">{index + 1}. {contender.symbol}</p>
                                            <p className="text-xs text-dark-text-secondary mt-1 max-w-md">{contender.summary}</p>
                                        </div>
                                        {contender.price !== undefined && contender.change24h !== undefined && (
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <p className="font-mono font-semibold text-white">{formatPrice(contender.price)}</p>
                                                <p className={`font-mono font-semibold text-xs ${changeColor}`}>{contender.change24h.toFixed(2)}%</p>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                   </ul>
                </Section>

                <Section title="Market Overview">
                    <p>{marketOverview}</p>
                </Section>
            </div>
        )
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-surface rounded-lg border border-dark-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
                <header className="flex items-center justify-between p-4 border-b border-dark-border flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">AI Coin Screener Results</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-dark-text-secondary hover:bg-dark-border hover:text-white transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};