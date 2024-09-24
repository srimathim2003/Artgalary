
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    password: String,
    phone: Number,
    address: String,
    email: String,
    purchase: String,
    price: Number,
    cart: [{ type: Schema.Types.ObjectId, ref: 'Artwork' }],
});


const User = mongoose.model('User', userSchema);


const artworkSchema = new Schema({
    title: String,
    artist: String,
    description: String,
    imagePath: String,
    comments: [String],
    price: Number,
    _id: Schema.Types.ObjectId,
    
});

const Artwork = mongoose.model('Artwork', artworkSchema);



module.exports = { User,Artwork};
