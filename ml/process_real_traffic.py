import os
import glob
import librosa
import soundfile as sf

INPUT_DIR = r".\real_traffic_sources"
OUTPUT_DIR = r".\dataset\traffic"

os.makedirs(OUTPUT_DIR, exist_ok=True)

files = glob.glob(os.path.join(INPUT_DIR, "*.wav"))

# Skip the Geofon recording because its 8 clips are already in the dataset
files = [
    f for f in files
    if "geofon" not in os.path.basename(f).lower()
]

# Find the next available traffic_real number
existing = glob.glob(os.path.join(OUTPUT_DIR, "traffic_real_*.wav"))
next_number = len(existing) + 1

print(f"Found {len(files)} new traffic recordings.")

for file_path in files:
    name = os.path.basename(file_path)

    print(f"\nProcessing: {name}")

    audio, sr = librosa.load(
        file_path,
        sr=22050,
        mono=True
    )

    clip_length = 3 * sr
    total_clips = len(audio) // clip_length

    for i in range(total_clips):
        start = i * clip_length
        end = start + clip_length

        clip = audio[start:end]

        output_name = f"traffic_real_{next_number:03d}.wav"
        output_path = os.path.join(OUTPUT_DIR, output_name)

        sf.write(output_path, clip, sr)

        print(f"  Created {output_name}")

        next_number += 1

print("\nREAL TRAFFIC PROCESSING COMPLETE")