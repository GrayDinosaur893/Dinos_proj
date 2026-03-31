import React, { useState, useEffect } from 'react';
import './Login3D.css';

const STORAGE_KEY = 'registered_users';

const Login3D = ({ onLogin }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Load users from localStorage on mount
  const getUsers = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  };

  // Clear message after delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Handle login form submission
  const handleLogin = (e) => {
    e.preventDefault();
    const users = getUsers();
    
    const user = users.find(
      u => u.username === loginUsername && u.password === loginPassword
    );

    if (user) {
      setMessage({ type: 'success', text: 'ACCESS GRANTED - Welcome back!' });
      // Clear login form
      setLoginUsername('');
      setLoginPassword('');
      // Trigger page switch after a short delay
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 1000);
    } else {
      setMessage({ type: 'error', text: 'ACCESS DENIED - Invalid credentials' });
    }
  };

  // Handle registration form submission
  const handleRegister = (e) => {
    e.preventDefault();
    const users = getUsers();

    // Check if username already exists
    if (users.some(u => u.username === regUsername)) {
      setMessage({ type: 'error', text: 'ENTITY EXISTS - Username already taken' });
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email === regEmail)) {
      setMessage({ type: 'error', text: 'EMAIL REGISTERED - Use another email' });
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      username: regUsername,
      email: regEmail,
      password: regPassword,
      createdAt: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    setMessage({ type: 'success', text: 'ENTITY CREATED - Registration successful!' });
    
    // Clear form and flip to login
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setTimeout(() => setIsFlipped(false), 1500);
  };

  return (
    <div className="login-3d-container">
      <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
        <div className="flip-card-inner">
          
          {/* ---- FRONT: LOGIN ---- */}
          <div className="flip-card-front">
            <div className="card-header">
              <h2>SYS_LOGIN</h2>
              <div className="header-line"></div>
            </div>
            
            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}
            
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="input-group">
                <input 
                  type="text" 
                  required 
                  placeholder=" " 
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                />
                <label>USERNAME_</label>
              </div>
              
              <div className="input-group">
                <input 
                  type="password" 
                  required 
                  placeholder=" " 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <label>PASSWORD_</label>
              </div>
              
              <button type="submit" className="auth-submit-btn">ACCESS PROTOCOL</button>
            </form>
            
            <div className="card-footer">
              <span>UNREGISTERED?</span>
              <button className="text-link" onClick={() => setIsFlipped(true)}>
                INITIALIZE ENTITY
              </button>
            </div>
          </div>

          {/* ---- BACK: REGISTER ---- */}
          <div className="flip-card-back">
            <div className="card-header">
              <h2>SYS_REGISTER</h2>
              <div className="header-line"></div>
            </div>
            
            {message.text && (
              <div className={`message ${message.type}`}>{message.text}</div>
            )}
            
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="input-group">
                <input 
                  type="text" 
                  required 
                  placeholder=" " 
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                />
                <label>NEW_USERNAME_</label>
              </div>
              
              <div className="input-group">
                <input 
                  type="email" 
                  required 
                  placeholder=" " 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
                <label>EMAIL_MATRIX_</label>
              </div>
              
              <div className="input-group">
                <input 
                  type="password" 
                  required 
                  placeholder=" " 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <label>PASSWORD_</label>
              </div>
              
              <button type="submit" className="auth-submit-btn">CREATE PROTOCOL</button>
            </form>
            
            <div className="card-footer">
              <span>EXISTING ENTITY?</span>
              <button className="text-link" onClick={() => setIsFlipped(false)}>
                RETURN TO LOGIN
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login3D;