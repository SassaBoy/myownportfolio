// models/PortfolioItem.js
const mongoose = require('mongoose');


const portfolioItemSchema = new mongoose.Schema({
  title: String,
  image: String,     // Store the filename of the uploaded image
  imageUrl: String,  // Store the Cloudinary URL of the image
});

const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

module.exports = PortfolioItem;