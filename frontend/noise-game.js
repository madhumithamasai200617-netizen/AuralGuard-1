/* =========================================================
   AURALGUARD - NOISE RUNNER
   noise.js
========================================================= */

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
    console.error("gameCanvas not found");
    throw new Error("gameCanvas not found");
}

const ctx = canvas.getContext("2d");

/* =========================================================
   DOM
========================================================= */

const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startButton = document.getElementById("startButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");

const exitGame = document.getElementById("exitGame");
const backDashboard = document.getElementById("backDashboard");

const exposureFill = document.getElementById("exposureFill");
const exposureValue = document.getElementById("exposureValue");
const noiseHitsValue = document.getElementById("noiseHitsValue");
const dbValue = document.getElementById("dbValue");
const scoreValue = document.getElementById("scoreValue");
const distanceValue = document.getElementById("distanceValue");
const shieldValue = document.getElementById("shieldValue");

const levelMessage = document.getElementById("levelMessage");
const levelNumber = document.getElementById("levelNumber");
const levelTitle = document.getElementById("levelTitle");

const bossWarning = document.getElementById("bossWarning");

const finalDistance = document.getElementById("finalDistance");
const finalScore = document.getElementById("finalScore");
const finalEvents = document.getElementById("finalEvents");
const finalQuiet = document.getElementById("finalQuiet");
const finalExposure = document.getElementById("finalExposure");
const finalShields = document.getElementById("finalShields");
const impactText = document.getElementById("impactText");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");
const duckBtn = document.getElementById("duckBtn");

/* =========================================================
   CANVAS
========================================================= */

let W = window.innerWidth;
let H = window.innerHeight;
let dpr = window.devicePixelRatio || 1;

function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* =========================================================
   GAME VARIABLES
========================================================= */

let gameRunning = false;
let gamePaused = false;

let score = 0;
let distance = 0;

let exposure = 15;
let maxExposure = 15;

let noiseHits = 0;
let noiseEvents = 0;

let quietZoneCount = 0;
let shieldUses = 0;

let gameTime = 0;

let level = 1;
let speed = 3.8;

const MAX_NOISE_HITS = 3;

/* =========================================================
   PLAYER
========================================================= */

const player = {
    lane: 1,
    targetLane: 1,

    x: 0,
    y: 0,

    velocityY: 0,

    jumping: false,
    ducking: false,

    shield: false,
    shieldTimer: 0,

    animation: 0
};

function groundY() {
    return H - 145;
}

/* =========================================================
   ROAD
========================================================= */

function roadWidth() {
    return Math.min(W * 0.72, 850);
}

function roadLeft() {
    return (W - roadWidth()) / 2;
}

function laneWidth() {
    return roadWidth() / 3;
}

function laneX(lane) {
    return (
        roadLeft() +
        laneWidth() * lane +
        laneWidth() / 2
    );
}

/* =========================================================
   OBJECT ARRAYS
========================================================= */

let obstacles = [];
let shields = [];
let quietZones = [];
let waves = [];
let particles = [];

/* =========================================================
   TIMERS
========================================================= */

let obstacleTimer = 0;
let shieldTimer = 0;
let quietTimer = 0;

/* =========================================================
   LEVEL DATA
========================================================= */

const levels = [
    {
        distance: 0,
        name: "CITY STREETS",
        speed: 3.8
    },
    {
        distance: 400,
        name: "TRAFFIC DISTRICT",
        speed: 4.2
    },
    {
        distance: 900,
        name: "CONSTRUCTION ZONE",
        speed: 4.6
    },
    {
        distance: 1500,
        name: "INDUSTRIAL AREA",
        speed: 5.1
    },
    {
        distance: 2200,
        name: "NOISE STORM",
        speed: 5.6
    }
];

/* =========================================================
   NOISE TYPES
========================================================= */

const noiseTypes = [
    {
        name: "HORN",
        emoji: "📢",
        db: 88,
        color: "#ffd34d"
    },
    {
        name: "TRAFFIC",
        emoji: "🚗",
        db: 84,
        color: "#49a8ff"
    },
    {
        name: "CONSTRUCTION",
        emoji: "🚧",
        db: 96,
        color: "#ff9d45"
    },
    {
        name: "MACHINERY",
        emoji: "⚙",
        db: 102,
        color: "#d66cff"
    },
    {
        name: "MUSIC",
        emoji: "🔊",
        db: 92,
        color: "#ff5798"
    }
];

/* =========================================================
   RESET
========================================================= */

function resetGame() {

    gameRunning = false;
    gamePaused = false;

    score = 0;
    distance = 0;

    exposure = 15;
    maxExposure = 15;

    noiseHits = 0;
    noiseEvents = 0;

    quietZoneCount = 0;
    shieldUses = 0;

    gameTime = 0;

    level = 1;
    speed = 3.8;

    obstacleTimer = 0;
    shieldTimer = 0;
    quietTimer = 0;

    obstacles = [];
    shields = [];
    quietZones = [];
    waves = [];
    particles = [];

    player.lane = 1;
    player.targetLane = 1;

    player.x = laneX(1);
    player.y = groundY();

    player.velocityY = 0;
    player.jumping = false;
    player.ducking = false;

    player.shield = false;
    player.shieldTimer = 0;

    updateHUD();
}

/* =========================================================
   START
========================================================= */

function startGame() {

    resetGame();

    gameRunning = true;

    if (startScreen) {
        startScreen.classList.add("hidden");
    }

    if (pauseScreen) {
        pauseScreen.classList.add("hidden");
    }

    if (gameOverScreen) {
        gameOverScreen.classList.add("hidden");
    }

    if (bossWarning) {
        bossWarning.classList.add("hidden");
    }

    showLevel();

    requestAnimationFrame(gameLoop);
}

/* =========================================================
   PAUSE
========================================================= */

function togglePause() {

    if (!gameRunning) {
        return;
    }

    gamePaused = !gamePaused;

    if (pauseScreen) {
        pauseScreen.classList.toggle(
            "hidden",
            !gamePaused
        );
    }
}

/* =========================================================
   PLAYER CONTROLS
========================================================= */

function moveLeft() {

    if (!gameRunning || gamePaused) {
        return;
    }

    if (player.targetLane > 0) {
        player.targetLane--;
    }
}

function moveRight() {

    if (!gameRunning || gamePaused) {
        return;
    }

    if (player.targetLane < 2) {
        player.targetLane++;
    }
}

function jump() {

    if (
        !gameRunning ||
        gamePaused ||
        player.jumping
    ) {
        return;
    }

    player.jumping = true;
    player.velocityY = -14;
}

function duckStart() {

    if (!gameRunning || gamePaused) {
        return;
    }

    player.ducking = true;
}

function duckEnd() {
    player.ducking = false;
}

/* =========================================================
   UPDATE PLAYER
========================================================= */

function updatePlayer() {

    const targetX = laneX(
        player.targetLane
    );

    player.x +=
        (targetX - player.x) * 0.16;

    if (player.jumping) {

        player.y += player.velocityY;

        player.velocityY += 0.68;

        if (player.y >= groundY()) {

            player.y = groundY();

            player.velocityY = 0;

            player.jumping = false;
        }

    } else {

        player.y = groundY();
    }

    player.animation += 0.2;
}

/* =========================================================
   SPAWN OBSTACLE
========================================================= */

function spawnObstacle() {

    const type =
        noiseTypes[
            Math.floor(
                Math.random() *
                noiseTypes.length
            )
        ];

    const lane =
        Math.floor(
            Math.random() * 3
        );

    obstacles.push({
        lane: lane,
        y: -70,
        type: type,
        hit: false,
        passed: false,
        pulse: 0
    });
}

/* =========================================================
   COLLISION
========================================================= */

function obstacleCollision(obstacle) {

    const x = laneX(
        obstacle.lane
    );

    const dx =
        Math.abs(
            player.x - x
        );

    const dy =
        Math.abs(
            player.y - obstacle.y
        );

    /*
       Jump high enough = avoid obstacle
    */

    if (
        player.jumping &&
        player.y < groundY() - 60
    ) {
        return false;
    }

    return (
        dx < 42 &&
        dy < 58
    );
}

/* =========================================================
   UPDATE OBSTACLES
========================================================= */

function updateObstacles() {

    for (const obstacle of obstacles) {

        obstacle.y += speed * 1.2;

        obstacle.pulse += 0.06;

        /*
           Collision
        */

        if (
            !obstacle.hit &&
            obstacleCollision(obstacle)
        ) {

            obstacle.hit = true;

            /*
               SHIELD PROTECTS PLAYER
            */

            if (player.shield) {

                score += 100;

                createBurst(
                    laneX(obstacle.lane),
                    obstacle.y,
                    "#00d9ff"
                );

            } else {

                noiseHits++;
                noiseEvents++;

                exposure +=
                    obstacle.type.db >= 100
                        ? 15
                        : 10;

                exposure =
                    Math.min(
                        100,
                        exposure
                    );

                maxExposure =
                    Math.max(
                        maxExposure,
                        exposure
                    );

                score =
                    Math.max(
                        0,
                        score - 75
                    );

                createBurst(
                    laneX(obstacle.lane),
                    obstacle.y,
                    "#ff4268"
                );

                waves.push({
                    x: laneX(obstacle.lane),
                    y: obstacle.y,
                    radius: 15,
                    alpha: 0.7
                });

                /*
                   THIRD HIT = GAME OVER
                */

                if (
                    noiseHits >=
                    MAX_NOISE_HITS
                ) {

                    updateHUD();

                    endGame();

                    return;
                }
            }
        }

        /*
           Avoided
        */

        if (
            !obstacle.passed &&
            obstacle.y >
            groundY() + 80
        ) {

            obstacle.passed = true;

            score += 35;
        }
    }

    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.y <
                H + 120
        );
}

/* =========================================================
   DRAW OBSTACLE
========================================================= */

function drawObstacle(obstacle) {

    const x =
        laneX(obstacle.lane);

    const y =
        obstacle.y;

    const progress =
        Math.max(
            0,
            Math.min(
                1,
                (y + 70) /
                (H + 70)
            )
        );

    const scale =
        0.65 +
        progress * 0.55;

    ctx.save();

    ctx.translate(x, y);

    ctx.scale(
        scale,
        scale
    );

    /*
       Glow
    */

    ctx.beginPath();

    ctx.arc(
        0,
        -20,
        35 +
        Math.sin(
            obstacle.pulse
        ) * 5,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        obstacle.type.color;

    ctx.globalAlpha = 0.2;

    ctx.lineWidth = 2;

    ctx.stroke();

    ctx.globalAlpha = 1;

    /*
       Box
    */

    ctx.fillStyle =
        "rgba(4,11,19,.96)";

    ctx.beginPath();

    ctx.roundRect(
        -31,
        -51,
        62,
        61,
        10
    );

    ctx.fill();

    ctx.strokeStyle =
        obstacle.type.color;

    ctx.lineWidth = 1.5;

    ctx.stroke();

    /*
       Emoji
    */

    ctx.font = "27px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        obstacle.type.emoji,
        0,
        -22
    );

    /*
       Label
    */

    ctx.font = "7px Arial";

    ctx.fillStyle = "#d4e4eb";

    ctx.fillText(
        obstacle.type.name,
        0,
        1
    );

    ctx.restore();
}

/* =========================================================
   SHIELD
========================================================= */

function spawnShield() {

    shields.push({
        lane:
            Math.floor(
                Math.random() * 3
            ),
        y: -50,
        rotation: 0
    });
}

function updateShields() {

    for (const shield of shields) {

        shield.y += speed;

        shield.rotation += 0.03;

        const dx =
            Math.abs(
                player.x -
                laneX(shield.lane)
            );

        const dy =
            Math.abs(
                player.y -
                shield.y
            );

        if (
            dx < 45 &&
            dy < 65
        ) {

            player.shield = true;

            player.shieldTimer = 600;

            shieldUses++;

            score += 150;

            shield.collected = true;
        }
    }

    shields =
        shields.filter(
            shield =>
                shield.y <
                    H + 100 &&
                !shield.collected
        );
}

function drawShield(shield) {

    const x =
        laneX(shield.lane);

    const y =
        shield.y;

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(
        shield.rotation
    );

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        23,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,217,255,.12)";

    ctx.fill();

    ctx.strokeStyle =
        "#00d9ff";

    ctx.lineWidth = 2;

    ctx.shadowBlur = 18;

    ctx.shadowColor =
        "#00d9ff";

    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.font = "20px Arial";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(
        "🛡",
        0,
        0
    );

    ctx.restore();
}

function updatePlayerShield() {

    if (!player.shield) {

        shieldValue.textContent =
            "READY";

        return;
    }

    player.shieldTimer--;

    shieldValue.textContent =
        Math.ceil(
            player.shieldTimer / 60
        ) + "s";

    if (
        player.shieldTimer <= 0
    ) {

        player.shield = false;

        shieldValue.textContent =
            "READY";
    }
}

/* =========================================================
   QUIET ZONES
========================================================= */

function spawnQuietZone() {

    quietZones.push({
        lane:
            Math.floor(
                Math.random() * 3
            ),
        y: -80,
        pulse: 0
    });
}

function updateQuietZones() {

    for (const zone of quietZones) {

        zone.y += speed;

        zone.pulse += 0.05;

        const dx =
            Math.abs(
                player.x -
                laneX(zone.lane)
            );

        const dy =
            Math.abs(
                player.y -
                zone.y
            );

        if (
            !zone.collected &&
            dx < 50 &&
            dy < 65
        ) {

            zone.collected = true;

            quietZoneCount++;

            exposure =
                Math.max(
                    0,
                    exposure - 20
                );

            score += 250;

            createBurst(
                player.x,
                player.y,
                "#37e6a0"
            );

        }
    }

    quietZones =
        quietZones.filter(
            zone =>
                zone.y <
                    H + 100 &&
                !zone.collected
        );
}

function drawQuietZone(zone) {

    const x =
        laneX(zone.lane);

    const y =
        zone.y;

    ctx.save();

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        40 +
            Math.sin(
                zone.pulse
            ) * 7,
        25,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(55,230,160,.08)";

    ctx.fill();

    ctx.strokeStyle =
        "rgba(55,230,160,.55)";

    ctx.stroke();

    ctx.font =
        "22px Arial";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "🌳",
        x,
        y
    );

    ctx.font =
        "8px Arial";

    ctx.fillStyle =
        "#69f4b7";

    ctx.fillText(
        "QUIET ZONE",
        x,
        y + 32
    );

    ctx.restore();
}

/* =========================================================
   PARTICLES
========================================================= */

function createBurst(
    x,
    y,
    color
) {

    for (
        let i = 0;
        i < 20;
        i++
    ) {

        particles.push({
            x: x,
            y: y,
            vx:
                (Math.random() - 0.5) * 4,
            vy:
                (Math.random() - 0.5) * 4,
            life: 1,
            color: color
        });
    }
}

function updateParticles() {

    for (const particle of particles) {

        particle.x += particle.vx;

        particle.y += particle.vy;

        particle.life -= 0.025;
    }

    particles =
        particles.filter(
            p =>
                p.life > 0
        );
}

function drawParticles() {

    for (const particle of particles) {

        ctx.globalAlpha =
            particle.life;

        ctx.fillStyle =
            particle.color;

        ctx.fillRect(
            particle.x,
            particle.y,
            3,
            3
        );
    }

    ctx.globalAlpha = 1;
}

/* =========================================================
   WAVES
========================================================= */

function updateWaves() {

    for (const wave of waves) {

        wave.radius += 2;

        wave.alpha -= 0.015;
    }

    waves =
        waves.filter(
            wave =>
                wave.alpha > 0
        );
}

function drawWaves() {

    for (const wave of waves) {

        ctx.beginPath();

        ctx.arc(
            wave.x,
            wave.y,
            wave.radius,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            `rgba(
                255,
                66,
                104,
                ${wave.alpha}
            )`;

        ctx.lineWidth = 2;

        ctx.stroke();
    }
}

/* =========================================================
   BACKGROUND
========================================================= */

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    gradient.addColorStop(
        0,
        "#06111e"
    );

    gradient.addColorStop(
        0.6,
        "#0a1823"
    );

    gradient.addColorStop(
        1,
        "#03070c"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );

    /*
       Moon
    */

    ctx.beginPath();

    ctx.arc(
        W - 110,
        130,
        35,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(150,220,255,.08)";

    ctx.fill();

    /*
       Skyline
    */

    const base =
        H - 185;

    for (
        let i = 0;
        i < 16;
        i++
    ) {

        const width = 70;

        const height =
            100 +
            ((i * 47) % 150);

        const x =
            i * 100 -
            ((gameTime * speed * 0.08) % 100);

        ctx.fillStyle =
            i % 2 === 0
                ? "#091824"
                : "#0b1d29";

        ctx.fillRect(
            x,
            base - height,
            width,
            height
        );

        /*
           Windows
        */

        for (
            let row = 0;
            row < 4;
            row++
        ) {

            for (
                let col = 0;
                col < 2;
                col++
            ) {

                ctx.fillStyle =
                    "rgba(80,180,210,.12)";

                ctx.fillRect(
                    x +
                        15 +
                        col * 27,
                    base -
                        height +
                        20 +
                        row * 30,
                    7,
                    9
                );
            }
        }
    }
}

/* =========================================================
   ROAD
========================================================= */

function drawRoad() {

    const width =
        roadWidth();

    const left =
        roadLeft();

    const top =
        H - 185;

    /*
       Sidewalk
    */

    ctx.fillStyle =
        "#101a22";

    ctx.fillRect(
        left - 35,
        top,
        width + 70,
        185
    );

    /*
       Road
    */

    ctx.fillStyle =
        "#05090e";

    ctx.fillRect(
        left,
        top,
        width,
        185
    );

    /*
       Border
    */

    ctx.strokeStyle =
        "rgba(0,217,255,.1)";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        left,
        top,
        width,
        185
    );

    /*
       Lane lines
    */

    ctx.setLineDash([
        22,
        25
    ]);

    ctx.lineDashOffset =
        -(gameTime * speed);

    ctx.strokeStyle =
        "rgba(255,255,255,.13)";

    for (
        let i = 1;
        i < 3;
        i++
    ) {

        const x =
            left +
            laneWidth() * i;

        ctx.beginPath();

        ctx.moveTo(
            x,
            top
        );

        ctx.lineTo(
            x,
            H
        );

        ctx.stroke();
    }

    ctx.setLineDash([]);
}

/* =========================================================
   PLAYER DRAW
========================================================= */

function drawPlayer() {

    const x =
        player.x;

    const y =
        player.y;

    /*
       Shield
    */

    if (player.shield) {

        ctx.beginPath();

        ctx.arc(
            x,
            y - 30,
            46,
            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(0,217,255,.8)";

        ctx.lineWidth = 2;

        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#00d9ff";

        ctx.stroke();

        ctx.shadowBlur = 0;
    }

    /*
       Shadow
    */

    ctx.beginPath();

    ctx.ellipse(
        x,
        groundY() + 5,
        24,
        6,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,.45)";

    ctx.fill();

    /*
       Body
    */

    const height =
        player.ducking
            ? 38
            : 60;

    ctx.fillStyle =
        "#00d9ff";

    ctx.beginPath();

    ctx.roundRect(
        x - 20,
        y - height,
        40,
        height,
        10
    );

    ctx.fill();

    /*
       Head
    */

    if (!player.ducking) {

        ctx.beginPath();

        ctx.arc(
            x,
            y - height - 10,
            13,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#e5fbff";

        ctx.fill();

        /*
           Visor
        */

        ctx.fillStyle =
            "#06141e";

        ctx.beginPath();

        ctx.roundRect(
            x - 10,
            y - height - 14,
            20,
            7,
            4
        );

        ctx.fill();
    }

    /*
       Legs
    */

    if (
        !player.jumping &&
        !player.ducking
    ) {

        const leg =
            Math.sin(
                player.animation
            ) * 5;

        ctx.strokeStyle =
            "#9aeeff";

        ctx.lineWidth = 6;

        ctx.lineCap =
            "round";

        ctx.beginPath();

        ctx.moveTo(
            x - 8,
            y
        );

        ctx.lineTo(
            x - 12 - leg,
            y + 15
        );

        ctx.moveTo(
            x + 8,
            y
        );

        ctx.lineTo(
            x + 12 + leg,
            y + 15
        );

        ctx.stroke();
    }
}

/* =========================================================
   LEVEL
========================================================= */

function updateLevel() {

    let newLevel = 1;

    for (
        let i = 0;
        i < levels.length;
        i++
    ) {

        if (
            distance >=
            levels[i].distance
        ) {

            newLevel = i + 1;
        }
    }

    if (
        newLevel !== level
    ) {

        level = newLevel;

        showLevel();

        if (
            level === 5 &&
            bossWarning
        ) {

            bossWarning.classList.remove(
                "hidden"
            );
        }
    }

    speed =
        levels[level - 1].speed;
}

/* =========================================================
   LEVEL MESSAGE
========================================================= */

function showLevel() {

    if (
        !levelMessage ||
        !levelNumber ||
        !levelTitle
    ) {
        return;
    }

    levelNumber.textContent =
        "LEVEL " +
        String(level).padStart(
            2,
            "0"
        );

    levelTitle.textContent =
        levels[
            level - 1
        ].name;

    levelMessage.classList.remove(
        "hidden"
    );

    setTimeout(() => {

        if (levelMessage) {
            levelMessage.classList.add(
                "hidden"
            );
        }

    }, 1500);
}

/* =========================================================
   SPAWN LOGIC
========================================================= */

function updateSpawning() {

    obstacleTimer++;
    shieldTimer++;
    quietTimer++;

    const obstacleDelay =
        Math.max(
            75,
            120 - level * 8
        );

    if (
        obstacleTimer >=
        obstacleDelay
    ) {

        spawnObstacle();

        obstacleTimer = 0;
    }

    /*
       Shield
    */

    if (
        shieldTimer >= 700
    ) {

        spawnShield();

        shieldTimer = 0;
    }

    /*
       Quiet zone
    */

    if (
        quietTimer >= 850
    ) {

        spawnQuietZone();

        quietTimer = 0;
    }
}

/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    if (exposureValue) {

        exposureValue.textContent =
            Math.round(
                exposure
            ) + "%";
    }

    if (exposureFill) {

        exposureFill.style.width =
            exposure + "%";

        if (exposure >= 75) {

            exposureFill.style.background =
                "#ff4268";

        } else if (
            exposure >= 50
        ) {

            exposureFill.style.background =
                "#ffd34d";

        } else {

            exposureFill.style.background =
                "#37e6a0";
        }
    }

    if (noiseHitsValue) {

        noiseHitsValue.textContent =
            noiseHits +
            " / " +
            MAX_NOISE_HITS;

        if (noiseHits === 0) {

            noiseHitsValue.style.color =
                "#37e6a0";

        } else if (
            noiseHits === 1
        ) {

            noiseHitsValue.style.color =
                "#ffd34d";

        } else {

            noiseHitsValue.style.color =
                "#ff4268";
        }
    }

    if (dbValue) {

        const simulatedDb =
            Math.round(
                45 +
                exposure * 0.5
            );

        dbValue.textContent =
            simulatedDb +
            " dB*";
    }

    if (scoreValue) {

        scoreValue.textContent =
            String(
                Math.floor(score)
            ).padStart(
                6,
                "0"
            );
    }

    if (distanceValue) {

        distanceValue.textContent =
            Math.floor(distance) +
            " m";
    }

    if (shieldValue) {

        if (!player.shield) {

            shieldValue.textContent =
                "READY";

        } else {

            shieldValue.textContent =
                Math.ceil(
                    player.shieldTimer / 60
                ) + "s";
        }
    }
}

/* =========================================================
   UPDATE
========================================================= */

function update() {

    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }

    gameTime++;

    distance +=
        speed * 0.07;

    score +=
        speed * 0.02;

    updatePlayer();

    updateSpawning();

    updateObstacles();

    updateShields();

    updatePlayerShield();

    updateQuietZones();

    updateWaves();

    updateParticles();

    updateLevel();

    /*
       Small natural exposure increase
    */

    exposure += 0.006;

    exposure =
        Math.min(
            100,
            exposure
        );

    maxExposure =
        Math.max(
            maxExposure,
            exposure
        );

    updateHUD();
}

/* =========================================================
   DRAW
========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    drawBackground();

    drawRoad();

    for (
        const zone of quietZones
    ) {
        drawQuietZone(zone);
    }

    for (
        const shield of shields
    ) {
        drawShield(shield);
    }

    for (
        const obstacle of obstacles
    ) {
        drawObstacle(obstacle);
    }

    drawWaves();

    drawParticles();

    drawPlayer();
}

/* =========================================================
   GAME LOOP
========================================================= */

function gameLoop() {

    update();

    draw();

    if (gameRunning) {

        requestAnimationFrame(
            gameLoop
        );
    }
}

/* =========================================================
   GAME OVER
========================================================= */

function endGame() {

    gameRunning = false;

    gamePaused = false;

    if (finalDistance) {

        finalDistance.textContent =
            Math.floor(distance) +
            " m";
    }

    if (finalScore) {

        finalScore.textContent =
            Math.floor(score);
    }

    if (finalEvents) {

        finalEvents.textContent =
            noiseEvents;
    }

    if (finalQuiet) {

        finalQuiet.textContent =
            quietZoneCount;
    }

    if (finalExposure) {

        finalExposure.textContent =
            Math.round(
                maxExposure
            ) + "%";
    }

    if (finalShields) {

        finalShields.textContent =
            shieldUses;
    }

    if (impactText) {

        impactText.textContent =
            "Three noise impacts were detected. The simulation demonstrates how repeated exposure to loud noise can increase cumulative noise exposure.";
    }

    if (gameOverScreen) {

        gameOverScreen.classList.remove(
            "hidden"
        );
    }
}

/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();

            moveLeft();
        }

        else if (
            event.key === "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            event.preventDefault();

            moveRight();
        }

        else if (
            event.key === "ArrowUp" ||
            event.code === "Space"
        ) {

            event.preventDefault();

            jump();
        }

        else if (
            event.key === "ArrowDown" ||
            event.key.toLowerCase() === "s"
        ) {

            event.preventDefault();

            duckStart();
        }

        else if (
            event.key.toLowerCase() === "p"
        ) {

            togglePause();
        }
    }
);

document.addEventListener(
    "keyup",
    function (event) {

        if (
            event.key === "ArrowDown" ||
            event.key.toLowerCase() === "s"
        ) {

            duckEnd();
        }
    }
);

/* =========================================================
   BUTTONS
========================================================= */

if (startButton) {
    startButton.addEventListener(
        "click",
        startGame
    );
}

if (resumeButton) {
    resumeButton.addEventListener(
        "click",
        togglePause
    );
}

if (restartButton) {
    restartButton.addEventListener(
        "click",
        startGame
    );
}

if (exitGame) {
    exitGame.addEventListener(
        "click",
        function () {
            window.location.href =
                "dashboard.html";
        }
    );
}

if (backDashboard) {
    backDashboard.addEventListener(
        "click",
        function () {
            window.location.href =
                "dashboard.html";
        }
    );
}

/* =========================================================
   MOBILE BUTTONS
========================================================= */

if (leftBtn) {

    leftBtn.addEventListener(
        "click",
        moveLeft
    );
}

if (rightBtn) {

    rightBtn.addEventListener(
        "click",
        moveRight
    );
}

if (jumpBtn) {

    jumpBtn.addEventListener(
        "click",
        jump
    );
}

if (duckBtn) {

    duckBtn.addEventListener(
        "mousedown",
        duckStart
    );

    duckBtn.addEventListener(
        "mouseup",
        duckEnd
    );

    duckBtn.addEventListener(
        "mouseleave",
        duckEnd
    );

    duckBtn.addEventListener(
        "touchstart",
        function (event) {

            event.preventDefault();

            duckStart();
        }
    );

    duckBtn.addEventListener(
        "touchend",
        function (event) {

            event.preventDefault();

            duckEnd();
        }
    );
}

/* =========================================================
   INITIALIZE
========================================================= */

resetGame();

draw();

console.log(
    "AuralGuard Noise Runner loaded successfully."
);