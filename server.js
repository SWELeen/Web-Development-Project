const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// MySQL connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root', 
    database: 'stitchit',
    port: 8889 
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to stitchit database');
});

// Route to handle form submission
app.post('/submit', upload.single('file'), (req, res) => {
    const {
        name, email, phone, dob,
        height, weight, chest, waist, hips, arm, leg, shoulder,
        clothingType, fabric, color, design, description
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const query = `
        INSERT INTO orders (
            name, email, phone, dob,
            height, weight, chest, waist, hips, arm, leg, shoulder,
            clothing_type, fabric, color, design, description, file_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        name, email, phone, dob,
        height, weight, chest, waist, hips, arm, leg, shoulder,
        clothingType, fabric, color, design, description, image
    ], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
        } else {
            res.status(200).send('Order submitted successfully!');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});