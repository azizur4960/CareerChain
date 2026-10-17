import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const SelectField = ({ id, label, value, onChange, placeholder, options }) => (
  <div className="min-w-0">
    <label htmlFor={id} className="mb-2 block text-xs font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <select
        id={id}
        value={value || ''}
        onChange={onChange}
        className="cc-control h-11 w-full appearance-none rounded-xl border-slate-200 bg-slate-50/70 pr-10 font-medium shadow-sm transition hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  </div>
);

const FilterPanel = ({ filters, onChange, onReset, options = {}, description }) => {
  const activeCount = Object.values(filters).filter((value) => (
    typeof value === 'boolean' ? value : Boolean(String(value ?? '').trim())
  )).length;
  const fieldCount = (options.alumniFilters ? 4 : 0)
    + Number(Boolean(options.workMode))
    + Number(Boolean(options.employmentType))
    + Number(Boolean(options.category))
    + Number(options.mentorshipOnly !== undefined)
    + Number(options.verifiedOnly !== undefined);
  const gridClass = fieldCount <= 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : fieldCount === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section aria-label="Search filters" className="cc-surface overflow-hidden rounded-2xl shadow-sm shadow-slate-900/[0.03]">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-700">
            <Filter aria-hidden="true" className="h-[18px] w-[18px]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Filters</h2>
              {activeCount > 0 && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  {activeCount} active
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{description || 'Refine the results to find the right match.'}</p>
          </div>
        </div>
        {onReset && activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg px-2.5 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-indigo-700 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 sm:self-auto"
          >
            <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>

      <div className={`grid ${gridClass} gap-x-4 gap-y-4 p-4 sm:p-5`}>
        {options.alumniFilters && [
          ['batch', 'Graduation batch'],
          ['department', 'Department'],
          ['company', 'Company'],
          ['skills', 'Professional skill'],
        ].map(([key, label]) => (
          <div key={key} className="min-w-0">
            <label className="mb-2 block text-xs font-semibold text-slate-700" htmlFor={`filter-${key}`}>
              {label}
            </label>
            <input
              id={`filter-${key}`}
              type="search"
              value={filters[key] || ''}
              onChange={(event) => onChange(key, event.target.value)}
              placeholder={`Filter by ${label.toLowerCase()}`}
              className="cc-control h-11 w-full rounded-xl border-slate-200 bg-slate-50/70 px-3.5 shadow-sm transition placeholder:font-normal hover:border-slate-300 hover:bg-white focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        ))}

        {options.workMode && (
          <SelectField
            id="filter-work-mode"
            label="Work mode"
            value={filters.workMode}
            onChange={(event) => onChange('workMode', event.target.value)}
            placeholder="All work modes"
            options={['Remote', 'Hybrid', 'Onsite']}
          />
        )}

        {options.employmentType && (
          <SelectField
            id="filter-employment-type"
            label="Employment type"
            value={filters.employmentType}
            onChange={(event) => onChange('employmentType', event.target.value)}
            placeholder="All employment types"
            options={['Full-time', 'Internship', 'Part-time', 'Contract']}
          />
        )}

        {options.category && (
          <SelectField
            id="filter-category"
            label="Category"
            value={filters.category}
            onChange={(event) => onChange('category', event.target.value)}
            placeholder="All categories"
            options={['Success Story', 'Interview Prep', 'DevOps & Cloud', 'Design & UX', 'Data & AI', 'Career Guidance']}
          />
        )}

        {options.mentorshipOnly !== undefined && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/50">
            <input
              type="checkbox"
              checked={filters.mentorshipOnly || false}
              onChange={(event) => onChange('mentorshipOnly', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Available for mentorship
          </label>
        )}

        {options.verifiedOnly !== undefined && (
          <label className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/50">
            <input
              type="checkbox"
              checked={filters.verifiedOnly || false}
              onChange={(event) => onChange('verifiedOnly', event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Verified alumni only
          </label>
        )}
      </div>
    </section>
  );
};

export default FilterPanel;
