"""
Unit tests for model loading and prediction logic.
"""

import pytest
import os
import joblib

MODEL_PATH = 'backend/app/model/water_quality_model.pkl'
THRESHOLD_PATH = 'backend/app/model/optimal_threshold.json'
IMPUTER_PATH = 'backend/app/model/imputer_values.json'


def test_model_file_exists():
    """Test that the model file exists."""
    assert os.path.exists(MODEL_PATH), f"Model file not found at {MODEL_PATH}"


def test_threshold_file_exists():
    """Test that the threshold config exists."""
    assert os.path.exists(THRESHOLD_PATH), f"Threshold file not found at {THRESHOLD_PATH}"


def test_imputer_file_exists():
    """Test that the imputer values file exists."""
    assert os.path.exists(IMPUTER_PATH), f"Imputer file not found at {IMPUTER_PATH}"


def test_model_loads_correctly():
    """Test that the model loads without errors."""
    model = joblib.load(MODEL_PATH)
    assert model is not None
    assert hasattr(model, 'predict')
    assert hasattr(model, 'predict_proba')


def test_model_has_correct_features():
    """Test that the model expects the correct number of features."""
    model = joblib.load(MODEL_PATH)
    # Random Forest has n_features_in_ attribute
    assert hasattr(model, 'n_features_in_')
    assert model.n_features_in_ == 9  # 9 water quality parameters


def test_model_prediction_shape():
    """Test that model prediction returns expected shape."""
    import numpy as np
    model = joblib.load(MODEL_PATH)
    
    # Create dummy input (9 features)
    dummy_input = np.array([[7.0, 200.0, 20000.0, 7.0, 300.0, 400.0, 10.0, 60.0, 4.0]])
    
    prediction = model.predict(dummy_input)
    proba = model.predict_proba(dummy_input)
    
    assert prediction.shape == (1,)
    assert proba.shape == (1, 2)  # Binary classification
    assert prediction[0] in [0, 1]
    assert 0 <= proba[0, 1] <= 1


def test_threshold_value_range():
    """Test that threshold is within valid range."""
    import json
    with open(THRESHOLD_PATH, 'r') as f:
        data = json.load(f)
    
    assert 'threshold' in data
    threshold = data['threshold']
    assert 0 < threshold < 1, f"Threshold {threshold} is out of range (0, 1)"


def test_imputer_has_all_columns():
    """Test that imputer values cover all expected columns."""
    import json
    with open(IMPUTER_PATH, 'r') as f:
        imputer = json.load(f)
    
    expected_cols = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate',
                     'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity']
    
    for col in expected_cols:
        assert col in imputer, f"Missing imputer value for {col}"
