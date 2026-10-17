import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { blogsApi } from '../../api/blogs';
import { Calendar, User, ArrowLeft, Tag, Share2 } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await blogsApi.getBlogById(id);
        setBlog(data);
      } catch (err) {
        console.error(err);
        setError('Article not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <Loader message="Loading article..." size="large" />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate('/student/blogs')} />;
  if (!blog) return null;

  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/blogs')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Career Articles
      </button>

      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
        {blog.image_url && (
          <div className="w-full h-64 sm:h-80 overflow-hidden bg-slate-100">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-8 sm:p-10 space-y-6">
          <div className="space-y-3">
            <span className="inline-block rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
              {blog.category}
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {blog.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1.5 font-bold text-slate-900">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {blog.author?.full_name || 'Alumni Author'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4">
            {blog.content}
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogDetailPage;
