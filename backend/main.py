import json
import os
import tempfile

import joblib
import librosa
import numpy as np

from dotenv import load_dotenv

from google import genai
from google.genai import types

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    Response
)
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from backend.supabase_client import supabase


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# GEMINI AI
# ==========================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from .env"
    )

gemini_client = genai.Client(
    api_key=GEMINI_API_KEY
)

# ============================================================
# AURALGUARD API
# ============================================================

app = FastAPI(
    title="AuralGuard API",
    version="0.5.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
 allow_origins=[
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "https://auralguard-1-frontend.vercel.app/"
],
allow_origin_regex=r"https://.*\.vercel\.app",
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "..",
    "ml",
    "auralguard_noise_model.pkl"
)

MODEL_PATH = os.path.abspath(MODEL_PATH)


# ============================================================
# MODEL SETTINGS
# ============================================================

model = None
scaler = None
classes = []

SAMPLE_RATE = 22050
SEGMENT_DURATION = 3


# ============================================================
# LOAD ML MODEL
# ============================================================

try:

    model_data = joblib.load(
        MODEL_PATH
    )

    # New model format
    if isinstance(model_data, dict):

        model = model_data["model"]

        classes = model_data["classes"]

        scaler = model_data.get("scaler", None)

        SAMPLE_RATE = model_data.get(
            "sample_rate",
            22050
        )

        SEGMENT_DURATION = model_data.get(
            "duration",
            3
        )

    # Compatibility with old model
    else:

        model = model_data

        classes = model.classes_

        SAMPLE_RATE = 22050

        SEGMENT_DURATION = 3


    print()
    print("==============================================")
    print(" AURALGUARD ML MODEL LOADED")
    print("==============================================")
    print(f"Model          : Random Forest")
    print(f"Classes        : {classes}")
    print(f"Sample rate    : {SAMPLE_RATE}")
    print(f"Segment length : {SEGMENT_DURATION} seconds")
    print("==============================================")
    print()


except Exception as e:

    print()
    print("==============================================")
    print(" ML MODEL LOAD ERROR")
    print("==============================================")

    print(e)

    print()


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {

        "message": "AuralGuard API is running",

        "version": "0.5.0",

        "ml_model_loaded": model is not None,

        "classes": [
            str(c)
            for c in classes
        ]

    }


# ============================================================
# AUTHENTICATION MODELS
# ============================================================

class SignupRequest(BaseModel):

    username: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):

    email: EmailStr
    password: str
class ChatRequest(BaseModel):
    message: str
    analysis: dict | None = None

# ============================================================
# SIGNUP
# ============================================================

@app.post("/signup")
def signup(data: SignupRequest):

    # --------------------------------------------------------
    # Validate username
    # --------------------------------------------------------

    username = data.username.strip()

    if len(username) < 3:

        raise HTTPException(
            status_code=400,
            detail="Username must contain at least 3 characters."
        )


    # --------------------------------------------------------
    # Validate password
    # --------------------------------------------------------

    if len(data.password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )


    # --------------------------------------------------------
    # Confirm password
    # --------------------------------------------------------

    if data.password != data.confirm_password:

        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )


    # --------------------------------------------------------
    # Supabase signup
    # --------------------------------------------------------

    try:

        result = supabase.auth.sign_up({

            "email": str(data.email),

            "password": data.password,

            "options": {

                "data": {

                    "username": username

                }

            }

        })


        # ----------------------------------------------------
        # Check signup result
        # ----------------------------------------------------

        if result.user is None:

            raise HTTPException(
                status_code=400,
                detail="Unable to create account."
            )


        return {

            "success": True,

            "message": "Account created successfully.",

            "user_id": str(
                result.user.id
            ),

            "email": result.user.email

        }


    except HTTPException:

        raise


    except Exception as e:

        error_message = str(e)


        # ----------------------------------------------------
        # Common Supabase errors
        # ----------------------------------------------------

        if (
            "already registered"
            in error_message.lower()
        ):

            raise HTTPException(

                status_code=400,

                detail="This email is already registered."

            )


        if (
            "user already registered"
            in error_message.lower()
        ):

            raise HTTPException(

                status_code=400,

                detail="This email is already registered."

            )


        raise HTTPException(

            status_code=400,

            detail=error_message

        )


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login(
    data: LoginRequest,
    response: Response
):

    try:

        result = supabase.auth.sign_in_with_password({

            "email": str(data.email),

            "password": data.password

        })


        # ----------------------------------------------------
        # Check user
        # ----------------------------------------------------

        if result.user is None:

            raise HTTPException(

                status_code=401,

                detail="Invalid email or password."

            )


        # ----------------------------------------------------
        # Get access token
        # ----------------------------------------------------

        if result.session is None:

            raise HTTPException(

                status_code=401,

                detail="Login session could not be created."

            )


        access_token = result.session.access_token


        # ----------------------------------------------------
        # HTTP-only authentication cookie
        # ----------------------------------------------------

        response.set_cookie(

            key="auralguard_session",

            value=access_token,

            httponly=True,

            secure=False,

            samesite="lax",

            max_age=60 * 60 * 24 * 7

        )


        return {

            "success": True,

            "message": "Login successful.",

            "user_id": str(
                result.user.id
            ),

            "email": result.user.email

        }


    except HTTPException:

        raise


    except Exception:

        raise HTTPException(

            status_code=401,

            detail="Invalid email or password."

        )


# ============================================================
# LOGOUT
# ============================================================

@app.post("/logout")
def logout(
    response: Response
):

    response.delete_cookie(
        key="auralguard_session"
    )

    return {

        "success": True,

        "message": "Logged out successfully."

    }


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_ml_features(audio):

    try:

        required_samples = (
            SAMPLE_RATE *
            SEGMENT_DURATION
        )

        # ----------------------------------------------------
        # Make audio exactly 3 seconds
        # ----------------------------------------------------

        if len(audio) < required_samples:

            audio = np.pad(
                audio,
                (
                    0,
                    required_samples - len(audio)
                )
            )

        else:

            audio = audio[
                :required_samples
            ]


        features = []


        # ====================================================
        # 1. MFCC
        # ====================================================

        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=SAMPLE_RATE,
            n_mfcc=20
        )

        mfcc_mean = np.mean(
            mfcc,
            axis=1
        )

        mfcc_std = np.std(
            mfcc,
            axis=1
        )

        features.extend(
            mfcc_mean
        )

        features.extend(
            mfcc_std
        )


        # ====================================================
        # 2. MEL SPECTROGRAM
        # ====================================================

        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=SAMPLE_RATE,
            n_mels=40,
            fmax=SAMPLE_RATE // 2
        )

        mel_db = librosa.power_to_db(
            mel,
            ref=np.max
        )

        mel_mean = np.mean(
            mel_db,
            axis=1
        )

        features.extend(
            mel_mean
        )


        # ====================================================
        # 3. RMS ENERGY
        # ====================================================

        rms = librosa.feature.rms(
            y=audio
        )

        features.append(
            np.mean(rms)
        )

        features.append(
            np.std(rms)
        )


        # ====================================================
        # 4. SPECTRAL CENTROID
        # ====================================================

        centroid = librosa.feature.spectral_centroid(
            y=audio,
            sr=SAMPLE_RATE
        )

        features.append(
            np.mean(centroid)
        )

        features.append(
            np.std(centroid)
        )


        # ====================================================
        # 5. SPECTRAL BANDWIDTH
        # ====================================================

        bandwidth = librosa.feature.spectral_bandwidth(
            y=audio,
            sr=SAMPLE_RATE
        )

        features.append(
            np.mean(bandwidth)
        )

        features.append(
            np.std(bandwidth)
        )


        # ====================================================
        # 6. ZERO CROSSING RATE
        # ====================================================

        zcr = librosa.feature.zero_crossing_rate(
            audio
        )

        features.append(
            np.mean(zcr)
        )

        features.append(
            np.std(zcr)
        )


        # ====================================================
        # 7. SPECTRAL ROLLOFF
        # ====================================================

        rolloff = librosa.feature.spectral_rolloff(
            y=audio,
            sr=SAMPLE_RATE,
            roll_percent=0.85
        )

        features.append(
            np.mean(rolloff)
        )

        features.append(
            np.std(rolloff)
        )


        # ====================================================
        # FINAL FEATURE VECTOR
        # ====================================================

        return np.array(
            features,
            dtype=np.float32
        )


    except Exception as e:

        print(
            f"Feature extraction error: {e}"
        )

        return None


# ============================================================
# dBFS CALCULATION
# ============================================================

def calculate_db(audio):

    if len(audio) == 0:

        return -200.0


    rms = np.sqrt(
        np.mean(
            np.square(audio)
        )
    )


    if rms <= 1e-10:

        return -200.0


    dbfs = 20 * np.log10(
        rms
    )


    return float(
        dbfs
    )


# ============================================================
# PEAK dBFS
# ============================================================

def calculate_peak_db(audio):

    if len(audio) == 0:

        return -200.0


    peak = np.max(
        np.abs(audio)
    )


    if peak <= 1e-10:

        return -200.0


    return float(
        20 * np.log10(
            peak
        )
    )


# ============================================================
# SEVERITY
# ============================================================

def calculate_severity(
    dbfs,
    confidence
):

    if dbfs <= -60:

        return "Low"


    if (
        dbfs >= -25
        and
        confidence >= 0.70
    ):

        return "High"


    if (
        dbfs >= -45
        and
        confidence >= 0.60
    ):

        return "Medium"


    return "Low"


# ============================================================
# SOURCE NAMES
# ============================================================

# ============================================================
# SOURCE NAMES
# ============================================================

SOURCE_NAMES = {
    "car_horn": "Car Horn",
    "chainsaw": "Chainsaw / Cutting Tools",
    "engine": "Engine & Mechanical Noise",
    "siren": "Emergency Siren",
    "traffic": "Road Traffic & Vehicle Flow",
    "dog_bark": "Dog Barking / Animal Noise",
    "drilling": "Drilling & Construction Tools",
    "jackhammer": "Jackhammer / Demolition",
    "construction": "Construction Activity",
    "screaming": "Screaming / Loud Vocal",
    "speech": "Human Speech / Conversation",
    "music": "Loud Music / Entertainment",
    "air_conditioner": "HVAC / Fan System",
    "gunshot": "Gunshot / High Impulse Sound",
    "lawn_mower": "Lawn Mower & Garden Equipment",
    "vacuum_cleaner": "Vacuum Cleaner / Motor Appliance",
    "rain": "Rain / Weather Sound",
    "wind": "Wind Turbulence",
    "fireworks": "Fireworks / Explosive Detonation",
    "aircraft": "Aircraft / Aviation Noise",
    "train": "Railway / Train Passage",
    "silent": "Silent / Ambient",
    "unusual_sound": "UNUSUAL SOUND DETECTED",
    "unknown": "UNUSUAL SOUND DETECTED"
}


# ============================================================
# RECOMMENDATIONS
# ============================================================

RECOMMENDATIONS = {
    "unusual_sound": [
        "Immediate Action: Review this audio segment manually as it does not strongly match trained acoustic profiles.",
        "Acoustic Control: Check signal input quality and inspect local ambient noise levels.",
        "Model Feedback: Log this sample to evaluate for future dataset retraining."
    ],
    "unknown": [
        "Immediate Action: Review this audio segment manually as it does not strongly match trained acoustic profiles.",
        "Acoustic Control: Check signal input quality and inspect local ambient noise levels.",
        "Model Feedback: Log this sample to evaluate for future dataset retraining."
    ],
    "car_horn": [
        "Immediate Action: Avoid unnecessary horn usage in residential zones and install roadside acoustic window seals.",
        "Acoustic Control: Install double-glazed laminated glass windows along road-facing building facades.",
        "Policy & Traffic: Implement automated quiet-zone monitoring and optimized traffic signal timing to reduce congestion."
    ],
    "chainsaw": [
        "Immediate Action: Mandate certified hearing protection (NRR 25+) and restrict chainsaw operation to late morning hours.",
        "Acoustic Control: Position mobile sound-absorbing barrier curtains around active cutting and tree trimming sites.",
        "Equipment Upgrade: Transition to battery-electric saws to lower noise output by 10–15 dB compared to 2-stroke models."
    ],
    "engine": [
        "Immediate Action: Check for worn mufflers, loose exhaust fittings, and strictly prohibit unnecessary engine idling.",
        "Acoustic Control: Mount machinery and stationary generators on anti-vibration rubber or spring isolation pads.",
        "Maintenance Schedule: Enforce routine lubrication logs and enclose heavy stationary engines inside soundproof hoods."
    ],
    "siren": [
        "Immediate Action: Close exterior door and window seals during emergency vehicle passage.",
        "Acoustic Control: Upgrade indoor quiet rooms with high Sound Transmission Class (STC 50+) wall insulation.",
        "Smart Transit: Encourage emergency vehicles to deploy smart directional sirens along dedicated transit corridors."
    ],
    "traffic": [
        "Immediate Action: Close road-facing windows and utilize indoor white-noise or sound-masking devices.",
        "Acoustic Control: Erect roadside sound barrier walls and dense evergreen vegetation buffers to block tire noise.",
        "Infrastructure: Pave roadway corridors with low-noise porous asphalt and enforce heavy-truck speed limits."
    ],
    "dog_bark": [
        "Immediate Action: Move quiet workspaces to interior rooms away from exterior yard walls.",
        "Acoustic Control: Install NRC 0.85+ acoustic wall panels and heavy fabric curtains to minimize bark reverberation.",
        "Behavioral Management: Utilize positive behavioral training tools and avoid leaving pets unattended outdoors."
    ],
    "drilling": [
        "Immediate Action: Restrict high-decibel drilling to mid-day periods and mandate earplugs for nearby personnel.",
        "Acoustic Control: Wrap active drilling rigs with portable soundproofing acoustic blankets.",
        "Technology Upgrade: Switch to electric or hydraulic silent-drilling equipment for urban construction."
    ],
    "jackhammer": [
        "Immediate Action: Enforce mandatory ear protection and limit continuous operator exposure to short 15-minute intervals.",
        "Acoustic Control: Place heavy sound-dampening mats over concrete surrounding the impact zone to damp vibration propagation.",
        "Worksite Management: Schedule heavy demolition during non-peak community hours and use hydraulic burst cutters."
    ],
    "construction": [
        "Immediate Action: Erect temporary perimeter sound barriers around heavy equipment operation areas.",
        "Acoustic Control: Isolate diesel generators and compressors using sound-damped localized enclosures.",
        "Regulatory Compliance: Comply strictly with municipal construction noise codes and time restrictions."
    ],
    "screaming": [
        "Immediate Action: Verify occupant safety and close windows to isolate exterior vocal disturbance.",
        "Acoustic Control: Add sound-absorbing wall panels and dense carpeting to eliminate flutter echoes.",
        "Community Safety: Establish clear community quiet hours and security reporting protocols."
    ],
    "speech": [
        "Immediate Action: Use acoustic desk dividers or speech-masking sound systems in open offices.",
        "Acoustic Control: Install NRC 0.85+ acoustic ceiling tiles and fabric wall coverings to absorb mid-range voice frequencies.",
        "Space Planning: Designate dedicated quiet zones and soundproof phone booths for confidential calls."
    ],
    "music": [
        "Immediate Action: Decouple subwoofers from hard floor surfaces using neoprene isolation pads.",
        "Acoustic Control: Install double drywall with Green Glue acoustic damping compound and heavy soundproof drapes.",
        "Policy Enforcement: Enforce nighttime low-frequency bass limits and comply with local venue noise codes."
    ],
    "air_conditioner": [
        "Immediate Action: Clean air filters, balance fan blades, and tighten loose casing screws.",
        "Acoustic Control: Install duct silencers and mount compressor units on anti-vibration spring isolators.",
        "Equipment Choice: Select variable-speed inverter HVAC units with low dBA manufacturer ratings."
    ],
    "gunshot": [
        "Immediate Action: Seek immediate indoor cover away from windows and contact local emergency dispatch.",
        "Acoustic Control: Install laminated ballistic acoustic glass and reinforced masonry wall structures.",
        "Public Safety: Connect automated acoustic gunshot detection sensors to emergency response systems."
    ],
    "lawn_mower": [
        "Immediate Action: Operate mowers during late morning/afternoon and wear ear protection.",
        "Acoustic Control: Maintain sharp mower blades and mufflers to prevent excess motor strain.",
        "Green Tech: Transition to electric or robotic lawn mowers to lower sound output to ~65 dB."
    ],
    "vacuum_cleaner": [
        "Immediate Action: Operate vacuums during daytime and keep motor filters free of dust clog.",
        "Acoustic Control: Choose multi-stage insulated motor vacuums for lower indoor sound emission.",
        "System Upgrade: Use central vacuum systems where motor noise is isolated in utility rooms."
    ],
    "rain": [
        "Immediate Action: Check window seals and attic hatches for air gaps allowing weather sounds.",
        "Acoustic Control: Add dense cellulose or fiberglass attic insulation to damp roof impact noise.",
        "Glazing Upgrade: Install storm windows with laminated acoustic glass interlayers."
    ],
    "wind": [
        "Immediate Action: Secure loose outdoor fixtures and seal structural window drafts.",
        "Acoustic Control: Plant windbreak tree shelters and upgrade exterior wall insulation.",
        "Architecture: Aerodynamically design roof eaves and exterior trim to prevent wind whistling."
    ],
    "fireworks": [
        "Immediate Action: Keep pets indoors with curtains drawn and calm background audio playing.",
        "Acoustic Control: Use double-glazed acoustic windows to block high-impulse shockwaves.",
        "Regulation: Restrict fireworks displays to designated holidays and authorized open locations."
    ],
    "aircraft": [
        "Immediate Action: Keep windows shut during peak flight corridor approaches.",
        "Acoustic Control: Retrofit attic and ceiling assemblies with resilient channels and sound insulation.",
        "Aviation Policy: Enforce airport noise-abatement flight paths and night curfews."
    ],
    "train": [
        "Immediate Action: Use heavy lined drapes on railway-facing windows.",
        "Acoustic Control: Erect sound barriers along tracks and install vibration-isolated rail beds.",
        "Rail Safety: Enforce quiet-zone intersection crossings where trains do not sound horns."
    ]
}



# ============================================================
# ML PREDICTION
# ============================================================

def predict_segment(audio):

    dbfs = calculate_db(
        audio
    )


    # --------------------------------------------------------
    # SILENCE DETECTION
    # --------------------------------------------------------

    if dbfs <= -60:

        return {

            "source": "silent",

            "source_name": "Silent",

            "confidence": 0.0,

            "dbfs": dbfs,

            "severity": "Low"

        }


    # --------------------------------------------------------
    # FEATURE EXTRACTION
    # --------------------------------------------------------

    features = extract_ml_features(
        audio
    )


    if features is None:

        return {

            "source": "unknown",

            "source_name": "Unknown",

            "confidence": 0.0,

            "dbfs": dbfs,

            "severity": "Low"

        }


    features = features.reshape(
        1,
        -1
    )

    if scaler is not None:
        features = scaler.transform(features)


    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    probabilities = model.predict_proba(
        features
    )[0]


    sorted_indices = np.argsort(
        probabilities
    )[::-1]


    best_index = sorted_indices[0]

    second_index = sorted_indices[1]


    confidence = float(
        probabilities[
            best_index
        ]
    )


    second_confidence = float(
        probabilities[
            second_index
        ]
    )


    predicted_class = str(
        model.classes_[
            best_index
        ]
    )


    second_class = str(
        model.classes_[
            second_index
        ]
    )


    # --------------------------------------------------------
    # CONFIDENCE GAP & CANDIDATE SOURCES
    # --------------------------------------------------------

    confidence_gap = float(confidence - second_confidence)

    candidates = []
    for idx in sorted_indices:
        prob = float(probabilities[idx])
        if prob >= 0.08:  # 8% threshold for candidate acoustic sources
            c_class = str(model.classes_[idx])
            c_name = SOURCE_NAMES.get(c_class, c_class.replace("_", " ").title())
            candidates.append({
                "source": c_class,
                "source_name": c_name,
                "confidence": prob
            })

    # --------------------------------------------------------
    # INTELLIGENT UNUSUAL SOUND REJECTION
    # --------------------------------------------------------

    CONFIDENCE_THRESHOLD = 0.38
    GAP_THRESHOLD = 0.08

    TRAFFIC_CONFIDENCE_THRESHOLD = 0.30
    TRAFFIC_GAP_THRESHOLD = 0.05

    if predicted_class in ["traffic", "engine", "helicopter"]:
        is_uncertain = (
            confidence < TRAFFIC_CONFIDENCE_THRESHOLD
            or confidence_gap < TRAFFIC_GAP_THRESHOLD
        )
    else:
        is_uncertain = (
            confidence < CONFIDENCE_THRESHOLD
            or confidence_gap < GAP_THRESHOLD
        )

    top_name = SOURCE_NAMES.get(predicted_class, predicted_class.replace("_", " ").title())
    second_name = SOURCE_NAMES.get(second_class, second_class.replace("_", " ").title())

    if is_uncertain:
        return {
            "source": "unusual_sound",
            "source_name": "UNUSUAL SOUND DETECTED",
            "confidence": confidence,
            "dbfs": dbfs,
            "severity": "Low",
            "top_prediction": predicted_class,
            "top_prediction_name": top_name,
            "top_confidence": confidence,
            "second_prediction": second_class,
            "second_prediction_name": second_name,
            "second_confidence": second_confidence,
            "confidence_gap": confidence_gap,
            "candidates": candidates,
            "explanation": f"The audio does not strongly match trained categories (Closest candidate: {top_name} at {confidence * 100:.1f}%).",
            "recommendation": "Review this acoustic event manually."
        }


    # --------------------------------------------------------
    # KNOWN SOUND DETECTED
    # --------------------------------------------------------

    severity = calculate_severity(
        dbfs,
        confidence
    )

    return {
        "source": predicted_class,
        "source_name": top_name,
        "confidence": confidence,
        "dbfs": dbfs,
        "severity": severity,
        "top_prediction": predicted_class,
        "top_prediction_name": top_name,
        "top_confidence": confidence,
        "second_prediction": second_class,
        "second_prediction_name": second_name,
        "second_confidence": second_confidence,
        "confidence_gap": confidence_gap,
        "candidates": candidates
    }


# ============================================================
# FFMPEG AUDIO EXTRACTION
# ============================================================

def extract_audio_from_file(
    input_path
):

    output_path = (
        input_path +
        "_audio.wav"
    )


    command = (

        f'ffmpeg -y '

        f'-i "{input_path}" '

        f'-vn '

        f'-ac 1 '

        f'-ar {SAMPLE_RATE} '

        f'"{output_path}"'

    )


    result = os.system(
        command
    )


    if result != 0:

        raise RuntimeError(
            "FFmpeg failed to extract audio."
        )


    return output_path


# ============================================================
# 1-SECOND TIMELINE
# ============================================================

def analyze_timeline(
    audio
):

    timeline = []


    duration = (
        len(audio) /
        SAMPLE_RATE
    )


    current_time = 0.0


    while current_time < duration:

        start_sample = int(
            current_time *
            SAMPLE_RATE
        )


        end_sample = int(
            min(
                (
                    current_time +
                    1
                ) * SAMPLE_RATE,

                len(audio)
            )
        )


        segment = audio[
            start_sample:end_sample
        ]


        dbfs = calculate_db(
            segment
        )


        peak_db = calculate_peak_db(
            segment
        )


        timeline.append({

            "start": round(
                current_time,
                2
            ),

            "end": round(
                min(
                    current_time + 1,
                    duration
                ),
                2
            ),

            "db": round(
                dbfs,
                2
            ),

            "peak_db": round(
                peak_db,
                2
            )

        })


        current_time += 1.0


    return timeline


# ============================================================
# 3-SECOND ML EVENTS
# ============================================================

def analyze_ml_events(
    audio
):

    events = []


    segment_samples = (

        SAMPLE_RATE *
        SEGMENT_DURATION

    )


    start = 0


    while start < len(audio):

        end = min(

            start +
            segment_samples,

            len(audio)

        )


        segment = audio[
            start:end
        ]


        if len(segment) < (
            SAMPLE_RATE * 0.5
        ):

            break


        result = predict_segment(
            segment
        )


        start_time = (
            start /
            SAMPLE_RATE
        )


        end_time = (
            end /
            SAMPLE_RATE
        )


        event = {

            "start": round(
                start_time,
                2
            ),

            "end": round(
                end_time,
                2
            ),

            "source": result[
                "source"
            ],

            "source_name": result[
                "source_name"
            ],

            "confidence": round(
                result[
                    "confidence"
                ] * 100,
                2
            ),

            "db": round(
                result[
                    "dbfs"
                ],
                2
            ),

            "severity": result[
                "severity"
            ]

        }


        # ----------------------------------------------------
        # ML diagnostic information (Phase 2)
        # ----------------------------------------------------

        if "top_prediction" in result:
            event["top_prediction"] = result["top_prediction"]
            event["top_prediction_name"] = result.get("top_prediction_name", result["top_prediction"].replace("_", " ").title())
            event["top_confidence"] = round(result["top_confidence"] * 100, 2)

            event["second_prediction"] = result["second_prediction"]
            event["second_prediction_name"] = result.get("second_prediction_name", result["second_prediction"].replace("_", " ").title())
            event["second_confidence"] = round(result["second_confidence"] * 100, 2)

            event["confidence_gap"] = round(result["confidence_gap"] * 100, 2)

        if "candidates" in result:
            event["candidates"] = [
                {
                    "source": c["source"],
                    "source_name": c["source_name"],
                    "confidence": round(c["confidence"] * 100, 2)
                }
                for c in result["candidates"]
            ]

        if "explanation" in result:
            event["explanation"] = result["explanation"]

        # ----------------------------------------------------
        # Recommendations
        # ----------------------------------------------------

        if "recommendation" in result and isinstance(result["recommendation"], str):
            event["recommendations"] = [
                f"Immediate Action: {result['recommendation']}",
                "Acoustic Control: Conduct signal verification and inspect surrounding area.",
                "Model Feedback: Log this segment for continuous acoustic model training."
            ]
        elif result["source"] in RECOMMENDATIONS:
            event["recommendations"] = RECOMMENDATIONS[result["source"]]
        else:
            event["recommendations"] = [
                "Identify the noise source location and assess decibel compliance.",
                "Apply localized acoustic absorption barriers or dampening materials.",
                "Establish scheduled operational quiet hours and community noise controls."
            ]

        events.append(
            event
        )


        start += segment_samples


    return events


# ============================================================
# ANALYZE API
# ============================================================

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...)
):

    temp_input = None

    temp_audio = None


    try:

        # ----------------------------------------------------
        # SAVE UPLOADED FILE
        # ----------------------------------------------------

        suffix = os.path.splitext(
            file.filename
        )[1]


        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp:

            temp_input = temp.name

            content = await file.read()

            temp.write(
                content
            )


        # ----------------------------------------------------
        # EXTRACT AUDIO
        # ----------------------------------------------------

        temp_audio = (
            extract_audio_from_file(
                temp_input
            )
        )


        # ----------------------------------------------------
        # LOAD AUDIO
        # ----------------------------------------------------

        audio, sr = librosa.load(

            temp_audio,

            sr=SAMPLE_RATE,

            mono=True

        )


        duration = (
            len(audio) /
            SAMPLE_RATE
        )


        # ----------------------------------------------------
        # BASIC AUDIO ANALYSIS
        # ----------------------------------------------------

        estimated_db = calculate_db(
            audio
        )


        peak_db = calculate_peak_db(
            audio
        )


        # ----------------------------------------------------
        # SPECTRAL CENTROID
        # ----------------------------------------------------

        spectral_centroid = (
            librosa.feature.spectral_centroid(
                y=audio,
                sr=SAMPLE_RATE
            )
        )


        # ----------------------------------------------------
        # SPECTRAL BANDWIDTH
        # ----------------------------------------------------

        spectral_bandwidth = (
            librosa.feature.spectral_bandwidth(
                y=audio,
                sr=SAMPLE_RATE
            )
        )


        # ----------------------------------------------------
        # ZERO CROSSING RATE
        # ----------------------------------------------------

        zcr = (
            librosa.feature.zero_crossing_rate(
                audio
            )
        )


        # ----------------------------------------------------
        # TIMELINE
        # ----------------------------------------------------

        timeline = analyze_timeline(
            audio
        )


        # ----------------------------------------------------
        # ML EVENTS
        # ----------------------------------------------------

        if model is not None:

            ml_events = analyze_ml_events(
                audio
            )

        else:

            ml_events = []


        # ----------------------------------------------------
        # FINAL RESPONSE
        # ----------------------------------------------------

        return {

            "status": "success",

            "filename": file.filename,

            "duration": round(
                duration,
                2
            ),

            "estimated_db": round(
                estimated_db,
                2
            ),

            "peak_db": round(
                peak_db,
                2
            ),

            "spectral_centroid": round(

                float(
                    np.mean(
                        spectral_centroid
                    )
                ),

                2

            ),

            "spectral_bandwidth": round(

                float(
                    np.mean(
                        spectral_bandwidth
                    )
                ),

                2

            ),

            "zero_crossing_rate": round(

                float(
                    np.mean(
                        zcr
                    )
                ),

                4

            ),

            "timeline": timeline,

            "ml_detection": {

                "model": "Random Forest",

                "classes": [
                    str(c)
                    for c in classes
                ],

                "events": ml_events

            }

        }


    except Exception as e:

        return {

            "status": "error",

            "message": str(e)

        }


    finally:

        # ----------------------------------------------------
        # DELETE TEMPORARY FILES
        # ----------------------------------------------------

        for path in [

            temp_input,

            temp_audio

        ]:

            if (

                path

                and

                os.path.exists(path)

            ):

                try:

                    os.remove(
                        path
                    )

                except Exception:

                    pass
        # ============================================================
# GEMINI AI CHATBOT
# ============================================================

@app.post("/chat")
async def chat_with_ai(request: ChatRequest):

    if request.analysis:

        analysis_context = json.dumps(
            request.analysis,
            indent=2
        )

    else:

        analysis_context = (
            "No AuralGuard analysis is currently available."
        )

    system_instruction = """
You are AuralGuard AI, an intelligent assistant
for the AuralGuard noise pollution detection system.

You help users understand:

- Noise pollution
- Detected noise sources
- Machine-learning results
- Confidence scores
- Severity
- Noise timeline
- Estimated audio levels
- Causes of noise
- Noise prevention
- Noise reduction
- Noise control

Use the supplied AuralGuard analysis when relevant.

Never invent:
- detected sources
- confidence values
- measurements
- timeline events

If information is unavailable, clearly say so.

AuralGuard currently produces estimated digital
audio levels. Do not describe these as calibrated
environmental dB SPL measurements unless a calibrated
measurement system is being used.

Give clear and practical answers suitable for
a college project user.
"""

    user_prompt = f"""
CURRENT AURALGUARD ANALYSIS:

{analysis_context}


USER QUESTION:

{request.message}
"""

    try:

        response = gemini_client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7,
                max_output_tokens=300
            )
        )

        return {
            "status": "success",
            "reply": response.text
        }
    except Exception as e:

        print("Gemini error:", repr(e))

        return {
            "status": "error",
            "reply": f"Gemini error: {str(e)}"
        }


# ============================================================
# FRONTEND STATIC FILES SERVING (Executable Website)
# ============================================================

FRONTEND_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "frontend"))
if os.path.exists(FRONTEND_DIR):
    app.mount("/app", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend_app")
