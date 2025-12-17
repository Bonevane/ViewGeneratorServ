import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "./App";

function Dashboard({ token }) {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Config for Axios calls
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // 1. Fetch Videos on Load
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_URL}/video/list`, authConfig);
      setVideos(res.data.videos);
    } catch (err) {
      console.error("Failed to fetch videos", err);
    }
  };

  // 2. Handle Upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Pre-check file size on client side
    // if (file.size > 50 * 1024 * 1024) return alert("File too big!");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setStatusMsg("Uploading... Checking Quotas...");

    try {
      await axios.post(`${API_URL}/video/upload`, formData, {
        headers: {
          ...authConfig.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      setStatusMsg("Upload Successful!");
      fetchVideos(); // Refresh list
    } catch (err) {
      // Show specific error from backend (e.g., "Storage limit exceeded")
      setStatusMsg(
        `Error: ${
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Upload Failed"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (filename) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.post(`${API_URL}/video/delete`, { filename }, authConfig);
      fetchVideos(); // Refresh list
    } catch (err) {
      alert("Failed to delete video");
    }
  };

  return (
    <div className="dashboard">
      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload New Video</h3>
        <p className="hint">Max 50MB Storage | Max 100MB Bandwidth/Day</p>
        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <span className="loader">Processing...</span>}
        {statusMsg && <p className="status-msg">{statusMsg}</p>}
      </div>

      <hr />

      {/* Video Grid */}
      <h3>My Videos</h3>
      {videos.length === 0 ? (
        <p>No videos found. Upload one!</p>
      ) : (
        <div className="video-grid">
          {videos.map((vid) => (
            <div key={vid.filename} className="video-card">
              <div className="video-wrapper">
                <video controls width="100%">
                  <source src={vid.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="video-info">
                <strong>{vid.original_name}</strong>
                <p>{(vid.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={() => handleDelete(vid.filename)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
