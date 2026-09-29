/* ========================================
   AURALGUARD INTERACTIVE EFFECTS
======================================== */


/* ========================================
   PARTICLE SYSTEM
======================================== */

const particleContainer =
    document.getElementById("particles");

const particleCount = 45;

for (let i = 0; i < particleCount; i++) {

    const particle =
        document.createElement("span");

    particle.classList.add("particle");

    particle.style.left =
        Math.random() * 100 + "%";

    particle.style.animationDuration =
        (8 + Math.random() * 15) + "s";

    particle.style.animationDelay =
        (Math.random() * 10) + "s";

    particle.style.transform =
        `scale(${0.5 + Math.random()})`;

    particleContainer.appendChild(particle);
}


/* ========================================
   SCROLL REVEAL
======================================== */

const revealElements =
    document.querySelectorAll(
        ".problem-card, " +
        ".pipeline-card, " +
        ".tech-item, " +
        ".workflow-step"
    );


const observer =
    new IntersectionObserver(
        (entries) => {

            entries.forEach(
                (entry) => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add("show");

                    }

                }
            );

        },
        {
            threshold: 0.15
        }
    );


revealElements.forEach(
    (element, index) => {

        element.classList.add("reveal");

        element.style.transitionDelay =
            `${index * 80}ms`;

        observer.observe(element);

    }
);


/* ========================================
   ACTIVE NAVIGATION
======================================== */

const navLinks =
    document.querySelectorAll(
        "nav a"
    );

const sections =
    document.querySelectorAll(
        "section[id]"
    );


window.addEventListener(
    "scroll",
    () => {

        let currentSection = "";

        sections.forEach(
            (section) => {

                const sectionTop =
                    section.offsetTop - 180;

                const sectionHeight =
                    section.offsetHeight;

                if (
                    window.scrollY >= sectionTop &&
                    window.scrollY <
                    sectionTop + sectionHeight
                ) {

                    currentSection =
                        section.getAttribute(
                            "id"
                        );

                }

            }
        );


        navLinks.forEach(
            (link) => {

                link.classList.remove(
                    "active"
                );

                if (
                    link.getAttribute("href") ===
                    "#" + currentSection
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


/* ========================================
   HERO CARD 3D EFFECT
======================================== */

const visualCard =
    document.querySelector(
        ".visual-card"
    );

const heroVisual =
    document.querySelector(
        ".hero-visual"
    );


if (
    visualCard &&
    heroVisual
) {

    heroVisual.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                heroVisual.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const centerX =
                rect.width / 2;

            const centerY =
                rect.height / 2;

            const rotateX =
                ((y - centerY) / centerY) * -4;

            const rotateY =
                ((x - centerX) / centerX) * 4;

            visualCard.style.transform =
                `
                perspective(900px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-5px)
                `;

        }
    );


    heroVisual.addEventListener(
        "mouseleave",
        () => {

            visualCard.style.transform = "";

        }
    );

}


/* ========================================
   BUTTON RIPPLE
======================================== */

const buttons =
    document.querySelectorAll(
        ".primary-btn, " +
        ".secondary-btn, " +
        ".nav-login"
    );


buttons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            function (event) {

                const ripple =
                    document.createElement(
                        "span"
                    );

                ripple.style.position =
                    "absolute";

                ripple.style.borderRadius =
                    "50%";

                ripple.style.background =
                    "rgba(255,255,255,0.35)";

                ripple.style.width =
                    "10px";

                ripple.style.height =
                    "10px";

                ripple.style.left =
                    event.offsetX + "px";

                ripple.style.top =
                    event.offsetY + "px";

                ripple.style.transform =
                    "translate(-50%, -50%)";

                ripple.style.pointerEvents =
                    "none";

                ripple.style.animation =
                    "rippleAnimation 0.6s ease-out forwards";

                this.appendChild(ripple);


                setTimeout(
                    () => {

                        ripple.remove();

                    },
                    600
                );

            }
        );

    }
);


/* ========================================
   RIPPLE CSS
======================================== */

const rippleStyle =
    document.createElement("style");

rippleStyle.innerHTML = `

@keyframes rippleAnimation {

    from {

        width: 10px;
        height: 10px;

        opacity: 0.7;

    }

    to {

        width: 300px;
        height: 300px;

        opacity: 0;

    }

}

`;

document.head.appendChild(
    rippleStyle
);


/* ========================================
   AI CORE MOUSE GLOW
======================================== */

const aiCore =
    document.querySelector(
        ".ai-core"
    );


if (aiCore) {

    document.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                aiCore.getBoundingClientRect();

            const distanceX =
                event.clientX -
                (rect.left + rect.width / 2);

            const distanceY =
                event.clientY -
                (rect.top + rect.height / 2);

            const distance =
                Math.sqrt(
                    distanceX * distanceX +
                    distanceY * distanceY
                );


            if (distance < 300) {

                const intensity =
                    1 - distance / 300;

                aiCore.style.boxShadow =
                    `
                    0 0 ${30 + intensity * 30}px
                    rgba(
                        0,
                        210,
                        255,
                        ${0.35 + intensity * 0.3}
                    ),

                    0 0 ${70 + intensity * 50}px
                    rgba(
                        0,
                        130,
                        255,
                        ${0.15 + intensity * 0.2}
                    ),

                    inset 0 0 ${30 + intensity * 20}px
                    rgba(
                        0,
                        200,
                        255,
                        0.15
                    )
                    `;

            }

        }
    );

}


/* ========================================
   CARD LIGHT FOLLOW
======================================== */

const cards =
    document.querySelectorAll(
        ".problem-card, .pipeline-card"
    );


cards.forEach(
    (card) => {

        card.addEventListener(
            "mousemove",
            (event) => {

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX -
                    rect.left;

                const y =
                    event.clientY -
                    rect.top;

                card.style.background =
                    `
                    radial-gradient(
                        circle at ${x}px ${y}px,
                        rgba(0, 170, 255, 0.10),
                        rgba(10, 25, 45, 0.65) 45%
                    )
                    `;

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.background = "";

            }
        );

    }
);


/* ========================================
   WAVEFORM RANDOMIZATION
======================================== */

const waveBars =
    document.querySelectorAll(
        ".large-wave i"
    );


function randomizeWave() {

    waveBars.forEach(
        (bar) => {

            const height =
                20 + Math.random() * 90;

            bar.style.height =
                height + "px";

        }
    );

}


setInterval(
    randomizeWave,
    1400
);


/* ========================================
   NAVBAR SCROLL EFFECT
======================================== */

const navbar =
    document.querySelector(
        ".navbar"
    );


window.addEventListener(
    "scroll",
    () => {

        if (window.scrollY > 40) {

            navbar.style.background =
                "rgba(3, 9, 20, 0.98)";

            navbar.style.boxShadow =
                "0 8px 30px rgba(0, 0, 0, 0.25)";

        } else {

            navbar.style.background =
                "rgba(3, 9, 20, 0.94)";

            navbar.style.boxShadow =
                "none";

        }

    }
);


/* ========================================
   PAGE LOAD
======================================== */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "page-loaded"
        );

    }
);