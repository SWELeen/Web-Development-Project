let currentStep = 0;
const steps = document.querySelectorAll(".step");
const stepCircles = document.querySelectorAll(".step-circle");
const stepLines = document.querySelectorAll(".step-line");

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');


const app = express();
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',  
    database: 'stitchit',
    port: 8889        
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to database!");
});


app.post('/contact', (req, res) => {
    const { firstName, lastName, email, phone, message } = req.body;
    const sql = "INSERT INTO contacts (first_name, last_name, email, phone, message) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [firstName, lastName, email, phone, message], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error");
        }
        res.send("Message stored successfully");
    });
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});


function showStep(step) {
    steps.forEach((s, index) => {
        s.classList.toggle("active", index === step);
    });

    stepCircles.forEach((circle, index) => {
        circle.classList.toggle("active", index <= step);
    });

    stepLines.forEach((line, index) => {
        line.style.backgroundColor = index < step ? "#EAAEB2" : "#ddd";
        line.style.transition = "background-color 0.5s ease-in-out";
    });
}

function nextStep() {
    const currentFieldset = steps[currentStep];
    const inputs = currentFieldset.querySelectorAll("input, select, textarea");
    let isValid = true;

    inputs.forEach(input => {
        const errorElement = document.getElementById(`${input.id}-error`);

        if (errorElement) errorElement.style.display = "none"; // Hide any previous errors

        if (input.type === "file") {
            if (input.files.length === 0) {
                isValid = false;
                if (errorElement) errorElement.style.display = "block";
            }
        } else if (input.tagName === "TEXTAREA") {
            if (input.value.trim() === "") {
                isValid = false;
                if (errorElement) errorElement.style.display = "block";
            }
        } else if (!input.checkValidity()) {
            isValid = false;
            input.reportValidity();
        }
    });

    if (isValid && currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}

// Show the first step when the page loads
showStep(currentStep);

// Attach event listeners
document.querySelectorAll(".button-next").forEach(button => {
    button.addEventListener("click", nextStep);
});

document.querySelectorAll(".button-prev").forEach(button => {
    button.addEventListener("click", prevStep);
});

document.getElementById("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        message: document.getElementById("message").value
    };

    try {
        const res = await fetch("http://localhost:3000/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("Message sent successfully!");
            document.getElementById("contactForm").reset();
        } else {
            alert("Something went wrong!");
        }
    } catch (err) {
        console.error(err);
        alert("Error connecting to server.");
    }
});

