import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { uploadFile } from '../firebase';

export default function FileUpload() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'video/mp4'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only .png, .jpg, .jpeg (images) and .mp4 (videos) files are allowed');
      setFile(null);
      return;
    }

    // Validate file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await uploadFile(file, user.uid);
      setMessage(`✅ "${file.name}" uploaded successfully!`);
      setFile(null);
      
      // Redirect to files page after 2 seconds
      setTimeout(() => {
        navigate('/files');
      }, 2000);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <div className="file-upload-card">
        <h2>📤 Upload Files</h2>
        <p className="file-upload-subtitle">Share images (.png, .jpg, .jpeg) and videos (.mp4) with your team</p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`file-input-area ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-input"
              accept=".png,.jpg,.jpeg,.mp4"
              onChange={(e) => handleFile(e.target.files?.[0])}
              disabled={loading}
              className="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              <div className="file-input-icon">📁</div>
              <div className="file-input-text">
                {file ? (
                  <>
                    <strong>Selected: {file.name}</strong>
                    <small>({(file.size / 1024 / 1024).toFixed(2)} MB)</small>
                  </>
                ) : (
                  <>
                    <strong>Drag and drop your file here</strong>
                    <small>or click to browse (.png, .jpg, .jpeg or .mp4, max 100MB)</small>
                  </>
                )}
              </div>
            </label>
          </div>

          {error && <div className="file-upload-error">⚠️ {error}</div>}
          {message && <div className="file-upload-success">{message}</div>}

          <button
            type="submit"
            className="upload-btn"
            disabled={!file || loading}
          >
            {loading ? '⏳ Uploading...' : '✓ Upload File'}
          </button>

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/files')}
            disabled={loading}
          >
            View All Files
          </button>
        </form>

        <div className="file-upload-info">
          <h4>📋 Guidelines:</h4>
          <ul>
            <li>✅ Supported: PNG & JPEG images (.png, .jpg, .jpeg) and MP4 videos (.mp4)</li>
            <li>✅ Max file size: 100MB</li>
            <li>✅ Files are stored securely in your account</li>
            <li>✅ View and download all files on the Files page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
