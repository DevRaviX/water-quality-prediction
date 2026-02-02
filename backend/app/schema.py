from pydantic import BaseModel, Field

class WaterQualityInput(BaseModel):
    ph: float = Field(..., description="pH level of the water", ge=0, le=14, json_schema_extra={"example": 7.0})
    Hardness: float = Field(..., description="Hardness of water in mg/L", json_schema_extra={"example": 200.0})
    Solids: float = Field(..., description="Total dissolved solids in ppm", json_schema_extra={"example": 20000.0})
    Chloramines: float = Field(..., description="Amount of Chloramines in ppm", json_schema_extra={"example": 7.0})
    Sulfate: float = Field(..., description="Amount of Sulfates dissolved in mg/L", json_schema_extra={"example": 300.0})
    Conductivity: float = Field(..., description="Electrical conductivity of water in μS/cm", json_schema_extra={"example": 400.0})
    Organic_carbon: float = Field(..., description="Amount of organic carbon in ppm", json_schema_extra={"example": 10.0})
    Trihalomethanes: float = Field(..., description="Amount of Trihalomethanes in μg/L", json_schema_extra={"example": 60.0})
    Turbidity: float = Field(..., description="Measure of light emitting property in NTU", json_schema_extra={"example": 4.0})

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

