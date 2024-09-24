import React, { useState,useEffect,useContext } from 'react';
import axios from 'axios'
import { AuthContext } from '../context/AuthProvider';


const Card = ({ artwork }) => {
  const [showComments, setShowComments] = useState(false);
  const [comment,setComment] = useState('')
  const [comments, setComments] = useState([])

  const [cart , setCart]= useState(0);
  const {auth} = useContext(AuthContext)
  
  const { username } = auth;

  

  useEffect( () => {
    setComments(artwork.comments || [])
  },[artwork])

  
  const handleCommentClick = () => {
      setShowComments(!showComments);
  };

  const onBuyClick = async(e) =>{
    e.preventDefault();
    setCart(cart+1);
    try{
      const updateCart = await axios.put(`http://localhost:5000/cart/${username}/update`, {
        cart: artwork._id,
      });
      console.log(updateCart.data)
    }catch(err){
      console.log('cart was not added '+ err.message);
    }
    
   
    console.log("Buy clicked")
  }

  const handleAddComment = async (e) => {
    e.preventDefault();

    try {
      
      const response = await axios.put(`http://localhost:5000/api/artworks/${artwork._id}/comments`, {
        comment: comment,
      });
      setComment('')
      setComments(response.data.artwork.comments || [])

      console.log('Comment added successfully:', response.data);
      
    } catch (error) {
      console.error('Error adding comment:', error.message);
      
    }
  };

  const updateCartQuantity = async(artworkId, update) =>{
    console.log(artworkId,update)
    try{
      const response = await axios.put(`http://localhost:5000/cart/${username}/update-quantity`, {artworkId:artworkId,update:update});
      if(update==='add'){
        setCart(cart+1)
      }else{
        setCart(cart-1)
      }
      console.log(response);
  
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '30px', margin: '10px', width: '300px',backgroundColor:'gainsboro',borderRadius:'20px',cursor:'pointer'}}>
      
      <img src={`http://localhost:5000/${artwork.imagePath.replace(/\\/g, '/')}`} alt={artwork.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
      <h3>{artwork.title}</h3>
      <p>Artist: {artwork.artist}</p>
      <p>Description: {artwork.description}</p>
      <p>Price: {artwork.price}</p>
      
      <button onClick={handleCommentClick}>Comment</button>
      <button onClick={onBuyClick} style={{marginLeft:'10px'}}>Add to Cart</button>
      {cart!==0 &&(
        <div>
          <button onClick={() => updateCartQuantity(artwork._id, "remove")}>-</button>
            Quantity: {cart}
            <button onClick={() => updateCartQuantity(artwork._id, "add")}>+</button>
        </div>
      )}

      {showComments && (
        <div>
          <h4>Comments:</h4>
          {comments && comments.length > 0 ? (
            comments.map((comment, index) => (
              <p key={index}>{comment}</p>
            ))
          ) : (
            <p>No comments</p>
          )}
          
          
          <form onSubmit={handleAddComment}>
            <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment" />
            <button type="submit">Add Comment</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Card;
