
import React from 'react';
// FIX: Import missing type 'PredictionAnalysis'.
import type { PredictionAnalysis } from '../types';
// FIX: Import missing icons 'CloseIcon' and 'TrendingUpIcon'.
import { LoadingSpinner, CloseIcon, TrendingUpIcon } from './icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PredictionAnalysisModalProps {
  analysis: PredictionAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const AnalysisSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-lg font-semibold text-indigo-400 mb-2">{title}</h3>
    <div className="text-slate-300 space-y-2 text-sm leading-relaxed">{children}</div>
  </div>
);

const BacktestMetrics: React.FC<{ sharpe: number; drawdown: string }> = ({ sharpe, drawdown }) => (
    <div className="grid grid-cols-2 gap-4">
        <div className="bg-brand-bg-dark p-4 rounded-lg text-center">
            <p className="text-sm text-slate-400">Sharpe Ratio</p>
            <p className="text-2xl font-bold font-mono text-white">{sharpe.toFixed(2)}</p>
        </div>
        <div className="bg-brand-bg-dark p-4 rounded-lg text-center">
            <p className="text-sm text-slate-400">Max Drawdown</p>
            <p className="text-2xl font-bold font-mono text-brand-red">{drawdown}</p>
        </div>
    </div>
);

export const PredictionAnalysisModal: React.FC<PredictionAnalysisModalProps> = ({ analysis, isLoading, error, onClose }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px]">
          <LoadingSpinner />
          <p className="mt-4 text-slate-300">AI is performing deep analysis & backtesting...</p>
          <p className="text-xs text-slate-500 mt-2">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-brand-red min-h-[300px] flex flex-col items-center justify-center">
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      );
    }
    
    if (!analysis) return null;

    return (
      <div className="space-y-6">
        <AnalysisSection title="Simulated Backtest Results">
            <BacktestMetrics sharpe={analysis.sharpeRatio} drawdown={analysis.maxDrawdown} />
            <div className="h-64 mt-4 bg-brand-bg-dark p-2 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysis.equityCurve} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="period" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                            labelStyle={{ color: '#cbd5e1' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </AnalysisSection>

        <AnalysisSection title="Performance Summary">
            <p>{analysis.performanceSummary}</p>
        </AnalysisSection>
        <AnalysisSection title="Root Causes of Errors">
            <ul className="list-disc list-inside space-y-1">
                {analysis.errorRootCauses.map((cause, index) => <li key={index}>{cause}</li>)}
            </ul>
        </AnalysisSection>
        <AnalysisSection title="Recommended Adjustments">
            <ul className="list-disc list-inside space-y-1">
                {analysis.recommendedAdjustments.map((rec, index) => <li key={index}>{rec}</li>)}
            </ul>
        </AnalysisSection>
        <AnalysisSection title="Expected Outcome">
            <p>{analysis.expectedOutcome}</p>
        </AnalysisSection>
        <AnalysisSection title="Reinforcement Strategy">
            <p>{analysis.reinforcementStrategy}</p>
        </AnalysisSection>
        <AnalysisSection title="Confidence Evaluation">
            <p>{analysis.confidenceEvaluation}</p>
        </AnalysisSection>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-brand-bg-light rounded-lg border border-brand-border w-full max-w-2xl max-h-[90vh] flex flex-col">
            <header className="flex items-center justify-between p-4 border-b border-brand-border flex-shrink-0">
                <h2 className="text-xl font-bold text-white">Prediction Performance Analysis</h2>
                <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
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
