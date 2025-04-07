//used claude for the solely frontend feature development

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
 const [users, setUsers] = useState([]);
 const [createUserID, setCreateUserID] = useState('');
 const [createUsername, setCreateUsername] = useState('');
 const [createEmail, setCreateEmail] = useState('');
 const [createPassword, setCreatePassword] = useState('');
 const [updateUserID, setUpdateUserID] = useState('');
 const [updateUsername, setUpdateUsername] = useState('');
 const [deleteUserID, setDeleteUserID] = useState('');
 
 const API_URL = 'http://localhost:5000';

 const fetchUsers = async () => {
   try {
     const response = await axios.get(`${API_URL}/api/users`);
     setUsers(response.data);
   } catch (error) {
     console.error('Error fetching users:', error.response ? error.response.data : error);
     alert('failed to fetch users');
   }
 };
 
 useEffect(() => {
   fetchUsers();
 }, []);
 
 const handleCreateUser = async (e) => {
   e.preventDefault();
   try {
     await axios.post(`${API_URL}/users`, {
       UserID: createUserID,
       Username: createUsername,
       Email: createEmail,
       Password: createPassword
     });
     alert('user created');
     setCreateUserID('');
     setCreateUsername('');
     setCreateEmail('');
     setCreatePassword('');
     fetchUsers();
   } catch (error) {
     console.error('error creating user:', error.response ? error.response.data : error);
     alert('failed to create user');
   }
 };
 
 const handleUpdateUser = async (e) => {
   e.preventDefault();
   try {
     await axios.put(`${API_URL}/users/${updateUserID}`, {
       Username: updateUsername
     });
     alert('user updated');
     setUpdateUserID('');
     setUpdateUsername('');
     fetchUsers();
   } catch (error) {
     console.error('error updating user:', error.response ? error.response.data : error);
     alert('failed to update');
   }
 };
 
 const handleDeleteUser = async (e) => {
   e.preventDefault();
   try {
     await axios.delete(`${API_URL}/users/${deleteUserID}`);
     await fetchUsers();
     alert('user deleted');
     setDeleteUserID('');
   } catch (error) {
     console.error('Error deleting user:', error.response ? error.response.data : error);
     alert('failed to delete user');
   }
 };

 return (
   <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
     <h1>User Management System</h1>
     
     {/* Create User Form */}
     <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
       <h2>Create User</h2>
       <form onSubmit={handleCreateUser}>
         <div style={{ marginBottom: '10px' }}>
           <label>User ID: </label>
           <input 
             type="text" 
             value={createUserID} 
             onChange={(e) => setCreateUserID(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <div style={{ marginBottom: '10px' }}>
           <label>Username: </label>
           <input 
             type="text" 
             value={createUsername} 
             onChange={(e) => setCreateUsername(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <div style={{ marginBottom: '10px' }}>
           <label>Email: </label>
           <input 
             type="email" 
             value={createEmail} 
             onChange={(e) => setCreateEmail(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <div style={{ marginBottom: '10px' }}>
           <label>Password: </label>
           <input 
             type="password" 
             value={createPassword} 
             onChange={(e) => setCreatePassword(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           Create User
         </button>
       </form>
     </div>
     
     {/* Update User Form */}
     <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
       <h2>Update User</h2>
       <form onSubmit={handleUpdateUser}>
         <div style={{ marginBottom: '10px' }}>
           <label>User ID: </label>
           <input 
             type="text" 
             value={updateUserID} 
             onChange={(e) => setUpdateUserID(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <div style={{ marginBottom: '10px' }}>
           <label>New Username: </label>
           <input 
             type="text" 
             value={updateUsername} 
             onChange={(e) => setUpdateUsername(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           Update User
         </button>
       </form>
     </div>
     
     {/* Delete User Form */}
     <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
       <h2>Delete User</h2>
       <form onSubmit={handleDeleteUser}>
         <div style={{ marginBottom: '10px' }}>
           <label>User ID: </label>
           <input 
             type="text" 
             value={deleteUserID} 
             onChange={(e) => setDeleteUserID(e.target.value)} 
             style={{ marginLeft: '10px' }}
             required
           />
         </div>
         <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
           Delete User
         </button>
       </form>
     </div>
     
     {/* Display Users */}
     <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
       <h2>User List</h2>
       <button 
         onClick={fetchUsers}
         style={{ padding: '8px 15px', backgroundColor: '#607d8b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '15px' }}
       >
         Refresh Users
       </button>
       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
         <thead>
           <tr style={{ backgroundColor: '#f2f2f2' }}>
             <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>User ID</th>
             <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Username</th>
             <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
           </tr>
         </thead>
         <tbody>
           {users.map((user) => (
             <tr key={user.UserID}>
               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.UserID}</td>
               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.Username}</td>
               <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.Email}</td>
             </tr>
           ))}
         </tbody>
       </table>
     </div>
   </div>
 );
}

export default App;