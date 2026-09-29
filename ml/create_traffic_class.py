import os
import random

import librosa
import numpy as np
import soundfile as sf


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_DIR = os.path.join(BASE_DIR, "dataset")
TRAFFIC_DIR = os.path.join(DATASET_DIR, "traffic")

SAMPLE_RATE = 22050
DURATION = 3
TARGET_SAMPLES = SAMPLE_RATE * DURATION

NUM_TRAFFIC_FILES = 40

SOURCE_CLASSES = [
    "car_horn",
    "engine",
    "siren"
]

random.seed(42)
np.random.seed(42)


def load_audio(path):
    audio, _ = librosa.load(
        path,
        sr=SAMPLE_RATE,
        mono=True
    )

    if len(audio) < TARGET_SAMPLES:
        audio = np.pad(
            audio,
            (0, TARGET_SAMPLES - len(audio))
        )
    else:
        audio = audio[:TARGET_SAMPLES]

    return audio.astype(np.float32)


def normalize(audio):
    peak = np.max(np.abs(audio))

    if peak > 0:
        audio = audio / peak

    return audio


def get_files(class_name):
    folder = os.path.join(DATASET_DIR, class_name)

    return [
        os.path.join(folder, filename)
        for filename in os.listdir(folder)
        if filename.lower().endswith(".wav")
    ]


def create_traffic_sample(index, source_files):
    selected_classes = random.sample(
        SOURCE_CLASSES,
        k=random.choice([2, 3])
    )

    mixed = np.zeros(TARGET_SAMPLES, dtype=np.float32)

    for class_name in selected_classes:

        file_path = random.choice(source_files[class_name])

        audio = load_audio(file_path)

        # Random volume contribution
        volume = random.uniform(0.25, 0.60)

        mixed += audio * volume

    mixed = normalize(mixed)

    # Keep a little headroom to avoid clipping
    mixed = mixed * 0.95

    output_name = f"traffic_{index:03d}.wav"
    output_path = os.path.join(
        TRAFFIC_DIR,
        output_name
    )

    sf.write(
        output_path,
        mixed,
        SAMPLE_RATE
    )

    return output_name, selected_classes


def main():

    os.makedirs(
        TRAFFIC_DIR,
        exist_ok=True
    )

    source_files = {}

    for class_name in SOURCE_CLASSES:

        files = get_files(class_name)

        if not files:
            raise RuntimeError(
                f"No WAV files found in dataset/{class_name}"
            )

        source_files[class_name] = files

        print(
            f"{class_name}: {len(files)} files"
        )

    print()
    print("Creating synthetic traffic class...")
    print()

    for index in range(1, NUM_TRAFFIC_FILES + 1):

        filename, sources = create_traffic_sample(
            index,
            source_files
        )

        print(
            f"{filename} <- "
            f"{', '.join(sources)}"
        )

    print()
    print("========================================")
    print("Traffic class created successfully")
    print("========================================")
    print(f"Location: {TRAFFIC_DIR}")
    print(f"Files: {NUM_TRAFFIC_FILES}")
    print(f"Sample rate: {SAMPLE_RATE}")
    print(f"Duration: {DURATION} seconds")


if __name__ == "__main__":
    main()