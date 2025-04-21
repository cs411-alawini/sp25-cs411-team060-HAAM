import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'system', 
      text: 'Welcome to SympChat! Please describe your symptoms or click on the affected area in the body visualization.' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [diagnoses, setDiagnoses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  // Function to simulate fetching diagnoses from the backend
  const fetchDiagnoses = async (symptomText) => {
    setIsLoading(true);
    
    try {
      // Simulating network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response data
      const mockDiagnoses = [
        { id: 1, name: 'Common Cold', confidence: 85, description: 'A viral infection of the upper respiratory tract.' },
        { id: 2, name: 'Seasonal Allergies', confidence: 72, description: 'An immune response to environmental triggers like pollen.' },
        { id: 3, name: 'Influenza', confidence: 45, description: 'A viral infection that attacks your respiratory system.' }
      ];
      
      setDiagnoses(mockDiagnoses);
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'system',
        text: `Based on your symptoms, I've identified some potential conditions. Please check the diagnosis panel for details.`
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the symptoms
    fetchDiagnoses(inputText);
    
    // Clear input field
    setInputText('');
  };

  // Basic inline styles for layout (minimum styling)
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
        {diagnoses.length === 0 ? (
          <p>Describe your symptoms to get diagnoses</p>
        ) : (
          <div>
            {diagnoses.map(diagnosis => (
              <div key={diagnosis.id} style={diagnosisCardStyle}>
                <h3>{diagnosis.name}</h3>
                <div>
                  <div style={{ 
                    height: '8px', 
                    width: `${diagnosis.confidence}%`, 
                    backgroundColor: '#5cb85c',
                    marginTop: '5px',
                    marginBottom: '5px'
                  }}></div>
                  <span>{diagnosis.confidence}% match</span>
                </div>
                <p>{diagnosis.description}</p>
                <button style={{
                  width: '100%',
                  padding: '8px',
                  marginTop: '10px',
                  backgroundColor: 'white',
                  border: '1px solid #4e8cff',
                  color: '#4e8cff',
                  cursor: 'pointer'
                }}>
                  More Information
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;