import shutil
import uuid
import os
import pickle
from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import FileResponse
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
        
    return {
        "session_id": session_id,
        "filename": file.filename,
        "message": "Upload successful"
    }

@router.post("/use_sample")
async def use_sample():
    """
    Copies the default dataset to a new session.
    """
    session_id = str(uuid.uuid4())
    # Path relative to backend execution: ../../../Data/water_potability.csv
    # Adjust based on project structure. verified in services.py as ../../Data/water_potability.csv relative to services.py
    # Here router is in backend/app/routers, so root is ../../..
    # But services.py used os.path.dirname(__file__)
    
    # Safe approach: usage absolute path logic similar to services.py
    # Base dir of app: backend/app -> backend -> project root
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # Water Quality Prediction System
    DATA_PATH = os.path.join(BASE_DIR, "Data", "water_potability.csv")
    
    dest_path = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
    
    if not os.path.exists(DATA_PATH):
        raise HTTPException(status_code=404, detail="Sample dataset not found on server.")
        
    try:
        shutil.copy(DATA_PATH, dest_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load sample data: {str(e)}")
        
    return {
        "session_id": session_id,
        "filename": "water_potability.csv (Sample)",
        "message": "Sample data loaded successfully"
    }

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
        
        # 1. Histograms for numerical columns
        histograms = {}
        numerical_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        for col in numerical_cols:
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

        # 2. Correlation Matrix
        corr_matrix = df.corr().fillna(0).to_dict()
        # Convert to list for easier frontend mapping
        corr_list = []
        cols = list(corr_matrix.keys())
        for i, row_col in enumerate(cols):
            for j, col_col in enumerate(cols):
                corr_list.append({
                    "x": row_col,
                    "y": col_col,
                    "value": float(corr_matrix[row_col][col_col])
                })

        # 3. Class Distribution (Target)
        target_col = 'Potability' if 'Potability' in df.columns else df.columns[-1]
        dist_counts = df[target_col].value_counts().to_dict()
        total = len(df)
        class_distribution = [
            {"label": str(k), "count": v, "percentage": round((v/total)*100, 1)}
            for k, v in dist_counts.items()
        ]

        # 4. Boxplot Stats & Outliers
        boxplot_data = {}
        for col in numerical_cols:
            if col == target_col: continue
            col_data = df[col].dropna()
            if len(col_data) == 0: continue
            
            q1 = col_data.quantile(0.25)
            q3 = col_data.quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]
            
            boxplot_data[col] = {
                "min": float(col_data.min()),
                "q1": float(q1),
                "median": float(col_data.median()),
                "q3": float(q3),
                "max": float(col_data.max()),
                "outlier_count": len(outliers),
                "outlier_percentage": round((len(outliers) / len(col_data)) * 100, 1)
            }

        return {
            "total_rows": total,
            "total_columns": len(df.columns),
            "columns": list(df.columns),
            "null_counts": null_counts,
            "description": description,
            "histograms": histograms,
            "correlation_matrix": corr_list,
            "class_distribution": class_distribution,
            "boxplot_data": boxplot_data,
            "target_col": target_col
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing data: {str(e)}")

@router.get("/preview/{session_id}")
async def get_preview(session_id: str):
    """
    Returns the first 5 rows of the dataset.
    """
    # Debug Logging Setup
    import sys
    def log_debug(msg):
        with open("/tmp/debug_gemini.log", "a") as f:
            f.write(f"{datetime.now()}: {msg}\n")
            
    log_debug(f"Entering get_preview for {session_id}")

    file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
    if not os.path.exists(file_location):
        log_debug(f"File not found: {file_location}")
        raise HTTPException(status_code=404, detail="Session not found")
        
    try:
        log_debug(f"Reading CSV: {file_location}")
        df = pd.read_csv(file_location, nrows=5)
        
        log_debug("Replacing NaNs")
        df = df.fillna("") # Safer string replacement for JSON
        
        log_debug("Converting to dict")
        res = {
            "columns": list(df.columns),
            "rows": df.to_dict(orient="split")["data"] 
        }
        log_debug("Returning response")
        return res
        
    except Exception as e:
        log_debug(f"EXCEPTION: {str(e)}")
        import traceback
        with open("/tmp/debug_gemini.log", "a") as f:
            traceback.print_exc(file=f)
            
        raise HTTPException(status_code=500, detail=f"Error reading preview: {str(e)}")

@router.post("/impute/{session_id}")
async def impute_data(session_id: str, strategies: dict[str, str] = Body(...)):
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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error cleaning data: {str(e)}")

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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing data: {str(e)}")

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, f1_score, confusion_matrix, 
    precision_score, recall_score, roc_auc_score, roc_curve
)
from pydantic import BaseModel
import json
from datetime import datetime

class TrainingConfig(BaseModel):
    model_type: str = "Random Forest"
    params: dict = {}

@router.post("/train/{session_id}")
async def train_model(session_id: str, config: TrainingConfig = Body(...)):
    """
    Trains a model based on user configuration.
    """
    file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_cleaned.csv")
    if not os.path.exists(file_location):
        file_location = os.path.join(TEMP_DATA_DIR, f"{session_id}_raw.csv")
        
    if not os.path.exists(file_location):
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    try:
        df = pd.read_csv(file_location)
        # Handle simple target assumption
        target_col = 'Potability' if 'Potability' in df.columns else df.columns[-1]
        
        X = df.drop(columns=[target_col])
        y = df[target_col]
        
        # Simple imputation for safety
        if X.isnull().sum().sum() > 0:
            X = X.fillna(X.mean())
            
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Model Selection
        model_type = config.model_type
        params = config.params
        
        if model_type == "Gradient Boosting":
            # Safe defaults if params missing
            n_estimators = int(params.get("n_estimators", 100))
            learning_rate = float(params.get("learning_rate", 0.1))
            model = GradientBoostingClassifier(n_estimators=n_estimators, learning_rate=learning_rate, random_state=42)
            
        elif model_type == "Logistic Regression":
            C = float(params.get("C", 1.0))
            model = LogisticRegression(C=C, max_iter=1000, random_state=42)
            
        else: # Default Random Forest
            n_estimators = int(params.get("n_estimators", 100))
            max_depth = params.get("max_depth", None)
            if max_depth == "None": max_depth = None
            else: max_depth = int(max_depth) if max_depth else None
            
            model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, random_state=42)
            
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='weighted')
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        # ROC Calculation
        auc_score = 0
        roc_data = []
        try:
            if len(np.unique(y)) == 2:
                auc_score = roc_auc_score(y_test, y_prob)
                fpr, tpr, _ = roc_curve(y_test, y_prob)
                indices = np.linspace(0, len(fpr)-1, 20, dtype=int)
                for i in indices:
                    roc_data.append({"fpr": float(fpr[i]), "tpr": float(tpr[i])})
        except:
            pass

        # Feature Importance (Switch for LR)
        feature_importance = []
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            feature_importance = [{"feature": col, "importance": float(imp)} for col, imp in zip(X.columns, importances)]
        elif hasattr(model, 'coef_'):
            importances = np.abs(model.coef_[0])
            feature_importance = [{"feature": col, "importance": float(imp)} for col, imp in zip(X.columns, importances)]
            
        feature_importance.sort(key=lambda x: x['importance'], reverse=True)
        feature_importance = feature_importance[:10]

        # 3. Threshold Tuning Data
        threshold_curves = []
        try:
            if len(np.unique(y)) == 2:
                for thresh in np.linspace(0, 1, 21):
                    y_pred_thresh = (y_prob >= thresh).astype(int)
                    p_t = float(precision_score(y_test, y_pred_thresh, zero_division=0))
                    r_t = float(recall_score(y_test, y_pred_thresh, zero_division=0))
                    f_t = float(f1_score(y_test, y_pred_thresh, zero_division=0))
                    threshold_curves.append({
                        "threshold": round(float(thresh), 2),
                        "precision": p_t,
                        "recall": r_t,
                        "f1": f_t
                    })
        except:
            pass

        # Save model
        model_path = os.path.join(TEMP_DATA_DIR, f"{session_id}_model.pkl")
        with open(model_path, "wb") as f:
            pickle.dump(model, f)
            
        # Log History
        history_path = os.path.join(TEMP_DATA_DIR, f"{session_id}_history.json")
        run_record = {
            "timestamp": datetime.now().isoformat(),
            "model_type": model_type,
            "params": params,
            "metrics": {
                "accuracy": float(acc),
                "f1": float(f1),
                "auc": float(auc_score)
            }
        }
        
        history = []
        if os.path.exists(history_path):
            with open(history_path, 'r') as hf:
                history = json.load(hf)
        history.append(run_record)
        with open(history_path, 'w') as hf:
            json.dump(history, hf)
            
        return {
            "accuracy": float(acc),
            "f1_score": float(f1),
            "precision": float(precision),
            "recall": float(recall),
            "auc_score": float(auc_score),
            "roc_curve": roc_data,
            "confusion_matrix": cm,
            "feature_importance": feature_importance,
            "threshold_curves": threshold_curves, # NEW
            "target": target_col,
            "model_path": model_path,
            "history": history
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

@router.get("/download_model/{session_id}")
async def download_model(session_id: str):
    """
    Downloads the trained model as a .pkl file.
    """
    model_path = os.path.join(TEMP_DATA_DIR, f"{session_id}_model.pkl")
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="Model not found. Please train first.")
        
    return FileResponse(model_path, filename="water_quality_model.pkl", media_type="application/octet-stream")
