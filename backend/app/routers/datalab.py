import shutil
import uuid
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd

router = APIRouter()

TEMP_DATA_DIR = "temp_data"
os.makedirs(TEMP_DATA_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Uploads a CSV file and creates a new session.
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    session_id = str(uuid.uuid4())
    file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
    
    try:
        with open(file_location, "wb+") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Quick validation that it's a readable CSV
        pd.read_csv(file_location, nrows=5)
        
    except Exception as e:
        if os.path.exists(file_location):
            os.remove(file_location)
        raise HTTPException(status_code=400, detail=f"Invalid CSV file: {str(e)}")

import numpy as np

@router.get("/eda/{session_id}")
async def get_eda(session_id: str):
    """
    Returns statistics and histogram data for the uploaded dataset.
    """
    file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        df = pd.read_csv(file_location)
        
        # Basic Stats
        null_counts = df.isnull().sum().to_dict()
        description = df.describe().to_dict()
        
        # Histograms for numerical columns
        histograms = {}
        for col in df.select_dtypes(include=[np.number]).columns:
            # Drop NaNs for histogram calculation
            data = df[col].dropna().values
            if len(data) > 0:
                counts, bin_edges = np.histogram(data, bins=20)
                hist_data = []
                for i in range(len(counts)):
                    hist_data.append({
                        "name": f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}",
                        "count": int(counts[i])
                    })
                histograms[col] = hist_data
            else:
                histograms[col] = []

        return {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": list(df.columns),
            "null_counts": null_counts,
            "description": description,
            "histograms": histograms
        }
        
@router.post("/impute/{session_id}")
async def impute_data(session_id: str, strategies: dict[str, str]):
    """
    Applies imputation strategies to the dataset.
    strategies: {"column_name": "mean" | "median" | "mode" | "drop_row"}
    """
    file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        df = pd.read_csv(file_location)
        
        for col, method in strategies.items():
            if col not in df.columns:
                continue
                
            if method == "drop_row":
                df.dropna(subset=[col], inplace=True)
            elif method == "mean" and pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].mean())
            elif method == "median" and pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            elif method == "mode":
                if not df[col].mode().empty:
                    df[col] = df[col].fillna(df[col].mode()[0])
        
        # Save cleaned version
        cleaned_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_cleaned.csv")
        df.to_csv(cleaned_location, index=False)
        
        return {
            "message": "Imputation applied successfully",
            "remaining_nulls": df.isnull().sum().to_dict(),
            "cleaned_file": cleaned_location
        }
        
@router.get("/compare/{session_id}")
async def compare_data(session_id: str):
    """
    Returns 'Before vs After' histogram data for visualization.
    """
    raw_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
    cleaned_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_cleaned.csv")
    
    if not os.path.exists(cleaned_location):
        raise HTTPException(status_code=404, detail="Cleaned data used for comparison not found. Please impute first.")
        
    try:
        df_raw = pd.read_csv(raw_location)
        df_clean = pd.read_csv(cleaned_location)
        
        comparison_data = {}
        
        # Compare numerical columns
        for col in df_clean.select_dtypes(include=[np.number]).columns:
            if col not in df_raw.columns:
                continue
                
            # Raw Histogram
            raw_vals = df_raw[col].dropna().values
            clean_vals = df_clean[col].dropna().values
            
            if len(raw_vals) == 0 or len(clean_vals) == 0:
                continue

            # Use fixed bins based on the full range (raw + clean) to align charts
            min_val = min(raw_vals.min(), clean_vals.min())
            max_val = max(raw_vals.max(), clean_vals.max())
            
            # Create 20 bins
            bins = np.linspace(min_val, max_val, 21)
            
            raw_hist, _ = np.histogram(raw_vals, bins=bins)
            clean_hist, _ = np.histogram(clean_vals, bins=bins)
            
            chart_data = []
            for i in range(len(raw_hist)):
                label = f"{bins[i]:.1f}-{bins[i+1]:.1f}"
                chart_data.append({
                    "name": label,
                    "Raw": int(raw_hist[i]),
                    "Cleaned": int(clean_hist[i])
                })
                
            comparison_data[col] = chart_data

        return {"comparisons": comparison_data}
        
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

@router.post("/train/{session_id}")
async def train_model(session_id: str):
    """
    Trains a Random Forest model on the cleaned dataset.
    Returns metrics and confusion matrix.
    """
    file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_cleaned.csv")
    if not os.path.exists(file_location):
        # Fallback to raw if clean doesn't exist (though UI flow prevents this)
        file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
        
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        df = pd.read_csv(file_location)
        
        # Assumption: Last column is target. 
        # In a more advanced version, we'd let user pick target.
        # For this dataset, target is 'Potability'.
        target_col = 'Potability' if 'Potability' in df.columns else df.columns[-1]
        
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Handle remaining NaNs if any (simple drop for training safety)
        if X.isnull().sum().sum() > 0:
            X = X.fillna(X.mean())
            
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        # Feature Importance
        feature_importance = []
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_importance = [
                {"feature": col, "importance": float(imp)} 
                for col, imp in zip(X.columns, importances)
            ]
            feature_importance.sort(key=lambda x: x['importance'], reverse=True)
            feature_importance = feature_importance[:5] # Top 5
            
        return {
            "accuracy": float(acc),
            "f1_score": float(f1),
            "confusion_matrix": cm,
            "feature_importance": feature_importance,
            "target": target_col
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")
