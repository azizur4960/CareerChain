import React, { useEffect, useState } from 'react';

const API_ROOT = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

const sizes = {
  small: 'h-8 w-8 text-xs',
  medium: 'h-11 w-11 text-sm',
  large: 'h-16 w-16 text-xl',
};

const resolveImageUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  return `${API_ROOT}${url.startsWith('/') ? '' : '/'}${url}`;
};

const UserAvatar = ({ user, imageUrl, size = 'medium', className = '' }) => {
  const name = user?.full_name || 'User';
  const source = resolveImageUrl(imageUrl ?? user?.profile_image_url);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [source]);

  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800 font-semibold text-white ${sizes[size] || sizes.medium} ${className}`}
      aria-label={`${name} profile photo`}
      role="img"
    >
      {source && !imageFailed ? (
        <img src={source} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setImageFailed(true)} />
      ) : (
        initials || 'U'
      )}
    </span>
  );
};

export default UserAvatar;