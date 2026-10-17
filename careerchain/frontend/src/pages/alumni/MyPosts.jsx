import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogsApi } from '../../api/blogs';
import { BookOpen, FilePlus, Trash2, ExternalLink } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const MyPosts = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogsApi.getMyBlogs();
      setBlogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load your articles.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await blogsApi.deleteBlog(blogId);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete blog.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Published Career Articles
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Articles and interview advice you have contributed to the platform.
          </p>
        </div>

        <Link
          to="/alumni/blogs/create"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <FilePlus className="h-4 w-4" />
          Write Article
        </Link>
      </div>

      {loading ? (
        <Loader message="Loading your articles..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchMyBlogs} />
      ) : blogs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles written yet"
          description="Share your tech journey or interview experiences to inspire current students."
          actionLabel="Write First Article"
          actionLink="/alumni/blogs/create"
        />
      ) : (
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-700 px-2 py-0.5">
                  {blog.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{blog.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{blog.content}</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/student/blogs/${blog.id}`}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View
                </Link>
                <button
                  onClick={() => handleDelete(blog.id)}
                  className="rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;
