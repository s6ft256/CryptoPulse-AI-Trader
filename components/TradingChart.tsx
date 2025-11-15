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


// Dynamic price formatting for labels and axes to support a wide range of crypto values
const formatPrice = (price: number): string => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.0001) return price.toFixed(6);
    return price.toPrecision(2);
};


export const TradingChart: React.FC<TradingChartProps> = ({ data, prediction }) => {
  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-dark-text-secondary">Loading chart data...</div>;
  }
  
  // Dynamically adjust Y-axis domain to include candle prices and AI predictions
  let prices = data.flatMap(d => [d.high, d.low]);
  if (prediction) {
      prices.push(prediction.potentialHigh, prediction.potentialLow);
  }
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const domainPadding = (maxPrice - minPrice) * 0.15; // Increased padding slightly for better visuals

  // Refined label style for better visibility
  const labelStyle: React.CSSProperties = {
      backgroundColor: 'rgba(19, 23, 34, 0.8)', 
      padding: '3px 6px', 
      borderRadius: '4px',
      border: '1px solid #2a2e39',
      textShadow: '0 1px 2px rgba(0,0,0,0.5)'
  };


  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 5, right: 70, bottom: 5, left: -20 }}>
          <CartesianGrid stroke={ '#2a2e39'} strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke={'#8b92a1'} fontSize={10} tickLine={false} axisLine={false} />
          <YAxis
            orientation="right"
            stroke={'#8b92a1'}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            domain={[minPrice - domainPadding, maxPrice + domainPadding]}
            tickFormatter={(value) => typeof value === 'number' ? formatPrice(value) : ''}
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
          
          {/* AI Prediction Visualization - REFINED */}
          {prediction && (
              <>
                  {/* Shaded area for potential price range (confidence interval) */}
                  <ReferenceArea 
                      y1={prediction.potentialLow} 
                      y2={prediction.potentialHigh} 
                      stroke="#2962ff" 
                      strokeOpacity={0.4} 
                      fill="#2962ff" 
                      fillOpacity={0.15} 
                      ifOverflow="visible" 
                  />
                  
                  {/* Line for the price target - more distinct */}
                  <ReferenceLine y={prediction.priceTarget} stroke="#538eff" strokeWidth={2} strokeDasharray="8 4">
                      <Label 
                          value={`Target: ${formatPrice(prediction.priceTarget)}`} 
                          fill="#538eff" 
                          position="right" 
                          fontSize={12} 
                          fontWeight="bold" 
                          style={labelStyle}
                      />
                  </ReferenceLine>
                  
                  {/* Line for the potential high */}
                  <ReferenceLine y={prediction.potentialHigh} stroke="#26a69a" strokeDasharray="2 4" strokeWidth={1.5}>
                      <Label 
                          value={`High: ${formatPrice(prediction.potentialHigh)}`} 
                          fill="#26a69a" 
                          position="right" 
                          fontSize={10} 
                          style={labelStyle}
                      />
                  </ReferenceLine>

                  {/* Line for the potential low */}
                  <ReferenceLine y={prediction.potentialLow} stroke="#ef5350" strokeDasharray="2 4" strokeWidth={1.5}>
                      <Label 
                          value={`Low: ${formatPrice(prediction.potentialLow)}`} 
                          fill="#ef5350" 
                          position="right" 
                          fontSize={10} 
                          style={labelStyle}
                      />
                  </ReferenceLine>
              </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};