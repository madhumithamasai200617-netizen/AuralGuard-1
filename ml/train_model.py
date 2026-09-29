import os
import numpy as np
import librosa
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ============================================================
# AURALGUARD - IMPROVED NOISE CLASSIFICATION MODEL
# ============================================================

# Dataset location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

# Output model
MODEL_PATH = os.path.join(BASE_DIR, "auralguard_noise_model.pkl")

# Audio settings
SAMPLE_RATE = 22050
DURATION = 3
SAMPLES_PER_FILE = SAMPLE_RATE * DURATION


# ------------------------------------------------------------
# FEATURE EXTRACTION
# ------------------------------------------------------------

def extract_features(file_path):
    """
    Extract multiple audio features from a 3-second audio file.

    Features:
    - MFCC
    - Mel Spectrogram
    - RMS Energy
    - Spectral Centroid
    - Spectral Bandwidth
    - Zero Crossing Rate
    - Spectral Rolloff
    """

    try:
        # Load audio
        audio, sr = librosa.load(
            file_path,
            sr=SAMPLE_RATE,
            duration=DURATION
        )

        # Make every audio file exactly 3 seconds
        if len(audio) < SAMPLES_PER_FILE:
            audio = np.pad(
                audio,
                (0, SAMPLES_PER_FILE - len(audio))
            )
        else:
            audio = audio[:SAMPLES_PER_FILE]

        features = []

        # ====================================================
        # 1. MFCC
        # ====================================================

        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=sr,
            n_mfcc=20
        )

        mfcc_mean = np.mean(mfcc, axis=1)
        mfcc_std = np.std(mfcc, axis=1)

        features.extend(mfcc_mean)
        features.extend(mfcc_std)

        # ====================================================
        # 2. MEL SPECTROGRAM
        # ====================================================

        mel = librosa.feature.melspectrogram(
            y=audio,
            sr=sr,
            n_mels=40,
            fmax=sr // 2
        )

        mel_db = librosa.power_to_db(
            mel,
            ref=np.max
        )

        mel_mean = np.mean(mel_db, axis=1)

        features.extend(mel_mean)

        # ====================================================
        # 3. RMS ENERGY
        # ====================================================

        rms = librosa.feature.rms(y=audio)

        rms_mean = np.mean(rms)
        rms_std = np.std(rms)

        features.append(rms_mean)
        features.append(rms_std)

        # ====================================================
        # 4. SPECTRAL CENTROID
        # ====================================================

        centroid = librosa.feature.spectral_centroid(
            y=audio,
            sr=sr
        )

        features.append(np.mean(centroid))
        features.append(np.std(centroid))

        # ====================================================
        # 5. SPECTRAL BANDWIDTH
        # ====================================================

        bandwidth = librosa.feature.spectral_bandwidth(
            y=audio,
            sr=sr
        )

        features.append(np.mean(bandwidth))
        features.append(np.std(bandwidth))

        # ====================================================
        # 6. ZERO CROSSING RATE
        # ====================================================

        zcr = librosa.feature.zero_crossing_rate(
            audio
        )

        features.append(np.mean(zcr))
        features.append(np.std(zcr))

        # ====================================================
        # 7. SPECTRAL ROLLOFF
        # ====================================================

        rolloff = librosa.feature.spectral_rolloff(
            y=audio,
            sr=sr,
            roll_percent=0.85
        )

        features.append(np.mean(rolloff))
        features.append(np.std(rolloff))

        # ====================================================
        # FINAL FEATURE VECTOR
        # ====================================================

        return np.array(features, dtype=np.float32)

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


# ------------------------------------------------------------
# LOAD DATASET
# ------------------------------------------------------------

def load_dataset():

    X = []
    y = []

    print("\n==============================================")
    print(" AURALGUARD ML DATASET LOADING")
    print("==============================================\n")

    if not os.path.exists(DATASET_DIR):
        raise FileNotFoundError(
            f"Dataset folder not found: {DATASET_DIR}"
        )

    # Get class folders
    classes = sorted([
        folder for folder in os.listdir(DATASET_DIR)
        if os.path.isdir(os.path.join(DATASET_DIR, folder))
    ])

    if not classes:
        raise RuntimeError(
            "No class folders found inside dataset folder."
        )

    print("Classes found:")

    for class_name in classes:
        print(f"  - {class_name}")

    print()

    # Process every class
    for class_name in classes:

        class_path = os.path.join(
            DATASET_DIR,
            class_name
        )

        files = [
            file for file in os.listdir(class_path)
            if file.lower().endswith(
                (".wav", ".mp3", ".flac", ".ogg", ".m4a")
            )
        ]

        print(
            f"Processing {class_name}: "
            f"{len(files)} files"
        )

        successful = 0

        for file_name in files:

            file_path = os.path.join(
                class_path,
                file_name
            )

            feature_vector = extract_features(
                file_path
            )

            if feature_vector is not None:

                X.append(feature_vector)
                y.append(class_name)

                successful += 1

        print(
            f"  Successfully processed: "
            f"{successful}"
        )

    if len(X) == 0:
        raise RuntimeError(
            "No audio features were extracted."
        )

    X = np.array(X)
    y = np.array(y)

    print("\n==============================================")
    print(" DATASET SUMMARY")
    print("==============================================")

    print(f"Total samples : {len(X)}")
    print(f"Feature count : {X.shape[1]}")
    print(f"Classes       : {sorted(set(y))}")

    for class_name in sorted(set(y)):
        count = np.sum(y == class_name)
        print(
            f"{class_name:12s}: {count} samples"
        )

    return X, y


# ------------------------------------------------------------
# TRAIN MODEL
# ------------------------------------------------------------

def train_model():

    X, y = load_dataset()

    print("\n==============================================")
    print(" TRAINING AURALGUARD MODEL")
    print("==============================================\n")

    # Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples : {len(X_test)}")

    # ========================================================
    # RANDOM FOREST
    # ========================================================

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1,
        class_weight="balanced"
    )

    print("\nTraining Random Forest...")

    model.fit(
        X_train,
        y_train
    )

    print("Training completed.")

    # ========================================================
    # TEST MODEL
    # ========================================================

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    print("\n==============================================")
    print(" MODEL PERFORMANCE")
    print("==============================================")

    print(
        f"\nAccuracy: {accuracy * 100:.2f}%"
    )

    print("\nClassification Report:\n")

    print(
        classification_report(
            y_test,
            y_pred,
            zero_division=0
        )
    )

    # ========================================================
    # CONFUSION MATRIX
    # ========================================================

    print("Confusion Matrix:\n")

    labels = sorted(set(y))

    matrix = confusion_matrix(
        y_test,
        y_pred,
        labels=labels
    )

    print("Classes:")
    print(labels)
    print()

    print(matrix)

    # ========================================================
    # SAVE MODEL
    # ========================================================

    model_data = {
        "model": model,
        "classes": model.classes_,
        "sample_rate": SAMPLE_RATE,
        "duration": DURATION,
        "feature_count": X.shape[1]
    }

    joblib.dump(
        model_data,
        MODEL_PATH
    )

    print("\n==============================================")
    print(" MODEL SAVED")
    print("==============================================")

    print(
        f"\nModel location:\n{MODEL_PATH}"
    )

    print(
        f"\nClasses:\n{model.classes_}"
    )

    print(
        f"\nFeature count:\n{X.shape[1]}"
    )

    print("\nAuralGuard ML training finished successfully.")


# ------------------------------------------------------------
# MAIN
# ------------------------------------------------------------

if __name__ == "__main__":

    try:
        train_model()

    except Exception as e:

        print("\n==============================================")
        print(" TRAINING ERROR")
        print("==============================================")

        print(f"\n{e}")

        print(
            "\nPlease check your dataset and Python environment."
        )