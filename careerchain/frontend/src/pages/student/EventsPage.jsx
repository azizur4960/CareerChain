import React, { useState, useEffect } from 'react';
import { eventsApi } from '../../api/events';
import EventCard from '../../components/EventCard';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { Calendar } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEvents({
        event_type: selectedType || undefined,
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load upcoming events.');
    } finally {
      setLoading(false);
    }
  };

  const types = ['Webinar', 'Workshop', 'Career Fair'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Webinars & Career Events
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Join live interactive workshops, tech summits, and mock interview marathons organized by DIU alumni.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedType('')}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              selectedType === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Events
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedType === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader message="Loading scheduled campus events..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No upcoming events"
          description="There are currently no events matching the selected filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
