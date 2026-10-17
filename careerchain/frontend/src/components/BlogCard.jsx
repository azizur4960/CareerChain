import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User as UserIcon, ArrowRight } from 'lucide-react';

const BlogCard = ({ blog }) => {
  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="cc-surface group flex flex-col overflow-hidden transition-colors hover:border-indigo-300">
      {blog.image_url ? (
        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <div className="absolute top-3 left-3">
            <span className="rounded-lg bg-white/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm">
              {blog.category}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-16 w-full items-center border-b border-slate-200 bg-slate-50 px-5">
          <span className="text-xs font-semibold text-indigo-700">
            {blog.category}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <UserIcon className="h-3.5 w-3.5" />
              {blog.author?.full_name || 'Alumni Author'}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            <Link to={`/student/blogs/${blog.id}`}>{blog.title}</Link>
          </h3>

          <p className="mt-2.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">
            {blog.content}
          </p>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <Link
            to={`/student/blogs/${blog.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700"
          >
            Read Article
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
