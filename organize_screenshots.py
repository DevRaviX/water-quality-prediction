
import os
import glob
import shutil

ARTIFACT_DIR = "/Users/ravigupta/.gemini/antigravity/brain/e561d473-33ee-41eb-b9f6-658f06d7fadc"
TARGET_DIR = "Visualisations/golden_master"
os.makedirs(TARGET_DIR, exist_ok=True)

MAPPING = {
    "golden_1a_predictor_filled": "1a_Predictor_Input.png",
    "golden_1b_predictor_result": "1b_Predictor_Result.png",
    "golden_2_analytics": "2_Analytics_Dashboard.png",
    "golden_3a_datalab_upload": "3a_DataLab_Upload.png",
    "golden_3b_datalab_eda": "3b_DataLab_EDA.png",
    "golden_3c_datalab_verify": "3c_DataLab_Verification.png",
    "golden_3d_datalab_results": "3d_DataLab_Results.png",
    "golden_4_report": "4_Project_Report.png"
}

for pattern, target_name in MAPPING.items():
    # Find all matches for this pattern
    matches = glob.glob(os.path.join(ARTIFACT_DIR, f"{pattern}*.png"))
    
    if not matches:
        print(f"Warning: No matches found for {pattern}")
        continue
        
    # Get the latest file
    latest_file = max(matches, key=os.path.getmtime)
    print(f"Found latest for {pattern}: {latest_file}")
    
    # Destination paths
    target_path_viz = os.path.join(TARGET_DIR, target_name)
    target_path_artifact = os.path.join(ARTIFACT_DIR, target_name)
    
    # Copy to Visualisations (User Project)
    shutil.copy2(latest_file, target_path_viz)
    
    # Copy (Rename) in Artifact Dir (For Embedding) - Rename creates the clean link
    shutil.copy2(latest_file, target_path_artifact)
    print(f"Processed {target_name}")

print("Done organization.")
