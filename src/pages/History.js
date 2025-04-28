import React, { useState, useEffect } from 'react';

export default function History() {
  const [months, setMonths] = useState('6');
  const [recurringSymptoms, setRecurringSymptoms] = useState([]);
  const [recurringDiseases, setRecurringDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      setDiagnosticInfo(`Raw localStorage data: ${userStr}`);

      if (userStr) {
        const user = JSON.parse(userStr);
        setDiagnosticInfo(prev => `${prev}\nParsed user data: ${JSON.stringify(user)}`);

        if (user && user.userId) {
          setUserId(user.userId);
          setDiagnosticInfo(prev => `${prev}\nUser ID set: ${user.userId}`);
        } else {
          throw new Error('Invalid user data');
        }
      } else {
        setError('Please log in to view your health history');
      }
    } catch (err) {
      setError('Failed to load user data. Please log in again.');
      setDiagnosticInfo(`Error loading user data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchHistory(6);
    }
  }, [userId]);

  const fetchHistory = async (monthsValue) => {
    setLoading(true);
    setError('');
    setDiagnosticInfo('');
    
    if (!userId) {
      setError('User ID is missing. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const fetchUrl = `http://localhost:5000/history?userId=${userId}&months=${monthsValue}`;
      setDiagnosticInfo(`Fetching URL: ${fetchUrl}`);

      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId.toString()
        }
      });

      setDiagnosticInfo(prev => `${prev}\nResponse Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        setDiagnosticInfo(prev => `${prev}\nError Response: ${errorText}`);
        throw new Error(errorText || 'Failed to fetch history data');
      }

      const data = await response.json();
      setDiagnosticInfo(prev => `${prev}\nReceived Data: ${JSON.stringify(data)}`);

      setRecurringSymptoms(data.recurringSymptoms || []);
      setRecurringDiseases(data.recurringDiseases || []);
    } catch (error) {
      setError(error.message || 'Failed to load history. Please try again.');
      setDiagnosticInfo(`Fetch Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const monthsValue = parseInt(months) || 6;
    fetchHistory(monthsValue);
  };

  return (
    <div style={{
      maxWidth: 800,
      margin: '2rem auto',
      padding: '1rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Your Health History
      </h1>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Month Selection Form */}
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        marginBottom: '1rem',
        opacity: userId ? 1 : 0.5
      }}>
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="Months"
          min="1"
          max="60"
          style={{
            flex: 1,
            padding: '0.5rem',
            fontSize: '1rem'
          }}
          disabled={!userId}
        />
        <button 
          type="submit" 
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none'
          }}
          disabled={!userId || loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          color: '#666',
          padding: '2rem'
        }}>
          Loading your health history...
        </div>
      )}

      {/* Symptoms Section */}
      {!loading && (
        <div>
          <h2>Recurring Symptoms</h2>
          {recurringSymptoms.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No recurring symptoms found.
            </p>
          ) : (
            <ul>
              {recurringSymptoms.map((symptom, index) => (
                <li key={index} style={{ 
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#f0f0f0'
                }}>
                  {symptom.SymptomName} (Frequency: {symptom.SymptomFrequency})
                </li>
              ))}
            </ul>
          )}

          {/* Diseases Section */}
          <h2>Recurring Conditions</h2>
          {recurringDiseases.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No recurring conditions found.
            </p>
          ) : (
            <ul>
              {recurringDiseases.map((disease, index) => (
                <li key={index} style={{ 
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: '#f0f0f0'
                }}>
                  {disease.DiseaseName} 
                  (Frequency: {disease.DiagnosisFrequency})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}