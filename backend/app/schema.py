from pydantic import BaseModel, Field

class WaterQualityInput(BaseModel):
    ph: float = Field(..., description="pH level of the water", ge=0, le=14, example=7.0)
    Hardness: float = Field(..., description="Hardness of water in mg/L", example=200.0)
    Solids: float = Field(..., description="Total dissolved solids in ppm", example=20000.0)
    Chloramines: float = Field(..., description="Amount of Chloramines in ppm", example=7.0)
    Sulfate: float = Field(..., description="Amount of Sulfates dissolved in mg/L", example=300.0)
    Conductivity: float = Field(..., description="Electrical conductivity of water in μS/cm", example=400.0)
    Organic_carbon: float = Field(..., description="Amount of organic carbon in ppm", example=10.0)
    Trihalomethanes: float = Field(..., description="Amount of Trihalomethanes in μg/L", example=60.0)
    Turbidity: float = Field(..., description="Measure of light emitting property in NTU", example=4.0)

class FeatureContribution(BaseModel):
    feature: str
    value: float
    contribution: float

class PredictionResponse(BaseModel):
    potability_score: float
    is_potable: bool
    status: str
    threshold_used: float
    explanation: list[FeatureContribution] = []


class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float

class StatsResponse(BaseModel):
    r2_score: float
    rmse: float
    recall_optimized: float
    model_name: str
    feature_importance: list[FeatureImportanceItem] = []


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str


class pHForecastInput(BaseModel):
    """Input for pH forecasting - historical pH readings."""
    ph_history: list[float] = Field(
        ..., 
        description="List of historical pH readings (7 values recommended)",
        min_length=1,
        max_length=30
    )


class pHForecastResponse(BaseModel):
    predicted_ph: float
    trend: str  # "stable", "increasing", "decreasing"
    confidence: float

