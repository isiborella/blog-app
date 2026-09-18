import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchPostById } from "../services/blogService";
import { API_URL } from "../config";
import LoadingSpinner from "./LoadingSpinner";
import "./BlogDetails.css";

export default function BlogDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPostById(id);
        if (!data) {
          setError("Post not found.");
        } else {
          setPost(data);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load this post. It may have been deleted or the ID is invalid.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="details-loading">
        <LoadingSpinner size="large" />
        <p>Loading post…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-error">
        <h2>Oops!</h2>
        <p>{error}</p>
        <Link to="/" className="back-link">← Back to all posts</Link>
      </div>
    );
  }

  const data = post.attributes ?? post;
  const imageUrl = data.Image?.url;
  const createdAt = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="details-container">
      <Link to="/" className="back-link">← Back to all posts</Link>

      {imageUrl && (
        <img
          className="details-image"
          src={`${API_URL}${imageUrl}`}
          alt={data.Title}
        />
      )}

      <div className="details-content">
        {data.Category && (
          <span className="category-badge">{data.Category}</span>
        )}
        <h1 className="details-title">{data.Title}</h1>
        {createdAt && <p className="details-date">Published on {createdAt}</p>}
        <p className="details-body">{data.Description}</p>
      </div>
    </div>
  );
}
