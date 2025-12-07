import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getUserFiles, storage } from '../firebase';
import { ref, getDownloadURL } from 'firebase/storage';

export default function FileManager() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [previewName, setPreviewName] = useState(null);

  useEffect(() => {
    const loadFiles = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        const userFiles = await getUserFiles(user.uid);
        setFiles(userFiles);
        setError('');
      } catch (err) {
        console.error('Failed to load files:', err);
        setError('Failed to load files. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [user?.uid]);

  const handleDownload = async (file) => {
    try {
      setDownloading(file.name);
      const fileRef = ref(storage, file.fullPath);
      const url = await getDownloadURL(fileRef);

      // Use window.open (navigation) to avoid CORS fetch restrictions.
      // Browser navigation bypasses CORS. File will open in new tab or download depending on type.
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = async (file) => {
    try {
      const fileRef = ref(storage, file.fullPath);
      const url = await getDownloadURL(fileRef);
      setPreviewUrl(url);
      setPreviewType(file.type);
      setPreviewName(file.name);
    } catch (err) {
      console.error('Preview failed:', err);
      alert('Failed to load preview');
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    setPreviewName(null);
  };

  

  const getFileIcon = (type) => {
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('video')) return '🎬';
    return '📄';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="file-manager-container">
      <div className="file-manager-header">
        <h1>📁 My Files</h1>
        <p className="file-manager-subtitle">Manage and download your uploaded files</p>
        <button
          className="upload-file-btn"
          onClick={() => navigate('/upload')}
        >
          ➕ Upload New File
        </button>
      </div>

      {loading && <div className="file-manager-loading">⏳ Loading your files...</div>}
      {error && <div className="file-manager-error">❌ {error}</div>}

      {!loading && files.length === 0 && (
        <div className="file-manager-empty">
          <div className="empty-icon">📭</div>
          <h3>No files yet</h3>
          <p>Start by uploading your first file</p>
          <button
            className="upload-file-btn"
            onClick={() => navigate('/upload')}
          >
            ➕ Upload File
          </button>
        </div>
      )}

      {!loading && files.length > 0 && (
        <div className="file-manager-list">
          <div className="file-manager-list-header">
            <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
          </div>

          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-item-left">
                <div className="file-icon">{getFileIcon(file.type)}</div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {(file.type?.includes('image') || file.type?.includes('video')) && (
                  <button className="download-btn" onClick={() => handlePreview(file)}>
                    👁️ Preview
                  </button>
                )}
                <button
                  className="download-btn"
                  onClick={() => handleDownload(file)}
                  disabled={downloading === file.name}
                >
                  {downloading === file.name ? '⏳ Downloading...' : '⬇️ Download'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {previewUrl && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-card" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <strong>{previewName}</strong>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="download-btn" onClick={() => window.open(previewUrl, '_blank')}>Open</button>
                <button className="download-btn" onClick={closePreview}>Close</button>
              </div>
            </div>
            <div className="preview-body">
              {previewType?.includes('image') && <img src={previewUrl} alt={previewName} style={{ maxWidth: '100%', maxHeight: '70vh' }} />}
              {previewType?.includes('video') && (
                <video controls style={{ maxWidth: '100%', maxHeight: '70vh' }}>
                  <source src={previewUrl} type={previewType} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
