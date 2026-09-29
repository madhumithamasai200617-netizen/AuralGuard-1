/* =========================================================
   AURALGUARD LOGIN
   Clean + Stable Version
   ========================================================= */


/* =========================================================
   BACKEND
   ========================================================= */

const API_BASE_URL = "https://aural-ze9j.onrender.com";


/* =========================================================
   PARTICLES
   ========================================================= */

const particleContainer =
    document.getElementById("particles");

if (particleContainer) {

    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {

        const particle = document.createElement("span");

        particle.className = "particle";

        particle.style.left =
            Math.random() * 100 + "%";

        particle.style.top =
            Math.random() * 100 + "%";

        particle.style.animationDelay =
            Math.random() * 5 + "s";

        particle.style.animationDuration =
            3 + Math.random() * 5 + "s";

        particleContainer.appendChild(particle);
    }
}


/* =========================================================
   LOGIN FORM
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const message =
    document.getElementById("message");

const rememberMe =
    document.getElementById("rememberMe");


/* =========================================================
   SHOW / HIDE PASSWORD
   ========================================================= */

const showPassword =
    document.getElementById("showPassword");

if (showPassword && passwordInput) {

    showPassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            showPassword.textContent = "HIDE";

        } else {

            passwordInput.type = "password";

            showPassword.textContent = "SHOW";
        }

    });
}


/* =========================================================
   LOGIN MESSAGE
   ========================================================= */

function showMessage(text, type = "error") {

    if (!message) return;

    message.textContent = text;

    message.className = "message " + type;

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log("LOGIN BUTTON WORKING");


            /* -----------------------------------------
               GET INPUT VALUES
               ----------------------------------------- */

            const email =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            console.log("Email:", email);


            /* -----------------------------------------
               VALIDATION
               ----------------------------------------- */

            if (!email) {

                showMessage(
                    "Please enter your email.",
                    "error"
                );

                return;
            }


            if (!password) {

                showMessage(
                    "Please enter your password.",
                    "error"
                );

                return;
            }


            /* -----------------------------------------
               BUTTON LOADING
               ----------------------------------------- */

            if (loginButton) {

                loginButton.disabled = true;

                loginButton.dataset.originalText =
                    loginButton.textContent;

                loginButton.textContent =
                    "LOGGING IN...";
            }


            showMessage(
                "Connecting to AuralGuard...",
                "loading"
            );


            /* -----------------------------------------
               BACKEND REQUEST
               ----------------------------------------- */

            try {

                const response =
                    await fetch(
                        API_BASE_URL + "/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials: "include",

                            body: JSON.stringify({

                                email: email,

                                password: password

                            })
                        }
                    );


                console.log(
                    "Login status:",
                    response.status
                );


                const data =
                    await response.json();


                console.log(
                    "Login response:",
                    data
                );


                /* -----------------------------------------
                   LOGIN FAILED
                   ----------------------------------------- */

                if (!response.ok) {

                    showMessage(
                        data.detail ||
                        "Invalid email or password.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------------------
                   LOGIN SUCCESS
                   ----------------------------------------- */

                showMessage(
                    "Login successful!",
                    "success"
                );


                console.log(
                    "Logged in user:",
                    data
                );


                /*
                   TEMPORARY REDIRECT

                   Change dashboard.html later
                   when your dashboard is ready.
                */

                setTimeout(function () {

                    window.location.href =
                        "dashboard.html";

                }, 800);


            } catch (error) {

                console.error(
                    "LOGIN ERROR:",
                    error
                );


                showMessage(
                    "Cannot connect to AuralGuard backend.",
                    "error"
                );

            } finally {

                /* -----------------------------------------
                   RESTORE BUTTON
                   ----------------------------------------- */

                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        loginButton.dataset.originalText ||
                        "LOGIN";
                }

            }

        }
    );
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

const forgotPassword =
    document.getElementById("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            alert(
                "Password reset will be available soon."
            );

        }
    );
}


/* =========================================================
   REMEMBER ME
   ========================================================= */

if (rememberMe) {

    rememberMe.addEventListener(
        "change",
        function () {

            console.log(
                "Remember me:",
                rememberMe.checked
            );

        }
    );
}


/* =========================================================
   PAGE LOADED
   ========================================================= */

console.log(
    "AURALGUARD LOGIN JS LOADED"
);

console.log(
    "Backend:",
    API_BASE_URL
);
