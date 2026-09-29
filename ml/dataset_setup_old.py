from pathlib import Path
import requests

DATASET_URL = "https://zenodo.org/records/1203745/files/UrbanSound8K.tar.gz"

output_dir = Path("dataset")
output_dir.mkdir(exist_ok=True)

print("AuralGuard dataset setup")
print("------------------------")
print()
print("We are NOT downloading the full dataset yet.")
print("The next step will create a small filtered dataset.")