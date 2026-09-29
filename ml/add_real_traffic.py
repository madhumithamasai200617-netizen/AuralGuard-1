import os

import librosa
import soundfile as sf


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

INPUT_FILE = r"C:\Users\madhu\Downloads\AMBTraf_Trafic at the geofon 2 (ID 2753)_BigSoundBank.com.wav"

TRAFFIC_DIR = os.path.join(
    BASE_DIR,
    "dataset",
    "traffic"
)

SAMPLE_RATE = 22050
DURATION = 3
TARGET_SAMPLES = SAMPLE_RATE * DURATION


def main():

    os.makedirs(TRAFFIC_DIR, exist_ok=True)

    print("Loading real traffic recording...")

    audio, _ = librosa.load(
        INPUT_FILE,
        sr=SAMPLE_RATE,
        mono=True
    )

    total_duration = len(audio) / SAMPLE_RATE

    print(f"Duration: {total_duration:.2f} seconds")
    print(f"Sample rate: {SAMPLE_RATE}")
    print()

    count = 0

    start = 0

    while start + TARGET_SAMPLES <= len(audio):

        end = start + TARGET_SAMPLES

        segment = audio[start:end]

        count += 1

        filename = f"traffic_real_{count:03d}.wav"

        output_path = os.path.join(
            TRAFFIC_DIR,
            filename
        )

        sf.write(
            output_path,
            segment,
            SAMPLE_RATE
        )

        print(
            f"{filename}  "
            f"({start / SAMPLE_RATE:.1f}s - "
            f"{end / SAMPLE_RATE:.1f}s)"
        )

        start += TARGET_SAMPLES

    print()
    print("========================================")
    print("REAL TRAFFIC SAMPLES CREATED")
    print("========================================")
    print(f"Location: {TRAFFIC_DIR}")
    print(f"New samples: {count}")


if __name__ == "__main__":
    main()