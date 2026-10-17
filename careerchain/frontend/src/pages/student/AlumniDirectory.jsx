import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alumniApi } from '../../api/alumni';
import { aiApi } from '../../api/ai';
import AlumniCard from '../../components/AlumniCard';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import UserAvatar from '../../components/UserAvatar';
import { ArrowRight, Users, Sparkles } from 'lucide-react';

const AlumniDirectory = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    batch: '',
    department: '',
    company: '',
    skills: '',
    mentorshipOnly: false,
    verifiedOnly: false,
  });

  useEffect(() => {
    fetchAlumniData();
  }, [search, filters]);

  const fetchAlumniData = async () => {
    try {
      setLoading(true);
      const [alumniData, recsData] = await Promise.all([
        alumniApi.getAlumni({
          search: search || undefined,
          batch: filters.batch || undefined,
          department: filters.department || undefined,
          company: filters.company || undefined,
          skills: filters.skills || undefined,
          mentorship_only: filters.mentorshipOnly || undefined,
          verified_only: filters.verifiedOnly || undefined,
        }),
        aiApi.getRecommendedMentors().catch(() => ({ recommendations: [] })),
      ]);

      setAlumniList(alumniData);
      setRecommendedMentors(recsData?.recommendations || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load alumni directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ batch: '', department: '', company: '', skills: '', mentorshipOnly: false, verifiedOnly: false });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          DIU Alumni Directory & Mentors
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Connect with verified DIU alumni across top tech companies for guidance, resume advice, and job referrals.
        </p>
      </div>

      {/* AI Recommended Mentors Banner */}
      {recommendedMentors.length > 0 && !search && (
        <section className="border-y border-slate-200 py-5" aria-labelledby="recommended-mentors-title">
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-700" aria-hidden="true" />
              <h2 id="recommended-mentors-title" className="text-base font-bold text-slate-900">Mentors aligned with your profile</h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">Ranked by target-role similarity, shared skills, and mentorship availability.</p>
          </div>

          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-3">
            {recommendedMentors.slice(0, 3).map((rec) => {
              const profile = rec.alumni.alumni_profile || {};
              return (
                <article key={rec.alumni.id} className="border-t border-slate-200 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={rec.alumni} size="small" />
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">{rec.alumni.full_name}</h3>
                          <p className="mt-0.5 truncate text-xs text-slate-600">{profile.current_position || 'Professional'}{profile.current_company ? ` · ${profile.current_company}` : ''}</p>
                        </div>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-indigo-800">{rec.match_score}%</span>
                  </div>
                  {rec.shared_skills.length > 0 && <p className="mt-2 text-xs text-slate-500">Shared skills: {rec.shared_skills.join(', ')}</p>}
                  <Link to={`/student/alumni/${rec.alumni.id}`} className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900">
                    View alumni profile<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by alumni name, company, position, or skills..."
        />
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          options={{ mentorshipOnly: true, verifiedOnly: true, alumniFilters: true }}
        />
      </div>

      {/* Directory Grid */}
      {loading ? (
        <Loader message="Loading verified alumni..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAlumniData} />
      ) : alumniList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No alumni found"
          description="Try broadening your search query or toggling filters."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alumniList.map((alumni) => (
            <AlumniCard key={alumni.id} user={alumni} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlumniDirectory;
