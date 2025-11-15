
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar, Cell, Scatter, Label } from 'recharts';
// FIX: Import 'ChartDataPoint' from '../types'.
import type { ChartDataPoint } from '../types';
import { PredictionTrend } from '../types';
// FIX: Import 'PencilIcon' and 'TrashIcon' from './icons'.
import { PencilIcon, TrashIcon } from './icons';

interface ForexChartProps {
  data: ChartDataPoint[] | null;
  trend: PredictionTrend | null;
  lineName: string;
  isFuture?: boolean;
  showIndicatorControls?: boolean;
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

const upColor = '#26a69a';
const downColor = '#ef5350';
const ema12Color = '#facc15';
const ema26Color = '#ef5350';
const bollingerBandColor = '#787b86';

const bullishPatternColor = '#facc15'; // yellow
const bearishPatternColor = '#f97316'; // orange-red
const neutralPatternColor = '#38bdf8'; // blue
const bullishEngulfingHighlightColor = '#2dd4bf'; // teal highlight

const getPatternColor = (type: 'bullish' | 'bearish' | 'neutral') => {
    switch (type) {
        case 'bullish': return bullishPatternColor;
        case 'bearish': return bearishPatternColor;
        case 'neutral': return neutralPatternColor;
        default: return '#FFFFFF';
    }
}

const IndicatorRow: React.FC<{ label: string, value: string | number, color?: string }> = ({ label, value, color }) => (
    <div className="flex justify-between items-center text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold" style={{ color: color || '#FFFFFF' }}>{value}</span>
    </div>
);


const CustomTooltip: React.FC<{ active?: boolean, payload?: any[], label?: string, isCrypto: boolean }> = ({ active, payload, label, isCrypto }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const priceFixedPoints = isCrypto ? 2 : 5;
        const indicatorFixedPoints = isCrypto ? 2 : 5;
        
        const isDoji = data.pattern?.name === 'Doji';
        const closeColor = isDoji ? neutralPatternColor : (data.open && data.price >= data.open ? upColor : downColor);

        return (
            <div className="p-3 bg-dark-surface border border-dark-border rounded-lg shadow-xl text-sm w-48 space-y-2">
                <p className="label text-dark-text-primary font-bold mb-2">{`${label}`}</p>
                
                {/* Price Info */}
                <div className="space-y-1">
                    {data.open !== undefined && <IndicatorRow label="Open" value={data.open.toFixed(priceFixedPoints)} />}
                    {data.high !== undefined && <IndicatorRow label="High" value={data.high.toFixed(priceFixedPoints)} />}
                    {data.low !== undefined && <IndicatorRow label="Low" value={data.low.toFixed(priceFixedPoints)} />}
                    {data.price !== undefined && <IndicatorRow label="Close" value={data.price.toFixed(priceFixedPoints)} color={closeColor} />}
                </div>

                {/* Indicators */}
                {(data.ema12 !== undefined || data.rsi !== undefined || data.macd !== undefined) && (
                     <div className="pt-2 border-t border-dark-border/50 space-y-1">
                        {data.ema12 !== undefined && <IndicatorRow label="EMA(12)" value={data.ema12.toFixed(indicatorFixedPoints)} color={ema12Color} />}
                        {data.ema26 !== undefined && <IndicatorRow label="EMA(26)" value={data.ema26.toFixed(indicatorFixedPoints)} color={ema26Color} />}
                        {data.bollingerUpper !== undefined && <IndicatorRow label="BB Upper" value={data.bollingerUpper.toFixed(indicatorFixedPoints)} color={bollingerBandColor} />}
                        {data.bollingerLower !== undefined && <IndicatorRow label="BB Lower" value={data.bollingerLower.toFixed(indicatorFixedPoints)} color={bollingerBandColor} />}
                        {data.rsi !== undefined && <IndicatorRow label="RSI(14)" value={data.rsi.toFixed(2)} color={'#c084fc'} />}
                        {data.macd !== undefined && <IndicatorRow label="MACD" value={data.macd.toFixed(indicatorFixedPoints)} color={'#38bdf8'} />}
                        {data.macdSignal !== undefined && <IndicatorRow label="Signal" value={data.macdSignal.toFixed(indicatorFixedPoints)} color={'#f97316'} />}
                        {data.macdHist !== undefined && <IndicatorRow label="Histogram" value={data.macdHist.toFixed(indicatorFixedPoints)} color={data.macdHist >= 0 ? 'rgba(38, 166, 154, 0.9)' : 'rgba(239, 83, 80, 0.9)'} />}
                    </div>
                )}
                 {data.pattern && (
                    <div className="pt-2 mt-2 border-t border-dark-border/50 text-center">
                        <p className="font-bold text-sm" style={{ color: getPatternColor(data.pattern.type) }}>{data.pattern.name}</p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};


const CandlestickBars: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => (
    <>
        {/* Wick */}
        <Bar dataKey={(d: ChartDataPoint) => [d.low!, d.high!]} barSize={2} legendType="none">
            {data.map((d, index) => {
                const isSecondCandleOfEngulfing = d.pattern?.name === 'Bullish Engulfing';
                const isFirstCandleOfEngulfing = index + 1 < data.length && data[index + 1].pattern?.name === 'Bullish Engulfing';
                const isPartOfEngulfing = isFirstCandleOfEngulfing || isSecondCandleOfEngulfing;

                const isDoji = d.pattern?.name === 'Doji';
                const baseColor = isDoji ? neutralPatternColor : (d.price >= d.open! ? upColor : downColor);

                const finalColor = isPartOfEngulfing ? bullishEngulfingHighlightColor : baseColor;

                return <Cell key={`cell-wick-${index}`} fill={finalColor} />;
            })}
        </Bar>
        {/* Body */}
        <Bar dataKey={(d: ChartDataPoint) => [d.open!, d.price]} barSize={8}>
            {data.map((d, index) => {
                const isSecondCandleOfEngulfing = d.pattern?.name === 'Bullish Engulfing';
                const isFirstCandleOfEngulfing = index + 1 < data.length && data[index + 1].pattern?.name === 'Bullish Engulfing';
                const isPartOfEngulfing = isFirstCandleOfEngulfing || isSecondCandleOfEngulfing;

                const isDoji = d.pattern?.name === 'Doji';
                const baseColor = isDoji ? neutralPatternColor : (d.price >= d.open! ? upColor : downColor);

                const fill = isSecondCandleOfEngulfing ? bullishEngulfingHighlightColor : baseColor;
                const stroke = isPartOfEngulfing ? bullishEngulfingHighlightColor : 'none';
                const strokeWidth = isPartOfEngulfing ? 1 : 0;
                
                return <Cell key={`cell-body-${index}`} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
            })}
        </Bar>
    </>
);

const BullishPatternMarker: React.FC<any> = ({ cx, cy }) => {
    if (cx === null || cy === null) return null;
    const size = 8;
    const points = `${cx},${cy} ${cx - size / 2},${cy + size} ${cx + size / 2},${cy + size}`;
    return (
        <polygon points={points} fill={bullishPatternColor} />
    );
};

const BearishPatternMarker: React.FC<any> = ({ cx, cy }) => {
    if (cx === null || cy === null) return null;
    const size = 8;
    const points = `${cx},${cy} ${cx - size / 2},${cy - size} ${cx + size / 2},${cy - size}`;
    return (
        <polygon points={points} fill={bearishPatternColor} />
    );
};

const NeutralPatternMarker: React.FC<any> = ({ cx, cy }) => {
    if (cx === null || cy === null) return null;
    return (
        <circle cx={cx} cy={cy} r={4} fill={neutralPatternColor} />
    );
};


export const ForexChart: React.FC<ForexChartProps> = ({ data, trend, lineName, isFuture = false, showIndicatorControls = false, stopLossPrice, takeProfitPrice }) => {
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [lines, setLines] = useState<{ start: ChartDataPoint; end: ChartDataPoint }[]>([]);
  const [tempLine, setTempLine] = useState<{ start: ChartDataPoint | null; end: ChartDataPoint | null }>({ start: null, end: null });
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>{isFuture ? "AI forecast chart will appear here." : "Prediction chart will appear here."}</p>
      </div>
    );
  }
  
  const hasCandlestickData = !isFuture && data.every(p => p.open !== undefined && p.high !== undefined && p.low !== undefined);
  // FIX: 'PredictionTrend' is a type, not a value. Use string literal for comparison.
  const trendColor = trend === 'BULLISH' ? upColor : downColor;

  let priceValues = hasCandlestickData ? data.flatMap(p => [p.low, p.high, p.patternMarkerY]) : data.map(p => p.price);
  if (stopLossPrice) priceValues.push(stopLossPrice);
  if (takeProfitPrice) priceValues.push(takeProfitPrice);

  const validPriceValues = priceValues.filter(v => v !== null && v !== undefined) as number[];

  if (validPriceValues.length === 0) {
      return null;
  }
  
  const minPrice = Math.min(...validPriceValues);
  const maxPrice = Math.max(...validPriceValues);
  const dataPriceRange = maxPrice - minPrice;

  // Add 5% padding on each side (total 10%) to the actual data range.
  const paddedDataRange = dataPriceRange * 1.1;
  
  // To prevent candles looking too flat during low volatility, define a minimum visible range for the Y-axis.
  // This acts as a 'zoom' level, controllable by the user.
  const avgPrice = (minPrice + maxPrice) / 2;
  const minVisibleYRange = (avgPrice * 0.004) / zoomLevel;

  // The final range of the Y-axis will be the larger of the padded data range or our minimum visible range.
  const finalYRange = Math.max(paddedDataRange, minVisibleYRange);
  
  // Center the domain on the midpoint of the price data.
  const midPoint = (minPrice + maxPrice) / 2;
  const domainMin = midPoint - finalYRange / 2;
  const domainMax = midPoint + finalYRange / 2;
  
  const isCrypto = data[0]?.price > 100;
  
  const hasIndicatorData = !isFuture && data.some(p => p.rsi !== undefined && p.macd !== undefined);
  
  const visibleIndicators = [showRSI, showMACD].filter(Boolean).length;
  let priceChartHeight = '100%';
  if (hasIndicatorData && visibleIndicators > 0) {
      priceChartHeight = `${100 - (visibleIndicators * 25)}%`;
  }
  const indicatorChartHeight = '25%';

  const handleMouseDown = (e: any) => {
    if (isDrawingMode && e && e.activePayload && e.activePayload.length > 0) {
      setTempLine({ start: e.activePayload[0].payload, end: e.activePayload[0].payload });
    }
  };

  const handleMouseMove = (e: any) => {
    if (tempLine.start && e && e.activePayload && e.activePayload.length > 0) {
      setTempLine(prev => ({ ...prev, end: e.activePayload[0].payload }));
    }
  };

  const handleMouseUp = () => {
    if (tempLine.start && tempLine.end) {
      if (tempLine.start.date !== tempLine.end.date) {
        setLines(prev => [...prev, tempLine as { start: ChartDataPoint; end: ChartDataPoint }]);
      }
    }
    setTempLine({ start: null, end: null });
  };


  return (
    <div className={`w-full h-full flex flex-col ${isDrawingMode ? 'cursor-crosshair' : ''}`}>
       <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-100 flex-shrink-0">
                {isFuture ? '24-Hour AI Forecast' : 'Live Market Trend (Simulated)'}
            </h3>
            <div className="flex items-center gap-4 flex-wrap justify-end">
                {!isFuture && showIndicatorControls && hasIndicatorData && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Indicators:</span>
                        <button onClick={() => setShowMACD(!showMACD)} className={`text-xs px-2 py-1 rounded transition-colors ${showMACD ? 'bg-indigo-600 text-white' : 'bg-dark-surface hover:bg-dark-border text-slate-300'}`}>MACD</button>
                        <button onClick={() => setShowRSI(!showRSI)} className={`text-xs px-2 py-1 rounded transition-colors ${showRSI ? 'bg-indigo-600 text-white' : 'bg-dark-surface hover:bg-dark-border text-slate-300'}`}>RSI</button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsDrawingMode(!isDrawingMode)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${isDrawingMode ? 'bg-indigo-600 text-white' : 'bg-dark-surface hover:bg-dark-border text-slate-300'}`}>
                        <PencilIcon className="w-3 h-3"/> Draw
                    </button>
                    <button onClick={() => setLines([])} disabled={lines.length === 0} className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors bg-dark-surface hover:bg-dark-border text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        <TrashIcon className="w-3 h-3"/> Clear
                    </button>
                </div>
                {hasCandlestickData && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="zoom-slider" className="text-xs text-slate-400 whitespace-nowrap">Candle Height</label>
                        <input
                            id="zoom-slider"
                            type="range"
                            min="0.5"
                            max="2.5"
                            step="0.1"
                            value={zoomLevel}
                            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                            className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            aria-label="Candlestick height adjustment"
                        />
                    </div>
                )}
            </div>
        </div>

      <ResponsiveContainer width="100%" height={priceChartHeight}>
        <ComposedChart 
          data={data} 
          syncId="forexSync" 
          margin={{ top: 5, right: 5, left: 0, bottom: 5, }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#2a2e39" />
          <XAxis dataKey="date" stroke="#8b92a1" fontSize={12} tickLine={false} axisLine={false} tick={hasIndicatorData && visibleIndicators > 0 ? { display: 'none' } : {}}/>
          <YAxis stroke="#8b92a1" fontSize={12} tickLine={false} axisLine={false} domain={[domainMin, domainMax]} tickFormatter={(value) => isCrypto ? `$${Math.round(value)}` : `${value.toFixed(4)}`} />
          <Tooltip content={<CustomTooltip isCrypto={isCrypto} />} cursor={{ stroke: '#8b92a1', strokeWidth: 1, strokeDasharray: '3 3' }}/>
          
          {takeProfitPrice && !isFuture && (
            <ReferenceLine y={takeProfitPrice} stroke={upColor} strokeDasharray="4 4" strokeWidth={2}>
              <Label value={`TP: ${takeProfitPrice.toFixed(isCrypto ? 2 : 4)}`} position="right" fill={upColor} fontSize={12} style={{ backgroundColor: 'rgba(19, 23, 34, 0.7)', padding: '2px 4px', borderRadius: '3px' }} />
            </ReferenceLine>
          )}
          {stopLossPrice && !isFuture && (
            <ReferenceLine y={stopLossPrice} stroke={downColor} strokeDasharray="4 4" strokeWidth={2}>
              <Label value={`SL: ${stopLossPrice.toFixed(isCrypto ? 2 : 4)}`} position="right" fill={downColor} fontSize={12} style={{ backgroundColor: 'rgba(19, 23, 34, 0.7)', padding: '2px 4px', borderRadius: '3px' }}/>
            </ReferenceLine>
          )}

          {hasCandlestickData ? (
             <>
                <Line type="monotone" dataKey="bollingerUpper" stroke={bollingerBandColor} strokeWidth={1} dot={false} strokeDasharray="3 3" legendType="none" />
                <Line type="monotone" dataKey="bollingerLower" stroke={bollingerBandColor} strokeWidth={1} dot={false} strokeDasharray="3 3" legendType="none" />
                <CandlestickBars data={data} />
                <Line type="monotone" dataKey="ema12" stroke={ema12Color} strokeWidth={2} dot={false} legendType="none" />
                <Line type="monotone" dataKey="ema26" stroke={ema26Color} strokeWidth={2} dot={false} legendType="none" />
                <Scatter dataKey="patternMarkerY" data={data.filter(p => p.pattern?.type === 'bullish')} shape={<BullishPatternMarker />} zIndex={100}/>
                <Scatter dataKey="patternMarkerY" data={data.filter(p => p.pattern?.type === 'bearish')} shape={<BearishPatternMarker />} zIndex={100}/>
                <Scatter dataKey="patternMarkerY" data={data.filter(p => p.pattern?.type === 'neutral')} shape={<NeutralPatternMarker />} zIndex={100}/>
            </>
          ) : (
            <Line type="monotone" dataKey="price" stroke={trendColor} strokeWidth={2} dot={false} activeDot={{ r: 6 }} name={lineName} strokeDasharray={isFuture ? "5 5" : "0"}/>
          )}

          {/* Render finalized trendlines */}
          {lines.map((line, index) => (
            <Line key={`line-${index}`} type="linear" data={[line.start, line.end]} dataKey="price" stroke="#a78bfa" strokeWidth={2} dot={false} legendType="none" xAxisId={0} yAxisId={0}/>
          ))}
          {/* Render temporary line while drawing */}
          {tempLine.start && tempLine.end && (
              <Line type="linear" data={[tempLine.start, tempLine.end]} dataKey="price" stroke="#a78bfa" strokeWidth={2} strokeDasharray="5 5" dot={false} legendType="none" xAxisId={0} yAxisId={0}/>
          )}

        </ComposedChart>
      </ResponsiveContainer>

      {hasIndicatorData && showRSI && (
         <ResponsiveContainer width="100%" height={indicatorChartHeight}>
            <LineChart data={data} syncId="forexSync" margin={{ top: 10, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                 <XAxis dataKey="date" stroke="#8b92a1" fontSize={12} tickLine={false} axisLine={false} tick={showMACD ? { display: 'none' } : {}}/>
                <YAxis stroke="#8b92a1" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[10, 30, 50, 70, 90]} />
                <Tooltip content={<CustomTooltip isCrypto={isCrypto} />} cursor={{ stroke: '#8b92a1', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="rsi" stroke="#c084fc" strokeWidth={1} dot={false} />
            </LineChart>
         </ResponsiveContainer>
      )}

      {hasIndicatorData && showMACD && (
         <ResponsiveContainer width="100%" height={indicatorChartHeight}>
            <ComposedChart data={data} syncId="forexSync" margin={{ top: 10, right: 5, left: 0, bottom: 5, }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" />
                <XAxis dataKey="date" stroke="#8b92a1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b92a1" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(isCrypto ? 0 : 4)} allowDecimals={false} />
                <Tooltip content={<CustomTooltip isCrypto={isCrypto} />} cursor={{ stroke: '#8b92a1', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                <ReferenceLine y={0} stroke="#8b92a1" strokeDasharray="2 2" />
                <Bar dataKey="macdHist" barSize={5}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.macdHist && entry.macdHist >= 0 ? 'rgba(38, 166, 154, 0.6)' : 'rgba(239, 83, 80, 0.6)'} />
                    ))}
                </Bar>
                <Line type="monotone" dataKey="macd" stroke="#38bdf8" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="macdSignal" stroke="#f97316" strokeWidth={1} dot={false} />
            </ComposedChart>
         </ResponsiveContainer>
      )}
    </div>
  );
};
