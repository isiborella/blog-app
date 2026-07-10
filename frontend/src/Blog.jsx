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

  // 🔥 UPLOAD IMAGE FIRST
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

  // 🔥 CREATE POST WITH IMAGE
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
      <div className="posts-grid">
        {posts
          .filter((post) => {
            const data = post.attributes ?? post;

            return data.Title.toLowerCase().includes(
              search.toLowerCase()
            );
          })
          .sort((a, b) => {
            const postA = a.attributes ?? a;
            const postB = b.attributes ?? b;

            if (sortOption === "az"){
              return postA.Title.localeCompare(postB.Title);
            }

            if (sortOption === "oldest"){
              return new Date(postA.createdAt) - new Date(postB.createdAt);
            } 

            return new Date(postB.createdAt) - new Date(postA.createdAt)
          })
          .map((post) => {
          const data = post.attributes ?? post;

          const title = data.Title;
          const desc = data.Description;
          const imageUrl = data.Image?.url;

          return (
            <div className="post-card" key={post.id}>
              {imageUrl && (
                <img
                  src={`http://localhost:1337${imageUrl}`}
                  alt={title}
                />
              )}

              <h3>{title}</h3>
              <p>{desc}</p>

              <button
              className="delete-btn" 
              onClick={() => deletePost(post.documentId)}>
                Delete
              </button>
            </div>
          );
        })}
      </div>
      <div className="blog-container">

      ...

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />

      </div>
    </div>
  );
}