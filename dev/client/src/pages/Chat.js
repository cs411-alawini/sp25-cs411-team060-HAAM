import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'system', 
      text: 'Welcome to SympChat! Please list your symptoms in a comma separated list to get diagnosed.' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  const fetchMedicinesForDiagnoses = async (diagnosesData) => {
    try {
      const diagnosesWithMedicines = await Promise.all(
        diagnosesData.map(async (diagnosis) => {
          const response = await fetch('http://localhost:5000/diagnose-helper', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              diseaseID: diagnosis.DiseaseID
            }),
          });
          
          if (!response.ok) {
            console.error(`Failed to get medicines for disease ${diagnosis.DiseaseID}`);
            return { ...diagnosis, medicines: [] };
          }
          
          const data = await response.json();
          return { ...diagnosis, medicines: data.medicines || [] };
        })
      );
      
      return diagnosesWithMedicines;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      return diagnosesData.map(diagnosis => ({ ...diagnosis, medicines: [] }));
    }
  };

  const fetchDiagnoses = async (symptomText) => {
    setIsLoading(true);
    
    try {
      const symptoms = symptomText.split(',').map(s => s.trim());
      
      const response = await fetch('http://localhost:5000/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms,
          maxResults: 3
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get diagnoses');
      }
      
      const data = await response.json();
      let formattedDiagnoses = data.diagnoses ? data.diagnoses.map(diagnosis => {
        const formattedDescription = diagnosis.Description ? 
          diagnosis.Description.replace(/_/g, ' ') : '';
        
        return {
          id: diagnosis.DiseaseID,
          name: diagnosis.DiseaseName,
          description: formattedDescription,
          matchingCount: diagnosis.MatchingSymptomCount,
          similarDiseases: diagnosis.SimilarDiseases,
          DiseaseID: diagnosis.DiseaseID // Keep the original ID for API calls
        };
      }) : [];
      
      formattedDiagnoses = await fetchMedicinesForDiagnoses(formattedDiagnoses);
      
      // sort diagnoses by confidence 
      formattedDiagnoses.sort((a, b) => b.confidence - a.confidence);
      setDiagnoses(formattedDiagnoses);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: `Based on your symptoms, I've identified ${formattedDiagnoses.length} potential conditions. Please check the diagnosis panel for details.`
      }]);
      
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: 'Sorry, I encountered an error while analyzing your symptoms. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText
    };
    
    setMessages(prev => [...prev, userMessage]);
    fetchDiagnoses(inputText);
    setInputText('');
  };

  const containerStyle = {
    display: 'flex',
    width: '100%',
    height: '100vh',
    fontFamily: 'Arial, sans-serif'
  };

  const chatSectionStyle = {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #ddd'
  };

  const chatMessagesStyle = {
    flex: '1',
    padding: '20px',
    overflowY: 'auto'
  };

  const userMessageStyle = {
    textAlign: 'right',
    marginBottom: '10px',
    paddingRight: '10px'
  };

  const systemMessageStyle = {
    textAlign: 'left',
    marginBottom: '10px',
    paddingLeft: '10px'
  };

  const inputFormStyle = {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd'
  };

  const inputStyle = {
    flex: '1',
    padding: '10px',
    marginRight: '10px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: isLoading ? '#ccc' : '#4e8cff',
    color: 'white',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer'
  };

  const sidebarStyle = {
    width: '300px',
    padding: '20px',
    overflowY: 'auto',
    borderLeft: '1px solid #ddd'
  };

  const diagnosisCardStyle = {
    border: '1px solid #ddd',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '5px'
  };
  
  const medicineListStyle = {
    marginTop: '10px',
    paddingLeft: '15px'
  };
  
  const medicineItemStyle = {
    marginBottom: '5px',
    fontSize: '14px'
  };

  const medicineSectionStyle = {
    marginTop: '15px',
    borderTop: '1px solid #eee',
    paddingTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={chatSectionStyle}>
        <div style={chatMessagesStyle}>
          {messages.map(message => (
            <div 
              key={message.id} 
              style={message.type === 'user' ? userMessageStyle : systemMessageStyle}
            >
              <strong>{message.type === 'user' ? 'You: ' : 'SympChat: '}</strong>
              <span>{message.text}</span>
            </div>
          ))}
          {isLoading && (
            <div style={systemMessageStyle}>
              <strong>SympChat: </strong>
              <span>Analyzing your symptoms...</span>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
        
        <form style={inputFormStyle} onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your symptoms (e.g., fever, cough, headache)"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            style={buttonStyle}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? 'Analyzing...' : 'Send'}
          </button>
        </form>
      </div>
      
      <div style={sidebarStyle}>
        <h2>Potential Diagnoses</h2>
        
        {/* Debug data section */}
        <div style={{ marginBottom: '15px', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
          <details>
            <summary>Debug Data</summary>
            <strong>Raw input symptoms:</strong><br/>
            {inputText}<br/><br/>
            <strong>Processed symptoms:</strong><br/>
            {inputText.split(',').map(s => s.trim()).join(', ')}<br/><br/>
            <strong>Raw diagnosis data:</strong><br/>
            {JSON.stringify(diagnoses, null, 2)}
          </details>
        </div>
        
        {diagnoses.length === 0 ? (
          <p>Describe your symptoms to get diagnoses</p>
        ) : (
          <div>
            {diagnoses.map(diagnosis => (
              <div key={diagnosis.id} style={diagnosisCardStyle}>
                <h3>{diagnosis.name}</h3>
                <p>{diagnosis.description}</p>
                
                {diagnosis.similarDiseases && (
                  <p><strong>Similar conditions:</strong> {diagnosis.similarDiseases}</p>
                )}
                
                {/* Medicine section */}
                <div style={medicineSectionStyle}>
                  <h4>Recommended Medicines:</h4>
                  {diagnosis.medicines && diagnosis.medicines.length > 0 ? (
                    <ul style={medicineListStyle}>
                      {diagnosis.medicines.map(medicine => (
                        <li key={medicine.MedicineID} style={medicineItemStyle}>
                          <strong>{medicine.MedicineName}</strong>
                          {medicine.UsageInstructions && 
                            <p style={{fontSize: '12px', marginTop: '2px', color: '#555'}}>
                              Usage: {medicine.UsageInstructions}
                            </p>
                          }
                          {medicine.SideEffects && 
                            <p style={{fontSize: '12px', marginTop: '2px', color: '#c74444'}}>
                              Side effects: {medicine.SideEffects}
                            </p>
                          }
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{fontStyle: 'italic', color: '#888'}}>
                      No specific medications found for this condition.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;