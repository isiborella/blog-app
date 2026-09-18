import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as blogService from "./services/blogService";
import LoadingSpinner from "./components/LoadingSpinner";
import "./Blog.css";

const POSTS_PER_PAGE = 5;

const CATEGORIES = ["General", "Technology", "Education", "Lifestyle"];

export default function Blog({ user }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Edit state
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("General");

  // Delete confirmation state
  const [postToDelete, setPostToDelete] = useState(null);

  // Loading states (Task 2)
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [updatingPost, setUpdatingPost] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  // Pagination state (Task 1)
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch Posts ──────────────────────────────────────────────────────────

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await blogService.fetchPosts();
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load posts. Please try again.");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // ─── Create Post ──────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (description.length > 500) {
      toast.warning("Description cannot exceed 500 characters.");
      return;
    }

    setCreatingPost(true);
    try {
      await blogService.createPost({ title, description, category, imageFile: image });
      setTitle("");
      setDescription("");
      setCategory("General");
      setImage(null);
      toast.success("Post created successfully!");
      loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post.");
    } finally {
      setCreatingPost(false);
    }
  };

  // ─── Edit Post ────────────────────────────────────────────────────────────

  const startEdit = (post) => {
    const data = post.attributes ?? post;
    setEditingPost(post.documentId);
    setEditTitle(data.Title);
    setEditDescription(data.Description);
    setEditCategory(data.Category || "General");
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditTitle("");
    setEditDescription("");
    setEditCategory("General");
  };

  const handleUpdate = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (editDescription.length > 500) {
      toast.warning("Description cannot exceed 500 characters.");
      return;
    }

    setUpdatingPost(true);
    try {
      await blogService.updatePost(editingPost, {
        title: editTitle,
        description: editDescription,
        category: editCategory,
      });
      toast.success("Post updated successfully!");
      cancelEdit();
      loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update post.");
    } finally {
      setUpdatingPost(false);
    }
  };

  // ─── Delete Post ──────────────────────────────────────────────────────────

  const requestDelete = (documentId) => setPostToDelete(documentId);
  const cancelDelete = () => setPostToDelete(null);

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setDeletingPost(true);
    try {
      await blogService.deletePost(postToDelete);
      toast.success("Post deleted successfully!");
      setPostToDelete(null);
      loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post.");
    } finally {
      setDeletingPost(false);
    }
  };

  // ─── Filter + Sort (Task 6 category filter included) ─────────────────────

  const filteredPosts = posts
    .filter((post) => {
      const data = post.attributes ?? post;
      const matchesSearch = data.Title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoryFilter === "All" || data.Category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const postA = a.attributes ?? a;
      const postB = b.attributes ?? b;
      if (sortOption === "az") return postA.Title.localeCompare(postB.Title);
      if (sortOption === "oldest")
        return new Date(postA.createdAt) - new Date(postB.createdAt);
      return new Date(postB.createdAt) - new Date(postA.createdAt);
    });

  // ─── Pagination (Task 1) ──────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  // Reset to page 1 whenever the filtered set changes
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedPosts = filteredPosts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset page when search, sort, or category filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortOption, categoryFilter]);

  // ─── Category counts (bonus Task 6) ──────────────────────────────────────

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = posts.filter((p) => {
      const data = p.attributes ?? p;
      return data.Category === cat;
    }).length;
    return acc;
  }, {});

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="blog-container">
      <h1>Welcome, {user.username}</h1>

      {/* ── CREATE FORM ── */}
      <div className="post-form">
        <h2>New Post</h2>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={creatingPost}
        />

        <textarea
          placeholder="Write your post..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          disabled={creatingPost}
        />
        <p
          className={`char-counter ${
            description.length >= 500
              ? "danger"
              : description.length >= 450
              ? "warning"
              : ""
          }`}
        >
          {description.length} / 500
        </p>

        {/* Category select (Task 6) */}
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={creatingPost}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          disabled={creatingPost}
        />

        <button onClick={handleCreate} disabled={creatingPost}>
          {creatingPost ? <LoadingSpinner size="small" /> : "Add Post"}
        </button>
      </div>

      {/* ── EDIT FORM ── */}
      {editingPost && (
        <div className="post-form">
          <h2>Edit Post</h2>
          <input
            placeholder="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            disabled={updatingPost}
          />

          <textarea
            placeholder="Edit your post..."
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            maxLength={500}
            disabled={updatingPost}
          />
          <p
            className={`char-counter ${
              editDescription.length >= 500
                ? "danger"
                : editDescription.length >= 450
                ? "warning"
                : ""
            }`}
          >
            {editDescription.length} / 500
          </p>

          {/* Category select for edit (Task 6) */}
          <select
            className="category-select"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            disabled={updatingPost}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="form-actions">
            <button onClick={handleUpdate} disabled={updatingPost}>
              {updatingPost ? <LoadingSpinner size="small" /> : "Update"}
            </button>
            <button className="cancel-edit-btn" onClick={cancelEdit} disabled={updatingPost}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── SEARCH + SORT + CATEGORY FILTER ── */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-row">
        <div className="sort-bar">
          <label>Sort By:</label>
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A – Z</option>
          </select>
        </div>

        {/* Category filter (Task 6) */}
        <div className="sort-bar">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">
              All Categories ({posts.length})
            </option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat} ({categoryCounts[cat] ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── POST LIST ── */}
      {loadingPosts ? (
        <div className="loading-state">
          <LoadingSpinner />
          <p>Loading posts…</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <p className="no-posts">No posts found.</p>
      ) : (
        <>
          <div className="posts-grid">
            {paginatedPosts.map((post) => {
              const data = post.attributes ?? post;
              const postTitle = data.Title;
              const desc = data.Description;
              const imageUrl = data.Image?.url;
              const postCategory = data.Category;

              return (
                <div className="post-card" key={post.id}>
                  {imageUrl && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${imageUrl}`}
                      alt={postTitle}
                    />
                  )}

                  <div className="post-content">
                    {postCategory && (
                      <span className="category-badge">{postCategory}</span>
                    )}
                    <h3>{postTitle}</h3>
                    <p>{desc}</p>

                    <div className="post-actions">
                      {/* Task 5 – View Post link */}
                      <Link
                        to={`/posts/${post.documentId}`}
                        className="view-btn"
                      >
                        Read More
                      </Link>

                      <button
                        className="edit-btn"
                        onClick={() => startEdit(post)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => requestDelete(post.documentId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PAGINATION (Task 1) ── */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
              >
                ← Previous
              </button>

              {/* Clickable page numbers (bonus) */}
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={page === safeCurrentPage ? "page-btn active" : "page-btn"}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <span className="page-info">
                Page {safeCurrentPage} of {totalPages}
              </span>

              <button
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {postToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this post?</p>
            <div className="modal-actions">
              <button
                className="confirm-btn"
                onClick={confirmDelete}
                disabled={deletingPost}
              >
                {deletingPost ? <LoadingSpinner size="small" /> : "Confirm"}
              </button>
              <button
                className="cancel-btn"
                onClick={cancelDelete}
                disabled={deletingPost}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}
