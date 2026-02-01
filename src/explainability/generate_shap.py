"""
SHAP Explainability Module for Water Quality Prediction

Generates:
1. Global feature importance (Summary Plot)
2. Feature dependence plots
3. Individual prediction explanations (Force Plot)
"""

import os
import sys
import joblib
import shap
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Paths
MODEL_PATH = 'backend/app/model/water_quality_model.pkl'
DATA_PATH = 'Data/water_potability.csv'
OUTPUT_DIR = 'Visualisations/shap'

def load_model_and_data():
    """Load the trained model and dataset."""
    print("Loading model and data...")
    model = joblib.load(MODEL_PATH)
    df = pd.read_csv(DATA_PATH)
    
    # Impute missing values (same as training)
    df.fillna(df.median(), inplace=True)
    
    X = df.drop('Potability', axis=1)
    y = df['Potability']
    
    return model, X, y

def generate_shap_values(model, X):
    """Generate SHAP values using TreeExplainer."""
    print("Calculating SHAP values (this may take a minute)...")
    explainer = shap.TreeExplainer(model)
    shap_values = explainer(X)
    return explainer, shap_values

def save_summary_plot(shap_values, X):
    """Save SHAP summary plot (global feature importance)."""
    print("Generating summary plot...")
    plt.figure(figsize=(10, 8))
    shap.summary_plot(shap_values[:, :, 1], X, show=False)
    plt.title("SHAP Feature Importance (Potable Class)", fontsize=14)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'shap_summary_plot.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {OUTPUT_DIR}/shap_summary_plot.png")

def save_bar_plot(shap_values, X):
    """Save SHAP bar plot (mean absolute importance)."""
    print("Generating bar plot...")
    plt.figure(figsize=(10, 6))
    shap.plots.bar(shap_values[:, :, 1], show=False)
    plt.title("Mean |SHAP Value| (Feature Importance)", fontsize=14)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, 'shap_bar_plot.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {OUTPUT_DIR}/shap_bar_plot.png")

def save_dependence_plot(shap_values, X, feature='ph'):
    """Save SHAP dependence plot for a specific feature."""
    print(f"Generating dependence plot for '{feature}'...")
    plt.figure(figsize=(10, 6))
    shap.dependence_plot(feature, shap_values[:, :, 1].values, X, show=False)
    plt.title(f"SHAP Dependence: {feature}", fontsize=14)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f'shap_dependence_{feature}.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {OUTPUT_DIR}/shap_dependence_{feature}.png")

def save_waterfall_plot(shap_values, X, sample_idx=0):
    """Save SHAP waterfall plot for a single prediction."""
    print(f"Generating waterfall plot for sample {sample_idx}...")
    plt.figure(figsize=(10, 6))
    shap.plots.waterfall(shap_values[sample_idx, :, 1], show=False)
    plt.title(f"SHAP Explanation for Sample {sample_idx}", fontsize=14)
    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, f'shap_waterfall_sample_{sample_idx}.png'), dpi=150, bbox_inches='tight')
    plt.close()
    print(f"Saved: {OUTPUT_DIR}/shap_waterfall_sample_{sample_idx}.png")

def main():
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Load model and data
    model, X, y = load_model_and_data()
    
    # Generate SHAP values
    explainer, shap_values = generate_shap_values(model, X)
    
    # Generate and save plots
    save_summary_plot(shap_values, X)
    save_bar_plot(shap_values, X)
    save_dependence_plot(shap_values, X, feature='ph')
    save_dependence_plot(shap_values, X, feature='Sulfate')
    save_waterfall_plot(shap_values, X, sample_idx=0)
    save_waterfall_plot(shap_values, X, sample_idx=100)
    

    # Save global feature importance data (JSON)
    # Calculate mean absolute SHAP value for each feature
    # shap_values[:, :, 1] is for positive class in binary classification
    vals = shap_values[:, :, 1].values
    if vals.ndim == 1: # Sometimes comes as just (samples, features) if binary?
        pass # Handle if needed, but usually binary classifier output depends on implementation
    
    # Check shape: (samples, features)
    # For TreeExplainer on binary class RF, shap_values is usually a list or object with values for both classes
    # But shap 0.50+ returns an Explanation object.
    # We accessed shap_values[:, :, 1] in plots which implies it has class dim.
    
    # Let's extract values safely
    if len(shap_values.shape) == 3:
        vals = np.abs(shap_values.values[:, :, 1]).mean(0) # Mean across samples
    else:
        vals = np.abs(shap_values.values).mean(0)

    global_importance = []
    for i, col in enumerate(X.columns):
        global_importance.append({
            "feature": col,
            "importance": float(vals[i])
        })
    
    # Sort
    global_importance.sort(key=lambda x: x['importance'], reverse=True)
    
    import json
    with open(os.path.join('backend/app/model', 'global_feature_importance.json'), 'w') as f:
        json.dump(global_importance, f, indent=4)
    print("Saved global_feature_importance.json for API use.")

    print("\n✅ SHAP analysis complete! Visualizations and Data saved.")
    
    # Save explainer for API use
    joblib.dump(explainer, os.path.join('backend/app/model', 'shap_explainer.pkl'))
    print("Saved SHAP explainer for API use.")

if __name__ == "__main__":
    main()
