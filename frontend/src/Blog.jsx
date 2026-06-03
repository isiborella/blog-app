import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "./auth";
import "./Blog.css";

export default function Blog({ user }) {
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

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
      alert("Fill all fields");
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

      fetchPosts();
    } catch (error) {
      console.error(error);
      alert("Failed to create post");
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

    fetchPosts();
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data || error);
    alert("Delete failed");
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

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* IMAGE INPUT */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button onClick={createPost}>Add Post</button>
      </div>

      {/* POSTS */}
      <div className="posts-grid">
        {posts.map((post) => {
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
    </div>
  );
}