import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "./App";

function Dashboard({ token }) {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  // New State for Search and Bulk Delete
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideos, setSelectedVideos] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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
      // Clear selection on refresh to avoid stale state
      setSelectedVideos(new Set());
    } catch (err) {
      console.error("Failed to fetch videos", err);
    }
  };

  // 2. Handle Upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

  // 3. Handle Single Delete
  const handleDelete = async (filename) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      await axios.post(`${API_URL}/video/delete`, { filename }, authConfig);
      fetchVideos(); // Refresh list
    } catch (err) {
      alert("Failed to delete video");
    }
  };

  // 4. Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedVideos.size} videos?`)) return;
    
    setIsBulkDeleting(true);
    try {
        // Execute all delete requests concurrently
        const deletePromises = Array.from(selectedVideos).map(filename => 
            axios.post(`${API_URL}/video/delete`, { filename }, authConfig)
                .catch(err => console.error(`Failed to delete ${filename}`, err))
        );
        
        await Promise.all(deletePromises);
        
        setStatusMsg("Bulk delete completed");
        fetchVideos(); // Refresh list will also clear selection
    } catch (err) {
        alert("Error during bulk delete");
    } finally {
        setIsBulkDeleting(false);
    }
  };

  // 5. Selection Logic
  const toggleSelection = (filename) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(filename)) {
        newSelection.delete(filename);
    } else {
        newSelection.add(filename);
    }
    setSelectedVideos(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length && filteredVideos.length > 0) {
        setSelectedVideos(new Set());
    } else {
        setSelectedVideos(new Set(filteredVideos.map(v => v.filename)));
    }
  };

  // Filtered Videos based on Search
  const filteredVideos = videos.filter(v => 
    v.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = filteredVideos.length > 0 && selectedVideos.size === filteredVideos.length;

  return (
    <div className="dashboard">
      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload New Video</h3>
        <p className="hint">Max 50MB Storage | Max 100MB Bandwidth/Day</p>
        <div className="upload-input-wrapper">
            <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            disabled={uploading}
            id="file-upload"
            style={{ display: "none" }}
            />
            <label htmlFor="file-upload" className="button" style={{
                cursor: "pointer",
                padding: "0.8rem 1.5rem",
                backgroundColor: "var(--primary-color)",
                color: "white",
                borderRadius: "8px",
                fontWeight: "500",
                display: "inline-block"
            }}>
                {uploading ? "Uploading..." : "Select Video File"}
            </label>
        </div>
        {uploading && <span className="loader">Processing...</span>}
        {statusMsg && <p className="status-msg">{statusMsg}</p>}
      </div>

      {/* Search and Bulk Actions Bar */}
      <div className="actions-bar">
        <div className="search-wrapper">
            <input 
                type="text" 
                placeholder="Search videos..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />
        </div>
        
        <div className="bulk-actions">
            <label className="select-all-label">
                <input 
                    type="checkbox" 
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    disabled={filteredVideos.length === 0}
                />
                Select All
            </label>
            
            {selectedVideos.size > 0 && (
                <button 
                    onClick={handleBulkDelete} 
                    className="bulk-delete-btn"
                    disabled={isBulkDeleting}
                >
                    {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedVideos.size})`}
                </button>
            )}
        </div>
      </div>

      {/* Video Grid */}
      <div>
        <h3 style={{ marginBottom: "1rem" }}>My Videos ({filteredVideos.length})</h3>
        {filteredVideos.length === 0 ? (
            <div className="empty-state">
                <p>{searchQuery ? "No videos match your search." : "No videos found. Upload one to get started!"}</p>
            </div>
        ) : (
            <div className="video-grid">
            {filteredVideos.map((vid) => (
                <div key={vid.filename} className={`video-card ${selectedVideos.has(vid.filename) ? "selected" : ""}`}>
                <div className="video-card-header">
                    <input 
                        type="checkbox"
                        checked={selectedVideos.has(vid.filename)}
                        onChange={() => toggleSelection(vid.filename)}
                        className="video-checkbox"
                    />
                </div>
                <div className="video-player-wrapper">
                    <video controls>
                    <source
                        src={`${API_URL}/video/stream/${vid.filename}?token=${token}`}
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                    </video>
                </div>
                <div className="video-info">
                    <h4>{vid.filename}</h4>
                    <div className="video-meta">
                        <span className="video-size">{(vid.size / (1024 * 1024)).toFixed(2)} MB</span>
                        <button 
                            onClick={() => handleDelete(vid.filename)}
                            className="delete-btn"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
