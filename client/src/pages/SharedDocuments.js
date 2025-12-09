import React, { useEffect, useState } from 'react';
import { getDocuments } from '../api/docsApis';
import DocumentCard from '../components/documents/DocumentCard';
import Navbar from '../components/layout/Navbar';
import DocsLayout from '../layouts/DocsLayout';

const SharedDocuments = () => {
  const [sharedDocs, setSharedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    try {
      const res = await getDocuments();
      // Filter only documents that are shared
      const shared = res.data.filter(doc => doc.isShared === true);
      setSharedDocs(shared);
      setLoading(false);
    } catch (err) {
      setError('Error fetching shared documents');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <DocsLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>Loading shared documents...</p>
        </div>
      </DocsLayout>
    );
  }

  if (error) {
    return (
      <DocsLayout>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{error}</p>
          <button onClick={fetchSharedDocuments} style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Try Again
          </button>
        </div>
      </DocsLayout>
    );
  }

  return (
    <DocsLayout>
      <div style={{ padding: '20px' }}>
        <Navbar onLogout={handleLogout} />
        <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>🗂️ Shared Documents</h1>
        
        {sharedDocs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No Shared Documents</h3>
            <p style={{ color: '#6b7280', marginTop: '10px' }}>
              There are no shared documents available right now.
            </p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          }}>
            {sharedDocs.map((document) => (
              <DocumentCard
                key={document._id}
                document={document}
                onClick={() => {
                  // Navigate to document detail or open in modal
                  window.location.href = `/documents/${document._id}`;
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DocsLayout>
  );
};

export default SharedDocuments;