import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { Users, Search, Shield, Check, X, AlertCircle } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(selectedRole);
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const updated = await adminApi.toggleUserStatus(userId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: updated.is_active } : u))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to update user status.');
    }
  };

  const handleToggleIdentityVerification = async (userId) => {
    try {
      const updated = await adminApi.toggleIdentityVerification(userId);
      setUsers((prev) => prev.map((user) => (
        user.id === userId
          ? { ...user, is_identity_verified: updated.is_identity_verified }
          : user
      )));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update identity verification.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.university_id?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review registered students, alumni, and administrators.
          </p>
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['', 'STUDENT', 'ALUMNI', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                selectedRole === r
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by name, email, or DIU ID..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {loading ? (
        <Loader message="Loading platform users..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : (
        <>
        {filteredUsers.length === 0 ? (
          <EmptyState icon={Users} title="No accounts match" description="Try another name, email, university ID, or role filter." actionLabel="Clear search and role" onAction={() => { setSearch(''); setSelectedRole(''); }} />
        ) : (
        <div className="space-y-3 md:hidden">
          {filteredUsers.map((u) => (
            <article key={u.id} className="cc-surface space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-slate-900">{u.full_name}</h2>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{u.email}</p>
                </div>
                <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-800">{u.role}</span>
              </div>
              <dl className="grid grid-cols-2 gap-3 border-y border-slate-200 py-3 text-xs">
                <div><dt className="text-slate-500">University ID</dt><dd className="mt-0.5 break-words font-medium text-slate-800">{u.university_id || 'Not provided'}</dd></div>
                <div><dt className="text-slate-500">Department</dt><dd className="mt-0.5 text-slate-800">{u.department || 'Not set'}</dd></div>
              </dl>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-xs font-semibold ${u.is_active ? 'text-emerald-800' : 'text-rose-800'}`}>{u.is_active ? 'Active' : 'Suspended'}</span>
                <button
                  type="button"
                  onClick={() => handleToggleIdentityVerification(u.id)}
                  disabled={!u.university_id && !u.email?.toLowerCase().endsWith('@diu.edu.bd')}
                  className="min-h-10 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  title="Admin review of the university ID or institutional email"
                >
                  {u.is_identity_verified ? 'Identity verified' : 'Review identity'}
                </button>
                <button type="button" onClick={() => handleToggleStatus(u.id)} className="min-h-10 rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  {u.is_active ? 'Suspend account' : 'Restore account'}
                </button>
              </div>
            </article>
          ))}
        </div>
        )}

        <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">University ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Identity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {u.university_id || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                      {u.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleIdentityVerification(u.id)}
                        disabled={!u.university_id && !u.email?.toLowerCase().endsWith('@diu.edu.bd')}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                          u.is_identity_verified
                            ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Admin review of the university ID or institutional email"
                      >
                        {u.is_identity_verified ? 'Verified' : 'Review ID'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                          u.is_active
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
