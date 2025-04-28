import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(''); 
  const navigate = useNavigate();

  const toggleLoginSignup = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setEmail('');
    setPassword('');
    setError('');
    setDebugInfo('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDebugInfo('Attempting ' + (isLogin ? 'login' : 'signup') + '...');
    
    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:5000/login', {
          Username: username,
          Password: password
        });
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setTimeout(() => {
          navigate('/chat');
          setTimeout(() => {
            window.location.href = '/chat';
          }, 100);
        }, 100);
      } else {
        const response = await axios.post('http://localhost:5000/signup', {
          Username: username,
          Email: email,
          Password: password
        });
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setTimeout(() => {
          navigate('/chat');
          setTimeout(() => {
            window.location.href = '/chat';
          }, 100);
        }, 100);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || 'Server error');
      } else if (error.request) {
        setError('No response from server. Is the backend running?');
      } else {
        setError('Request error: ' + error.message);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          )}
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>

          {/* Toggle between Login and Signup */}
          <div className="text-center">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleLoginSignup}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginSignup;