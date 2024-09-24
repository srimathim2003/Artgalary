import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginCss from '../Page-css/Login.module.css';
import axios from 'axios';
import { AuthContext } from '../context/AuthProvider';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });

      if (response?.data?.status === 'success' && response?.data?.user) {
        const user = response.data.user;
        const accessToken = response?.data?.accessToken;

        setAuth({
          _id:user._id,
          username,
          password,
          accessToken,
        });

        navigate('/dash');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      console.error('Login failed:', err.message);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (<div className={LoginCss.login}>
  
    <h3 className={LoginCss.heading}>Art-Galary</h3>
    <div className={LoginCss.container}>
      <form action="/" method="POST" onSubmit={handleSubmit} className={LoginCss.form}>
        <h3>Login page</h3>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          placeholder="UserID"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className={LoginCss.button} disabled={loading}>
          {loading ? 'Logging in...' : 'Submit'}
        </button>
      </form>
      {error && <p>{error}</p>}
      <br />
      <Link to="/register" className={LoginCss.link}>New to this site... Register here👈</Link>
    </div>
    
    </div>
    
  );
};

export default Login;
