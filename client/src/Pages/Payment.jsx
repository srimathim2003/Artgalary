import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthProvider';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import PaymentCss from '../Page-css/PaymentCss.module.css'

const Payment = () => {
  const { auth } = useContext(AuthContext);
  const { username, _id } = auth;

  const [artworks, setArtworks] = useState([]);
  const [final, setFinal] = useState([]);
  const [total, setTotal] = useState(0);
  const [artDetails, setArtDetails] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    axios.get(`http://localhost4:5000/fetch-user?id=${_id}`)
      .then(response => {
        setArtworks(response.data.user.cart);
      })
      .catch(err => {
        console.error("Error fetching artworks " + err);
      });
  }, [_id]);

  useEffect(() => {
    axios.get('http://localhost4:5000/total-price', { params: { final } })
      .then(result => {
        setTotal(result.data.total);
        setArtDetails(result.data.arr);
      })
      .catch(err => {
        console.log(err);
      });
  }, [final]);

  useEffect(() => {
    const countCart = () => {
      const cartCount = artworks.reduce((countMap, cartItem) => {
        countMap[cartItem] = (countMap[cartItem] || 0) + 1;
        return countMap;
      }, {});

      const finalArray = Object.entries(cartCount).map(([cartId, count]) => ({ _id: cartId, count }));
      setFinal(finalArray);
    };

    countCart();
  }, [artworks]);

  const initPayment = (data) => {
    const options = {
      key: "rzp_test_K0Vi9VrVLORM20",
      amount: data.amount,
      currency: data.currency,
      name: username,
      description: "Test Transaction",
      image: 'https://wallpapercave.com/wp/wp2555019.jpg',
      order_id: data.id,
      handler: async (response) => {
        try {
          const verifyUrl = "http://localhost:5000/verify";
          const { data } = await axios.post(verifyUrl, response);
          if (data.message === 'Payment verified successfully') {
            console.log("Payment verified")
            setFinal([])
            setArtDetails([])
            setTotal(0)
            
            const clear = await axios.delete(`http://localhost:5000/${username}/delete-cart`)
            console.log(clear)
          }
        } catch (error) {
          console.log(error);
        }
      },
      theme: {
        color: "#3399cc",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };


  const handlePayment = async () => {
    if (total === 0) {
      alert("Total amount is 0. Please add items to your cart.");
      return;
    }
    try {
      const orderUrl = "http://localhost:5000/orders";
      const { data } = await axios.post(orderUrl, { amount: total });
      console.log(data);
      initPayment(data.data);
    } catch (error) {
      console.log("err")
      console.log(error);
    }
  };

  const updateCartQuantity = async (artworkId, update) => {
    try {
      const response = await axios.put(`http://localhost:5000/cart/${username}/update-quantity`, { artworkId: artworkId, update: update });
      setArtworks(response.data.user.cart);
      if (response.data.user.cart.length === 0) {
        setArtDetails([])
        setTotal(0)
      }

    } catch (err) {
      console.log(err);
    }
  }

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div>
      <div className={PaymentCss.header}>
        <p className={PaymentCss.hello}>Hello, {username}</p>
        <Link to='/'><button className={PaymentCss.logout}>dashboard</button></Link>
        <div><button className={PaymentCss.logout} onClick={handleLogout}>Logout</button></div>
      </div>
      <div className={PaymentCss.pay}>
        <p className={PaymentCss.total}>Total: {total}</p>
        <button className={PaymentCss.buy} onClick={handlePayment}>
          buy now
        </button>
      </div>
      <div className={PaymentCss.gridContainer}>
        {artDetails && artDetails.length > 0 ? artDetails.map(art => (
          <div key={art._id} className={`${PaymentCss.card} ${PaymentCss.gridItem}`} >
            <img src={`http://localhost:5000/${art.image.replace(/\\/g, '/')}`} alt="" style={{ width: '250px', height: '400px' }} />

            <p>Product Name: {art.title}</p>
            <div>
              <button onClick={() => updateCartQuantity(art._id, "remove")}>-</button>
              Quantity: {art.count}
              <button onClick={() => updateCartQuantity(art._id, "add")}>+</button>
            </div>
            <p>artist-{art.artist}</p>
            <p>description-{art.description}</p>
            <p>Price-{art.price}</p>
            <hr />
          </div>
        )) : <p>No items available in cart</p>}
      </div>

    </div>
  );
};

export default Payment;
