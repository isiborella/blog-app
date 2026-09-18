// Central config — components import from here instead of accessing
// import.meta.env directly. This makes it easy to swap values in one place.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:1337";
