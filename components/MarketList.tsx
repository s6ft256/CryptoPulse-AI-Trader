import React, { useState, useMemo } from 'react';
import type { CryptoPair } from '../types';

interface MarketListProps {
  pairs: CryptoPair[];
  selectedPair: CryptoPair;
  onSelectPair: (pair: CryptoPair) => void;
}

export const MarketList: React.FC<MarketListProps> = ({ pairs, selectedPair, onSelectPair }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPairs = useMemo(() => {
    return pairs.filter(p => p.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [pairs, searchTerm]);

  return (
    <div className="bg-dark-surface h-full flex flex-col">
      <div className="p-2 border-b border-dark-border">
        <input
          type="text"
          placeholder="Search markets..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-dark-bg text-dark-text-primary placeholder-dark-text-secondary p-2 rounded-md border border-dark-border focus:outline-none focus:ring-1 focus:ring-accent-blue"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-dark-surface">
            <tr>
              <th className="text-left font-normal text-dark-text-secondary p-2">Pair</th>
              {/* Add more columns like price/change if real-time data is piped here */}
            </tr>
          </thead>
          <tbody>
            {filteredPairs.map(pair => (
              <tr
                key={pair.symbol}
                onClick={() => onSelectPair(pair)}
                className={`cursor-pointer hover:bg-dark-border ${selectedPair.symbol === pair.symbol ? 'bg-accent-blue/20' : ''}`}
              >
                <td className={`p-2 font-medium ${selectedPair.symbol === pair.symbol ? 'text-white' : 'text-dark-text-primary'}`}>{pair.symbol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
