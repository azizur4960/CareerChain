import React from 'react';
import { Sparkles } from 'lucide-react';

const FitScoreBadge = ({ score, size = 'default', showLabel = true }) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  let colorScheme = {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    label: 'Strong Match',
  };

  if (numericScore < 60) {
    colorScheme = {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      label: 'Developing Match',
    };
  } else if (numericScore < 80) {
    colorScheme = {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
      label: 'Competitive Match',
    };
  }

  if (size === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}`}
      >
        <Sparkles className="h-3 w-3" />
        {numericScore}% Match
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text} shadow-sm`}
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-4 w-4" />
        <span className="font-extrabold text-sm">{numericScore}%</span>
      </div>
      {showLabel && (
        <>
          <span className="h-3.5 w-px bg-slate-300" />
          <span className="text-xs font-semibold">{colorScheme.label}</span>
        </>
      )}
    </div>
  );
};

export default FitScoreBadge;
