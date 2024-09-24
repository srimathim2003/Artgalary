import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import UploadCss from '../Page-css/Upload.module.css'


const ArtworkForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState(0)
  const navigate = useNavigate();

  const { auth} = useContext(AuthContext);
  const { username } = auth;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', username);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('price',price)

    try {
      
      const response = await axios.post('http://localhost:5000/api/artworks', formData);

      console.log('Artwork added successfully:', response.data);
      navigate('/');     
    } catch (error) {
      console.error('Error adding artwork:', error.message);
      
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className={UploadCss.parent}>
      <button className={`${UploadCss.button} ${UploadCss.logout}`} onClick={handleLogout}>
        Logout
      </button>
    <div className={UploadCss.container}>
      <h2>Add Artwork</h2>
      <form onSubmit={handleSubmit} className={UploadCss.form}>
        <label className={UploadCss.label}>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={UploadCss.input}
        />

        <label htmlFor="price" className={UploadCss.label}>Price:</label>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className={UploadCss.input}
        />
        
        <label className={UploadCss.label}>Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className={UploadCss.textarea}
        />

        <label htmlFor="image" className={UploadCss.label}>Image:</label>
        <input
          type="file"
          id="image"
          onChange={(e) => setImage(e.target.files[0])}
          className={UploadCss.input}
        />

        <button type="submit" className={UploadCss.button}>Submit Artwork</button>
      </form>
      </div>
    </div>
  );
};

export default ArtworkForm;
