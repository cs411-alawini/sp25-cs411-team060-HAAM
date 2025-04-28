import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    maxWidth: 800,
    margin: '2rem auto',
    padding: '1rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '1.5rem'
  },
  form: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  },
  consultationItem: {
    backgroundColor: 'white',
    padding: '1rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center'
  }
};

export default function ConsultationManagement() {
  const [symptoms, setSymptoms] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [notes, setNotes] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingConsultation, setEditingConsultation] = useState(null);

  const fetchConsultations = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/user-consultations/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consultations');
      }
      const data = await response.json();
      setConsultations(data.consultations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.userId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConsultations();
    }
  }, [userId]);

  const resetForm = () => {
    setSymptoms('');
    setDiseaseName('');
    setNotes('');
    setEditingConsultation(null);
  };

  const handleAddConsultation = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      setError('Please log in to add a consultation');
      return;
    }

    try {
      const consultationResponse = await fetch('http://localhost:5000/consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserID: userId,
          DiseaseName: diseaseName,
          Notes: notes || `Consultation for ${diseaseName}`
        }),
      });

      const consultationData = await consultationResponse.json();
      if (symptoms.trim()) {
        const symptomsList = symptoms.split(',').map(s => s.trim());
        
        await fetch('http://localhost:5000/consultation-symptoms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ConsultationID: consultationData.consultation.ConsultationID,
            Symptoms: symptomsList
          }),
        });
      }

      fetchConsultations();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  //edit consultations
  const handleEditConsultation = async (e) => {
    e.preventDefault();

    if (!editingConsultation) return;

    try {
      const symptomsList = symptoms 
        ? symptoms.split(',').map(s => s.trim())
        : [];

      const response = await fetch(`http://localhost:5000/consultation/${editingConsultation.ConsultationID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          DiseaseName: diseaseName,
          Notes: notes,
          Symptoms: symptomsList
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update consultation');
      }

      fetchConsultations();
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const prepareEditConsultation = (consultation) => {
    setEditingConsultation(consultation);
    setSymptoms(consultation.Symptoms.join(', '));
    setDiseaseName(consultation.DiseaseName);
    setNotes(consultation.Notes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingConsultation) {
      handleEditConsultation(e);
    } else {
      handleAddConsultation(e);
    }
  };

  const handleDeleteConsultation = async (consultationId) => {
    if (!window.confirm('Are you sure you want to delete this consultation?')) return;

    try {
      const response = await fetch(`http://localhost:5000/consultation/${consultationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete consultation');
      }

      fetchConsultations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Consultation Management</h1>

      {error && <div style={styles.error}>{error}</div>}

      {/* Add/Edit Consultation Form */}
      <form 
        onSubmit={handleSubmit} 
        style={styles.form}
      >
        <h2>{editingConsultation ? 'Edit Consultation' : 'Add New Consultation'}</h2>
        <input
          type="text"
          placeholder="Symptoms (comma separated)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Disease Name"
          value={diseaseName}
          onChange={(e) => setDiseaseName(e.target.value)}
          style={styles.input}
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={styles.input}
        />
        <div>
          <button 
            type="submit" 
            style={{
              ...styles.button,
              backgroundColor: '#4CAF50',
              color: 'white',
              marginRight: '0.5rem'
            }}
          >
            {editingConsultation ? 'Save Changes' : 'Add Consultation'}
          </button>
          {editingConsultation && (
            <button 
              type="button"
              onClick={resetForm}
              style={{
                ...styles.button,
                backgroundColor: '#f44336',
                color: 'white'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Consultation List */}
      <h2 style={{textAlign: 'center', marginBottom: '1rem'}}>Your Consultations</h2>
      {loading ? (
        <p style={{textAlign: 'center'}}>Loading consultations...</p>
      ) : consultations.length === 0 ? (
        <p style={{textAlign: 'center', color: '#666'}}>No consultations found.</p>
      ) : (
        consultations.map(consultation => (
          <div 
            key={consultation.ConsultationID} 
            style={styles.consultationItem}
          >
            <div>
              <strong>{consultation.DiseaseName}</strong>
              <p>Date: {new Date(consultation.Date).toLocaleDateString()}</p>
              <p>Symptoms: {consultation.Symptoms.join(', ')}</p>
              <p>Notes: {consultation.Notes}</p>
            </div>
            <div>
              <button 
                onClick={() => prepareEditConsultation(consultation)}
                style={{
                  ...styles.button,
                  backgroundColor: '#2196F3',
                  color: 'white',
                  marginRight: '0.5rem'
                }}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteConsultation(consultation.ConsultationID)}
                style={{
                  ...styles.button,
                  backgroundColor: '#f44336',
                  color: 'white'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}