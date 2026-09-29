const API_BASE_URL = "https://aural-ze9j.onrender.com";

const signupForm = document.getElementById("signupForm");

const usernameInput =
    document.getElementById("username") ||
    document.getElementById("fullName");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const confirmPasswordInput =
    document.getElementById("confirmPassword");

console.log("Signup form:", signupForm);

signupForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    console.log("CREATE ACCOUNT BUTTON WORKING");

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    console.log("Username:", username);
    console.log("Email:", email);

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {

        console.log("Sending signup request...");

        const response = await fetch(
            API_BASE_URL + "/signup",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    confirm_password: confirmPassword
                })
            }
        );

        console.log("Signup status:", response.status);

        const data = await response.json();

        console.log("Signup response:", data);

        if (!response.ok) {
            alert(
                data.detail ||
                "Signup failed."
            );
            return;
        }

        alert("Account created successfully!");

        window.location.href = "login.html";

    } catch (error) {

        console.error("SIGNUP ERROR:", error);

        alert("Cannot connect to AuralGuard backend.");
    }

});
