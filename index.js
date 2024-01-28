const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');  
require('dotenv').config();     
cloudinary.config({ 
  cloud_name: 'dp0i92tjf', 
  api_key: '227668771945544', 
  api_secret: 'N9IKKoyrz7bsj2A-LPCu24R6XCg' 
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
mongoose.connect(process.env.MONGO_URI).then(()=>{ 
    console.log(" DB connection successfull ");
} );



// Define a simple video schema
const videoSchema = new mongoose.Schema({
    name: String,
    url: String
  });
  const Video = mongoose.model('Video', videoSchema);

// EJS setup
app.set('view engine', 'ejs');
app.use(express.static('public'));


app.get('/', (req, res) => {
    res.render('index');
    }
);

app.post('/upload', upload.single('video'), (req, res) => {
    // Upload video to Cloudinary
    cloudinary.uploader.upload_stream({ resource_type: 'video' }, async (error, result) => {
      if (error) {
        console.error(error);
        res.status(500).send('Error uploading video');
      } else {
        // Save video details to MongoDB
        const newVideo = new Video({
          name: req.file.originalname, // Assuming you want to store the original file name
          url: result.secure_url
        });
  
       let video = newVideo.save();
       res.render('success',{video})
      }
    }).end(req.file.buffer);
  });


  app.get('/videos', async (req, res) => {
    try {
      const videos = await Video.find();
      res.render('videos', { videos });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching videos from the database');
    }
  });


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
    }
);
