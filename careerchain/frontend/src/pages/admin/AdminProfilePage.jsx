import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ProfilePhotoEditor from '../../components/ProfilePhotoEditor';
import UserAvatar from '../../components/UserAvatar';

const AdminProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold text-indigo-700">Administrator account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">My profile</h1>
        <p className="mt-1 text-sm text-slate-600">Manage the profile photo shown across CareerChain.</p>
      </header>

      <section className="cc-surface flex items-center gap-4 p-5">
        <UserAvatar user={user} size="large" />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900">{user?.full_name}</h2>
          <p className="mt-1 truncate text-sm text-slate-600">{user?.email}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" />Administrator
          </p>
        </div>
      </section>

      <ProfilePhotoEditor />
    </div>
  );
};

export default AdminProfilePage;