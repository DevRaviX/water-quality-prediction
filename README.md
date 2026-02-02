# Water Quality Prediction System

[![CI](https://github.com/DevRaviX/water-quality-prediction/actions/workflows/ci.yml/badge.svg)](https://github.com/DevRaviX/water-quality-prediction/actions/workflows/ci.yml)
[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/release/python-311/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **An end-to-end Machine Learning system for water potability classification and pH forecasting, with model explainability (SHAP), experiment tracking, and production-ready deployment.**

---

## 🧪 **NEW: AutoML Data Lab**

Transform raw data into insights with our interactive end-to-end pipeline:

1.  **Upload**: Drag & drop any CSV dataset.
2.  **Analyze**: Instant EDA with automatic histograms and null-value detection.
3.  **Clean**: Interactively impute missing values (Mean, Median, Mode, or Drop).
4.  **Verify**: Side-by-side "Before vs After" visualization to ensure data integrity.
5.  **Train**: Build a custom Random Forest model and view performance metrics (Accuracy, F1, Confusion Matrix).

> **Access the Data Lab at:** `/datalab`

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Frontend ["🖥️ React Frontend"]
        UI[User Interface]
        Lab[Data Lab UI]
        Charts[Recharts Visualizations]
    end

    subgraph Backend ["⚙️ FastAPI Backend"]
        API[REST API]
        Model[Inference Model]
        Trainer[AutoML Trainer]
        SHAP[SHAP Explainer]
    end

    subgraph Data ["📊 Data Layer"]
        CSV[(water_potability.csv)]
        Temp["Session Data (Uploads)"]
        PKL[model.pkl]
    end

    UI --> API
    Lab --> API
    API --> Model
    API --> Trainer
    API --> SHAP
    Model --> PKL
    Trainer --> Temp
    CSV --> Model
```

---

## 📸 Screenshots

| Predictor | Analytics | Data Lab |
|:---------:|:---------:|:--------:|
| ![Predictor](Visualisations/screenshots/predictor_desktop.png) | ![Analytics](Visualisations/screenshots/analytics_desktop.png) | *Coming Soon* |

---

## ☁️ Deployment

For production deployment to **AWS ECS (Fargate)**, please refer to the project documentation (if available) or standard Docker deployment practices.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

Access the app at:
- **Predictor**: http://localhost:8000
- **Data Lab**: http://localhost:8000/datalab

### Option 2: Manual Setup

**1. Backend**
```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn backend.app.main:app --reload --port 8000
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

Access the app at: http://localhost:5173

---

## 📊 Model Explainability (SHAP)

We use SHAP (SHapley Additive exPlanations) to provide transparent, interpretable predictions.

### Global Feature Importance

![SHAP Summary](Visualisations/shap/shap_summary_plot.png)

### Individual Prediction Explanation

![SHAP Waterfall](Visualisations/shap/shap_waterfall_sample_0.png)

---

## 🧪 Testing

Run the test suite:

```bash
pytest tests/ -v
```

Current coverage: **80%+** across API endpoints and model logic.

---

## 📁 Project Structure

```
water-quality-prediction/
├── backend/
│   └── app/
│       ├── main.py          # FastAPI entry point
│       ├── api.py           # Inference endpoints
│       ├── routers/
│       │   └── datalab.py   # AutoML endpoints
│       ├── schema.py        # Pydantic models
│       ├── services.py      # Business logic
│       └── model/           # Trained models
├── frontend/
│   └── src/
│       ├── components/      # React components
│       │   └── DataLab/     # AutoML components
│       ├── api.js           # API client
│       └── App.jsx          # Main app
├── notebooks/
│   ├── EDA.ipynb            # Exploratory analysis
│   └── advanced_classification.ipynb
├── src/
│   └── explainability/      # SHAP scripts
├── tests/                   # pytest tests
├── Visualisations/          # Generated plots
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## 🔌 API Reference

### Predict Potability

```http
POST /api/predict
```

**Request:**
```json
{
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
```

**Response:**
```json
{
  "potability_score": 0.72,
  "is_potable": true,
  "status": "Safe",
  "threshold_used": 0.36
}
```

### Get Model Stats

```http
GET /api/stats
```

### Get Random Sample

```http
GET /api/sample
```

---

## 📚 Methodology

1. **Data Preprocessing**: Median imputation for missing values (pH, Sulfate, Trihalomethanes)
2. **Class Imbalance**: Handled via `class_weight='balanced'`
3. **Threshold Optimization**: Swept [0, 1] to maximize F1 while achieving ≥90% recall
4. **Explainability**: SHAP TreeExplainer for Random Forest

---

## 👥 Team

- **[Ravi Kant Gupta](https://github.com/DevRaviX)** — Project Lead & Developer

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Water Potability Dataset](https://www.kaggle.com/adityakadiwal/water-potability) (Kaggle)
- [USGS Spatio-Temporal Dataset](https://doi.org/10.1145/3339823)
- [SHAP Library](https://github.com/slundberg/shap)
