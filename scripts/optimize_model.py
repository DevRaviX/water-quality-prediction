"""
Optuna Hyperparameter Optimization Script
"""

import os
import json
import optuna
import mlflow
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import f1_score, make_scorer

# Paths
DATA_PATH = 'Data/water_potability.csv'
MODEL_DIR = 'backend/app/model'
BEST_PARAMS_PATH = os.path.join(MODEL_DIR, 'best_params.json')

def load_data():
    df = pd.read_csv(DATA_PATH)
    # Impute missing values
    df.fillna(df.median(), inplace=True)
    X = df.drop('Potability', axis=1)
    y = df['Potability']
    return X, y

def objective(trial, X, y):
    # Hyperparameter search space
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 100, 500),
        'max_depth': trial.suggest_int('max_depth', 5, 25),
        'min_samples_split': trial.suggest_int('min_samples_split', 2, 10),
        'min_samples_leaf': trial.suggest_int('min_samples_leaf', 1, 5),
        'max_features': trial.suggest_categorical('max_features', ['sqrt', 'log2', None]),
        'bootstrap': trial.suggest_categorical('bootstrap', [True, False])
    }
    
    # Model
    model = RandomForestClassifier(
        **params,
        random_state=42,
        class_weight='balanced',
        n_jobs=-1
    )
    
    # robust evaluation with cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(model, X, y, cv=cv, scoring='f1', n_jobs=-1)
    
    return scores.mean()

def run_optimization():
    mlflow.set_experiment("Water_Quality_Optuna_Optimization")
    
    X, y = load_data()
    
    study = optuna.create_study(direction='maximize', study_name="RF_Optimization")
    
    print("Starting optimization (20 trials)...")
    study.optimize(lambda trial: objective(trial, X, y), n_trials=20)
    
    print("\nBest trial:")
    trial = study.best_trial
    print(f"  Value: {trial.value}")
    print("  Params: ")
    for key, value in trial.params.items():
        print(f"    {key}: {value}")
        
    # Log best run to MLflow
    with mlflow.start_run(run_name="Optuna_Best_Model"):
        mlflow.log_params(trial.params)
        mlflow.log_metric("best_cv_f1", trial.value)
        
        # Train final model with best params
        best_model = RandomForestClassifier(
            **trial.params,
            random_state=42,
            class_weight='balanced'
        )
        best_model.fit(X, y)
        
        # Save best model
        mlflow.sklearn.log_model(best_model, "best_model")
        
        # Save params locally
        os.makedirs(MODEL_DIR, exist_ok=True)
        with open(BEST_PARAMS_PATH, 'w') as f:
            json.dump(trial.params, f, indent=4)
            
        print(f"Saved best params to {BEST_PARAMS_PATH}")

if __name__ == "__main__":
    run_optimization()
