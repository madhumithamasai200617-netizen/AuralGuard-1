import os
import sys
import joblib
import librosa
import numpy as np


# ============================================
# AURALGUARD ML PREDICTION
# ============================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "auralguard_noise_model.pkl"
)

SAMPLE_RATE = 22050
DURATION = 3
SAMPLES_PER_FILE = SAMPLE_RATE * DURATION


# ============================================
# LOAD MODEL
# ============================================

print("AuralGuard ML Prediction")
print("=" * 40)

if not os.path.exists(MODEL_PATH):
    print("ERROR: Model file not found:")
    print(MODEL_PATH)
    sys.exit(1)

model_data = joblib.load(MODEL_PATH)

scaler = None
if isinstance(model_data, dict):
    model = model_data["model"]
    classes = model_data["classes"]
    scaler = model_data.get("scaler", None)

    SAMPLE_RATE = model_data.get(
        "sample_rate",
        SAMPLE_RATE
    )

    DURATION = model_data.get(
        "duration",
        DURATION
    )

    SAMPLES_PER_FILE = SAMPLE_RATE * DURATION

else:
    # Compatibility with a normal sklearn model
    model = model_data
    classes = model.classes_


print("Loaded model classes:")

for class_name in classes:
    print(" -", class_name)

print()
print("Sample rate:", SAMPLE_RATE)
print("Duration:", DURATION, "seconds")
print("Model:", type(model).__name__)
print("=" * 40)


# ============================================
# FEATURE EXTRACTION
# MUST MATCH train_model.py
# ============================================

def extract_features(file_path):

    try:

        audio, sr = librosa.load(
            file_path,
            sr=SAMPLE_RATE,
            mono=True
        )

        # Make exactly 3 seconds
        if len(audio) < SAMPLES_PER_FILE:

            audio = np.pad(
                audio,
                (0, SAMPLES_PER_FILE - len(audio))
            )

        else:

            audio = audio[:SAMPLES_PER_FILE]


        # ------------------------------------
        # MFCC
        # 20 mean + 20 std = 40
        # ------------------------------------

        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=sr,
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


        # ------------------------------------
        # MEL SPECTROGRAM
        # 40 mean = 40
        # ------------------------------------

        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=sr,
            n_mels=40
        )

        mel_db = librosa.power_to_db(
            mel,
            ref=np.max
        )

        mel_mean = np.mean(
            mel_db,
            axis=1
        )


        # ------------------------------------
        # RMS
        # mean + std = 2
        # ------------------------------------

        rms = librosa.feature.rms(
            y=audio
        )

        rms_mean = np.mean(rms)
        rms_std = np.std(rms)


        # ------------------------------------
        # SPECTRAL CENTROID
        # mean + std = 2
        # ------------------------------------

        centroid = librosa.feature.spectral_centroid(
            y=audio,
            sr=sr
        )

        centroid_mean = np.mean(centroid)
        centroid_std = np.std(centroid)


        # ------------------------------------
        # SPECTRAL BANDWIDTH
        # mean + std = 2
        # ------------------------------------

        bandwidth = librosa.feature.spectral_bandwidth(
            y=audio,
            sr=sr
        )

        bandwidth_mean = np.mean(bandwidth)
        bandwidth_std = np.std(bandwidth)


        # ------------------------------------
        # ZERO CROSSING RATE
        # mean + std = 2
        # ------------------------------------

        zcr = librosa.feature.zero_crossing_rate(
            audio
        )

        zcr_mean = np.mean(zcr)
        zcr_std = np.std(zcr)


        # ------------------------------------
        # SPECTRAL ROLLOFF
        # mean + std = 2
        # ------------------------------------

        rolloff = librosa.feature.spectral_rolloff(
            y=audio,
            sr=sr
        )

        rolloff_mean = np.mean(rolloff)
        rolloff_std = np.std(rolloff)


        # ------------------------------------
        # COMBINE FEATURES
        # TOTAL = 90 FEATURES
        # ------------------------------------

        features = np.concatenate([

            mfcc_mean,
            mfcc_std,

            mel_mean,

            [
                rms_mean,
                rms_std
            ],

            [
                centroid_mean,
                centroid_std
            ],

            [
                bandwidth_mean,
                bandwidth_std
            ],

            [
                zcr_mean,
                zcr_std
            ],

            [
                rolloff_mean,
                rolloff_std
            ]

        ])


        return features.astype(
            np.float32
        )


    except Exception as e:

        print()
        print("Feature extraction error:")
        print(e)

        return None


# ============================================
# PREDICT AUDIO
# ============================================

def predict_audio(file_path):

    if not os.path.exists(file_path):

        print()
        print("ERROR: Audio file not found:")
        print(file_path)

        return


    print()
    print("Analyzing:")
    print(file_path)

    features = extract_features(
        file_path
    )

    if features is None:
        return


    print()
    print("Feature count:", len(features))

    # Random Forest expects:
    # (samples, features)

    features = features.reshape(
        1,
        -1
    )

    if scaler is not None:
        features = scaler.transform(features)


    # ------------------------------------
    # PREDICTION
    # ------------------------------------

    prediction = model.predict(
        features
    )

    predicted_class = str(
        prediction[0]
    )


    # ------------------------------------
    # CONFIDENCE
    # ------------------------------------

    if hasattr(
        model,
        "predict_proba"
    ):

        probabilities = model.predict_proba(
            features
        )[0]

        sorted_indices = np.argsort(
            probabilities
        )[::-1]


        print()
        print("Prediction probabilities")
        print("-" * 40)

        for index in sorted_indices:

            class_name = classes[index]

            confidence = (
                probabilities[index] * 100
            )

            print(
                f"{class_name:20s} "
                f"{confidence:6.2f}%"
            )


        best_index = sorted_indices[0]

        best_confidence = (
            probabilities[best_index] * 100
        )

        print()
        print("=" * 40)
        print("FINAL PREDICTION")
        print("=" * 40)

        print(
            "Source:",
            predicted_class
        )

        print(
            "Confidence:",
            f"{best_confidence:.2f}%"
        )

    else:

        print()
        print("=" * 40)
        print("FINAL PREDICTION")
        print("=" * 40)

        print(
            "Source:",
            predicted_class
        )

        print(
            "Confidence:",
            "Not available"
        )


# ============================================
# MAIN
# ============================================

if __name__ == "__main__":

    if len(sys.argv) > 1:

        # Example:
        # python predict.py "file.wav"

        audio_file = sys.argv[1]

    else:

        print()
        print("No audio file provided.")

        print()
        print("Usage:")
        print(
            'python predict.py "path_to_audio.wav"'
        )

        print()
        print("Example:")

        print(
            r'python predict.py "dataset\car_horn\1-xxx-A-xx.wav"'
        )

        sys.exit(0)


    predict_audio(
        audio_file
    )