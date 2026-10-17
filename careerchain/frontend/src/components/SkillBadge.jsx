import React from 'react';

const SkillBadge = ({ skill, variant = 'default', size = 'default' }) => {
  const variantStyles = {
    default: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100',
    matched: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    missing: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };

  const sizeStyles = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-1 font-medium',
    large: 'text-sm px-3 py-1.5 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border transition-colors ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.default}`}
    >
      {skill}
    </span>
  );
};

export default SkillBadge;
