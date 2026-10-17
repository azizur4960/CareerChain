import React, { useState, useEffect } from 'react';
import { blogsApi } from '../../api/blogs';
import BlogCard from '../../components/BlogCard';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import { BookOpen } from 'lucide-react';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, [search, category]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogsApi.getBlogs({
        search: search || undefined,
        category: category || undefined,
      });
      setBlogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load career blogs.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setCategory('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Career Insights & Alumni Stories
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          In-depth technical guides, interview playbooks, and career transition experiences written by DIU graduates.
        </p>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search articles by title, topic, or technology..."
        />
        <FilterPanel
          filters={{ category }}
          onChange={(key, val) => setCategory(val)}
          onReset={handleReset}
          options={{ category: true }}
        />
      </div>

      {loading ? (
        <Loader message="Loading career articles..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchBlogs} />
      ) : blogs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles found"
          description="Try selecting another category or clearing your search query."
          actionLabel="Clear Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsPage;
