import joblib
import json
import os
import pandas as pd
import numpy as np
from .schema import WaterQualityInput

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
MODEL_PATH = os.path.join(MODEL_DIR, 'water_quality_model.pkl')
THRESHOLD_PATH = os.path.join(MODEL_DIR, 'optimal_threshold.json')
IMPUTER_PATH = os.path.join(MODEL_DIR, 'imputer_values.json')
# Assuming data is relative to the backend execution context for sampling
DATA_PATH = os.path.join(os.path.dirname(__file__), '../../../Data/water_potability.csv')
EXPLAINER_PATH = os.path.join(MODEL_DIR, 'shap_explainer.pkl')
FEATURE_IMPORTANCE_PATH = os.path.join(MODEL_DIR, 'global_feature_importance.json')

class ModelService:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_importance = []
        self.threshold = 0.5
        self.imputer_values = {}
        self.data_df = None
        self._load_artifacts()
        self._load_data()

    def _load_artifacts(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
            
            if os.path.exists(THRESHOLD_PATH):
                with open(THRESHOLD_PATH, 'r') as f:
                    self.threshold = json.load(f).get('threshold', 0.5)
            
            if os.path.exists(IMPUTER_PATH):
                with open(IMPUTER_PATH, 'r') as f:
                    self.imputer_values = json.load(f)

            if os.path.exists(EXPLAINER_PATH):
                try:
                    self.explainer = joblib.load(EXPLAINER_PATH)
                except Exception as e:
                    print(f"Error loading explainer: {e}")

            if os.path.exists(FEATURE_IMPORTANCE_PATH):
                with open(FEATURE_IMPORTANCE_PATH, 'r') as f:
                    self.feature_importance = json.load(f)
                    
        except Exception as e:
            print(f"Error loading artifacts: {e}")

    def _load_data(self):
        # Load dataset for random sampling (opt-in)
        try:
            if os.path.exists(DATA_PATH):
                self.data_df = pd.read_csv(DATA_PATH)
        except Exception as e:
            print(f"Error loading data for sampling: {e}")

    def predict(self, input_data: WaterQualityInput):
        if not self.model:
            raise RuntimeError("Model not loaded")

        data = input_data.model_dump()
        df = pd.DataFrame([data])
        df.fillna(self.imputer_values, inplace=True)
        
        probs = self.model.predict_proba(df)[:, 1]
        score = float(probs[0])
        is_potable = score >= self.threshold

        explanation = []
        if self.explainer:
            try:
                shap_values = self.explainer(df)
                # Handle shape (1, features, 2) for binary classification
                vals = shap_values.values[0]
                if vals.ndim > 1:
                    vals = vals[:, 1]  # Take positive class contribution
                
                for i, col in enumerate(df.columns):
                    explanation.append({
                        "feature": col,
                        "value": float(df.iloc[0, i]),
                        "contribution": float(vals[i])
                    })
                # Sort by absolute impact
                explanation.sort(key=lambda x: abs(x['contribution']), reverse=True)
            except Exception as e:
                print(f"Error generating SHAP explanation: {e}")
        
        return {
            "potability_score": score,
            "is_potable": bool(is_potable),
            "status": "Safe" if is_potable else "Not Safe",
            "threshold_used": self.threshold,
            "explanation": explanation
        }

    def get_random_sample(self):
        if self.data_df is None:
            raise RuntimeError("Dataset not available for sampling")
        
        # Get a random row, drop Potability if present
        sample = self.data_df.sample(1).iloc[0]
        sample_dict = sample.drop('Potability', errors='ignore').to_dict()
        
        # Handle NaN in sample by filling with 0 or imputer values (for display purposes)
        # Ideally we send nulls back and let frontend handle, but schema enforcement might require floats
        # Let's use imputer values to ensure valid float response
        for k, v in sample_dict.items():
            if pd.isna(v):
                sample_dict[k] = self.imputer_values.get(k, 0.0)
                
        return sample_dict

    def get_global_feature_importance(self):
        return self.feature_importance

model_service = ModelService()
