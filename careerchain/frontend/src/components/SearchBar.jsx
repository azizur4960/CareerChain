import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search by keyword, skills, or title...', onClear = null }) => {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type="search"
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="cc-control w-full py-2.5 pl-10 pr-10 transition-colors"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => (onClear ? onClear() : onChange(''))}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
