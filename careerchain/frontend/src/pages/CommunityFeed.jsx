import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Image, MessageCircle, MoreHorizontal, Newspaper, RefreshCw, Search, Send, Sparkles, Trash2, X } from 'lucide-react';
import { feedApi } from '../api/feed';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';
import Loader from '../components/Loader';

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '💪', label: 'Support' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😊', label: 'Smile' },
];
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const countVisibleComments = (items) => items.reduce((total, comment) => total + (comment.is_deleted ? 0 : 1) + countVisibleComments(comment.replies || []), 0);
const updateCommentTree = (items, targetId, update) => items.map((comment) => (
  comment.id === targetId
    ? update(comment)
    : { ...comment, replies: updateCommentTree(comment.replies || [], targetId, update) }
));

const CommunityFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState('ALL');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('UPDATE');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [comments, setComments] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyingToId, setReplyingToId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [feedLoadError, setFeedLoadError] = useState('');
  const [retryingMore, setRetryingMore] = useState(false);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [pendingDeletePost, setPendingDeletePost] = useState(null);
  const [pendingDeleteComment, setPendingDeleteComment] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const imageInputRef = useRef(null);
  const cancelDeleteButtonRef = useRef(null);
  const deleteInProgressRef = useRef(false);

  useEffect(() => {
    if (!pendingDeletePost && !pendingDeleteComment) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !deleteInProgressRef.current) {
        setPendingDeletePost(null);
        setPendingDeleteComment(null);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    cancelDeleteButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [pendingDeletePost, pendingDeleteComment]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview('');
      return undefined;
    }
    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const loadFeed = async (showLoader = false) => {
    try {
      setRetryingMore(false);
      setFeedLoadError('');
      if (showLoader) setLoading(true);
      const page = await feedApi.getFeed();
      setPosts(page.posts);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setFeedLoadError(err.response?.data?.detail || 'Could not load the feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setRetryingMore(false);
    setFeedLoadError('');
    try {
      const page = await feedApi.getFeed({ cursor: nextCursor });
      setPosts((current) => [...current, ...page.posts]);
      setNextCursor(page.next_cursor);
    } catch (err) {
      setRetryingMore(true);
      setFeedLoadError(err.response?.data?.detail || 'Could not load more updates. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
  const filteredPosts = posts.filter((post) => {
    if (feedFilter !== 'ALL' && post.post_type !== feedFilter) return false;
    if (!normalizedSearch) return true;
    return [post.content, post.author?.full_name, post.author?.role]
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch));
  });
  const filterOptions = [
    { value: 'ALL', label: 'All updates', count: posts.length },
    { value: 'UPDATE', label: 'Updates', count: posts.filter((post) => post.post_type === 'UPDATE').length },
    { value: 'SUCCESS_STORY', label: 'Success stories', count: posts.filter((post) => post.post_type === 'SUCCESS_STORY').length },
  ];

  const createPost = async (event) => {
    event.preventDefault();
    if ((!content.trim() && !imageFile) || posting) return;
    setPosting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('post_type', postType);
      if (imageFile) formData.append('image', imageFile);
      const post = await feedApi.createPost(formData);
      setPosts((current) => [post, ...current]);
      setContent('');
      setPostType('UPDATE');
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Your post could not be published. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Images must be 8 MB or smaller.');
      return;
    }
    setError('');
    setImageFile(file);
  };

  const sendComment = async (event, postId, parentCommentId = null) => {
    event.preventDefault();
    const text = (parentCommentId ? replyDrafts[parentCommentId] || '' : comments[postId] || '').trim();
    if (!text || busy) return;
    setBusy(`comment-${postId}`);
    try {
      const comment = await feedApi.addComment(postId, { content: text, parent_comment_id: parentCommentId });
      setPosts((current) => current.map((post) => {
        if (post.id !== postId) return post;
        return parentCommentId
          ? { ...post, comments: updateCommentTree(post.comments, parentCommentId, (parent) => ({ ...parent, replies: [...(parent.replies || []), comment] })) }
          : { ...post, comments: [...post.comments, comment] };
      }));
      if (parentCommentId) {
        setReplyDrafts((current) => ({ ...current, [parentCommentId]: '' }));
        setReplyingToId(null);
      } else {
        setComments((current) => ({ ...current, [postId]: '' }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Your comment could not be added. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const react = async (postId, emoji) => {
    if (busy) return;
    setBusy(`reaction-${postId}-${emoji}`);
    try {
      await feedApi.toggleReaction(postId, emoji);
      await loadFeed();
    } catch (err) {
      setError(err.response?.data?.detail || 'Your reaction could not be saved. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const deletePost = async () => {
    if (!pendingDeletePost || deletingPostId) return;
    const postId = pendingDeletePost.id;
    deleteInProgressRef.current = true;
    setDeletingPostId(postId);
    setDeleteError('');
    try {
      await feedApi.deletePost(postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      setPendingDeletePost(null);
      setOpenMenuPostId(null);
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'This post could not be deleted. Please try again.');
    } finally {
      deleteInProgressRef.current = false;
      setDeletingPostId(null);
    }
  };

  const deleteComment = async () => {
    if (!pendingDeleteComment || deletingCommentId) return;
    const { postId, comment } = pendingDeleteComment;
    deleteInProgressRef.current = true;
    setDeletingCommentId(comment.id);
    setDeleteError('');
    try {
      const deletedComment = await feedApi.deleteComment(postId, comment.id);
      setPosts((current) => current.map((post) => post.id === postId
        ? { ...post, comments: updateCommentTree(post.comments, comment.id, () => deletedComment) }
        : post));
      setPendingDeleteComment(null);
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'This comment could not be deleted. Please try again.');
    } finally {
      deleteInProgressRef.current = false;
      setDeletingCommentId(null);
    }
  };

  const renderComment = (comment, postId, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-slate-100 pl-3 sm:ml-12 sm:pl-4' : ''}`}>
      <div className="flex gap-2">
        {!comment.is_deleted && <UserAvatar user={comment.author} size="small" />}
        <div className="min-w-0 flex-1">
          <div className={`rounded-xl px-3 py-2 ${comment.is_deleted ? 'bg-slate-50' : 'bg-slate-100'}`}>
            {comment.is_deleted ? <p className="text-sm italic text-slate-500">This comment was deleted.</p> : <>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-xs font-semibold text-slate-800">{comment.author?.full_name}</p>
                <time className="text-[10px] text-slate-500" dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleString()}</time>
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{comment.content}</p>
            </>}
          </div>
          {!comment.is_deleted && <div className="mt-1 flex items-center gap-1 pl-2">
            {depth === 0 && <button type="button" onClick={() => setReplyingToId((current) => current === comment.id ? null : comment.id)} className="min-h-8 rounded px-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-indigo-700">Reply</button>}
            {Number(comment.author?.id) === Number(user?.id) && <button type="button" onClick={() => { setDeleteError(''); setPendingDeleteComment({ postId, comment }); }} aria-label="Delete your comment" className="inline-flex min-h-8 items-center gap-1 rounded px-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" />Delete</button>}
          </div>}
        </div>
      </div>
      {comment.replies?.length > 0 && <div className="mt-2 space-y-3">{comment.replies.map((reply) => renderComment(reply, postId, depth + 1))}</div>}
      {depth === 0 && replyingToId === comment.id && !comment.is_deleted && <form onSubmit={(event) => sendComment(event, postId, comment.id)} className="ml-10 mt-2 flex items-center gap-2 sm:ml-14">
        <UserAvatar user={user} size="small" />
        <input autoFocus aria-label={`Reply to ${comment.author?.full_name}`} value={replyDrafts[comment.id] || ''} onChange={(event) => setReplyDrafts((current) => ({ ...current, [comment.id]: event.target.value }))} maxLength={2000} placeholder={`Reply to ${comment.author?.full_name}…`} className="cc-control min-w-0 flex-1 rounded-full" />
        <button type="submit" disabled={Boolean(busy) || !(replyDrafts[comment.id] || '').trim()} aria-label="Post reply" className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50"><Send className="h-4 w-4" /></button>
      </form>}
    </div>
  );

  if (loading) return <Loader message="Loading your community feed…" size="large" />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-indigo-700"><Newspaper className="h-4 w-4" />Shared DIU Community</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">News Feed</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">One place for students, alumni, and staff to share wins, ideas, and useful updates.</p>
        </div>
        <button type="button" disabled={loading} onClick={() => loadFeed(true)} className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:self-auto"><RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh feed</button>
      </header>

      <form onSubmit={createPost} className="cc-surface space-y-4 border-indigo-100 p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3"><UserAvatar user={user} size="medium" /><button type="button" onClick={() => document.getElementById('feed-post')?.focus()} className="min-h-11 flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 text-left text-sm font-medium text-slate-600 hover:border-indigo-300 hover:bg-white">Share an update or success story</button></div>
        <textarea id="feed-post" value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} rows={4} placeholder="What would you like to share with the community?" className="cc-control w-full" />
        {imagePreview && <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"><img src={imagePreview} alt="Selected post preview" className="max-h-96 w-full object-contain" /><button type="button" onClick={() => setImageFile(null)} aria-label="Remove selected image" className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-100"><X className="h-4 w-4" /></button></div>}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><Sparkles className="h-4 w-4 text-amber-500" />
              <select aria-label="Post type" value={postType} onChange={(event) => setPostType(event.target.value)} className="cc-control">
                <option value="UPDATE">General update</option><option value="SUCCESS_STORY">Success story</option>
              </select>
            </label>
            <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} className="hidden" aria-label="Choose an image" />
            <button type="button" onClick={() => imageInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100"><Image className="h-4 w-4 text-emerald-700" />Add a photo</button>
            <span className="text-xs text-slate-500">JPG, PNG, or WebP · Up to 8 MB</span>
          </div>
          <button type="submit" disabled={posting || (!content.trim() && !imageFile)} className="cc-button-primary"><Send className="h-4 w-4" />{posting ? 'Posting…' : 'Post'}</button>
        </div>
      </form>

      <section aria-label="Search and filter news feed" className="cc-surface space-y-3 p-3 sm:p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search loaded updates by text or member" placeholder="Search updates and members…" className="cc-control w-full bg-slate-50 pl-9" />
        </label>
        <div className="flex flex-wrap items-center gap-2" aria-label="Filter news feed">
          {filterOptions.map((option) => <button key={option.value} type="button" aria-pressed={feedFilter === option.value} onClick={() => setFeedFilter(option.value)} className={`inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors ${feedFilter === option.value ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            {option.label}<span className={feedFilter === option.value ? 'text-indigo-100' : 'text-slate-500'}>{option.count}</span>
          </button>)}
          <p className="ml-auto text-xs text-slate-500">Showing {filteredPosts.length} of {posts.length} loaded</p>
        </div>
      </section>

      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {feedLoadError && <div role="alert" className="flex flex-col gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"><p>{feedLoadError}</p><button type="button" onClick={retryingMore ? loadMore : () => loadFeed(true)} className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg border border-rose-300 bg-white px-3 text-xs font-semibold text-rose-800 hover:bg-rose-100"><RefreshCw className="h-3.5 w-3.5" />Retry</button></div>}
      {posts.length === 0 && !feedLoadError && <div className="cc-surface p-10 text-center"><MessageCircle className="mx-auto h-9 w-9 text-indigo-300" /><h2 className="mt-3 font-semibold text-slate-900">No posts yet</h2><p className="mt-1 text-sm text-slate-500">Be the first to share an update with the community.</p></div>}
      {posts.length > 0 && filteredPosts.length === 0 && <div className="cc-surface p-8 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-3 font-semibold text-slate-900">No matching updates</h2><p className="mt-1 text-sm text-slate-500">Try another search or switch to All updates.</p><button type="button" onClick={() => { setSearchQuery(''); setFeedFilter('ALL'); }} className="mt-3 text-xs font-semibold text-indigo-700 hover:text-indigo-900">Clear search and filters</button></div>}

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <article key={post.id} className="cc-surface relative space-y-4 overflow-visible p-4 shadow-sm sm:p-5">
            <header className="flex items-start gap-3">
              <UserAvatar user={post.author} size="small" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{post.author?.full_name || 'Community member'}</p>
                <p className="text-xs text-slate-500">{post.author?.role === 'ALUMNI' ? 'Alumni' : post.author?.role === 'STUDENT' ? 'Student' : 'Community member'} · <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString()}</time></p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {post.post_type === 'SUCCESS_STORY' && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">🎉 Success story</span>}
                {Number(post.author?.id) === Number(user?.id) && <div className="relative">
                  <button type="button" aria-label="Post options" aria-haspopup="menu" aria-expanded={openMenuPostId === post.id} onClick={() => setOpenMenuPostId((current) => current === post.id ? null : post.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"><MoreHorizontal className="h-5 w-5" /></button>
                  {openMenuPostId === post.id && <div role="menu" aria-label="Post options" className="absolute right-0 top-10 z-20 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    <button type="button" role="menuitem" onClick={() => { setDeleteError(''); setPendingDeletePost(post); setOpenMenuPostId(null); }} className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium text-rose-700 hover:bg-rose-50"><Trash2 className="h-4 w-4" />Delete post</button>
                  </div>}
                </div>}
              </div>
            </header>
            {post.content && <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">{post.content}</p>}
            {post.image_url && <img src={`${API_ORIGIN}${post.image_url}`} alt={`Image shared by ${post.author?.full_name || 'a community member'}`} loading="lazy" className="max-h-[36rem] w-full rounded-lg border border-slate-100 bg-slate-50 object-contain" />}

            <div className="flex items-center justify-between border-y border-slate-100 py-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5" aria-label="Reactions">
                {post.reactions.filter((item) => item.count > 0).slice(0, 3).map((reaction) => <span key={reaction.emoji} title={`${reaction.count} ${reaction.emoji}`} className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">{reaction.emoji}</span>)}
                {post.reactions.reduce((total, reaction) => total + reaction.count, 0) > 0 && <span>{post.reactions.reduce((total, reaction) => total + reaction.count, 0)}</span>}
              </div>
              {(() => { const commentCount = countVisibleComments(post.comments); return <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>; })()}
            </div>

            <div className="grid grid-cols-3 gap-1 border-b border-slate-100 pb-2 sm:grid-cols-6">
              {REACTIONS.map(({ emoji, label }) => {
                const reaction = post.reactions.find((item) => item.emoji === emoji);
                return <button key={emoji} type="button" onClick={() => react(post.id, emoji)} disabled={Boolean(busy)} aria-label={`${label}${reaction?.count ? `, ${reaction.count} reactions` : ''}`} aria-pressed={Boolean(reaction?.reacted_by_me)} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors hover:bg-slate-100 disabled:opacity-60 ${reaction?.reacted_by_me ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600'}`}>
                  <span aria-hidden="true">{emoji}</span><span>{label}</span>{reaction?.count ? <span className="text-[10px] text-slate-500">{reaction.count}</span> : null}
                </button>;
              })}
            </div>

            {post.comments.map((comment) => renderComment(comment, post.id))}

            <form onSubmit={(event) => sendComment(event, post.id)} className="flex items-center gap-2">
              <UserAvatar user={user} size="small" />
              <input aria-label="Write a comment" value={comments[post.id] || ''} onChange={(event) => setComments((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={2000} placeholder="Congratulate them or add a comment…" className="cc-control min-w-0 flex-1 rounded-full" />
              <button type="submit" disabled={Boolean(busy) || !(comments[post.id] || '').trim()} aria-label="Post comment" className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-700 text-white hover:bg-indigo-800 disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </form>
          </article>
        ))}
      </div>

      {nextCursor && <div className="flex justify-center"><button type="button" disabled={loadingMore} onClick={loadMore} className="cc-button-secondary min-w-40">{loadingMore ? 'Loading updates…' : 'Load more updates'}</button></div>}

      {(pendingDeletePost || pendingDeleteComment) && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !deletingPostId && !deletingCommentId) { setPendingDeletePost(null); setPendingDeleteComment(null); } }}>
        <section role="dialog" aria-modal="true" aria-labelledby="delete-post-title" aria-describedby="delete-post-description" onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const buttons = event.currentTarget.querySelectorAll('button:not(:disabled)');
          const firstButton = buttons[0];
          const lastButton = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === firstButton) {
            event.preventDefault();
            lastButton?.focus();
          } else if (!event.shiftKey && document.activeElement === lastButton) {
            event.preventDefault();
            firstButton?.focus();
          }
        }} className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-700"><AlertTriangle className="h-5 w-5" /></div>
          <h2 id="delete-post-title" className="mt-4 text-lg font-bold text-slate-900">{pendingDeletePost ? 'Delete this post?' : 'Delete this comment?'}</h2>
          <p id="delete-post-description" className="mt-2 text-sm leading-6 text-slate-600">{pendingDeletePost ? 'Your post and its photo, comments, and reactions will be permanently removed. This action cannot be undone.' : 'Your comment will be removed. Any replies will stay in the conversation.'}</p>
          {deleteError && <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{deleteError}</p>}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button ref={cancelDeleteButtonRef} type="button" disabled={Boolean(deletingPostId || deletingCommentId)} onClick={() => { setPendingDeletePost(null); setPendingDeleteComment(null); }} className="cc-button-secondary">Keep it</button>
            <button type="button" disabled={Boolean(deletingPostId || deletingCommentId)} onClick={pendingDeletePost ? deletePost : deleteComment} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 text-sm font-semibold text-white hover:bg-rose-800 disabled:cursor-wait disabled:opacity-60"><Trash2 className="h-4 w-4" />{deletingPostId || deletingCommentId ? 'Deleting…' : `Delete ${pendingDeletePost ? 'post' : 'comment'}`}</button>
          </div>
        </section>
      </div>}
    </div>
  );
};

export default CommunityFeed;
