import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add backend to sys path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from backend.app.main import app
from backend.app.services import model_service

def test_shap_explanation_in_prediction():
    client = TestClient(app)
    
    # Random safe sample data
    payload = {
        "ph": 7.0,
        "Hardness": 200.0,
        "Solids": 20000.0,
        "Chloramines": 7.0,
        "Sulfate": 300.0,
        "Conductivity": 400.0,
        "Organic_carbon": 10.0,
        "Trihalomethanes": 60.0,
        "Turbidity": 4.0
    }
    
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200, f"Request failed: {response.text}"
    
    data = response.json()
    assert "explanation" in data
    assert len(data["explanation"]) > 0
    
    # Check structure
    first_exp = data["explanation"][0]
    assert "feature" in first_exp
    assert "value" in first_exp
    assert "contribution" in first_exp
    
    print("\n✅ SHAP integration verification successful!")
    print(f"Top feature: {first_exp['feature']}, Contribution: {first_exp['contribution']}")

if __name__ == "__main__":
    test_shap_explanation_in_prediction()
