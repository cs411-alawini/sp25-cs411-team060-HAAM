import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ onLogout, userName }) {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <Link to="/bodyscan" className="text-white hover:text-gray-300">BodyScan</Link>
          <Link to="/chat" className="text-white hover:text-gray-300">Chat</Link>
          <Link to="/consultation" className="text-white hover:text-gray-300">Consultation</Link>
          <Link to="/history" className="text-white hover:text-gray-300">History</Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-white">{userName}</span>
          <button 
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;