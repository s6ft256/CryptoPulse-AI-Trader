import React from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Cell, Line, ReferenceLine, Label, ReferenceArea } from 'recharts';
import type { Candle, AIPrediction } from '../types';

interface TradingChartProps {
  data: Candle[];
  prediction?: AIPrediction | null;
}

const CustomTooltipContent: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const priceColor = data.close >= data.open ? 'text-accent-green' : 'text-accent-red';
    return (
      <div className="bg-dark-surface p-2 rounded-md border border-dark-border text-xs text-dark-text-secondary">
        <p className="text-dark-text-primary">{label}</p>
        <p>Open: <span className="font-mono text-white">{data.open.toFixed(4)}</span></p>
        <p>High: <span className="font-mono text-white">{data.high.toFixed(4)}</span></p>
        <p>Low: <span className="font-mono text-white">{data.low.toFixed(4)}</span></p>
        <p>Close: <span className={`font-mono ${priceColor}`}>{data.close.toFixed(4)}</span></p>
        <p>Volume: <span className="font-mono text-white">{data.volume.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

export const TradingChart: React.FC<TradingChartProps> = ({ data, prediction }) => {
  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-dark-text-secondary">Loading chart data...</div>;
  }
  
  let prices = data.flatMap(d => [d.high, d.low]);
  if (prediction) {
      prices.push(prediction.potentialHigh, prediction.potentialLow);
  }
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const domainPadding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 5, right: 60, bottom: 5, left: -20 }}>
          <CartesianGrid stroke={ '#2a2e39'} strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke={'#8b92a1'} fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            orientation="right"
            stroke={'#8b92a1'}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[minPrice - domainPadding, maxPrice + domainPadding]}
            tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : ''}
          />
          <Tooltip content={<CustomTooltipContent />} />

          {/* Candlestick - Body */}
          <Bar dataKey={(d: Candle) => [d.open, d.close]} barSize={6}>
            {data.map((d, index) => (
              <Cell key={`cell-body-${index}`} fill={d.close >= d.open ? '#26a69a' : '#ef5350'} />
            ))}
          </Bar>
          {/* Candlestick - Wick */}
          <Bar dataKey={(d: Candle) => [d.low, d.high]} barSize={1} legendType="none">
            {data.map((d, index) => (
              <Cell key={`cell-wick-${index}`} fill={d.close >= d.open ? '#26a69a' : '#ef5350'} />
            ))}
          </Bar>
          
          {/* AI Prediction Lines */}
          {prediction && (
              <>
                  <ReferenceArea y1={prediction.potentialLow} y2={prediction.potentialHigh} stroke="none" fill="#2962ff" fillOpacity={0.1} ifOverflow="visible" />
                  <ReferenceLine y={prediction.priceTarget} stroke="#2962ff" strokeWidth={2}>
                      <Label value={`Target: ${prediction.priceTarget.toFixed(2)}`} fill="#2962ff" position="right" fontSize={12} fontWeight="bold" />
                  </ReferenceLine>
                  <ReferenceLine y={prediction.potentialHigh} stroke="#26a69a" strokeDasharray="3 3">
                      <Label value={`High: ${prediction.potentialHigh.toFixed(2)}`} fill="#26a69a" position="right" fontSize={10} />
                  </ReferenceLine>
                  <ReferenceLine y={prediction.potentialLow} stroke="#ef5350" strokeDasharray="3 3">
                      <Label value={`Low: ${prediction.potentialLow.toFixed(2)}`} fill="#ef5350" position="right" fontSize={10} />
                  </ReferenceLine>
              </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};