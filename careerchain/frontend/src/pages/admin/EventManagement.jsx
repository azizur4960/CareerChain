import React, { useState, useEffect } from 'react';
import { eventsApi } from '../../api/events';
import { Calendar, PlusCircle, Trash2, Video, ExternalLink } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';

const createEmptyEvent = () => ({
  title: '',
  description: '',
  event_type: 'Webinar',
  date: new Date().toISOString().slice(0, 10),
  time: '',
  location: '',
  meeting_url: '',
  registration_url: '',
});

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(createEmptyEvent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and remove this event?')) return;
    try {
      setActionError('');
      await eventsApi.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.detail || 'The event could not be cancelled. Please try again.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    try {
      const created = await eventsApi.createEvent(formData);
      setEvents((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setFormData(createEmptyEvent());
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || 'The event could not be published. Check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Event & Webinar Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Schedule workshops, webinars, and mock interview sessions for DIU students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setFormError(''); setIsModalOpen(true); }}
          className="cc-button-primary self-start"
        >
          <PlusCircle className="h-4 w-4" />
          Schedule Event
        </button>
      </div>

      {actionError && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{actionError}</p>}

      {loading ? (
        <Loader message="Loading events..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchEvents} />
      ) : (
        events.length === 0 ? (
          <EmptyState icon={Calendar} title="No campus events scheduled" description="Published events and webinars will appear here." actionLabel="Schedule an event" onAction={() => setIsModalOpen(true)} />
        ) : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase rounded bg-indigo-50 text-indigo-700 px-2 py-0.5">
                    {ev.event_type}
                  </span>
                  <span className="text-xs text-slate-500">{ev.date} at {ev.time}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{ev.description}</p>
                <p className="text-[11px] text-slate-400 mt-2">📍 {ev.location}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                {ev.meeting_url && (
                  <a
                    href={ev.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Video className="h-3 w-3" />
                    Meeting Link
                  </a>
                )}
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Cancel Event
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule a campus event">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{formError}</p>}
          <div>
            <label htmlFor="event-title" className="block text-xs font-semibold text-slate-700 mb-1">Event title</label>
            <input
              id="event-title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. DIU System Design Bootcamp"
              className="cc-control w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-type" className="block text-xs font-semibold text-slate-700 mb-1">Event type</label>
              <select
                id="event-type"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="cc-control w-full"
              >
                <option value="Webinar">Webinar</option>
                <option value="Workshop">Workshop</option>
                <option value="Career Fair">Career Fair</option>
              </select>
            </div>

            <div>
              <label htmlFor="event-date" className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                id="event-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="cc-control w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-time" className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
              <input
                id="event-time"
                type="text"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 07:30 PM BST"
                className="cc-control w-full"
              />
            </div>

            <div>
              <label htmlFor="event-location" className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
              <input
                id="event-location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Online Zoom or Campus Lab"
                className="cc-control w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-meeting-url" className="block text-xs font-semibold text-slate-700 mb-1">Meeting URL</label>
            <input
              id="event-meeting-url"
              type="url"
              value={formData.meeting_url}
              onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
              placeholder="https://zoom.us/j/..."
              className="cc-control w-full"
            />
          </div>

          <div>
            <label htmlFor="event-registration-url" className="block text-xs font-semibold text-slate-700 mb-1">Registration URL</label>
            <input
              id="event-registration-url"
              type="url"
              value={formData.registration_url}
              onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
              placeholder="https://…"
              className="cc-control w-full"
            />
          </div>

          <div>
            <label htmlFor="event-description" className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              id="event-description"
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event agenda, speaker background, and session takeaways..."
              className="cc-control w-full py-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="cc-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cc-button-primary"
            >
              {isSubmitting ? 'Publishing…' : 'Publish event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventManagement;
