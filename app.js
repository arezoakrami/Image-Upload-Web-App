const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// EJS setup
app.set('view engine', 'ejs');

// Static folder
app.use(express.static('public'));

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// Help to read uploads.json
const getUploads = () => {
  if (!fs.existsSync('uploads.json')) return [];
  return JSON.parse(fs.readFileSync('uploads.json'));
};

// Home route
app.get('/', (req, res) => {
  const images = getUploads();
  res.render('index', { images });
});

// Upload form
app.get('/upload', (req, res) => {
  res.render('upload');
});

// Upload handler
app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    const uploads = getUploads();
    uploads.push({
      filename: req.file.filename,
      originalname: req.file.originalname,
      uploadDate: new Date().toISOString()
    });
    fs.writeFileSync('uploads.json', JSON.stringify(uploads, null, 2));
    res.redirect('/');
  } else {
    res.send('No file uploaded.');
  }
});

// Gallery page
app.get('/gallery', (req, res) => {
  const images = getUploads();
  res.render('gallery', { images });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
