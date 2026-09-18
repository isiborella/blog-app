import "./LoadingSpinner.css";

/**
 * Reusable loading spinner.
 * @param {{ size?: "small" | "medium" | "large" }} props
 */
export default function LoadingSpinner({ size = "medium" }) {
  return (
    <span
      className={`spinner spinner--${size}`}
      role="status"
      aria-label="Loading"
    />
  );
}
