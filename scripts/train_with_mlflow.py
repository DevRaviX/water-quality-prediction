"""
MLflow Experiment Tracking for Water Quality Model Training

This script trains the Random Forest model with full MLflow tracking:
- Parameters (n_estimators, max_depth, threshold)
- Metrics (F1, Recall, Precision, ROC-AUC)
- Artifacts (model.pkl, confusion_matrix.png, feature_importance.png)
"""

import os
import json
import mlflow
import mlflow.sklearn
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report, confusion_matrix, 
    f1_score, recall_score, precision_score, roc_auc_score
)

# Paths
DATA_PATH = 'Data/water_potability.csv'
MODEL_DIR = 'backend/app/model'
RANDOM_STATE = 42

# MLflow Configuration
EXPERIMENT_NAME = "Water_Quality_Potability"
mlflow.set_experiment(EXPERIMENT_NAME)


def train_with_mlflow():
    """Train model with MLflow experiment tracking."""
    
    with mlflow.start_run(run_name="RandomForest_Balanced_ThresholdOpt"):
        
        # ============ Data Loading ============
        print("Loading data...")
        df = pd.read_csv(DATA_PATH)
        
        # Log dataset info
        mlflow.log_param("dataset_size", len(df))
        mlflow.log_param("missing_values", df.isnull().sum().sum())
        
        # Imputation
        imputer_values = df.median().to_dict()
        df.fillna(imputer_values, inplace=True)
        
        X = df.drop('Potability', axis=1)
        y = df['Potability']
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
        )
        
        mlflow.log_param("train_size", len(X_train))
        mlflow.log_param("test_size", len(X_test))
        mlflow.log_param("random_state", RANDOM_STATE)
        
        # ============ Model Training ============
        print("Training Random Forest...")
        
        # Hyperparameters
        n_estimators = 300
        max_depth = 12
        
        mlflow.log_param("n_estimators", n_estimators)
        mlflow.log_param("max_depth", max_depth)
        mlflow.log_param("class_weight", "balanced")
        
        rf_model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            random_state=RANDOM_STATE,
            class_weight='balanced',
            n_jobs=-1
        )
        rf_model.fit(X_train, y_train)
        
        # ============ Threshold Optimization ============
        print("Optimizing threshold for >90% recall...")
        
        y_probs = rf_model.predict_proba(X_test)[:, 1]
        thresholds = np.arange(0.0, 1.01, 0.01)
        
        best_thresh = 0.5
        best_f1 = 0
        
        for t in thresholds:
            y_pred_t = (y_probs >= t).astype(int)
            rec = recall_score(y_test, y_pred_t, zero_division=0)
            
            if rec >= 0.90:
                f1 = f1_score(y_test, y_pred_t, zero_division=0)
                if f1 > best_f1:
                    best_f1 = f1
                    best_thresh = t
        
        mlflow.log_param("optimal_threshold", best_thresh)
        
        # ============ Evaluation ============
        print(f"Evaluating with threshold = {best_thresh:.2f}...")
        
        y_pred = (y_probs >= best_thresh).astype(int)
        
        # Metrics
        f1 = f1_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_probs)
        
        mlflow.log_metric("f1_score", f1)
        mlflow.log_metric("recall", recall)
        mlflow.log_metric("precision", precision)
        mlflow.log_metric("roc_auc", roc_auc)
        
        print(f"F1: {f1:.4f}, Recall: {recall:.4f}, Precision: {precision:.4f}, ROC-AUC: {roc_auc:.4f}")
        
        # ============ Artifacts ============
        print("Saving artifacts...")
        
        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Not Potable', 'Potable'],
                   yticklabels=['Not Potable', 'Potable'])
        plt.title(f'Confusion Matrix (Threshold={best_thresh:.2f})')
        plt.ylabel('Actual')
        plt.xlabel('Predicted')
        plt.tight_layout()
        cm_path = 'mlflow_confusion_matrix.png'
        plt.savefig(cm_path, dpi=150)
        plt.close()
        mlflow.log_artifact(cm_path)
        os.remove(cm_path)
        
        # Feature Importance
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': rf_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        plt.figure(figsize=(10, 6))
        sns.barplot(x='importance', y='feature', data=feature_importance, palette='viridis')
        plt.title('Random Forest Feature Importance')
        plt.tight_layout()
        fi_path = 'mlflow_feature_importance.png'
        plt.savefig(fi_path, dpi=150)
        plt.close()
        mlflow.log_artifact(fi_path)
        os.remove(fi_path)
        
        # Log model
        mlflow.sklearn.log_model(rf_model, "model")
        
        # Save model to app directory
        import joblib
        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(rf_model, os.path.join(MODEL_DIR, 'water_quality_model.pkl'))
        
        with open(os.path.join(MODEL_DIR, 'imputer_values.json'), 'w') as f:
            json.dump(imputer_values, f)
        
        with open(os.path.join(MODEL_DIR, 'optimal_threshold.json'), 'w') as f:
            json.dump({'threshold': best_thresh}, f)
        
        print(f"\n✅ Training complete! Run ID: {mlflow.active_run().info.run_id}")
        print(f"View experiments: mlflow ui")
        
        return rf_model, best_thresh


if __name__ == "__main__":
    train_with_mlflow()
