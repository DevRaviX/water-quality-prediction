"""
Unit tests for the Water Quality Prediction API.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.fixture
def sample_input():
    """Valid water quality sample input."""
    return {
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


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test the root endpoint returns a welcome message."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
    
    assert response.status_code == 200
    assert "message" in response.json()
    assert "running" in response.json()["message"].lower()


@pytest.mark.asyncio
async def test_predict_endpoint_valid_input(sample_input):
    """Test prediction with valid input."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/predict", json=sample_input)
    
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "potability_score" in data
    assert "is_potable" in data
    assert "status" in data
    assert "threshold_used" in data
    
    # Check types
    assert isinstance(data["potability_score"], float)
    assert isinstance(data["is_potable"], bool)
    assert data["status"] in ["Safe", "Not Safe"]


@pytest.mark.asyncio
async def test_predict_endpoint_invalid_input():
    """Test prediction with missing fields."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/predict", json={"ph": 7.0})
    
    # Should return 422 Unprocessable Entity
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_stats_endpoint():
    """Test the stats endpoint returns model metrics."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/stats")
    
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "r2_score" in data
    assert "rmse" in data
    assert "recall_optimized" in data
    assert "model_name" in data
    
    # Check values (from resume)
    assert data["r2_score"] == pytest.approx(0.8329, rel=0.01)
    assert data["recall_optimized"] >= 0.90


@pytest.mark.asyncio
async def test_sample_endpoint():
    """Test the sample endpoint returns valid water quality data."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/sample")
    
    # May return 500 if dataset not available, but should not crash
    assert response.status_code in [200, 500]
    
    if response.status_code == 200:
        data = response.json()
        # Check expected fields
        expected_fields = ["ph", "Hardness", "Solids", "Chloramines", "Sulfate",
                         "Conductivity", "Organic_carbon", "Trihalomethanes", "Turbidity"]
        for field in expected_fields:
            assert field in data


@pytest.mark.asyncio
async def test_predict_boundary_values():
    """Test prediction with boundary pH values."""
    transport = ASGITransport(app=app)
    
    # pH at boundaries
    boundary_inputs = [
        {"ph": 0.0, "Hardness": 200.0, "Solids": 20000.0, "Chloramines": 7.0,
         "Sulfate": 300.0, "Conductivity": 400.0, "Organic_carbon": 10.0,
         "Trihalomethanes": 60.0, "Turbidity": 4.0},
        {"ph": 14.0, "Hardness": 200.0, "Solids": 20000.0, "Chloramines": 7.0,
         "Sulfate": 300.0, "Conductivity": 400.0, "Organic_carbon": 10.0,
         "Trihalomethanes": 60.0, "Turbidity": 4.0},
    ]
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for input_data in boundary_inputs:
            response = await client.post("/api/predict", json=input_data)
            assert response.status_code == 200


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test the health check endpoint."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_ph_forecast_endpoint():
    """Test pH forecasting with historical data."""
    transport = ASGITransport(app=app)
    
    input_data = {"ph_history": [7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6]}
    
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/predict-ph", json=input_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "predicted_ph" in data
    assert "trend" in data
    assert "confidence" in data
    assert data["trend"] == "increasing"  # Values are increasing
