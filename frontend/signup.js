```javascript
// ======================================================
// AURALGUARD - SIGNUP JAVASCRIPT
// ======================================================

// Backend API
const API_BASE_URL = "https://auralguard-1.onrender.com";


// ======================================================
// PAGE LOAD
// ======================================================

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------------------
    // GET HTML ELEMENTS
    // --------------------------------------------------

    const signupForm = document.getElementById("signupForm");

    const usernameInput =
        document.getElementById("username") ||
        document.getElementById("fullName");

    const emailInput = document.getElementById("email");

    const passwordInput = document.getElementById("password");

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const termsCheckbox = document.getElementById("terms");

    const showPasswordCheckbox =
        document.getElementById("showPassword");

    const showConfirmPasswordCheckbox =
        document.getElementById("showConfirmPassword");

    const strengthText =
        document.getElementById("strengthText");

    const strengthFill =
        document.getElementById("strengthFill");

    const message =
        document.getElementById("message");

    const createButton =
        document.getElementById("createButton");


    // --------------------------------------------------
    // CHECK FORM
    // --------------------------------------------------

    if (!signupForm) {
        console.error("ERROR: signupForm not found.");
        return;
    }


    // ==================================================
    // PASSWORD SHOW / HIDE
    // ==================================================

    if (showPasswordCheckbox && passwordInput) {

        showPasswordCheckbox.addEventListener("change", function () {

            if (this.checked) {
                passwordInput.type = "text";
            } else {
                passwordInput.type = "password";
            }

        });

    }


    if (showConfirmPasswordCheckbox && confirmPasswordInput) {

        showConfirmPasswordCheckbox.addEventListener(
            "change",
            function () {

                if (this.checked) {
                    confirmPasswordInput.type = "text";
                } else {
                    confirmPasswordInput.type = "password";
                }

            }
        );

    }


    // ==================================================
    // PASSWORD STRENGTH
    // ==================================================

    if (passwordInput) {

        passwordInput.addEventListener("input", function () {

            const password = passwordInput.value;

            let strength = 0;

            // Length
            if (password.length >= 8) {
                strength++;
            }

            // Lowercase
            if (/[a-z]/.test(password)) {
                strength++;
            }

            // Uppercase
            if (/[A-Z]/.test(password)) {
                strength++;
            }

            // Number
            if (/[0-9]/.test(password)) {
                strength++;
            }

            // Special character
            if (/[^A-Za-z0-9]/.test(password)) {
                strength++;
            }


            if (strengthFill) {

                strengthFill.style.width =
                    (strength / 5) * 100 + "%";

            }


            if (strengthText) {

                if (password.length === 0) {

                    strengthText.textContent =
                        "Password strength";

                } else if (strength <= 2) {

                    strengthText.textContent =
                        "Weak password";

                } else if (strength === 3) {

                    strengthText.textContent =
                        "Medium password";

                } else if (strength === 4) {

                    strengthText.textContent =
                        "Strong password";

                } else {

                    strengthText.textContent =
                        "Very strong password";

                }

            }

        });

    }


    // ==================================================
    // FORM SUBMIT
    // ==================================================

    signupForm.addEventListener("submit", async function (event) {

        // VERY IMPORTANT
        // Prevent normal HTML form submission
        event.preventDefault();


        // --------------------------------------------------
        // CHECK INPUT ELEMENTS
        // --------------------------------------------------

        if (
            !usernameInput ||
            !emailInput ||
            !passwordInput ||
            !confirmPasswordInput
        ) {

            console.error(
                "ERROR: Signup input fields are missing."
            );

            showMessage(
                "Signup form fields are missing.",
                "error"
            );

            return;
        }


        // --------------------------------------------------
        // GET VALUES
        // --------------------------------------------------

        const username =
            usernameInput.value.trim();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (username.length < 3) {

            showMessage(
                "Username must contain at least 3 characters.",
                "error"
            );

            usernameInput.focus();

            return;
        }


        if (email.length === 0) {

            showMessage(
                "Please enter your email address.",
                "error"
            );

            emailInput.focus();

            return;
        }


        // Basic email validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();

            return;
        }


        if (password.length < 8) {

            showMessage(
                "Password must contain at least 8 characters.",
                "error"
            );

            passwordInput.focus();

            return;
        }


        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            confirmPasswordInput.focus();

            return;
        }


        // Terms checkbox
        if (termsCheckbox && !termsCheckbox.checked) {

            showMessage(
                "Please accept the Terms and Privacy Policy.",
                "error"
            );

            return;
        }


        // ==================================================
        // BUTTON LOADING STATE
        // ==================================================

        if (createButton) {

            createButton.disabled = true;

            createButton.textContent =
                "CREATING ACCOUNT...";

        }


        showMessage(
            "Creating your AuralGuard account...",
            "loading"
        );


        // ==================================================
        // SEND DATA TO FASTAPI
        // ==================================================

        try {

            console.log(
                "Sending signup request to:",
                API_BASE_URL + "/signup"
            );


            const response = await fetch(
                API_BASE_URL + "/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    body: JSON.stringify({

                        username: username,

                        email: email,

                        password: password,

                        confirm_password: confirmPassword

                    })

                }
            );


            console.log(
                "Signup response status:",
                response.status
            );


            // --------------------------------------------------
            // READ SERVER RESPONSE
            // --------------------------------------------------

            let data;

            try {

                data = await response.json();

            } catch (jsonError) {

                console.error(
                    "Server did not return JSON:",
                    jsonError
                );

                throw new Error(
                    "Invalid response received from server."
                );

            }


            console.log(
                "Signup response:",
                data
            );


            // ==================================================
            // ERROR FROM BACKEND
            // ==================================================

            if (!response.ok) {

                let errorMessage =
                    "Signup failed. Please try again.";


                if (data.detail) {

                    if (typeof data.detail === "string") {

                        errorMessage =
                            data.detail;

                    } else if (Array.isArray(data.detail)) {

                        errorMessage =
                            data.detail
                                .map(function (error) {
                                    return error.msg;
                                })
                                .join(", ");

                    }

                }


                throw new Error(errorMessage);

            }


            // ==================================================
            // SUCCESS
            // ==================================================

            console.log(
                "ACCOUNT CREATED SUCCESSFULLY"
            );


            showMessage(
                "✓ Account created successfully! Redirecting to login...",
                "success"
            );


            // Disable button
            if (createButton) {

                createButton.disabled = true;

                createButton.textContent =
                    "ACCOUNT CREATED";

            }


            // --------------------------------------------------
            // REDIRECT TO LOGIN
            // --------------------------------------------------

            setTimeout(function () {

                window.location.href =
                    "login.html";

            }, 1500);


        } catch (error) {

            // ==================================================
            // ERROR HANDLING
            // ==================================================

            console.error(
                "SIGNUP ERROR:",
                error
            );


            let errorMessage =
                error.message;


            // Network error
            if (
                error instanceof TypeError &&
                error.message.includes("fetch")
            ) {

                errorMessage =
                    "Cannot connect to AuralGuard server. Make sure FastAPI is running on port 8001.";

            }


            showMessage(
                errorMessage,
                "error"
            );


            // Enable button again
            if (createButton) {

                createButton.disabled = false;

                createButton.textContent =
                    "CREATE ACCOUNT";

            }

        }

    });


    // ==================================================
    // MESSAGE FUNCTION
    // ==================================================

    function showMessage(text, type) {

        if (!message) {

            console.log(
                "MESSAGE:",
                text
            );

            return;
        }


        message.textContent = text;


        // Reset classes
        message.className =
            "message";


        // Add message type
        if (type) {

            message.classList.add(type);

        }


        message.style.display =
            "block";

    }


    // ==================================================
    // PAGE READY
    // ==================================================

    console.log(
        "AuralGuard signup.js loaded successfully."
    );

    console.log(
        "Backend:",
        API_BASE_URL
    );

});
```
