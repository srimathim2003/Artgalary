import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthProvider';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Card from './Card';
import { useNavigate } from 'react-router-dom';
import DashCss from '../Page-css/DashCSS.module.css'

const Dashboard = () => {
  const { auth} = useContext(AuthContext);
  const { username } = auth;
  const [artwork, setArtwork] = useState([]);
  const navigate = useNavigate();
  
  

  useEffect(() => {
    axios.get('http://localhost:5000/artwork-dashboard')
      .then(result => {
        
        setArtwork(result.data.artwork);
        
      })
      .catch(err => {
        console.error('Error fetching artworks:', err);
      });
  });

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    navigate('/');
  };
  

  return (
    <div>
      <div className={DashCss.header}>
    Hello {username}
    <Link to='/payment' className={DashCss.upload}><button className={DashCss.cart}>go to cart</button></Link>
    <Link to='/art-form' ><button className={DashCss.cart}>Upload Artwork</button></Link>
    <Link to='/profile'><button class={DashCss.profile}>Profile</button></Link>
    <button className={DashCss.logout} onClick={handleLogout}>
        Logout
      </button>
      
      </div>
      <div className={DashCss.body}>
    {artwork && artwork.length > 0 ? (
      <div className={DashCss.gridContainer}>
        {artwork.map(art => (
          <Card className={DashCss.gridItem}  key={art._id} artwork={art}  />
        ))}
      </div>
    ) : (
      <p>No artworks found</p>
    )}
  </div>
  </div>
  );
};

export default Dashboard;
