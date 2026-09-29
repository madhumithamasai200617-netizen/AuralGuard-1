/* ============================================================
   AURALGUARD AI CHATBOT
============================================================ */

const API_URL = "https://aural-ze9j.onrender.com";


document.addEventListener("DOMContentLoaded", () => {

    const chatMessages =
        document.getElementById("chatMessages");

    const chatInput =
        document.getElementById("chatInput");

    // Supports both IDs
    const sendButton =
        document.getElementById("sendChatButton") ||
        document.getElementById("sendButton");

    const quickButtons =
        document.querySelectorAll(".quick-question");


    let currentAnalysis = null;


    /* ============================================================
       LOAD LATEST ANALYSIS
    ============================================================ */

    try {

        const storedAnalysis =
            localStorage.getItem(
                "auralguardAnalysis"
            );


        if (storedAnalysis) {

            currentAnalysis =
                JSON.parse(
                    storedAnalysis
                );


            console.log(
                "AuralGuard analysis loaded:",
                currentAnalysis
            );

        }

    } catch (error) {

        console.error(
            "Could not load analysis:",
            error
        );

    }


    /* ============================================================
       SEND MESSAGE
    ============================================================ */

    async function sendMessage() {

        if (!chatInput) {
            return;
        }


        const question =
            chatInput.value.trim();


        if (!question) {
            return;
        }


        /* --------------------------------------------------------
           USER MESSAGE
        -------------------------------------------------------- */

        addMessage(
            question,
            "user"
        );


        chatInput.value = "";


        /* --------------------------------------------------------
           TYPING INDICATOR
        -------------------------------------------------------- */

        const typingMessage =
            addTypingMessage();


        if (sendButton) {
            sendButton.disabled = true;
        }


        try {

            console.log(
                "Sending question to AuralGuard AI..."
            );


            /*
                Tell the AI explicitly to keep the answer short.
            */

            const shortQuestion =
                `${question}

Please answer briefly and clearly.
Use a maximum of 3 short points or 2-4 short sentences.
Do not give a long explanation unless specifically requested.`;


            const response =
                await fetch(
                    `${API_URL}/chat`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        credentials:
                            "include",

                        body:
                            JSON.stringify({

                                message:
                                    shortQuestion,

                                analysis:
                                    currentAnalysis

                            })

                    }
                );


            console.log(
                "HTTP Status:",
                response.status
            );


            /* ----------------------------------------------------
               CHECK HTTP ERROR
            ---------------------------------------------------- */

            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            /* ----------------------------------------------------
               READ JSON
            ---------------------------------------------------- */

            const data =
                await response.json();


            console.log(
                "AI RESPONSE:",
                data
            );


            removeTypingMessage(
                typingMessage
            );


            /* ====================================================
               AI SUCCESS
            ==================================================== */

            if (
                data &&
                data.status === "success" &&
                data.reply
            ) {

                addMessage(
                    data.reply,
                    "bot"
                );

            }


            /* ====================================================
               AI ERROR
            ==================================================== */

            else {

                addMessage(
                    data?.reply ||
                    "AuralGuard AI could not generate a response.",
                    "bot"
                );

            }

        }

        catch (error) {

            console.error(
                "Chat error:",
                error
            );


            removeTypingMessage(
                typingMessage
            );


            addMessage(
                "Unable to connect to the AuralGuard AI server.",
                "bot"
            );

        }

        finally {

            if (sendButton) {

                sendButton.disabled =
                    false;

            }


            chatInput.focus();

        }

    }


    /* ============================================================
       ADD MESSAGE
    ============================================================ */

    function addMessage(
        message,
        sender
    ) {

        if (!chatMessages) {
            return;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            `message ${sender}-message`;


        /* --------------------------------------------------------
           AVATAR
        -------------------------------------------------------- */

        const avatar =
            document.createElement(
                "div"
            );


        avatar.className =
            "message-avatar";


        avatar.textContent =
            sender === "bot"
                ? "AI"
                : "YOU";


        /* --------------------------------------------------------
           MESSAGE BUBBLE
        -------------------------------------------------------- */

        const bubble =
            document.createElement(
                "div"
            );


        bubble.className =
            "message-bubble";


        bubble.innerHTML =
            formatMessage(
                String(
                    message || ""
                )
            );


        wrapper.appendChild(
            avatar
        );


        wrapper.appendChild(
            bubble
        );


        chatMessages.appendChild(
            wrapper
        );


        scrollToBottom();

    }


    /* ============================================================
       FORMAT AI RESPONSE
    ============================================================ */

    function formatMessage(text) {

        if (!text) {

            return "No response received.";

        }


        return text

            /* Bold markdown */
            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )

            /* Bullet points */
            .replace(
                /^\s*[-*]\s+/gm,
                "• "
            )

            /* Numbered lists */
            .replace(
                /^\s*(\d+)\.\s+/gm,
                "$1. "
            )

            /* Line breaks */
            .replace(
                /\n/g,
                "<br>"
            );

    }


    /* ============================================================
       TYPING INDICATOR
    ============================================================ */

    function addTypingMessage() {

        if (!chatMessages) {
            return null;
        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "message bot-message typing-wrapper";


        wrapper.innerHTML = `

            <div class="message-avatar">
                AI
            </div>

            <div class="message-bubble typing-bubble">

                <span></span>
                <span></span>
                <span></span>

            </div>

        `;


        chatMessages.appendChild(
            wrapper
        );


        scrollToBottom();


        return wrapper;

    }


    /* ============================================================
       REMOVE TYPING INDICATOR
    ============================================================ */

    function removeTypingMessage(
        element
    ) {

        if (element) {

            element.remove();

        }

    }


    /* ============================================================
       QUICK QUESTIONS
    ============================================================ */

    quickButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const question =
                        button.dataset.question ||
                        button.textContent.trim();


                    if (!chatInput) {
                        return;
                    }


                    chatInput.value =
                        question;


                    sendMessage();

                }
            );

        }
    );


    /* ============================================================
       SEND BUTTON
    ============================================================ */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );

    }


    /* ============================================================
       ENTER KEY
    ============================================================ */

    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    /* ============================================================
       SCROLL
    ============================================================ */

    function scrollToBottom() {

        if (!chatMessages) {
            return;
        }


        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }


    console.log(
        "AuralGuard AI Chatbot initialized."
    );

});
