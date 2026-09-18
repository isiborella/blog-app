import axios from "axios";
import { API_URL } from "../config";
import { getToken } from "../auth";

// Configured Axios instance with base URL pre-set.
// All service functions use this instead of repeating the full URL.
const api = axios.create({
  baseURL: API_URL,
});

// Attach the auth token to every request automatically.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch all posts with their related data (image, author, etc.)
 * @returns {Promise<Array>} Array of post objects
 */
export const fetchPosts = async () => {
  const res = await api.get("/api/posts?populate=*");
  return res.data.data || [];
};

/**
 * Fetch a single post by its documentId.
 * @param {string} documentId
 * @returns {Promise<Object>} Post object
 */
export const fetchPostById = async (documentId) => {
  const res = await api.get(`/api/posts/${documentId}?populate=*`);
  return res.data.data;
};

/**
 * Upload an image file to Strapi's media library.
 * @param {File} imageFile
 * @returns {Promise<Object>} Uploaded file object from Strapi
 */
export const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("files", imageFile);
  const res = await api.post("/api/upload", formData);
  return res.data[0];
};

/**
 * Create a new post. Optionally uploads an image first.
 * @param {{ title: string, description: string, category: string, imageFile: File|null }} postData
 * @returns {Promise<Object>} Created post object
 */
export const createPost = async ({ title, description, category, imageFile }) => {
  let imageId = null;
  if (imageFile) {
    const uploaded = await uploadImage(imageFile);
    imageId = uploaded.id;
  }

  const res = await api.post("/api/posts", {
    data: {
      Title: title,
      Description: description,
      Category: category,
      Image: imageId,
    },
  });
  return res.data.data;
};

/**
 * Update an existing post by its documentId.
 * @param {string} documentId
 * @param {{ title: string, description: string, category: string }} postData
 * @returns {Promise<Object>} Updated post object
 */
export const updatePost = async (documentId, { title, description, category }) => {
  const res = await api.put(`/api/posts/${documentId}`, {
    data: {
      Title: title,
      Description: description,
      Category: category,
    },
  });
  return res.data.data;
};

/**
 * Delete a post by its documentId.
 * @param {string} documentId
 * @returns {Promise<void>}
 */
export const deletePost = async (documentId) => {
  await api.delete(`/api/posts/${documentId}`);
};

export default api;
