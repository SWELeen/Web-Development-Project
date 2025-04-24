let currentStep = 0;
const steps = document.querySelectorAll(".step");
const stepCircles = document.querySelectorAll(".step-circle");
const stepLines = document.querySelectorAll(".step-line");

document.addEventListener("DOMContentLoaded", function () {
    // Contact form handler
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const data = {
                firstName: document.getElementById("firstName").value,
                lastName: document.getElementById("lastName").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                message: document.getElementById("message").value
            };

            fetch("http://localhost:3000/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(response => {
                alert(response.message);
            })
            .catch(error => {
                console.error("Error:", error);
                alert("Something went wrong!");
            });
        });
    }

    // Multi-step form handler
    const multiStepForm = document.getElementById('multiStepForm');
    if (multiStepForm) {
        multiStepForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append('clothingType', document.getElementById('clothing-type').value);

            try {
                const response = await fetch('http://localhost:3000/submit', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.text();
                alert(result);
                this.reset();
                showStep(0);
            } catch (error) {
                console.error('Error:', error);
                alert('Submission failed!');
            }
        });
    }

    showStep(currentStep);
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
        if (errorElement) {
            errorElement.style.display = "none";
            errorElement.innerText = "";
        }

        if (input.type === "file" && input.files.length === 0) {
            isValid = false;
            if (errorElement) {
                errorElement.style.display = "block";
                errorElement.innerText = "Please upload a file.";
            }
        } else if ((input.tagName === "TEXTAREA" || input.type === "text") && (input.value.trim() === "" || input.value.length < 2 || input.value.length > 50)) {
            isValid = false;
            if (errorElement) {
                errorElement.style.display = "block";
                errorElement.innerText = "Text must be between 2 and 50 characters.";
            }
        } else if (input.type === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
                if (errorElement) {
                    errorElement.style.display = "block";
                    errorElement.innerText = "Invalid email format.";
                }
            }
        } else if (input.id === "phone") {
            const phonePattern = /^\d{8,15}$/;
            if (!phonePattern.test(input.value)) {
                isValid = false;
                if (errorElement) {
                    errorElement.style.display = "block";
                    errorElement.innerText = "Phone number must contain 8 to 15 digits.";
                }
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

document.querySelectorAll(".button-next").forEach(button => {
    button.addEventListener("click", nextStep);
});

document.querySelectorAll(".button-prev").forEach(button => {
    button.addEventListener("click", prevStep);
});
