import os
import shutil
import pandas as pd

# ==============================
# PATHS
# ==============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

ESC50_DIR = os.path.join(
    BASE_DIR,
    "ESC-50-master",
    "ESC-50-master"
)

META_FILE = os.path.join(
    ESC50_DIR,
    "meta",
    "esc50.csv"
)

AUDIO_DIR = os.path.join(
    ESC50_DIR,
    "audio"
)

DATASET_DIR = os.path.join(
    BASE_DIR,
    "dataset"
)

# ==============================
# AURALGUARD TARGET CLASSES
# ==============================

TARGET_CLASSES = [
    "airplane",
    "car_horn",
    "chainsaw",
    "church_bells",
    "clock_alarm",
    "engine",
    "fireworks",
    "helicopter",
    "siren",
    "train"
]

# Samples per class
SAMPLES_PER_CLASS = 40

# ==============================
# CHECK PATHS
# ==============================

if not os.path.exists(META_FILE):
    raise FileNotFoundError(
        f"Metadata file not found:\n{META_FILE}"
    )

if not os.path.exists(AUDIO_DIR):
    raise FileNotFoundError(
        f"Audio folder not found:\n{AUDIO_DIR}"
    )

# ==============================
# LOAD METADATA
# ==============================

df = pd.read_csv(META_FILE)

print("=" * 65)
print("AURALGUARD - ESC-50 DATASET PREPARATION")
print("=" * 65)

print(f"\nTotal ESC-50 files available: {len(df)}")

# ==============================
# CREATE DATASET FOLDERS
# ==============================

for category in TARGET_CLASSES:

    folder_path = os.path.join(
        DATASET_DIR,
        category
    )

    os.makedirs(
        folder_path,
        exist_ok=True
    )

# ==============================
# COPY FILES
# ==============================

total_copied = 0

for category in TARGET_CLASSES:

    target_path = os.path.join(
        DATASET_DIR,
        category
    )

    matching = df[
        df["category"] == category
    ]

    available = len(matching)

    selected = matching.head(
        SAMPLES_PER_CLASS
    )

    copied = 0

    print("\n" + "-" * 65)
    print(f"Class     : {category}")
    print(f"Available : {available}")
    print(f"Target    : {SAMPLES_PER_CLASS}")

    for _, row in selected.iterrows():

        filename = row["filename"]

        source_file = os.path.join(
            AUDIO_DIR,
            filename
        )

        destination_file = os.path.join(
            target_path,
            filename
        )

        if not os.path.exists(source_file):
            print(f"Missing: {filename}")
            continue

        if not os.path.exists(destination_file):

            shutil.copy2(
                source_file,
                destination_file
            )

            copied += 1
            total_copied += 1

    print(f"Copied    : {copied}")

# ==============================
# FINAL SUMMARY
# ==============================

print("\n" + "=" * 65)
print("AURALGUARD DATASET SUMMARY")
print("=" * 65)

grand_total = 0

for category in TARGET_CLASSES:

    folder_path = os.path.join(
        DATASET_DIR,
        category
    )

    files = [
        f for f in os.listdir(folder_path)
        if f.lower().endswith(".wav")
    ]

    count = len(files)

    grand_total += count

    print(
        f"{category:<20} : {count}"
    )

print("-" * 65)
print(
    f"{'TOTAL':<20} : {grand_total}"
)
print("=" * 65)

print("\nDataset preparation completed successfully!")