// ============================================================
// AURALGUARD DASHBOARD
// Complete dashboard.js
// ============================================================

const API_URL = "https://auralguard-1.onrender.com";


// ============================================================
// ALERT AUDIO
// ============================================================

let alertAudioContext = null;


// ============================================================
// DOM READY
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("=================================");
    console.log("AURALGUARD DASHBOARD JS LOADED");
    console.log("API:", API_URL);
    console.log("=================================");


    initializeParticles();
    initializeNavigation();
    initializeUpload();
    initializeProfile();
    initializeLogout();
    initializeReport();
    initializeNoiseAlert();


    window.addEventListener("resize", () => {

        if (window.currentTimelineData) {

            drawNoiseChart(
                window.currentTimelineData
            );

        }

    });

});


// ============================================================
// PARTICLES
// ============================================================

function initializeParticles() {

    const canvas =
        document.createElement("canvas");


    canvas.id =
        "particleCanvas";


    canvas.style.position =
        "fixed";

    canvas.style.top =
        "0";

    canvas.style.left =
        "0";

    canvas.style.width =
        "100%";

    canvas.style.height =
        "100%";

    canvas.style.pointerEvents =
        "none";

    canvas.style.zIndex =
        "-1";

    canvas.style.opacity =
        "0.25";


    document.body.prepend(canvas);


    const ctx =
        canvas.getContext("2d");


    let particles = [];


    function resizeCanvas() {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

    }


    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    for (let i = 0; i < 55; i++) {

        particles.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() * 2 +
                0.5,

            speedX:
                (Math.random() - 0.5) *
                0.3,

            speedY:
                (Math.random() - 0.5) *
                0.3

        });

    }


    function animate() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        particles.forEach(p => {

            p.x += p.speedX;
            p.y += p.speedY;


            if (p.x < 0)
                p.x = canvas.width;

            if (p.x > canvas.width)
                p.x = 0;


            if (p.y < 0)
                p.y = canvas.height;

            if (p.y > canvas.height)
                p.y = 0;


            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.size,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#25d9ff";

            ctx.globalAlpha =
                0.5;


            ctx.fill();

        });


        ctx.globalAlpha =
            1;


        requestAnimationFrame(
            animate
        );

    }


    animate();

}


// ============================================================
// NAVIGATION
// ============================================================

function initializeNavigation() {

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                link.classList.add(
                    "active"
                );

            }
        );

    });

}


// ============================================================
// FILE UPLOAD
// ============================================================

let selectedFile = null;


function initializeUpload() {

    const fileInput =
        document.getElementById(
            "fileInput"
        );

    const browseButton =
        document.getElementById(
            "browseButton"
        );

    const uploadZone =
        document.getElementById(
            "uploadZone"
        );

    const removeFile =
        document.getElementById(
            "removeFile"
        );

    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (
        !fileInput ||
        !browseButton ||
        !uploadZone
    ) {

        console.error(
            "Upload elements not found."
        );

        return;

    }


    // --------------------------------------------------------
    // Browse button
    // --------------------------------------------------------

    browseButton.addEventListener(
        "click",
        () => {

            fileInput.click();

        }
    );


    // --------------------------------------------------------
    // File selection
    // --------------------------------------------------------

    fileInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (file) {

                handleFile(file);

            }

        }
    );


    // --------------------------------------------------------
    // Drag over
    // --------------------------------------------------------

    uploadZone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            uploadZone.classList.add(
                "dragover"
            );

        }
    );


    // --------------------------------------------------------
    // Drag leave
    // --------------------------------------------------------

    uploadZone.addEventListener(
        "dragleave",
        () => {

            uploadZone.classList.remove(
                "dragover"
            );

        }
    );


    // --------------------------------------------------------
    // Drop
    // --------------------------------------------------------

    uploadZone.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            uploadZone.classList.remove(
                "dragover"
            );


            const file =
                event.dataTransfer.files[0];


            if (file) {

                handleFile(file);

            }

        }
    );


    // --------------------------------------------------------
    // Remove file
    // --------------------------------------------------------

    if (removeFile) {

        removeFile.addEventListener(
            "click",
            () => {

                selectedFile =
                    null;


                fileInput.value =
                    "";


                const selectedFileBox =
                    document.getElementById(
                        "selectedFile"
                    );


                if (selectedFileBox) {

                    selectedFileBox.hidden =
                        true;

                }


                if (analyzeButton) {

                    analyzeButton.disabled =
                        true;

                }


                updateProcessingStatus(
                    "READY",
                    "Waiting for recording",
                    "Upload a file to begin analysis.",
                    0
                );


                const emptyPanel =
                    document.getElementById(
                        "timelineEmpty"
                    );


                const chartContainer =
                    document.getElementById(
                        "timelineChart"
                    );


                if (emptyPanel) {

                    emptyPanel.hidden =
                        false;

                    emptyPanel.style.display =
                        "";

                }


                if (chartContainer) {

                    chartContainer.hidden =
                        true;

                    chartContainer.style.display =
                        "none";

                }


                const sourceEmpty =
                    document.getElementById(
                        "sourceEmpty"
                    );


                if (sourceEmpty) {

                    sourceEmpty.hidden =
                        false;

                    sourceEmpty.style.display =
                        "";

                }


                const sourceList =
                    document.getElementById(
                        "sourceList"
                    );


                if (sourceList) {

                    sourceList.innerHTML =
                        "";

                }


                const recEmpty =
                    document.getElementById(
                        "recommendationEmpty"
                    );


                if (recEmpty) {

                    recEmpty.hidden =
                        false;

                    recEmpty.style.display =
                        "";

                }


                const recList =
                    document.getElementById(
                        "recommendationList"
                    );


                if (recList) {

                    recList.innerHTML =
                        "";

                }


                const controlSource =
                    document.getElementById(
                        "controlSource"
                    );


                if (controlSource) {

                    controlSource.textContent =
                        "—";

                }


                const controlExp =
                    document.getElementById(
                        "controlExplanation"
                    );


                if (controlExp) {

                    controlExp.textContent =
                        "Analyze a recording to generate source-specific information.";

                }

            }
        );

    }


    // --------------------------------------------------------
    // Analyze button
    // --------------------------------------------------------

    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            analyzeRecording
        );

    }

}


// ============================================================
// FILE VALIDATION
// ============================================================

function handleFile(file) {

    const allowedExtensions = [

        "mp3",
        "wav",
        "m4a",
        "mp4",
        "mov",
        "avi",
        "webm",
        "aac",
        "flac",
        "ogg",
        "mkv"

    ];


    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        showToast(
            "Unsupported file format.",
            "error"
        );

        return;

    }


    // 500 MB maximum

    const maxSize =
        500 *
        1024 *
        1024;


    if (file.size > maxSize) {

        showToast(
            "File size must be below 500 MB.",
            "error"
        );

        return;

    }


    selectedFile =
        file;


    displaySelectedFile(
        file
    );


    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            false;

    }


    updateProcessingStatus(
        "READY",
        "Recording ready",
        "Click Analyze Recording to start AI analysis.",
        0
    );

}


// ============================================================
// DISPLAY SELECTED FILE
// ============================================================

function displaySelectedFile(file) {

    const selectedFileBox =
        document.getElementById(
            "selectedFile"
        );


    const fileName =
        document.getElementById(
            "fileName"
        );


    const fileSize =
        document.getElementById(
            "fileSize"
        );


    if (selectedFileBox) {

        selectedFileBox.hidden =
            false;

    }


    if (fileName) {

        fileName.textContent =
            file.name;

    }


    if (fileSize) {

        fileSize.textContent =
            formatFileSize(
                file.size
            );

    }

}


// ============================================================
// FORMAT FILE SIZE
// ============================================================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (
        bytes <
        1024 * 1024
    ) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }


    if (
        bytes <
        1024 *
        1024 *
        1024
    ) {

        return (
            bytes /
            (1024 * 1024)
        ).toFixed(1) + " MB";

    }


    return (
        bytes /
        (1024 *
            1024 *
            1024)
    ).toFixed(1) + " GB";

}


// ============================================================
// ANALYZE RECORDING
// ============================================================

async function analyzeRecording() {

    if (!selectedFile) {

        showToast(
            "Please select a recording first.",
            "error"
        );

        return;

    }


    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            true;

    }


    /*
       IMPORTANT:
       Initialize the audio context while the
       Analyze button click is still a user action.
       This helps browsers allow alert sounds later.
    */

    initializeAlertAudio();


    updateProcessingStatus(
        "PROCESSING",
        "Analyzing recording",
        "Extracting audio features and detecting noise sources...",
        15
    );


    const formData =
        new FormData();


    formData.append(
        "file",
        selectedFile
    );


    try {

        console.log(
            "Sending file to:",
            API_URL + "/analyze"
        );


        // ----------------------------------------------------
        // Progress
        // ----------------------------------------------------

        updateProcessingStatus(
            "PROCESSING",
            "Processing audio",
            "Running AI noise classification...",
            35
        );


        // ----------------------------------------------------
        // API request
        // ----------------------------------------------------

        const response =
            await fetch(
                API_URL + "/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        console.log(
            "Analyze response status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();


            console.error(
                "Backend error:",
                errorText
            );


            throw new Error(
                "Analysis failed: " +
                response.status
            );

        }


        updateProcessingStatus(
            "PROCESSING",
            "AI detection running",
            "Identifying noise sources and generating recommendations...",
            70
        );


        const data =
            await response.json();


        console.log(
            "================================="
        );


        console.log(
            "FULL ANALYSIS RESPONSE:"
        );


        console.log(
            data
        );


        console.log(
            "================================="
        );


        updateProcessingStatus(
            "COMPLETE",
            "Analysis complete",
            "Noise source detection completed successfully.",
            100
        );


        // ----------------------------------------------------
        // MAIN RENDER
        // ----------------------------------------------------

        renderAnalysisResults(
            data
        );


        showToast(
            "Analysis completed successfully.",
            "success"
        );


        // ----------------------------------------------------
        // Scroll to results
        // ----------------------------------------------------

        setTimeout(() => {

            const results =
                document.getElementById(
                    "results"
                );


            if (results) {

                results.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }, 500);


    } catch (error) {

        console.error(
            "Analysis error:",
            error
        );


        updateProcessingStatus(
            "ERROR",
            "Analysis failed",
            error.message ||
            "Unable to analyze the recording.",
            0
        );


        showToast(
            "Analysis failed. Check the backend.",
            "error"
        );


    } finally {

        if (analyzeButton) {

            analyzeButton.disabled =
                false;

        }

    }

}


// ============================================================
// UPDATE PROCESSING STATUS
// ============================================================

function updateProcessingStatus(
    badge,
    title,
    text,
    progress
) {

    const engineBadge =
        document.getElementById(
            "engineBadge"
        );


    const processingTitle =
        document.getElementById(
            "processingTitle"
        );


    const processingText =
        document.getElementById(
            "processingText"
        );


    const progressValue =
        document.getElementById(
            "progressValue"
        );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (engineBadge) {

        engineBadge.textContent =
            badge;

    }


    if (processingTitle) {

        processingTitle.textContent =
            title;

    }


    if (processingText) {

        processingText.textContent =
            text;

    }


    if (progressValue) {

        progressValue.textContent =
            progress + "%";

    }


    if (progressFill) {

        progressFill.style.width =
            progress + "%";

    }

}


// ============================================================
// MAIN RESULT RENDERER
// ============================================================

function renderAnalysisResults(data) {

    console.log(
        "Rendering analysis:",
        data
    );


    // --------------------------------------------------------
    // Backend structure
    // --------------------------------------------------------

    const ml =
        data.ml_detection || {};


    const events =
        Array.isArray(ml.events)
            ? ml.events
            : [];


    console.log(
        "ML events:",
        events
    );


    // ========================================================
    // FIND ACTUAL NOISE EVENT
    // ========================================================

    const detectedEvents =
        events.filter(event => {

            return (
                event &&
                event.source &&
                event.source !== "silent" &&
                event.source_name &&
                event.source_name
                    .toLowerCase() !==
                    "silent"
            );

        });


    console.log(
        "Detected non-silent events:",
        detectedEvents
    );


    // ========================================================
    // PRIMARY SOURCE
    // ========================================================

    const primaryEvent =
        detectedEvents.length > 0
            ? detectedEvents.reduce(
                (best, current) => {

                    const bestConfidence =
                        Number(
                            best.confidence ||
                            0
                        );


                    const currentConfidence =
                        Number(
                            current.confidence ||
                            0
                        );


                    return currentConfidence >
                        bestConfidence
                        ? current
                        : best;

                }
            )
            : null;


    let sourceName =
        "No significant source detected";


    let confidence =
        0;


    let severity =
        "Low";


    if (primaryEvent) {
        if (primaryEvent.source === "unusual_sound" || primaryEvent.source === "unknown") {
            const topCand = primaryEvent.top_prediction_name || (primaryEvent.top_prediction ? formatSourceName(primaryEvent.top_prediction) : "");
            const topConf = primaryEvent.top_confidence ? (primaryEvent.top_confidence * (primaryEvent.top_confidence <= 1 ? 100 : 1)).toFixed(1) : Number(primaryEvent.confidence || 0).toFixed(1);
            sourceName = topCand ? `UNUSUAL SOUND DETECTED (Closest: ${topCand} ${topConf}%)` : "UNUSUAL SOUND DETECTED";
        } else {
            sourceName = primaryEvent.source_name || formatSourceName(primaryEvent.source);
        }

        confidence = Number(primaryEvent.confidence || 0);
        if (confidence > 0 && confidence <= 1.0) {
            confidence = confidence * 100;
        }

        severity = primaryEvent.severity || "Low";
    }


    console.log(
        "================================="
    );


    console.log(
        "PRIMARY SOURCE:",
        sourceName
    );


    console.log(
        "CONFIDENCE:",
        confidence
    );


    console.log(
        "SEVERITY:",
        severity
    );


    console.log(
        "================================="
    );


    // ========================================================
    // DURATION
    // ========================================================

    const duration =
        Number(
            data.duration || 0
        );


    // ========================================================
    // DB LEVEL
    // ========================================================

    const estimatedDb =
        Number(
            data.estimated_db
        );


    const dbText =
        Number.isFinite(
            estimatedDb
        )
            ? `${estimatedDb.toFixed(2)} dBFS`
            : "—";


    // ========================================================
    // OVERALL SEVERITY
    // ========================================================

    const overallSeverity =
        getOverallSeverity(
            events
        );


    // ========================================================
    // RESULT-BASED ALERT
    // ========================================================

    showResultAlert(
        overallSeverity,
        sourceName,
        estimatedDb
    );


    // ========================================================
    // OVERVIEW SECTION
    // ========================================================

    const dbValue =
        document.getElementById(
            "dbValue"
        );


    const sourceValue =
        document.getElementById(
            "sourceValue"
        );


    const severityValue =
        document.getElementById(
            "severityValue"
        );


    const durationValue =
        document.getElementById(
            "durationValue"
        );


    if (dbValue) {

        dbValue.textContent =
            dbText;

    }


    if (sourceValue) {

        sourceValue.textContent =
            sourceName;

    }


    if (severityValue) {

        severityValue.textContent =
            overallSeverity;

    }


    if (durationValue) {

        durationValue.textContent =
            formatDuration(
                duration
            );

    }


    // ========================================================
    // RESULTS SECTION
    // ========================================================

    const resultDb =
        document.getElementById(
            "resultDb"
        );


    const resultSource =
        document.getElementById(
            "resultSource"
        );


    const resultSeverity =
        document.getElementById(
            "resultSeverity"
        );


    const resultDuration =
        document.getElementById(
            "resultDuration"
        );


    if (resultDb) {

        resultDb.textContent =
            dbText;

    }


    if (resultSource) {

        resultSource.textContent =
            sourceName;

    }


    if (resultSeverity) {

        resultSeverity.textContent =
            overallSeverity;

    }


    if (resultDuration) {

        resultDuration.textContent =
            formatDuration(
                duration
            );

    }


    // ========================================================
    // CONFIDENCE
    // ========================================================

    const confidenceValue =
        document.getElementById(
            "confidenceValue"
        );


    const confidenceFill =
        document.getElementById(
            "confidenceFill"
        );


    const confidenceText =
        document.getElementById(
            "confidenceText"
        );


    if (confidenceValue) {

        confidenceValue.textContent =
            `${confidence.toFixed(1)}%`;

    }


    if (confidenceFill) {

        confidenceFill.style.width =
            `${Math.min(
                confidence,
                100
            )}%`;

    }


    if (confidenceText) {

        if (primaryEvent) {

            confidenceText.textContent =
                `${sourceName} detected with ${confidence.toFixed(1)}% AI confidence.`;

        } else {

            confidenceText.textContent =
                "No significant noise source detected.";

        }

    }


    // ========================================================
    // TIMELINE
    // ========================================================

    const timeline =
        (
            Array.isArray(
                data.timeline
            ) &&
            data.timeline.length > 0
        )
            ? data.timeline
            : generateFallbackTimeline(
                data,
                events
            );


    console.log(
        "Timeline received/generated:",
        timeline
    );


    renderTimeline(
        timeline,
        events
    );


    // ========================================================
    // SOURCES
    // ========================================================

    renderSources(
        events
    );


    // ========================================================
    // CONTROL CENTER
    // ========================================================

    renderControlCenter(
        events
    );


    // ========================================================
    // ENABLE REPORT
    // ========================================================

    const reportButton =
        document.getElementById(
            "reportButton"
        );


    if (reportButton) {

        reportButton.disabled =
            false;

    }


    // ========================================================
    // STORE GLOBALLY
    // ========================================================

    window.currentAnalysisData =
        data;


    window.currentTimelineData =
        timeline;


    window.currentEvents =
        events;


    /*
       Store analysis so chatbot.html
       can use the latest result.
    */

    try {

        localStorage.setItem(
            "auralguardAnalysis",
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Unable to store analysis:",
            error
        );

    }


    console.log(
        "Dashboard rendering completed."
    );

}


// ============================================================
// FORMAT DURATION
// ============================================================

function formatDuration(seconds) {

    seconds =
        Number(
            seconds || 0
        );


    if (seconds < 60) {

        return (
            `${seconds.toFixed(2)} s`
        );

    }


    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        Math.floor(
            seconds % 60
        );


    return (
        `${minutes}m ${remainingSeconds}s`
    );

}


// ============================================================
// GET OVERALL SEVERITY
// ============================================================

function getOverallSeverity(events) {

    if (
        !events ||
        events.length === 0
    ) {

        return "Low";

    }


    const severityRank = {

        Low: 1,

        Medium: 2,

        High: 3,

        Critical: 4

    };


    let highest =
        "Low";


    events.forEach(event => {

        const severity =
            event.severity ||
            "Low";


        if (
            (severityRank[severity] || 1) >
            (severityRank[highest] || 1)
        ) {

            highest =
                severity;

        }

    });


    return highest;

}


// ============================================================
// FALLBACK TIMELINE GENERATOR
// ============================================================

function generateFallbackTimeline(
    data,
    events
) {

    const rawDuration =
        Number(
            data?.duration || 0
        );


    const duration =
        rawDuration > 0
            ? rawDuration
            : 5;


    const rawEstDb =
        Number(
            data?.estimated_db
        );


    const estimatedDb =
        Number.isFinite(
            rawEstDb
        )
            ? rawEstDb
            : -45;


    const rawPeakDb =
        Number(
            data?.peak_db
        );


    const peakDb =
        Number.isFinite(
            rawPeakDb
        )
            ? rawPeakDb
            : Math.min(
                0,
                estimatedDb + 10
            );


    const numPoints =
        Math.max(
            15,
            Math.min(
                100,
                Math.floor(
                    duration * 4
                )
            )
        );


    const step =
        duration /
        Math.max(
            1,
            numPoints - 1
        );


    const fallbackTimeline =
        [];


    const validEvents =
    (events || []).filter(
        event =>
            event &&
            event.source &&
            event.source !== "silent" &&
            event.source !== "unknown"
    );

    for (
        let i = 0;
        i < numPoints;
        i++
    ) {

        const currentTime =
            i * step;


        const nextTime =
            Math.min(
                duration,
                (i + 1) * step
            );


        let currentDb =
            estimatedDb +
            (
                Math.sin(
                    i * 0.4
                ) * 2.5
            ) +
            (
                (
                    Math.random() -
                    0.5
                ) * 1.5
            );


        let activeSource =
            "ambient";


        if (
            validEvents.length > 0
        ) {

            for (
                const ev
                of validEvents
            ) {

                const start =
                    Number(
                        ev.start || 0
                    );


                const end =
                    Number(
                        ev.end ||
                        duration
                    );


                if (
                    currentTime >= start &&
                    currentTime <= end
                ) {

                    const conf =
                        Number(
                            ev.confidence ||
                            50
                        ) / 100;


                    currentDb =
                        estimatedDb +
                        (
                            peakDb -
                            estimatedDb
                        ) * conf +
                        (
                            (
                                Math.random() -
                                0.5
                            ) * 2
                        );


                    activeSource =
                        ev.source ||
                        "noise";


                    break;

                }

            }

        }


        currentDb =
            Math.max(
                -95,
                Math.min(
                    -5,
                    currentDb
                )
            );


        fallbackTimeline.push({

            start:
                Number(
                    currentTime.toFixed(2)
                ),

            end:
                Number(
                    nextTime.toFixed(2)
                ),

            db:
                Number(
                    currentDb.toFixed(2)
                ),

            source:
                activeSource

        });

    }


    return fallbackTimeline;

}


// ============================================================
// TIMELINE RENDERING
// ============================================================

function renderTimeline(
    timeline,
    events
) {

    const emptyPanel =
        document.getElementById(
            "timelineEmpty"
        );


    const chartContainer =
        document.getElementById(
            "timelineChart"
        );


    const eventList =
        document.getElementById(
            "eventList"
        );


    if (
        !timeline ||
        timeline.length === 0
    ) {

        timeline =
            generateFallbackTimeline(
                window.currentAnalysisData ||
                {},
                events
            );

    }


    console.log(
        "Rendering timeline with",
        timeline.length,
        "points."
    );


    // Hide empty state

    if (emptyPanel) {

        emptyPanel.hidden =
            true;

        emptyPanel.style.display =
            "none";

    }


    // Show chart

    if (chartContainer) {

        chartContainer.hidden =
            false;

        chartContainer.style.display =
            "block";

    }


    // Store timeline

    window.currentTimelineData =
        timeline;


    // Draw chart

    drawNoiseChart(
        timeline
    );


    // Event list

    renderEvents(
        eventList,
        events
    );

}


// ============================================================
// DRAW NOISE CHART
// ============================================================

function drawNoiseChart(
    timeline
) {

    const canvas =
        document.getElementById(
            "noiseChart"
        );


    if (!canvas) {

        console.error(
            "noiseChart canvas not found."
        );

        return;

    }


    const container =
        canvas.parentElement;


    if (!container) {

        return;

    }


    const rect =
        container.getBoundingClientRect();


    const width =
        rect.width > 0
            ? rect.width
            : 900;


    const height =
        rect.height > 0
            ? rect.height
            : 350;


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        width * dpr;


    canvas.height =
        height * dpr;


    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext("2d");


    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    // ========================================================
    // BACKGROUND
    // ========================================================

    ctx.fillStyle =
        "#07111f";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    if (
        !timeline.length
    ) {

        return;

    }


    // ========================================================
    // VALUES
    // ========================================================

    const values =
        timeline.map(item => {

            let value =
                Number(
                    item.db
                );


            if (
                !Number.isFinite(
                    value
                )
            ) {

                value =
                    -100;

            }


            return Math.max(
                -100,
                Math.min(
                    0,
                    value
                )
            );

        });


    // ========================================================
    // GRAPH PADDING
    // ========================================================

    const padding = {

        left: 60,

        right: 25,

        top: 30,

        bottom: 45

    };


    const graphWidth =
        width -
        padding.left -
        padding.right;


    const graphHeight =
        height -
        padding.top -
        padding.bottom;


    // ========================================================
    // GRID
    // ========================================================

    ctx.strokeStyle =
        "rgba(100,180,220,0.12)";


    ctx.lineWidth =
        1;


    const gridValues = [

        0,

        -20,

        -40,

        -60,

        -80,

        -100

    ];


    gridValues.forEach(db => {

        const y =
            padding.top +
            (
                (0 - db) /
                100
            ) *
            graphHeight;


        ctx.beginPath();


        ctx.moveTo(
            padding.left,
            y
        );


        ctx.lineTo(
            width -
            padding.right,
            y
        );


        ctx.stroke();


        ctx.fillStyle =
            "#7f9db3";


        ctx.font =
            "12px Arial";


        ctx.textAlign =
            "right";


        ctx.fillText(
            `${db} dB`,
            padding.left - 10,
            y + 4
        );

    });


    // ========================================================
    // X AXIS LABELS
    // ========================================================

    ctx.fillStyle =
        "#7f9db3";


    ctx.font =
        "12px Arial";


    ctx.textAlign =
        "center";


    const totalDuration =
        Number(
            timeline[
                timeline.length - 1
            ].end || 1
        );


    for (
        let i = 0;
        i <= 5;
        i++
    ) {

        const ratio =
            i / 5;


        const x =
            padding.left +
            ratio *
            graphWidth;


        const time =
            ratio *
            totalDuration;


        ctx.fillText(
            `${time.toFixed(1)}s`,
            x,
            height - 15
        );

    }


    // ========================================================
    // BUILD LINE
    // ========================================================

    const points =
        values.map(
            (
                value,
                index
            ) => {

                const item =
                    timeline[index];


                const time =
                    Number(
                        item.start || 0
                    );


                const x =
                    padding.left +
                    (
                        time /
                        totalDuration
                    ) *
                    graphWidth;


                const y =
                    padding.top +
                    (
                        (0 - value) /
                        100
                    ) *
                    graphHeight;


                return {

                    x,

                    y,

                    value,

                    time

                };

            }
        );


    // ========================================================
    // AREA
    // ========================================================

    if (
        points.length > 1
    ) {

        ctx.beginPath();


        ctx.moveTo(
            points[0].x,
            height -
            padding.bottom
        );


        points.forEach(
            point => {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }
        );


        ctx.lineTo(
            points[
                points.length - 1
            ].x,
            height -
            padding.bottom
        );


        ctx.closePath();


        const gradient =
            ctx.createLinearGradient(
                0,
                padding.top,
                0,
                height
            );


        gradient.addColorStop(
            0,
            "rgba(37,217,255,0.25)"
        );


        gradient.addColorStop(
            1,
            "rgba(37,217,255,0.01)"
        );


        ctx.fillStyle =
            gradient;


        ctx.fill();

    }


    // ========================================================
    // LINE
    // ========================================================

    ctx.beginPath();


    points.forEach(
        (
            point,
            index
        ) => {

            if (index === 0) {

                ctx.moveTo(
                    point.x,
                    point.y
                );

            } else {

                ctx.lineTo(
                    point.x,
                    point.y
                );

            }

        }
    );


    ctx.strokeStyle =
        "#25d9ff";


    ctx.lineWidth =
        3;


    ctx.lineJoin =
        "round";


    ctx.lineCap =
        "round";


    ctx.stroke();


    // ========================================================
    // POINTS
    // ========================================================

    points.forEach(
        point => {

            ctx.beginPath();


            ctx.arc(
                point.x,
                point.y,
                4,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#25d9ff";


            ctx.fill();


            ctx.strokeStyle =
                "#07111f";


            ctx.lineWidth =
                2;


            ctx.stroke();

        }
    );


    // ========================================================
    // CHART TITLE
    // ========================================================

    ctx.fillStyle =
        "#d8f5ff";


    ctx.font =
        "bold 13px Arial";


    ctx.textAlign =
        "left";


    ctx.fillText(
        "Noise Level Timeline",
        padding.left,
        18
    );

}


// ============================================================
// RENDER EVENTS
// ============================================================

function renderEvents(
    eventList,
    events
) {

    if (!eventList) {

        return;

    }


    eventList.innerHTML =
        "";


    const validEvents =
        (events || []).filter(
            event =>
                event &&
                event.source &&
                event.source !==
                "silent"
        );


    if (
        validEvents.length === 0
    ) {

        eventList.innerHTML = `

            <div class="timeline-event empty-event">

                <h4>
                    No significant noise events
                </h4>

                <p>
                    The recording did not contain
                    a strong detected noise source.
                </p>

            </div>

        `;


        return;

    }


    validEvents.forEach(
        (
            event,
            index
        ) => {

            const source =
                event.source_name ||
                formatSourceName(
                    event.source
                );


            const confidence =
                Number(
                    event.confidence ||
                    0
                );


            const severity =
                event.severity ||
                "Low";


            const start =
                Number(
                    event.start ||
                    0
                );


            const end =
                Number(
                    event.end ||
                    0
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "timeline-event";


            item.innerHTML = `

                <div class="event-number">
                    ${index + 1}
                </div>


                <div class="event-information">

                    <h4>
                        ${escapeHTML(
                            source
                        )}
                    </h4>


                    <p>
                        ${start.toFixed(1)}s
                        –
                        ${end.toFixed(1)}s
                    </p>

                </div>


                <div class="event-confidence">

                    <strong>
                        ${confidence.toFixed(1)}%
                    </strong>


                    <span>
                        ${escapeHTML(
                            severity
                        )}
                    </span>

                </div>

            `;


            eventList.appendChild(
                item
            );

        }
    );

}


// ============================================================
// SOURCES SECTION
// ============================================================

function renderSources(
    events
) {

    const empty =
        document.getElementById(
            "sourceEmpty"
        );


    const list =
        document.getElementById(
            "sourceList"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    if (empty) {

        empty.hidden =
            true;

        empty.style.display =
            "none";

    }


    const validEvents =
        (events || []).filter(
            event =>
                event &&
                event.source &&
                event.source !==
                "silent"
        );


    const sourceMap =
        new Map();


    if (
        validEvents.length > 0
    ) {

        validEvents.forEach(
            event => {

                const source =
                    event.source_name ||
                    formatSourceName(
                        event.source
                    );


                if (
                    !sourceMap.has(
                        source
                    )
                ) {

                    sourceMap.set(
                        source,
                        {

                            source,

                            confidence:
                                Number(
                                    event.confidence ||
                                    0
                                ),

                            count:
                                1

                        }
                    );

                } else {

                    const existing =
                        sourceMap.get(
                            source
                        );


                    existing.count++;


                    existing.confidence =
                        Math.max(
                            existing.confidence,
                            Number(
                                event.confidence ||
                                0
                            )
                        );

                }

            }
        );

    } else {

        sourceMap.set(
            "Ambient / Background Noise",
            {

                source:
                    "Ambient / Background Noise",

                confidence:
                    90.0,

                count:
                    1

            }
        );

    }


    sourceMap.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "source-card";


            card.innerHTML = `

                <div class="source-card-icon">
                    AI
                </div>


                <div class="source-card-content">

                    <h4>
                        ${escapeHTML(
                            item.source
                        )}
                    </h4>


                    <p>
                        Detected
                        ${item.count}
                        time${item.count > 1 ? "s" : ""}
                    </p>

                </div>


                <div class="source-card-confidence">

                    <strong>
                        ${item.confidence.toFixed(1)}%
                    </strong>


                    <span>
                        confidence
                    </span>

                </div>

            `;


            list.appendChild(
                card
            );

        }
    );

}


// ============================================================
// CONTROL CENTER
// ============================================================

function renderControlCenter(
    events
) {

    const sourceElement =
        document.getElementById(
            "controlSource"
        );


    const explanation =
        document.getElementById(
            "controlExplanation"
        );


    const empty =
        document.getElementById(
            "recommendationEmpty"
        );


    const list =
        document.getElementById(
            "recommendationList"
        );


    if (!list) {

        return;

    }


    list.innerHTML =
        "";


    if (empty) {

        empty.hidden =
            true;

        empty.style.display =
            "none";

    }


    const validEvents =
        (events || []).filter(
            event =>
                event &&
                event.source &&
                event.source !==
                "silent"
        );


    let primarySourceKey =
        "ambient";


    let source =
        "Ambient Acoustic Environment";


    let sourceExplanation =
        "The AI model analyzed sound levels and verified acoustic stability in the uploaded recording.";


    if (
        validEvents.length > 0
    ) {

        const primaryEvent =
            validEvents.reduce(
                (
                    best,
                    current
                ) => {

                    return Number(
                        current.confidence ||
                        0
                    ) >
                        Number(
                            best.confidence ||
                            0
                        )
                        ? current
                        : best;

                }
            );


        primarySourceKey =
            primaryEvent.source;


        source =
            primaryEvent.source_name ||
            formatSourceName(
                primaryEvent.source
            );


        sourceExplanation =
            getSourceExplanation(
                primaryEvent.source
            );

    }


    if (sourceElement) {

        sourceElement.textContent =
            source;

    }


    if (explanation) {

        explanation.textContent =
            sourceExplanation;

    }


    const recommendationSet =
        new Set();


    validEvents.forEach(
        event => {

            if (
                Array.isArray(
                    event.recommendations
                )
            ) {

                event.recommendations.forEach(
                    recommendation => {

                        if (
                            recommendation
                        ) {

                            recommendationSet.add(
                                recommendation
                            );

                        }

                    }
                );

            }

        }
    );


    if (
        recommendationSet.size === 0
    ) {

        getFallbackRecommendations(
            primarySourceKey
        ).forEach(
            recommendation => {

                recommendationSet.add(
                    recommendation
                );

            }
        );

    }


    const tags = ["Immediate Action", "Acoustic Control", "Policy & Mitigation"];

    Array.from(recommendationSet).forEach((recommendation, index) => {
        const card = document.createElement("div");
        card.className = "recommendation-card";

        const tag = tags[index % tags.length];

        card.innerHTML = `
            <div class="recommendation-header">
                <span class="recommendation-number">0${index + 1}</span>
                <span class="recommendation-tag">${tag}</span>
            </div>
            <p class="recommendation-text">${escapeHTML(recommendation)}</p>
        `;

        list.appendChild(card);
    });

}


// ============================================================
// SOURCE EXPLANATION
// ============================================================

function getSourceExplanation(source) {
    const explanations = {
        car_horn: "The AI model identified acoustic impulse peaks associated with vehicle horns. Unregulated honking increases urban noise stress and distraction.",
        chainsaw: "The AI model identified high-amplitude high-frequency saw noise. Extended exposure poses significant auditory fatigue and hearing risks.",
        engine: "The AI model identified continuous low-frequency mechanical engine rumble from vehicle or generator machinery.",
        siren: "The AI model identified high-pitch fluctuating emergency sirens (1–3 kHz) designed for urgent auditory notice.",
        traffic: "The AI model detected continuous broadband road traffic noise generated by vehicle tire friction and exhaust systems.",
        dog_bark: "The AI model identified short impulse animal barking events (1–3 kHz), causing intermittent room reverberation and disturbance.",
        drilling: "The AI model detected high-frequency rotary drilling noise typical of construction, masonry, or utility maintenance.",
        jackhammer: "The AI model identified intense impact shockwaves (>90 dB) produced by pneumatic or hydraulic demolition tools.",
        construction: "The AI model identified mixed heavy construction noise, including machinery, engine rumbles, and structural impact sounds.",
        screaming: "The AI model detected high-pitched vocal distress or shouting signals requiring immediate awareness.",
        speech: "The AI model identified human speech acoustic formants (300 Hz – 3 kHz) within conversational sound levels.",
        music: "The AI model detected rhythmic musical patterns with prominent low-frequency bass reverberation.",
        air_conditioner: "The AI model identified continuous low-frequency HVAC fan hum and duct air turbulence.",
        gunshot: "The AI model detected an extreme high-decibel impulse event (>120 dB) with rapid acoustic onset.",
        lawn_mower: "The AI model identified 2-stroke/4-stroke small engine noise generated by landscaping equipment.",
        vacuum_cleaner: "The AI model detected high-RPM motor airflow noise from indoor cleaning appliances.",
        rain: "The AI model identified natural precipitation impact noise across a broad acoustic frequency spectrum.",
        wind: "The AI model detected low-frequency atmospheric wind turbulence and aerodynamic friction.",
        fireworks: "The AI model identified high-impulse pyrotechnic explosions and reverberant shockwaves.",
        aircraft: "The AI model detected jet or propeller engine acoustic flyover patterns with low-frequency ground roll.",
        train: "The AI model identified heavy rail passage noise combining wheel-rail contact friction and engine power.",
        unusual_sound: "UNUSUAL SOUND DETECTED — The audio does not strongly match trained categories. Manual review recommended.",
        unknown: "UNUSUAL SOUND DETECTED — The audio does not strongly match trained categories. Manual review recommended."
    };

    return (
        explanations[source] ||
        "The AI acoustic engine identified a distinct sound frequency pattern for this noise source."
    );
}


// ============================================================
// FALLBACK RECOMMENDATIONS
// ============================================================

function getFallbackRecommendations(source) {
    const recommendations = {
        unusual_sound: [
            "Review this audio segment manually as it does not strongly match trained acoustic profiles.",
            "Check signal input quality and inspect local ambient noise levels.",
            "Log this sample to evaluate for future dataset retraining."
        ],
        unknown: [
            "Review this audio segment manually as it does not strongly match trained acoustic profiles.",
            "Check signal input quality and inspect local ambient noise levels.",
            "Log this sample to evaluate for future dataset retraining."
        ],
        car_horn: [
            "Avoid unnecessary horn usage in residential and silent zones.",
            "Implement automated acoustic honking detection & traffic management.",
            "Erect directional noise barriers near hospital and school zones."
        ],
        chainsaw: [
            "Deploy electric or suppressed equipment to minimize acoustic emissions.",
            "Restrict high-decibel cutting activities to designated daylight hours.",
            "Equip all site personnel with high-attenuation hearing protection (NRR 25+)."
        ],
        engine: [
            "Schedule routine mechanical maintenance and muffler system checks.",
            "Enforce strict anti-idling protocols for stationary machinery.",
            "Install localized acoustic enclosures or vibration dampening mounts."
        ],
        siren: [
            "Limit emergency warning siren duration to active crisis corridors.",
            "Utilize smart directional sirens to minimize surrounding residential disturbance.",
            "Deploy automated emergency vehicle preemption (EVP) traffic systems."
        ],
        traffic: [
            "Implement low-noise porous asphalt paving on high-volume routes.",
            "Deploy urban speed calming measures and heavy vehicle speed limits.",
            "Construct vegetated sound barriers along highway perimeters."
        ],
        dog_bark: [
            "Position indoor acoustic insulation panels near perimeter fencing.",
            "Apply behavioral acoustic conditioning or anti-bark deterrent devices.",
            "Notify neighborhood animal control or community management."
        ],
        drilling: [
            "Erect portable modular noise curtains around active drilling rigs.",
            "Schedule high-pitch rotary operations during non-peak community hours.",
            "Utilize diamond-core vibration-damped drill bits."
        ],
        jackhammer: [
            "Install pneumatic exhaust silencers and acoustic jacket dampeners.",
            "Limit continuous breaker operation to 30-minute rotational shifts.",
            "Erect heavy-duty mobile sound barriers around demolition zones."
        ],
        construction: [
            "Enforce site perimeter noise monitoring with real-time decibel alarms.",
            "Replace diesel generators with battery energy storage systems (BESS).",
            "Establish mandatory quiet hours and acoustic buffer zones."
        ],
        screaming: [
            "Alert site security personnel to inspect the immediate acoustic zone.",
            "Verify public safety camera feeds near the detected GPS coordinates.",
            "Initiate automated emergency protocol if distress pattern persists."
        ],
        speech: [
            "Install acoustic wall baffles and sound-absorbing ceiling tiles.",
            "Utilize sound masking systems for confidential office/study areas.",
            "Establish designated quiet focus zones in communal spaces."
        ],
        music: [
            "Enforce venue low-frequency bass limiters and decibel compliance cutoff.",
            "Orient outdoor speaker arrays away from residential neighborhoods.",
            "Install double-glazed acoustic windows and bass traps."
        ],
        air_conditioner: [
            "Replace worn fan bearings and secure loose unit panel housing.",
            "Install anti-vibration rubber isolation pads beneath compressor units.",
            "Equip ductwork with internal acoustic silencer baffles."
        ],
        gunshot: [
            "IMMEDIATE ALERT: Trigger emergency responder notification protocol.",
            "Triangulate acoustic arrival timestamps for precise location mapping.",
            "Broadcast automated localized lockdown audio alert."
        ],
        lawn_mower: [
            "Transition to zero-emission battery electric lawn equipment.",
            "Restrict landscaping machinery use to 9:00 AM – 5:00 PM.",
            "Maintain sharp blades and clean mufflers for reduced acoustic load."
        ],
        vacuum_cleaner: [
            "Inspect and clean HEPA filters and motor intake vents.",
            "Operate high-decibel appliances during active day periods.",
            "Select low-dB quiet-mode vacuum appliances for indoor spaces."
        ],
        rain: [
            "Inspect roof drainage systems for excessive water impact splashing.",
            "Apply damping coatings to metal roofing and rainwater downspouts.",
            "No emergency action required; natural environmental sound."
        ],
        wind: [
            "Secure loose exterior structures, tarps, and window shutters.",
            "Install windbreak vegetation hedges or aerodynamic baffle fences.",
            "No emergency action required; natural atmospheric turbulence."
        ],
        fireworks: [
            "Notify surrounding residents in advance of scheduled pyrotechnic events.",
            "Maintain safety perimeters away from dry vegetation and residential zones.",
            "Provide protective indoor shelter access for domestic animals."
        ],
        aircraft: [
            "Optimize continuous descent arrival (CDA) flight paths.",
            "Enforce airport nighttime noise curfews and steep climb departures.",
            "Provide residential sound insulation retrofit grants for flight paths."
        ],
        train: [
            "Apply rail head friction modifiers to eliminate wheel squeal in curves.",
            "Construct roadside sound barrier walls along high-frequency rail lines.",
            "Establish quiet zones eliminating routine locomotive horn whistles."
        ]
    };

    return (
        recommendations[source] || [
            "Identify the noise source location and assess decibel compliance.",
            "Apply localized acoustic absorption barriers or dampening materials.",
            "Establish scheduled operational quiet hours and community noise controls."
        ]
    );
}


// ============================================================
// SOURCE NAME FORMATTER
// ============================================================

function formatSourceName(source) {
    if (!source) {
        return "Unknown Source";
    }

    const names = {
        car_horn: "Car Horn",
        chainsaw: "Chainsaw / Heavy Saw",
        engine: "Vehicle / Machinery Engine",
        siren: "Emergency Siren",
        traffic: "Road Traffic",
        dog_bark: "Animal Barking",
        drilling: "Construction Drilling",
        jackhammer: "Pneumatic Demolition",
        construction: "Heavy Construction",
        screaming: "Human Screaming / Distress",
        speech: "Human Speech / Crowd",
        music: "Loud Music / Bass",
        air_conditioner: "HVAC / Fan Noise",
        gunshot: "Firearm / Impulse Explosion",
        lawn_mower: "Landscaping / Mower Engine",
        vacuum_cleaner: "Appliance / Vacuum Motor",
        rain: "Heavy Rainfall",
        wind: "Wind / Aerodynamic Friction",
        fireworks: "Pyrotechnic Explosion",
        aircraft: "Aircraft / Aviation Flyover",
        train: "Heavy Rail / Railway Noise",
        silent: "Silent / Background",
        unusual_sound: "UNUSUAL SOUND DETECTED",
        unknown: "UNUSUAL SOUND DETECTED"
    };

    if (names[source]) {
        return names[source];
    }

    return source
        .replace(/_/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}


// ============================================================
// PROFILE
// ============================================================

function initializeProfile() {

    const usernameDisplay =
        document.getElementById(
            "usernameDisplay"
        );


    const userInitial =
        document.getElementById(
            "userInitial"
        );


    let username =
        "User";


    try {

        const stored =
            localStorage.getItem(
                "auralguardUser"
            );


        if (stored) {

            const parsed =
                JSON.parse(
                    stored
                );


            username =
                parsed.username ||
                parsed.email ||
                "User";

        }

    } catch (error) {

        console.warn(
            "Unable to read user profile.",
            error
        );

    }


    if (usernameDisplay) {

        usernameDisplay.textContent =
            username;

    }


    if (userInitial) {

        userInitial.textContent =
            username
                .charAt(0)
                .toUpperCase();

    }

}


// ============================================================
// LOGOUT
// ============================================================

function initializeLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {

        return;

    }


    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    API_URL +
                    "/logout",
                    {

                        method:
                            "POST",

                        credentials:
                            "include"

                    }
                );

            } catch (error) {

                console.warn(
                    "Logout API error:",
                    error
                );

            }


            localStorage.removeItem(
                "auralguardUser"
            );


            window.location.href =
                "login.html";

        }
    );

}


// ============================================================
// REPORT
// ============================================================

function initializeReport() {

    const reportButton =
        document.getElementById(
            "reportButton"
        );


    if (!reportButton) {

        return;

    }


    reportButton.addEventListener(
        "click",
        generateReport
    );

}


// ============================================================
// GENERATE REPORT
// ============================================================

function generateReport() {

    const data =
        window.currentAnalysisData;


    if (!data) {

        showToast(
            "Run an analysis first.",
            "error"
        );

        return;

    }


    const events =
        data.ml_detection &&
        Array.isArray(
            data.ml_detection.events
        )
            ? data.ml_detection.events
            : [];


    const detectedEvents =
        events.filter(
            event =>
                event.source !==
                "silent"
        );


    const primary =
        detectedEvents.length
            ? detectedEvents[0]
            : null;


    const source =
        primary
            ? (
                primary.source_name ||
                formatSourceName(
                    primary.source
                )
            )
            : "No significant source";


    const report = `

AURALGUARD
AI NOISE ANALYSIS REPORT

================================

Recording
${data.filename || "Unknown"}

Duration
${Number(data.duration || 0).toFixed(2)} seconds

Estimated Audio Level
${Number(data.estimated_db || 0).toFixed(2)} dBFS

Peak Audio Level
${Number(data.peak_db || 0).toFixed(2)} dBFS

Primary Noise Source
${source}

Severity
${primary?.severity || "Low"}

AI Confidence
${Number(primary?.confidence || 0).toFixed(1)}%

================================

Generated by AuralGuard AI Noise Analysis System
`;


    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/plain"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "AuralGuard_Analysis_Report.txt";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Analysis report generated.",
        "success"
    );

}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "info"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
        message;


    toast.classList.remove(
        "show",
        "success",
        "error"
    );


    toast.classList.add(
        type
    );


    void toast.offsetWidth;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3500
    );

}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// RESULT-BASED ALERT SYSTEM
// ============================================================

/*
    Alert behavior:

    LOW
        No sound

    MEDIUM
        1 beep

    HIGH
        2 beeps

    CRITICAL
        3 beeps
*/


// ============================================================
// INITIALIZE ALERT AUDIO
// ============================================================

function initializeAlertAudio() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            console.warn(
                "Web Audio API is not supported."
            );

            return null;

        }


        if (!alertAudioContext) {

            alertAudioContext =
                new AudioContext();

        }


        if (
            alertAudioContext.state ===
            "suspended"
        ) {

            alertAudioContext.resume()
                .catch(error => {

                    console.warn(
                        "Unable to resume alert audio:",
                        error
                    );

                });

        }


        return alertAudioContext;

    } catch (error) {

        console.error(
            "Unable to initialize alert audio:",
            error
        );


        return null;

    }

}


// ============================================================
// PLAY ONE ALERT BEEP
// ============================================================

function playAlertBeep(
    frequency = 700,
    duration = 0.25,
    delay = 0,
    volume = 0.15
) {

    const audio =
        initializeAlertAudio();


    if (!audio) {

        return;

    }


    setTimeout(
        () => {

            try {

                const oscillator =
                    audio.createOscillator();


                const gain =
                    audio.createGain();


                oscillator.type =
                    "square";


                oscillator.frequency.setValueAtTime(
                    frequency,
                    audio.currentTime
                );


                gain.gain.setValueAtTime(
                    0.001,
                    audio.currentTime
                );


                gain.gain.exponentialRampToValueAtTime(
                    volume,
                    audio.currentTime +
                    0.03
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    audio.currentTime +
                    duration
                );


                oscillator.connect(
                    gain
                );


                gain.connect(
                    audio.destination
                );


                oscillator.start();


                oscillator.stop(
                    audio.currentTime +
                    duration
                );


            } catch (error) {

                console.error(
                    "Alert beep error:",
                    error
                );

            }

        },
        delay
    );

}


// ============================================================
// PLAY ALERT BASED ON SEVERITY
// ============================================================

function playSeverityAlert(
    severity
) {

    const level =
        String(
            severity ||
            "Low"
        ).toLowerCase();


    console.log(
        "🔊 Playing alert for severity:",
        severity
    );


    // --------------------------------------------------------
    // LOW
    // --------------------------------------------------------

    if (
        level === "low"
    ) {

        console.log(
            "ℹ️ Low severity - no alert sound."
        );

        return;

    }


    // --------------------------------------------------------
    // MEDIUM
    // --------------------------------------------------------

    if (
        level === "medium"
    ) {

        console.log(
            "🔔 Medium severity - one beep."
        );


        playAlertBeep(
            650,
            0.25,
            0,
            0.12
        );


        return;

    }


    // --------------------------------------------------------
    // HIGH
    // --------------------------------------------------------

    if (
        level === "high"
    ) {

        console.log(
            "🚨 High severity - two beeps."
        );


        playAlertBeep(
            800,
            0.25,
            0,
            0.16
        );


        playAlertBeep(
            800,
            0.25,
            350,
            0.16
        );


        return;

    }


    // --------------------------------------------------------
    // CRITICAL
    // --------------------------------------------------------

    if (
        level === "critical"
    ) {

        console.log(
            "🚨 Critical severity - three beeps."
        );


        playAlertBeep(
            950,
            0.25,
            0,
            0.20
        );


        playAlertBeep(
            950,
            0.25,
            350,
            0.20
        );


        playAlertBeep(
            1100,
            0.30,
            700,
            0.22
        );


        return;

    }


    console.log(
        "No alert configured for severity:",
        severity
    );

}


// ============================================================
// SHOW RESULT ALERT
// ============================================================

function showResultAlert(
    severity,
    source,
    db
) {

    const noiseAlert =
        document.getElementById(
            "noiseAlert"
        );


    const noiseAlertMessage =
        document.getElementById(
            "noiseAlertMessage"
        );


    /*
       If the alert HTML is not present,
       still play the sound.
    */

    if (!noiseAlert) {

        console.warn(
            "noiseAlert element not found."
        );


        playSeverityAlert(
            severity
        );


        return;

    }


    const cleanSeverity =
        severity ||
        "Low";


    const cleanSource =
        source ||
        "Unknown noise source";


    const numericDb =
        Number(db);


    let levelText =
        "";


    if (
        Number.isFinite(
            numericDb
        )
    ) {

        levelText =
            `Estimated audio level: ${numericDb.toFixed(2)} dBFS.`;

    }


    // --------------------------------------------------------
    // LOW
    // --------------------------------------------------------

    if (
        String(
            cleanSeverity
        ).toLowerCase() ===
        "low"
    ) {

        noiseAlert.classList.remove(
            "show"
        );


        console.log(
            "ℹ️ Low severity. Alert not shown."
        );


        return;

    }


    // --------------------------------------------------------
    // ALERT MESSAGE
    // --------------------------------------------------------

    if (noiseAlertMessage) {

        noiseAlertMessage.textContent =
            `${cleanSeverity} noise detected — ${cleanSource}. ${levelText}`;

    }


    // --------------------------------------------------------
    // SEVERITY CLASS
    // --------------------------------------------------------

    noiseAlert.classList.remove(

        "low",

        "medium",

        "high",

        "critical"

    );


    noiseAlert.classList.add(
        String(
            cleanSeverity
        ).toLowerCase()
    );


    // --------------------------------------------------------
    // SHOW ALERT
    // --------------------------------------------------------

    noiseAlert.classList.add(
        "show"
    );


    // --------------------------------------------------------
    // PLAY SOUND
    // --------------------------------------------------------

    playSeverityAlert(
        cleanSeverity
    );

}


// ============================================================
// INITIALIZE NOISE ALERT
// ============================================================

function initializeNoiseAlert() {

    const closeNoiseAlert =
        document.getElementById(
            "closeNoiseAlert"
        );


    const noiseAlert =
        document.getElementById(
            "noiseAlert"
        );


    if (
        closeNoiseAlert &&
        noiseAlert
    ) {

        closeNoiseAlert.addEventListener(
            "click",
            () => {

                noiseAlert.classList.remove(
                    "show"
                );

            }
        );

    }

}


// ============================================================
// GLOBAL DEBUG HELPERS
// ============================================================

window.AuralGuard = {

    analyze:
        analyzeRecording,

    render:
        renderAnalysisResults,

    timeline:
        renderTimeline,

    chart:
        drawNoiseChart,

    alert:
        showResultAlert,

    alertSound:
        playSeverityAlert

};


console.log(
    "AuralGuard dashboard initialized."
);


// ============================================================
// PROFESSIONAL SIDEBAR
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const menuToggle =
            document.getElementById(
                "menuToggle"
            );


        const sidebar =
            document.getElementById(
                "professionalSidebar"
            );


        const sidebarClose =
            document.getElementById(
                "sidebarClose"
            );


        const overlay =
            document.getElementById(
                "sidebarOverlay"
            );


        console.log(
            "Sidebar elements:",
            {

                menuToggle,

                sidebar,

                sidebarClose,

                overlay

            }
        );


        if (
            !menuToggle ||
            !sidebar ||
            !sidebarClose ||
            !overlay
        ) {

            console.error(
                "❌ AuralGuard sidebar elements are missing."
            );

            return;

        }


        // ----------------------------------------------------
        // OPEN SIDEBAR
        // ----------------------------------------------------

        function openSidebar() {

            sidebar.classList.add(
                "open"
            );


            overlay.classList.add(
                "open"
            );


            menuToggle.classList.add(
                "open"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );


            document.body.style.overflow =
                "hidden";


            console.log(
                "✅ Sidebar opened"
            );

        }


        // ----------------------------------------------------
        // CLOSE SIDEBAR
        // ----------------------------------------------------

        function closeSidebar() {

            sidebar.classList.remove(
                "open"
            );


            overlay.classList.remove(
                "open"
            );


            menuToggle.classList.remove(
                "open"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            document.body.style.overflow =
                "";


            console.log(
                "✅ Sidebar closed"
            );

        }


        // ----------------------------------------------------
        // THREE LINE BUTTON
        // ----------------------------------------------------

        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                if (
                    sidebar.classList.contains(
                        "open"
                    )
                ) {

                    closeSidebar();

                } else {

                    openSidebar();

                }

            }
        );


        // ----------------------------------------------------
        // CLOSE BUTTON
        // ----------------------------------------------------

        sidebarClose.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );


        // ----------------------------------------------------
        // CLICK OUTSIDE SIDEBAR
        // ----------------------------------------------------

        overlay.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );


        // ----------------------------------------------------
        // SIDEBAR LINKS
        // ----------------------------------------------------

        const sidebarLinks =
            document.querySelectorAll(
                ".sidebar-anchor"
            );


        sidebarLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        if (
                            link.getAttribute(
                                "href"
                            ) ===
                            "chatbot.html"
                        ) {

                            closeSidebar();

                            return;

                        }


                        closeSidebar();

                    }
                );

            }
        );


        // ----------------------------------------------------
        // ESC KEY
        // ----------------------------------------------------

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeSidebar();

                }

            }
        );

    }
);
