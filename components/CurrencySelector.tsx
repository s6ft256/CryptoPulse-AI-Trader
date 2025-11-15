import React from 'react';

interface Asset {
  code: string;
  name: string;
}

interface AssetSelectorProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label: string;
  assets: Asset[];
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ id, value, onChange, label, assets }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-slate-400 mb-2">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 bg-brand-bg-dark border border-brand-border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
      >
        {assets.map((asset) => (
          <option key={asset.code} value={asset.code}>
            {asset.code} - {asset.name}
          </option>
        ))}
      </select>
    </div>
  );
};