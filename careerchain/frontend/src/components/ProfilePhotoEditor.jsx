import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ProfilePhotoEditor = () => {
  const { user, refreshUser } = useAuth();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;
    setError('');
    setNotice('');
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_TYPES.has(selected.type)) {
      setFile(null);
      setError('Choose a JPEG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFile(null);
      setError('Choose an image smaller than 5 MB.');
      event.target.value = '';
      return;
    }
    setFile(selected);
  };

  const uploadPhoto = async () => {
    if (!file || uploading || removing) return;
    setUploading(true);
    setError('');
    setNotice('');
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await authApi.uploadAvatar(formData);
      await refreshUser();
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setNotice('Profile photo updated.');
    } catch (uploadError) {
      setError(uploadError.response?.data?.detail || 'The photo could not be uploaded. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (removing || uploading) return;
    setRemoving(true);
    setError('');
    setNotice('');
    try {
      await authApi.removeAvatar();
      await refreshUser();
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setNotice('Profile photo removed.');
    } catch (removeError) {
      setError(removeError.response?.data?.detail || 'The photo could not be removed. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <section className="cc-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" aria-labelledby="profile-photo-title">
      <div className="flex items-center gap-4">
        <UserAvatar user={user} imageUrl={previewUrl || user?.profile_image_url} size="large" />
        <div>
          <h2 id="profile-photo-title" className="text-sm font-semibold text-slate-900">Profile photo</h2>
          <p className="mt-1 text-xs text-slate-600">JPEG, PNG, or WebP. Maximum 5 MB.</p>
          {file && <p className="mt-1 max-w-64 truncate text-xs text-slate-500">Selected: {file.name}</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          className="sr-only"
          id="profile-photo-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={chooseFile}
          disabled={uploading || removing}
        />
        <label htmlFor="profile-photo-file" className="cc-button-secondary cursor-pointer">
          <ImagePlus className="h-4 w-4" />Choose photo
        </label>
        {file && (
          <button type="button" onClick={uploadPhoto} disabled={uploading || removing} className="cc-button-primary">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Uploading…' : 'Save photo'}
          </button>
        )}
        {user?.profile_image_url && !file && (
          <button type="button" onClick={removePhoto} disabled={uploading || removing} className="cc-button-secondary text-rose-800">
            {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {removing ? 'Removing…' : 'Remove'}
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-rose-800 sm:basis-full">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-800 sm:basis-full">{notice}</p>}
    </section>
  );
};

export default ProfilePhotoEditor;