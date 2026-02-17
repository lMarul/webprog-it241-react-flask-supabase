import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Get API URL from environment variable or use default localhost
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/visitors";

const VisitorLog = () => {
  const [visitors, setVisitors] = useState([]);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentEditId, setCurrentEditId] = useState(null);

  // Fetch all visitor entries from the backend
  const loadVisitors = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      setVisitors(response.data);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage("Server is starting up... Please wait a moment and try again.");
      console.error("Error loading visitors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  // Add a new visitor entry
  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      alert("Please fill in both name and message fields!");
      return;
    }

    try {
      if (currentEditId) {
        // Update existing entry
        await axios.put(`${API_URL}/${currentEditId}`, formData);
        setCurrentEditId(null);
      } else {
        // Create new entry
        await axios.post(API_URL, formData);
      }
      setFormData({ name: '', message: '' });
      loadVisitors();
    } catch (err) {
      console.error("Error saving visitor:", err);
      alert("Failed to save entry. Please try again.");
    }
  };

  // Delete a visitor entry
  const handleRemoveVisitor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      loadVisitors();
    } catch (err) {
      console.error("Error deleting visitor:", err);
      alert("Failed to delete entry. Please try again.");
    }
  };

  // Prepare form for editing an existing entry
  const initiateEdit = (visitor) => {
    setFormData({ name: visitor.name, message: visitor.message });
    setCurrentEditId(visitor.id);
  };

  // Handle changes to form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setFormData({ name: '', message: '' });
    setCurrentEditId(null);
  };

  return (
    <div className="visitor-log-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>📝 Visitor Log</h1>
      <p>Leave a message and let us know you were here!</p>

      <form onSubmit={handleAddVisitor} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleInputChange}
            rows="4"
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          />
        </div>
        <button 
          type="submit" 
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {currentEditId ? 'Update Entry' : 'Add Entry'}
        </button>
        {currentEditId && (
          <button 
            type="button" 
            onClick={cancelEdit}
            style={{ 
              padding: '10px 20px', 
              fontSize: '16px', 
              marginLeft: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <hr style={{ margin: '30px 0' }} />

      {isLoading ? (
        <div className="loading-message" style={{ textAlign: 'center', padding: '20px' }}>
          <p>⏳ Loading visitor entries... This may take up to 30 seconds on first load.</p>
        </div>
      ) : errorMessage ? (
        <p style={{ color: '#ff9800', textAlign: 'center' }}>{errorMessage}</p>
      ) : (
        <div className="visitor-entries">
          {visitors.length === 0 && <p style={{ textAlign: 'center' }}>No entries yet. Be the first to leave a message!</p>}
          {visitors.map((visitor) => (
            <div 
              key={visitor.id} 
              style={{ 
                borderBottom: '1px solid #e0e0e0',
                padding: '15px 0',
                marginBottom: '10px'
              }}
            >
              <strong style={{ fontSize: '18px', color: '#333' }}>{visitor.name}</strong>
              <p style={{ margin: '10px 0', color: '#666' }}>{visitor.message}</p>
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={() => initiateEdit(visitor)}
                  style={{ 
                    padding: '5px 15px',
                    marginRight: '10px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveVisitor(visitor.id)}
                  style={{ 
                    padding: '5px 15px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
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
};

export default VisitorLog;
