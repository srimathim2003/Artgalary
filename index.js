const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const dotenv = require('dotenv')
const crypto = require('crypto')
const Razorpay = require('razorpay')  

dotenv.config();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadImage = multer({ storage: storage });

const secretKey = "Sivasanjeev";

const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { User, Artwork } = require('./models/users');


mongoose.connect('mongodb://localhost:27017/artgalary');

const conn = mongoose.connection;

conn.once('open', () => {
  console.log('Successfully connected to MongoDB');
});


app.post('/login', async (req, res) => {

  try {
    const user = await User.findOne({
      username: req.body.username,
    });

    if (user) {
      const passwordMatch = await bcrypt.compare(req.body.password, user.password);

      if (passwordMatch) {
        const accessToken = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ userId: user._id, username: user.username }, secretKey)
        res.cookie('refreshToken', refreshToken, { httpOnly: true });
        res.json({ status: "success", accessToken, user });
      } else {
        return res.json({ status: 'ok', user: false });
      }
    } else {
      return res.json({ status: 'ok', user: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      price: req.body.price,
    });
    res.json({ status: 'success', user });
  } catch (err) {
    console.log(err);
    res.json({ status: 'error', error: 'Failed to create user' });
  }
});


app.post('/api/artworks', uploadImage.single('image'), async (req, res) => {
  const { title, artist, description, price } = req.body;
  const imagePath = req.file.path;

  try {
    const newArtwork = await Artwork.create({
      _id: new mongoose.Types.ObjectId(),
      title,
      artist,
      description,
      imagePath,
      price
    });

    res.json({ status: 'success', artwork: newArtwork });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});


app.get('/artwork-dashboard', async (req, res) => {
  try {
    const artwork = await Artwork.find();
    res.json({ status: "getting artwork records", artwork });
  } catch (err) {
    console.log(err)
    res.json({ status: "Error getting artwork records", error: 'Internal server error' })
  }
})


app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);
  res.sendFile(imagePath);
});

app.put('/api/artworks/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  try {

    const updatedArtwork = await Artwork.findByIdAndUpdate(id, { $push: { comments: comment } }, { new: true });

    if (!updatedArtwork) {
      return res.status(404).json({ status: 'error', error: 'Artwork not found' });
    }

    res.json({ status: 'successfully updated comment', artwork: updatedArtwork });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
});

app.get('/fetch-user', async (req, res) => {
  const { id } = req.query;
  try {
    const user = await User.findById(id);

    if (!user) {

      return res.json({ status: "User not found", user });
    }


    res.json({ status: "Getting user record", user });
  } catch (err) {
    console.error(err);
    res.json({ status: "Error getting user record", error: 'Internal server error' });
  }
});

function deepEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

app.get('/total-price', async (req, res) => {
  const { final } = req.query;
  const arr = []
  try {
    if (final && final.length > 0) {
      const artworkPromises = final.map(async item => {
        const artwork = await Artwork.findById(item._id);
        const curItem = { title: artwork.title, artist: artwork.artist, description: artwork.description, image: artwork.imagePath, count: item.count, price: artwork.price, _id:artwork._id}
        if (!arr.some(existingItem => deepEqual(existingItem, curItem))) {
          arr.push(curItem);
        }
        return artwork ? artwork.price * item.count : 0;
      });

      const prices = await Promise.all(artworkPromises);

      const total = prices.reduce((acc, price) => acc + price, 0);

      res.json({ status: 'total price calculated', total, arr });
    }
  } catch (err) {
    console.log(err);
  }
})





app.put('/cart/:username/update', async (req, res) => {

  const username = req.params;
  const { cart } = req.body;

  try {
    const updateCart = await User.findOneAndUpdate(username, { $push: { cart: cart } }, { new: true });
    if (!updateCart) {
      return res.status(404).json({ status: 'error', error: 'User not found to update cart' });
    }
    return res.status(200).json({ status: 'successfully updated cart', user: updateCart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Internal server error' });
  }
});

app.put('/cart/:username/update-quantity', async (req, res) => {
  const { username } = req.params;
  const { artworkId, update } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    if (update === 'add') {
      const updateCart = await User.findOneAndUpdate(
        { username: username },
        { $push: { cart: artworkId } },
        { new: true }
      );

      if (!updateCart) {
        return res.status(404).json({ status: 'error', error: 'User not found to update cart' });
      }

      return res.status(200).json({ status: 'successfully updated cart', user: updateCart });
    } else if (update === 'remove') {
      const cartArray = user.cart;
      const i = cartArray.indexOf(artworkId)
      if(i!==-1){
        cartArray.splice(i,1);
      }
      
      const updateCart = await User.findOneAndUpdate(
        { username: username},
        { cart : cartArray },
        { new: true }
      );

      if (!updateCart) {
        return res.status(404).json({ status: 'error', error: 'User not found to update cart' });
      }

      return res.status(200).json({ status: 'successfully updated cart', user: updateCart });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: 'error', error: 'Internal server error in updatecart' });
  }
});




app.get('/artworkById/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const artwork = await Artwork.findById(id)
    if (!artwork) {
      return res.status(404).json({ status: 'error', error: 'artwork not found' });
    }
    return res.status(200).json({ status: 'artwork found', artwork: artwork })
  }
  catch (err) {
    return res.status(500).json({ status: 'error', error: 'Internal server error' })
  }

})


app.post("/orders", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.KEY_SECRET,
    });

    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
    };

    instance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Something Went Wrong!" });
      }
      res.status(200).json({ data: order });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
    console.log(error);
  }
});

app.delete('/:username/delete-cart', async(req,res)=>{
  const {username} = req.params;
  try{
    const cartArray=[];
    const updateCart = await User.findOneAndUpdate(
      { username: username},
      { cart : cartArray },
      { new: true }
    );
  }
  catch(err){
    console.log(err)
  }
})



app.listen(5000, () => {
  console.log('Server running on port 5000');
});
