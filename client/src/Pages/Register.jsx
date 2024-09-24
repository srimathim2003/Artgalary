import React, { useState } from 'react';
import RegisterCSS from '../Page-css/Register.module.css';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email,setEmail] = useState('')
  const [phone, setPhone] = useState(0)
  const [address, setAddress] = useState('')
  const purchase =0

  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Confirm password should match with Password");
    } else {
      registerUser();
    }
  };

  const registerUser = ()=>{
    
    axios.post('http://localhost:5000/register',{username,password,email,phone,address,purchase})
    .then(() =>{
      navigate('/')
    } )
    .catch(err=> console.log(err));
  }

  return (
    <div>
      <form action="/" method="POST" className={RegisterCSS.container} onSubmit={(e) => handleSubmit(e)}>
        <h3>Register here</h3>

        <label htmlFor="username">Username:</label>
        <input type="text" placeholder="UserName" onChange={(e) => setUsername(e.target.value)} name="username" value={username} />

        <label htmlFor="password">Password:</label>
        <input type="password" placeholder="Password" name="password" onChange={(e) => setPassword(e.target.value)} value={password} />

        <label htmlFor="confirm-password">Confirm Password:</label>
        <input type="password" placeholder="Confirm Password" name="confirm-password" onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} />

        <label htmlFor="phone">Phone Number:</label>
        <input type="Number" placeholder="phone number" name="phone" onChange={(e)=> setPhone(e.target.value)} value={phone} />

        <label htmlFor="email">Email:</label>
        <input type="email" placeholder='email' name="email" onChange={(e)=> setEmail(e.target.value)} value={email} />

        <label htmlFor="address">Address:</label>
        <input type="text" name="address" onChange={(e)=> setAddress(e.target.value)} placeholder="Address" value={address} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Register;
