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
app.use("/", express.static("./website")); // Frontend files
app.use("/uploads", express.static("uploads")); // Uploaded files

// Multer setup for file uploads
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
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("✅ Connected to stitchit database");
    }
});

// Route to handle form submission (Order)
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
            console.error("MySQL error in /submit:", err);
            res.status(500).send('Database error while submitting order');
        } else {
            res.status(200).send('Order submitted successfully!');
        }
    });
});

// Route to get the latest order
app.get('/latest-order', (req, res) => {
    const query = `SELECT * FROM orders ORDER BY id DESC LIMIT 1`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching latest order:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.json(null);
        }
    });
});

// Route to handle contact form
app.post("/contact", (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    const sql = `
        INSERT INTO contacts (first_name, last_name, email, phone, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [firstName, lastName, email, phone, message], (err, result) => {
        if (err) {
            console.error("MySQL error in /contact:", err);
            res.status(500).json({ error: err.message });
        } else {
            res.status(200).json({ message: "Contact message saved successfully" });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}/HTML/index.html`);
});
