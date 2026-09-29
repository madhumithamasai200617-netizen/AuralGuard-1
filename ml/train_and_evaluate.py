import os
import re
import numpy as np
import librosa
import joblib

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GroupKFold
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

# ============================================================
# AURALGUARD - PHASE 1 ML RELIABILITY & MODEL COMPARISON
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_PATH = os.path.join(BASE_DIR, "auralguard_noise_model.pkl")
INDEPENDENT_TEST_FILE = os.path.join(BASE_DIR, "real_traffic_test.wav")

SAMPLE_RATE = 22050
DURATION = 3
SAMPLES_PER_FILE = SAMPLE_RATE * DURATION

def extract_features(file_path):
    """
    Extract 90 audio features:
    - MFCC (20 mean + 20 std = 40)
    - Mel Spectrogram (40 mean = 40)
    - RMS Energy (mean + std = 2)
    - Spectral Centroid (mean + std = 2)
    - Spectral Bandwidth (mean + std = 2)
    - Zero Crossing Rate (mean + std = 2)
    - Spectral Rolloff (mean + std = 2)
    Total = 90 features
    """
    try:
        audio, sr = librosa.load(file_path, sr=SAMPLE_RATE, duration=DURATION, mono=True)
        if len(audio) < SAMPLES_PER_FILE:
            audio = np.pad(audio, (0, SAMPLES_PER_FILE - len(audio)))
        else:
            audio = audio[:SAMPLES_PER_FILE]

        features = []

        # 1. MFCC
        mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=20)
        features.extend(np.mean(mfcc, axis=1))
        features.extend(np.std(mfcc, axis=1))

        # 2. MEL SPECTROGRAM
        mel = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=40, fmax=sr // 2)
        mel_db = librosa.power_to_db(mel, ref=np.max)
        features.extend(np.mean(mel_db, axis=1))

        # 3. RMS ENERGY
        rms = librosa.feature.rms(y=audio)
        features.append(np.mean(rms))
        features.append(np.std(rms))

        # 4. SPECTRAL CENTROID
        centroid = librosa.feature.spectral_centroid(y=audio, sr=sr)
        features.append(np.mean(centroid))
        features.append(np.std(centroid))

        # 5. SPECTRAL BANDWIDTH
        bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sr)
        features.append(np.mean(bandwidth))
        features.append(np.std(bandwidth))

        # 6. ZERO CROSSING RATE
        zcr = librosa.feature.zero_crossing_rate(audio)
        features.append(np.mean(zcr))
        features.append(np.std(zcr))

        # 7. SPECTRAL ROLLOFF
        rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr, roll_percent=0.85)
        features.append(np.mean(rolloff))
        features.append(np.std(rolloff))

        return np.array(features, dtype=np.float32)

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


def get_group_id(filename):
    """
    Extract source group ID from filename to prevent data leakage.
    Clips and augmented variations originating from the same source file share the same group ID.
    """
    clean_name = filename
    if clean_name.startswith("aug_"):
        parts = clean_name.split("_", 3)
        if len(parts) >= 4:
            clean_name = parts[3]

    # ESC-50 filename pattern: fold-id-take-class.wav (e.g. 1-100038-A-14.wav)
    match = re.search(r'^\d+-(\d+)-[A-Z]-\d+\.wav', clean_name)
    if match:
        return f"esc50_{match.group(1)}"
    
    # Group by base clip name so augmented variations stay together while clips are distributed
    base = os.path.splitext(clean_name)[0]
    return f"group_{base}"


def load_dataset_with_groups():
    X, y, groups = [], [], []

    print("\n==============================================", flush=True)
    print(" AURALGUARD DATASET LOADING & GROUP PARSING", flush=True)
    print("==============================================\n", flush=True)

    classes = sorted([
        folder for folder in os.listdir(DATASET_DIR)
        if os.path.isdir(os.path.join(DATASET_DIR, folder))
    ])

    for class_name in classes:
        class_path = os.path.join(DATASET_DIR, class_name)
        files = [
            f for f in os.listdir(class_path)
            if f.lower().endswith((".wav", ".mp3", ".flac", ".ogg", ".m4a"))
        ]

        processed = 0
        for file_name in files:
            file_path = os.path.join(class_path, file_name)
            features = extract_features(file_path)
            if features is not None:
                group_id = get_group_id(file_name)
                X.append(features)
                y.append(class_name)
                groups.append(group_id)
                processed += 1

        print(f"  {class_name:18s}: {processed} samples extracted")

    return np.array(X), np.array(y), np.array(groups)


def evaluate_models():
    X, y, groups = load_dataset_with_groups()
    classes = sorted(list(set(y)))

    print("\n==============================================")
    print(" DATASET SUMMARY")
    print("==============================================")
    print(f"Total samples : {len(X)}")
    print(f"Feature count : {X.shape[1]}")
    print(f"Unique groups : {len(set(groups))}")
    print(f"Class count   : {len(classes)}")

    # Models to compare
    candidate_models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=300, max_depth=None, min_samples_split=2,
            random_state=42, n_jobs=-1, class_weight="balanced"
        ),
        "ExtraTrees": ExtraTreesClassifier(
            n_estimators=300, max_depth=None, min_samples_split=2,
            random_state=42, n_jobs=-1, class_weight="balanced"
        ),
        "HistGradientBoosting": HistGradientBoostingClassifier(
            max_iter=200, random_state=42, class_weight="balanced"
        ),
        "SVM_RBF": SVC(
            kernel="rbf", C=10.0, gamma="scale", probability=True,
            random_state=42, class_weight="balanced"
        )
    }

    gkf = GroupKFold(n_splits=5)

    print("\n==============================================")
    print(" PHASE 1 — MODEL COMPARISON (5-FOLD GROUP CROSS-VALIDATION)")
    print("==============================================")

    best_model_name = None
    best_val_f1 = -1.0
    model_results = {}

    for name, model_obj in candidate_models.items():
        val_accs = []
        val_precisions = []
        val_recalls = []
        val_f1s = []
        all_y_true = []
        all_y_pred = []

        for train_idx, val_idx in gkf.split(X, y, groups=groups):
            X_train, X_val = X[train_idx], X[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]

            # Fit scaler if needed (for SVM/GB)
            if "SVM" in name:
                scaler = StandardScaler()
                X_train = scaler.fit_transform(X_train)
                X_val = scaler.transform(X_val)

            model_obj.fit(X_train, y_train)
            y_pred = model_obj.predict(X_val)

            acc = accuracy_score(y_val, y_pred)
            prec, rec, f1, _ = precision_recall_fscore_support(
                y_val, y_pred, average="weighted", zero_division=0
            )

            val_accs.append(acc)
            val_precisions.append(prec)
            val_recalls.append(rec)
            val_f1s.append(f1)

            all_y_true.extend(y_val)
            all_y_pred.extend(y_pred)

        mean_acc = np.mean(val_accs)
        mean_prec = np.mean(val_precisions)
        mean_rec = np.mean(val_recalls)
        mean_f1 = np.mean(val_f1s)

        model_results[name] = {
            "accuracy": mean_acc,
            "precision": mean_prec,
            "recall": mean_rec,
            "f1_score": mean_f1,
            "y_true": all_y_true,
            "y_pred": all_y_pred
        }

        print(f"\nModel: {name:22s}")
        print(f"  Validation Accuracy : {mean_acc * 100:.2f}%")
        print(f"  Validation Precision: {mean_prec * 100:.2f}%")
        print(f"  Validation Recall   : {mean_rec * 100:.2f}%")
        print(f"  Validation F1-Score : {mean_f1 * 100:.2f}%")

        if mean_f1 > best_val_f1:
            best_val_f1 = mean_f1
            best_model_name = name

    print("\n==============================================")
    print(f" WINNING MODEL: {best_model_name} (F1: {best_val_f1*100:.2f}%)")
    print("==============================================")

    # Detailed report for winner
    winner_res = model_results[best_model_name]
    print("\nClassification Report (Group Validation):\n")
    print(classification_report(winner_res["y_true"], winner_res["y_pred"], zero_division=0))

    print("\nConfusion Matrix (Group Validation):\n")
    cm = confusion_matrix(winner_res["y_true"], winner_res["y_pred"], labels=classes)
    print(f"Classes: {classes}")
    print(cm)

    # Train final winner model on entire dataset
    final_model = candidate_models[best_model_name]
    scaler = None
    X_final = X.copy()
    if "SVM" in best_model_name:
        scaler = StandardScaler()
        X_final = scaler.fit_transform(X_final)

    final_model.fit(X_final, y)

    # Independent Real-World Performance Evaluation
    print("\n==============================================")
    print(" INDEPENDENT REAL-WORLD PERFORMANCE EVALUATION")
    print("==============================================")
    if os.path.exists(INDEPENDENT_TEST_FILE):
        print(f"Evaluating independent real-world test recording:\n  {INDEPENDENT_TEST_FILE}")
        indep_features = extract_features(INDEPENDENT_TEST_FILE)
        if indep_features is not None:
            feat_vec = indep_features.reshape(1, -1)
            if scaler is not None:
                feat_vec = scaler.transform(feat_vec)
            
            probs = final_model.predict_proba(feat_vec)[0]
            top_idx = np.argmax(probs)
            top_class = final_model.classes_[top_idx]
            top_conf = probs[top_idx] * 100

            print(f"\n  Independent Test Prediction : {top_class}")
            print(f"  Independent Test Confidence : {top_conf:.2f}%")
            print("  Top 3 Probability Distribution:")
            top_3_idx = np.argsort(probs)[::-1][:3]
            for idx in top_3_idx:
                print(f"    - {final_model.classes_[idx]:15s}: {probs[idx]*100:6.2f}%")
    else:
        print(f"Note: Independent test file {INDEPENDENT_TEST_FILE} not found. Skipping single-file test.")

    # Save best model to MODEL_PATH
    model_data = {
        "model": final_model,
        "classes": np.array(classes),
        "sample_rate": SAMPLE_RATE,
        "duration": DURATION,
        "feature_count": X.shape[1],
        "scaler": scaler,
        "model_name": best_model_name,
        "validation_accuracy": winner_res["accuracy"],
        "validation_f1": winner_res["f1_score"]
    }

    joblib.dump(model_data, MODEL_PATH)

    print("\n==============================================")
    print(" MODEL SAVED")
    print("==============================================")
    print(f"Model saved to: {MODEL_PATH}")
    print(f"Model Architecture: {best_model_name}")
    print(f"Validation F1-Score: {best_val_f1 * 100:.2f}%")
    print("Phase 1 ML training and validation finished successfully.")


if __name__ == "__main__":
    evaluate_models()
