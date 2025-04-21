const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder to serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stitchit'
});

connection.connect((err) => {
    if (err) {
        console.error('MySQL connection error:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Handle form submission
app.post('/submit-form', upload.single('file'), (req, res) => {
    const data = req.body;
    const filePath = req.file ? req.file.path : '';

    const sql = `INSERT INTO orders (
        name, email, phone, dob,
        height, weight, chest, waist, hips,
        arm, leg, shoulder,
        clothing_type, fabric, color, design,
        description, file_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
        data.name,
        data.email,
        data.phone,
        data.dob,
        data.height,
        data.weight,
        data.chest,
        data.waist,
        data.hips,
        data.arm,
        data.leg,
        data.shoulder,
        data["clothing-type"],
        data.fabric,
        data.color,
        data.design,
        data.description,
        filePath
    ];

//     const sql = `INSERT INTO orders (
//         name, email, phone, dob,
//         height, weight, chest, waist, hips,
//         arm, leg, shoulder,
//         clothing_type, fabric, color, design,
//         description, file_path) 
//         VALUES (
//         '${data.name}',
//         '${data.email}',
//         '${data.phone}',
//         '${data.dob}',
//         ${data.height},
//         ${data.weight},
//         ${data.chest},
//         ${data.waist},
//         ${data.hips},
//         ${data.arm},
//         ${data.leg},
//         ${data.shoulder},
//         '${data["clothing-type"]}',
//         '${data.fabric}',
//         '${data.color}',
//         '${data.design}',
//         '${data.description}',
//         '${filePath}')`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.error('Insert error:', err);
            return res.status(500).send('Database error');
        }
        res.send('Form submitted successfully!');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});