import os
import random
import numpy as np
import librosa
import soundfile as sf

# ============================================================
# AURALGUARD DATASET AUGMENTATION ENGINE
# Keeps strict distinction between:
# - Original recordings (ESC-50)
# - Synthetic mixtures (traffic_001.wav)
# - Real-world field recordings (traffic_real_001.wav)
# - Augmented recordings (aug_vol_, aug_shift_, aug_noise_, aug_pitch_, aug_speed_)
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

SAMPLE_RATE = 22050
DURATION = 3
TARGET_SAMPLES = SAMPLE_RATE * DURATION

random.seed(42)
np.random.seed(42)

# Audio augmentation functions

def augment_volume(audio, factor=None):
    """Scale audio gain by random factor between 0.75 and 1.25."""
    if factor is None:
        factor = random.uniform(0.75, 1.25)
    augmented = audio * factor
    peak = np.max(np.abs(augmented))
    if peak > 1.0:
        augmented = augmented / peak
    return augmented.astype(np.float32)


def augment_shift(audio, shift_ratio=None):
    """Circularly shift audio waveform."""
    if shift_ratio is None:
        shift_ratio = random.uniform(0.1, 0.3)
    shift_samples = int(len(audio) * shift_ratio)
    augmented = np.roll(audio, shift_samples)
    return augmented.astype(np.float32)


def augment_noise(audio, snr_db=30):
    """Inject subtle Gaussian background noise."""
    signal_power = np.mean(audio ** 2)
    if signal_power <= 1e-10:
        return audio
    noise_power = signal_power / (10 ** (snr_db / 10))
    noise = np.random.normal(0, np.sqrt(noise_power), len(audio))
    augmented = audio + noise
    peak = np.max(np.abs(augmented))
    if peak > 1.0:
        augmented = augmented / peak
    return augmented.astype(np.float32)


def augment_pitch(audio, n_steps=None):
    """Pitch shift audio by ±1.5 semitones."""
    if n_steps is None:
        n_steps = random.choice([-1.5, -1.0, 1.0, 1.5])
    try:
        augmented = librosa.effects.pitch_shift(audio, sr=SAMPLE_RATE, n_steps=n_steps)
        if len(augmented) < TARGET_SAMPLES:
            augmented = np.pad(augmented, (0, TARGET_SAMPLES - len(augmented)))
        else:
            augmented = augmented[:TARGET_SAMPLES]
        return augmented.astype(np.float32)
    except Exception:
        return audio


def augment_speed(audio, rate=None):
    """Speed variation between 0.95x and 1.05x stretch."""
    if rate is None:
        rate = random.choice([0.95, 1.05])
    try:
        augmented = librosa.effects.time_stretch(audio, rate=rate)
        if len(augmented) < TARGET_SAMPLES:
            augmented = np.pad(augmented, (0, TARGET_SAMPLES - len(augmented)))
        else:
            augmented = augmented[:TARGET_SAMPLES]
        return augmented.astype(np.float32)
    except Exception:
        return audio


def load_and_fix_length(file_path):
    audio, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
    if len(audio) < TARGET_SAMPLES:
        audio = np.pad(audio, (0, TARGET_SAMPLES - len(audio)))
    else:
        audio = audio[:TARGET_SAMPLES]
    return audio.astype(np.float32)


def process_dataset_augmentation():
    print("==========================================================")
    print(" AURALGUARD DATASET AUGMENTATION")
    print("==========================================================\n")

    classes = sorted([
        d for d in os.listdir(DATASET_DIR)
        if os.path.isdir(os.path.join(DATASET_DIR, d))
    ])

    total_new_augmented = 0

    for class_name in classes:
        class_dir = os.path.join(DATASET_DIR, class_name)
        
        # Get existing original/real/synth files (ignore existing aug_ files for idempotency)
        all_files = [f for f in os.listdir(class_dir) if f.lower().endswith(('.wav', '.mp3', '.flac'))]
        base_files = [f for f in all_files if not f.startswith("aug_")]

        if not base_files:
            continue

        print(f"Class '{class_name}': {len(base_files)} base files found.")

        target_total = 100
        needed_aug = max(0, target_total - len(all_files))

        if needed_aug == 0:
            print(f"  Class '{class_name}' already has {len(all_files)} total files. Skipping.\n")
            continue

        aug_created = 0
        aug_types = [augment_volume, augment_shift, augment_noise, augment_pitch, augment_speed]
        aug_names = ["aug_vol", "aug_shift", "aug_noise", "aug_pitch", "aug_speed"]

        while aug_created < needed_aug:
            # Pick a base file
            source_file = random.choice(base_files)
            source_path = os.path.join(class_dir, source_file)
            audio = load_and_fix_length(source_path)

            # Pick an augmentation type
            idx = random.randint(0, len(aug_types) - 1)
            aug_func = aug_types[idx]
            aug_prefix = aug_names[idx]

            augmented_audio = aug_func(audio)

            output_filename = f"{aug_prefix}_{aug_created + 1:03d}_{source_file}"
            output_path = os.path.join(class_dir, output_filename)

            sf.write(output_path, augmented_audio, SAMPLE_RATE)
            aug_created += 1
            total_new_augmented += 1

        print(f"  Generated {aug_created} augmented samples for '{class_name}'. Total now: {len(os.listdir(class_dir))}\n")

    print("==========================================================")
    print(f" AUGMENTATION COMPLETE — Generated {total_new_augmented} new audio files")
    print("==========================================================\n")


if __name__ == "__main__":
    process_dataset_augmentation()
