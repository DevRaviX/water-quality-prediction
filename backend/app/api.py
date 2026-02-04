from .schema import (
    WaterQualityInput, PredictionResponse, StatsResponse,
    HealthResponse, pHForecastInput, pHForecastResponse, IoTReading
)
from .services import model_service
import numpy as np

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "model_loaded": model_service.model is not None,
        "version": "1.1.0"
    }


@router.post("/predict", response_model=PredictionResponse)
async def predict_water_quality(input_data: WaterQualityInput):
    try:
        result = model_service.predict(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=StatsResponse)
async def get_model_stats():
    # Resume stats as requested
    return {
        "r2_score": 0.8329,
        "rmse": 0.012,
        "recall_optimized": 0.90,
        "model_name": "Random Forest (Balanced)",
        "feature_importance": model_service.get_global_feature_importance()
    }


@router.get("/sample", response_model=WaterQualityInput)
async def get_random_sample():
    try:
        return model_service.get_random_sample()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict-ph", response_model=pHForecastResponse)
async def forecast_ph(input_data: pHForecastInput):
    """
    Forecast next pH value based on historical readings.
    Uses simple linear trend analysis (demo implementation).
    """
    try:
        ph_values = np.array(input_data.ph_history)
        n = len(ph_values)
        
        # Simple linear regression for trend
        x = np.arange(n)
        slope, intercept = np.polyfit(x, ph_values, 1)
        
        # Predict next value
        predicted = slope * n + intercept
        predicted = float(np.clip(predicted, 0, 14))  # pH bounds
        
        # Determine trend
        if abs(slope) < 0.01:
            trend = "stable"
        elif slope > 0:
            trend = "increasing"
        else:
            trend = "decreasing"
        
        # Confidence based on R² of the linear fit
        y_pred = slope * x + intercept
        ss_res = np.sum((ph_values - y_pred) ** 2)
        ss_tot = np.sum((ph_values - np.mean(ph_values)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        confidence = float(max(0, min(1, r2)))
        
        return {
            "predicted_ph": round(predicted, 4),
            "trend": trend,
            "confidence": round(confidence, 4)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/iot/readings")
async def receive_iot_reading(reading: IoTReading):
    """
    Receive real-time data from ESP32.
    """
    try:
        # In a real app, you would save this to a timeseries DB.
        # For now, we'll just log it and potentially return it for live view.
        print(f"Received IoT Data: {reading}")
        
        # Determine status based on thresholds (Simple Logic)
        status = "Safe"
        if reading.ph < 6.5 or reading.ph > 8.5 or reading.turbidity > 5:
            status = "Unsafe"
            
        return {
            "status": "received",
            "analysis": status,
            "timestamp": "now" # In real app use datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
