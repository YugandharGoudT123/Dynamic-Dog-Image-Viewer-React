import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function LoginHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'loginEvents'), orderBy('ts', 'desc'), limit(100));
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            uid: data.uid || 'Unknown',
            email: data.email || 'No email',
            displayName: data.displayName || 'Anonymous',
            ts: data.ts,
            userAgent: data.userAgent || 'N/A'
          };
        });
        if (mounted) {
          setEvents(docs);
        }
      } catch (err) {
        console.error('Failed to load login events:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  const filteredEvents = events.filter(e => 
    e.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const getDeviceIcon = (userAgent) => {
    if (userAgent?.includes('Windows')) return '🖥️';
    if (userAgent?.includes('Mac')) return '🍎';
    if (userAgent?.includes('iPhone') || userAgent?.includes('iPad')) return '📱';
    if (userAgent?.includes('Android')) return '📲';
    return '💻';
  };

  const getDeviceName = (userAgent) => {
    if (userAgent?.includes('Windows')) return 'Windows';
    if (userAgent?.includes('Mac')) return 'MacOS';
    if (userAgent?.includes('iPhone')) return 'iPhone';
    if (userAgent?.includes('iPad')) return 'iPad';
    if (userAgent?.includes('Android')) return 'Android';
    return 'Unknown';
  };

  const getRandomGradient = (seed) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    return gradients[seed % gradients.length];
  };

  return (
    <div className="login-history-container">
      <div className="gmail-header">
        <h1>🔐 Login Activity</h1>
        <p className="gmail-subheader">Review all login events to your account</p>
      </div>

      <div className="gmail-search-bar">
        <input
          type="text"
          className="gmail-search-input"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <div className="gmail-loading">⏳ Loading login history...</div>}
      {error && <div className="gmail-error">❌ Error: {error}</div>}
      {!loading && events.length === 0 && <div className="gmail-empty">📭 No login records found.</div>}

      {!loading && events.length > 0 && (
        <div className="gmail-list">
          <div className="gmail-list-header">
            <span>{filteredEvents.length} of {events.length} logins</span>
          </div>
          {filteredEvents.length === 0 ? (
            <div className="gmail-empty">No results found for "{searchTerm}"</div>
          ) : (
            <>
              {filteredEvents.map((e, idx) => {
                const isSelected = selectedEvent?.id === e.id;
                const timestamp = e.ts && typeof e.ts.toDate === 'function' ? e.ts.toDate() : new Date();
                const timeStr = timestamp.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                });

                return (
                  <div
                    key={e.id}
                    className={`gmail-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedEvent(isSelected ? null : e)}
                  >
                    <div className="gmail-item-avatar" style={{
                      background: getRandomGradient(idx),
                      color: 'white'
                    }}>
                      {getInitials(e.displayName)}
                    </div>

                    <div className="gmail-item-content">
                      <div className="gmail-item-top">
                        <span className="gmail-item-name">{e.displayName}</span>
                        <span className="gmail-item-time">{timeStr}</span>
                      </div>
                      <div className="gmail-item-preview">{e.email}</div>
                      {isSelected && (
                        <div className="gmail-item-details">
                          <div className="detail-row">
                            <span className="detail-label">📧 Email:</span>
                            <span className="detail-value">{e.email}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">{getDeviceIcon(e.userAgent)} Device:</span>
                            <span className="detail-value">{getDeviceName(e.userAgent)}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">🕐 Login Time:</span>
                            <span className="detail-value">{timestamp.toLocaleString()}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">🔧 User Agent:</span>
                            <span className="detail-value detail-value-mono">{e.userAgent}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="gmail-item-star">⭐</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
