import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "./auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Blog.css";

export default function Blog({ user }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // EDIT POST STATE
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // DELETE CONFIRMATION MODAL STATE
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:1337/api/posts?populate=*"
      );

      setPosts(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // UPLOAD IMAGE FIRST
  const uploadImage = async () => {
    if (!image) return null;

    const formData = new FormData();
    formData.append("files", image);

    const res = await axios.post(
      "http://localhost:1337/api/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return res.data[0]; // uploaded file
  };

  // CREATE POST WITH IMAGE
  const createPost = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (description.length > 500) {
      toast.warning("Description cannot exceed 500 characters.");
      return;
    }

    try {
      const uploadedImage = await uploadImage();

      await axios.post(
        "http://localhost:1337/api/posts",
        {
          data: {
            Title: title,
            Description: description,
            Image: uploadedImage ? uploadedImage.id : null,
          },
        }
      );

      setTitle("");
      setDescription("");
      setImage(null);

      toast.success("Post created successfully!");

      fetchPosts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post.");
    }
  };

  // START EDITING A POST
  const startEdit = (post) => {
    const data = post.attributes ?? post;
    setEditingPost(post.documentId);
    setEditTitle(data.Title);
    setEditDescription(data.Description);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setEditTitle("");
    setEditDescription("");
  };

  //  UPDATE POST
  const updatePost = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (editDescription.length > 500) {
      toast.warning("Description cannot exceed 500 characters.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:1337/api/posts/${editingPost}`,
        {
          data: {
            Title: editTitle,
            Description: editDescription,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      toast.success("Post updated successfully!");

      cancelEdit();
      fetchPosts();
    } catch (error) {
      console.error("UPDATE ERROR:", error.response?.data || error);
      toast.error("Failed to update post.");
    }
  };

  const deletePost = async (documentId) => {
    try {
      await axios.delete(
        `http://localhost:1337/api/posts/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      toast.success("Post deleted successfully!");

      fetchPosts();
    } catch (error) {
      console.error("DELETE ERROR:", error.response?.data || error);
      toast.error("Failed to delete post.");
    }
  };

  // 🔥 DELETE CONFIRMATION HANDLERS
  const requestDelete = (documentId) => {
    setPostToDelete(documentId);
  };

  const cancelDelete = () => {
    setPostToDelete(null);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    await deletePost(postToDelete);
    setPostToDelete(null);
  };

  // 🔥 FILTER + SORT
  const filteredPosts = posts
    .filter((post) => {
      const data = post.attributes ?? post;

      return data.Title.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      const postA = a.attributes ?? a;
      const postB = b.attributes ?? b;

      if (sortOption === "az") {
        return postA.Title.localeCompare(postB.Title);
      }

      if (sortOption === "oldest") {
        return new Date(postA.createdAt) - new Date(postB.createdAt);
      }

      return new Date(postB.createdAt) - new Date(postA.createdAt);
    });

  return (
    <div className="blog-container">
      <h1>Welcome, {user.username}</h1>

      {/* CREATE POST */}
      <div className="post-form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Write your post..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
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

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button onClick={createPost}>Add Post</button>
      </div>

      {/* EDIT POST */}
      {editingPost && (
        <div className="post-form">
          <h2>Edit Post</h2>
          <input
            placeholder="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <textarea
            placeholder="Edit your post..."
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            maxLength={500}
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

          <button onClick={updatePost}>Update</button>
          <button onClick={cancelEdit}>Cancel</button>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="search-bar">
        <label> Sort By: </label>

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="newest"> Newest First</option>
          <option value="oldest"> Oldest First</option>
          <option value="az"> A - Z</option>
        </select>
      </div>

      {/* POSTS */}
      {filteredPosts.length === 0 ? (
        <p className="no-posts">No posts found.</p>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map((post) => {
            const data = post.attributes ?? post;

            const postTitle = data.Title;
            const desc = data.Description;
            const imageUrl = data.Image?.url;

            return (
              <div className="post-card" key={post.id}>
                {imageUrl && (
                  <img
                    src={`http://localhost:1337${imageUrl}`}
                    alt={postTitle}
                  />
                )}

                <div className="post-content">
                  <h3>{postTitle}</h3>
                  <p>{desc}</p>

                  <div className="post-actions">
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
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {postToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to delete this post?</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={confirmDelete}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={cancelDelete}>
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
