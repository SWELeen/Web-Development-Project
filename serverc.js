const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "stitchit",
    port: 8889
});


db.connect((err) => {
    if (err) {
        console.error("DB error:", err);
    } else {
        console.log("Connected to MySQL");
    }
});

app.post("/contact", (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    const sql = "INSERT INTO contacts (first_name, last_name, email, phone, message) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [firstName, lastName, email, phone, message], (err, result) => {

        if (err) {
            console.error("MySQL error:", err);
            res.status(500).json({ error: err.message });


        } else {
            res.status(200).json({ message: "Data saved" });
        }
    });
});


app.use(express.static('website'));

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

