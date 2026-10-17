import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { alumniApi } from '../../api/alumni';
import { CheckCircle, XCircle, Search, ShieldCheck, Award } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const AlumniVerification = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const data = await alumniApi.getAlumni();
      setAlumniList(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load alumni profiles for verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (alumni) => {
    const profileId = alumni.alumni_profile?.id;
    if (!profileId) return;

    try {
      await adminApi.toggleAlumniVerification(profileId);
      // Toggle locally
      setAlumniList((prev) =>
        prev.map((a) => {
          if (a.id === alumni.id) {
            return {
              ...a,
              alumni_profile: {
                ...a.alumni_profile,
                is_verified: !a.alumni_profile.is_verified,
              },
            };
          }
          return a;
        })
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update verification status.');
    }
  };

  const filtered = alumniList.filter((a) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.full_name?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.alumni_profile?.current_company?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Alumni Credential Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify graduation records and grant verified trust badges for alumni mentors.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by alumni name, email, or employer..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <Loader message="Loading alumni records..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchAlumni} />
      ) : (
        <>
        {filtered.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No alumni match" description="Try another name, email, or employer." actionLabel="Clear search" onAction={() => setSearch('')} />
        ) : (
        <div className="space-y-3 md:hidden">
          {filtered.map((a) => {
            const profile = a.alumni_profile || {};
            return (
              <article key={a.id} className="cc-surface space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-slate-900">{a.full_name}</h2>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{a.email}</p>
                  </div>
                  <span className="text-right text-xs font-semibold text-slate-600">Batch {profile.graduation_batch || '—'}</span>
                </div>
                <div className="border-y border-slate-200 py-3 text-xs">
                  <p className="font-medium text-slate-800">{profile.current_position || 'Position not set'}</p>
                  <p className="mt-0.5 text-slate-500">{profile.current_company || 'Company not set'} · {profile.years_of_experience || 0} years</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${profile.is_verified ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {profile.is_verified ? 'Verified alumni' : 'Pending review'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleVerification(a)}
                    className={`min-h-10 rounded-md px-3 text-xs font-semibold ${profile.is_verified ? 'border border-rose-300 text-rose-800 hover:bg-rose-50' : 'bg-indigo-700 text-white hover:bg-indigo-800'}`}
                  >
                    {profile.is_verified ? 'Revoke verification' : 'Verify alumni'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        )}

        <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Alumni Name</th>
                  <th className="py-3.5 px-4">Company & Role</th>
                  <th className="py-3.5 px-4">Batch</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((a) => {
                  const prof = a.alumni_profile || {};
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{a.full_name}</div>
                        <div className="text-[11px] text-slate-400">{a.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{prof.current_company || '—'}</div>
                        <div className="text-[11px] text-slate-500">{prof.current_position}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {prof.graduation_batch || 'DIU'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {prof.years_of_experience || 0} Years
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            prof.is_verified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {prof.is_verified ? 'Verified Alumni' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleVerification(a)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                            prof.is_verified
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          }`}
                        >
                          {prof.is_verified ? 'Revoke Status' : 'Approve & Verify'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default AlumniVerification;
