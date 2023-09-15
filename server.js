const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary'); // Import Cloudinary
const PortfolioItem = require('./models/PortfolioItem');
const sharp = require('sharp'); // Import the sharp library
const fs = require('fs');
require('dotenv').config();
const cors = require('cors'); // Import the cors middleware

const nodemailer = require('nodemailer');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Database Connected');
});

const app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors()); // Use the cors middleware to enable CORS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.static('uploads')); // Replace 'uploads' with the directory containing your images



  // Configure nodemailer to send emails (replace with your email service provider settings)
const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'Gmail'
    auth: {
      user: 'gewersdeon61@gmail.com',
      pass: 'dqpkeoompwquevaq',
    },
  });
  

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = file.originalname.split('.').pop(); // Get the file extension
      cb(null, uniqueSuffix + '.' + extension);
    }
  });
  
  const upload = multer({ storage: storage });




// ... other middleware and configuration ...

 app.post('/admin/upload', upload.fields([{ name: 'image' }, { name: 'imageUrl' }]), async (req, res) => {
    if (!req.files || !req.files.image || !req.body.title) {
      return res.status(400).send('Incomplete data provided.');
    }
  
    const imageFile = req.files.image[0];
    const imageUrl = req.body.imageUrl;
    const title = req.body.title;
  
    console.log('Image file:', imageFile);
    console.log('Image URL:', imageUrl);
  
    try {
      const newPortfolioItem = new PortfolioItem({
        title: title,
        image: imageFile.filename, // Save the image filename or path
        imageUrl: imageUrl, // Save the image URL
      });
  
      await newPortfolioItem.save();
  
    //   res.status(200).json({ message: 'PortfolioItem saved successfully.' });
      res.redirect('/admin');
     
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send(error);
    }
  });
  
  app.use('/vendors', express.static(__dirname + '/public/vendors', {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  },
}));



app.get('/', async (req, res) => {
  try {
    const portfolioItems = await PortfolioItem.find();
    res.render('index', { portfolioItems });
  } catch (error) {
    console.error('MongoDB query error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/admin', async (req, res) => {
  try {
    const portfolioItems = await PortfolioItem.find();
    res.render('admin', { portfolioItems });
  } catch (error) {
    console.error('MongoDB query error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/admin/delete/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Attempt to delete the portfolio item document by ID
      const result = await PortfolioItem.deleteOne({ _id: id });
  
      if (result.deletedCount === 0) {
        return res.status(404).send('Portfolio item not found.');
      }
  
      // Optionally, you can delete the image file from your server
      // Make sure to adjust the path and filename based on your Multer configuration
      const imagePath = `uploads/${result.image}`;
      fs.unlinkSync(imagePath);
  
      res.redirect('/admin');
    } catch (error) {
      console.error('MongoDB delete error:', error);
      res.status(500).send('Error deleting portfolio item.');
    }
  });

  app.post('/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;
  
    if (!name || !email || !subject || !message) {
      return res.status(400).send('Incomplete data provided.');
    }
  
    const mailOptions = {
      from: email, // Set the "from" address to the sender's email
      to: 'gewersdeon61@gmail.com', // Replace with your email address
      subject: subject,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
       
        Message: ${message}
      `,
    };
  
    try {
       await transporter.sendMail(mailOptions);
    //   res.status(200).json({ message: 'Message sent successfully.' });
    res.redirect('/');
      
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error sending message.');
    }
  });
  

  

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
