import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are currently no items matching your criteria.',
  actionLabel = null,
  actionLink = null,
  onAction = null,
}) => {
  return (
    <div className="my-4 flex flex-col items-start border-y border-slate-200 py-7 text-left">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-xl text-sm leading-5 text-slate-600">{description}</p>
      
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="cc-button-primary mt-4"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}

      {actionLabel && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="cc-button-secondary mt-4"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
