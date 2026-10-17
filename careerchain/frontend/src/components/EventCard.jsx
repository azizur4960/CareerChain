import React from 'react';
import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-react';

const EventCard = ({ event }) => {
  return (
    <article className="cc-surface flex flex-col justify-between p-5 transition-colors hover:border-indigo-300">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            {event.event_type}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {event.time}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {event.title}
        </h3>

        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600">
          <Calendar className="h-4 w-4 text-indigo-600 flex-shrink-0" />
          <span>{event.date}</span>
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        <p className="mt-3.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
        {event.meeting_url ? (
          <a
            href={event.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Video className="h-3.5 w-3.5" />
            Join Meeting
          </a>
        ) : (
          <span className="text-xs text-slate-400 italic">No link required</span>
        )}

        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Register <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
};

export default EventCard;
