<div align="center">
  <img src="logo.png" alt="TRICP Logo" width="80" height="80" style="border-radius:16px"/>
  <h1>TRICP</h1>
  <p><strong>Telecom Retention Intelligence & Churn Predictor</strong></p>
  <p>Precision churn forecasting and automated retention workflows for telecom businesses.</p>

  <p>
    <a href="https://github.com/reyyishreyas/churn_predictor"><img src="https://img.shields.io/badge/repo-GitHub-181717?logo=github" alt="GitHub"/></a>
    <img src="https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react" alt="React"/>
    <img src="https://img.shields.io/badge/ML-scikit--learn%20%7C%20XGBoost%20%7C%20LightGBM-F7931E" alt="ML"/>
    <img src="https://img.shields.io/badge/python-3.11%2B-3776AB?logo=python" alt="Python"/>
  </p>

  <p>
  </p>
</div>

---

## What is TRICP?

TRICP bridges the gap between complex machine learning and immediate business action. It lets you:

- **Score individual customers** — enter a customer profile and get an instant churn probability, risk classification, and root-cause breakdown.
- **Run bulk campaigns** — upload a CSV of your entire user base, score everyone in seconds, and auto-dispatch targeted retention emails to high-risk accounts.
- **Simulate interventions** — use the what-if simulator to see exactly how changing a contract type, login frequency, or feature usage score would move the churn needle.
- **Inspect the AI** — the Insights page exposes feature importance rankings and model performance metrics so every decision is explainable.

---

## Demo Screenshots

| Dashboard | User Analysis | Simulation |
|-----------|--------------|------------|
| ![dashboard](https://drive.google.com/file/d/11ODBIdkuhP5_27uDWDmn4Uvw5nkcSjuQ/view?usp=sharing) | ![analysis](https://drive.google.com/file/d/1ZKDXrdmYPSYHWk25zouFJTGx3ME-BhsT/view?usp=sharing) | ![sim](https://drive.google.com/file/d/1TBjSXwNVAXnVMbdVemuTWgD-BKXIliSo/view?usp=sharing) |


---

## Core Features

### 1. Single Predict — On-Demand Risk Scoring
Enter a customer's usage metrics to instantly compute:
- **Risk Level** — `Low / Medium / High` classification
- **Churn Probability** — exact percentage from the stacking ensemble
- **Root-Cause Analysis** — feature-level explanation of which behaviours are driving risk
- **Recommended Actions** — personalized intervention steps mapped to the top reasons

### 2. Bulk CSV Upload & Automation
Upload a CSV cohort and TRICP will:
- Score every row through the full ML pipeline
- Segment users into risk buckets
- Auto-dispatch personalised retention emails to qualifying accounts via Gmail SMTP
- Return an enriched CSV with churn scores, engagement labels, and recommended actions appended per row

### 3. What-If Simulation
Adjust sliders for login frequency, feature usage, payment failures, and contract type. TRICP recalculates the churn probability in real time and shows you the absolute and relative delta — so your team can evaluate interventions before committing to them.

### 4. Transparent AI — Model Insights
- **Feature Importance** — ranked bar chart of the top predictors from the stacking ensemble
- **Model Metrics** — Accuracy, ROC AUC, Precision, and Recall for every trained model
- **Model Comparison Table** — side-by-side benchmark of Stacking Ensemble vs. Logistic Regression vs. Random Forest

### 5. Personalised Retention Emails
The email engine selects from **8 scenario-specific templates** based on the strongest detected churn reason — no generic blasts:

| Template | Triggered by |
|---|---|
| High-Value Risk | High-spend customer with elevated churn probability |
| Billing / Payment Issue | Payment failures or Electronic check payment method |
| Inactivity | Last login ≥ 21 days ago |
| Early Lifecycle Risk | Tenure ≤ 6 months (onboarding risk) |
| Price Sensitivity | Monthly charges ≥ $85 |
| Low Engagement | Logins < 2.5/week or feature usage score < 40 |
| Low Product Adoption | Fewer than 3 active services |
| Contract Commitment | Month-to-month contract |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python 3.11+, FastAPI, Uvicorn |
| ML Training | scikit-learn, XGBoost, LightGBM, imbalanced-learn (SMOTE) |
| ML Serving | joblib, Stacking Ensemble (XGB + LGB + GBM + RF → LR meta) |
| Frontend | React 19, TypeScript, Vite 8 |
| UI Components | shadcn/ui, Radix UI primitives, Tailwind CSS 3 |
| Charts | Recharts |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Email | Python SMTP (Gmail / any SMTP provider) |
| Data | Telco Customer Churn dataset (7,043 records) |

---

## Repository Structure

```
churn_predictor/
│
├── logo.png                          # TRICP brand logo
│
├── backend/
│   ├── train_pipeline.py             # Full training script — run once to generate artifacts
│   ├── requirements.txt
│   ├── .env.example                  # Copy to .env and fill in SMTP credentials
│   ├── Dockerfile
│   │
│   ├── app/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── config/
│   │   │   └── settings.py           # App settings loaded from .env
│   │   ├── models/
│   │   │   ├── preprocessor.py       # ChurnPreprocessor class (fit/transform)
│   │   │   └── schemas.py            # Pydantic request/response schemas
│   │   ├── routes/
│   │   │   ├── churn.py              # All prediction, batch, simulation, insights endpoints
│   │   │   └── health.py             # GET /health
│   │   ├── services/
│   │   │   ├── artifact_store.py     # Loads .pkl artifacts with caching
│   │   │   ├── batch_service.py      # CSV parsing, bulk scoring, email dispatch
│   │   │   ├── email_service.py      # compose_retention_email + SMTP send
│   │   │   ├── email_templates.py    # 8 scenario templates + selection logic
│   │   │   ├── engagement_service.py # Engagement score calculation
│   │   │   ├── explainability_service.py  # Local feature attribution
│   │   │   ├── insights_service.py   # Dataset-level aggregated metrics
│   │   │   ├── intervention_engine.py     # Action logging and dispatch simulation
│   │   │   ├── prediction_service.py # Single-user end-to-end prediction
│   │   │   ├── recommendation_service.py  # Action → reason mapping
│   │   │   ├── segmentation_service.py    # User segment classification
│   │   │   └── simulation_service.py      # What-if comparison logic
│   │   └── utils/
│   │       ├── feature_helpers.py    # Business feature derivation, reason candidates
│   │       └── logger.py             # Structured JSON logging
│   │
│   ├── artifacts/                    # Generated by train_pipeline.py (not committed)
│   │   ├── model.pkl                 # Stacking ensemble
│   │   ├── scaler.pkl
│   │   ├── preprocessor.pkl
│   │   ├── feature_columns.pkl
│   │   ├── logistic_regression.pkl
│   │   ├── random_forest.pkl
│   │   └── metadata.json             # Feature importance + model metrics
│   │
│   ├── data/
│   │   └── churn.csv                 # Training dataset (Telco churn, 7,043 rows)
│   │
│   └── logs/                         # Runtime logs (not committed)
│       ├── action_log.jsonl
│       ├── batch_email.jsonl
│       ├── batch_service.log
│       ├── email_service.log
│       └── intervention_engine.log
│
├── frontend-react/
│   ├── src/
│   │   ├── App.tsx                   # Router + AppLoader
│   │   ├── main.tsx
│   │   ├── index.css                 # Global design tokens + CSS variables
│   │   ├── App.css                   # Page transition animations
│   │   ├── components/
│   │   │   ├── AppLoader.tsx         # Branded splash screen on first load
│   │   │   ├── ParticleCanvas.tsx    # Interactive neural-network particle system
│   │   │   ├── layout/
│   │   │   │   └── Layout.tsx        # Sidebar navigation + top header
│   │   │   └── ui/                   # shadcn/ui component library
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Overview + charts + TRICP intro
│   │   │   ├── UserAnalysis.tsx      # Single prediction form + result panel
│   │   │   ├── Insights.tsx          # Feature importance + model metrics
│   │   │   ├── Simulation.tsx        # What-if slider interface
│   │   │   └── BatchUpload.tsx       # CSV drag-drop + batch job results
│   │   └── lib/
│   │       ├── api.ts                # Axios API client
│   │       └── utils.ts              # Tailwind class merge utility
│   ├── public/
│   │   └── logo.png
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
│
└── notebooks/
    ├── churn_model.ipynb             # Original model development notebook
    └── churnpredictordataset.ipynb   # Exploratory data analysis
```

---

## ML Architecture

The production model is a **Stacking Ensemble** trained on 7,043 telco customer records.

```
Training pipeline (backend/train_pipeline.py)
│
├── Preprocessing
│   ├── Feature engineering  (ChargesPerMonth, TenureBucket, ServiceCount, ContractRisk, HighValue)
│   ├── Binary encoding      (gender, Partner, Dependents, PhoneService, PaperlessBilling)
│   └── One-hot encoding     (Contract, InternetService, PaymentMethod, …)
│
├── SMOTE oversampling       (handles class imbalance in training set)
├── StandardScaler
│
├── Base learners
│   ├── XGBoost              (500 estimators, lr=0.05, max_depth=6)
│   ├── LightGBM             (500 estimators, lr=0.05, num_leaves=40)
│   ├── GradientBoosting     (300 estimators, lr=0.05, max_depth=5)
│   └── Random Forest        (300 estimators, class_weight=balanced)
│
└── Meta-learner: Logistic Regression  (5-fold cross-val stack)
```

**Current model performance** (classification threshold = 0.35):

| Model | Accuracy | ROC AUC | Precision | Recall |
|---|---|---|---|---|
| Stacking Ensemble | 76.9% | 82.7% | 55.0% | 70.1% |
| Logistic Regression | 74.8% | 84.3% | 51.7% | 77.5% |
| Random Forest | 74.2% | 82.4% | 51.0% | 75.9% |

> XGBoost and LightGBM are base learners inside the stack. They contribute to ensemble predictions and are not independently benchmarked.

---

## API Reference

All endpoints served at `http://localhost:8000`. Interactive docs at `/docs`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check + version |
| `POST` | `/predict` | Single customer churn score, reasons, and actions |
| `POST` | `/simulate` | What-if comparison between base and updated user |
| `POST` | `/batch-predict` | CSV upload → bulk scoring + optional email dispatch |
| `GET` | `/insights` | Dataset-level metrics, feature importance, engagement distribution |
| `GET` | `/model-metrics` | Model comparison metrics only |

### Example — Single Predict

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "cust-001",
    "gender": "Female",
    "SeniorCitizen": 0,
    "Partner": "Yes",
    "Dependents": "No",
    "tenure": 12,
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "Fiber optic",
    "OnlineSecurity": "No",
    "OnlineBackup": "Yes",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "Yes",
    "StreamingMovies": "Yes",
    "Contract": "Month-to-month",
    "PaperlessBilling": "Yes",
    "PaymentMethod": "Electronic check",
    "MonthlyCharges": 79.90,
    "TotalCharges": 959.0,
    "days_since_last_login": 18,
    "avg_logins_per_week": 2.1,
    "feature_usage_score": 42.0,
    "payment_failures_90d": 1
  }'
```

---

## Setup & Running Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone

```bash
git clone https://github.com/reyyishreyas/churn_predictor.git
cd churn_predictor
```

### 2. Backend

```bash
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### 3. Train the models

Generates all `.pkl` artifacts under `backend/artifacts/`. Skip if artifacts are already present.

```bash
python backend/train_pipeline.py
```

### 4. Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in your SMTP credentials if you want real emails to send:

```env
GMAIL_ADDRESS=your@gmail.com
GMAIL_APP_PASSWORD=your-app-password
MAIL_FROM_NAME=Retention Team
CHURN_TRIGGER_THRESHOLD=0.60
EMAIL_BATCH_MIN_RISK=threshold   # threshold | medium | high
```

If left blank, the system runs in stub mode — emails are logged but not sent.

### 5. Start the API

```bash
# from backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000` · Docs at `http://localhost:8000/docs`

### 6. Start the frontend (new terminal)

```bash
cd frontend-react
npm install
npm run dev
```

Frontend available at `http://localhost:5173`

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `CHURN_TRIGGER_THRESHOLD` | `0.60` | Probability above which interventions fire |
| `EMAIL_BATCH_MIN_RISK` | `threshold` | `threshold` · `medium` · `high` — controls who gets an email in batch jobs |
| `GMAIL_ADDRESS` | — | Gmail address used as SMTP sender |
| `GMAIL_APP_PASSWORD` | — | Gmail App Password (not your login password) |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | `587` | SMTP port |
| `MAIL_FROM_NAME` | `Retention Team` | Display name in outgoing emails |
| `EMAIL_MODE` | auto-detected | `smtp` or `stub` |

> **Never commit `backend/.env`** — it is in `.gitignore`.

---

## Batch CSV Format

The batch upload endpoint expects a CSV with the following columns:

**Required:**
```
user_id (or customer_id), email,
gender, SeniorCitizen, Partner, Dependents, tenure,
PhoneService, MultipleLines, InternetService,
OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport,
StreamingTV, StreamingMovies, Contract, PaperlessBilling,
PaymentMethod, MonthlyCharges, TotalCharges
```

**Optional (behavioural signals — improve accuracy):**
```
days_since_last_login, avg_logins_per_week,
avg_session_duration_minutes, feature_usage_score,
payment_failures_90d, support_tickets_30d, activity_trend_pct
```

> The `Churn` column is ignored if present. A `Churn` value of `Yes/No` in your CSV will not affect predictions.

---

## Notebooks

The `notebooks/` directory contains the original Jupyter notebooks used to develop and validate the ML pipeline. These are the source of truth for the model architecture and are important for understanding how the production system was built.

```
notebooks/
├── churn_model.ipynb             # Primary model development notebook
└── churnpredictordataset.ipynb   # Dataset exploration and model training
```

### `churn_model.ipynb` — Model Development

This is the canonical notebook where the full training pipeline was designed and validated. It documents every decision that was later productionised into `backend/train_pipeline.py`.

**What it covers:**

| Step | Details |
|---|---|
| Data loading | Reads `churn.csv`, drops `customerID`, coerces `TotalCharges` to numeric, fills NaN with median |
| Target encoding | `Churn` → binary int (Yes=1, No=0) |
| Feature engineering | `ChargesPerMonth`, `MonthlyToTotal`, `TenureBucket` (0/1/2 buckets), `ServiceCount`, `HighValue`, `ContractRisk` |
| Encoding | Binary map for gender/yes-no fields; `pd.get_dummies` for multi-class categoricals |
| Train/test split | 80/20, stratified on `Churn`, `random_state=42` |
| Class imbalance | SMOTE oversampling applied to training set only |
| Scaling | `StandardScaler` fit on SMOTE-resampled training data |
| Base learners | XGBoost (500 est, lr=0.05, depth=6), LightGBM (500 est, lr=0.05, 40 leaves), GradientBoosting (300 est), Random Forest (300 est, balanced) |
| Meta-learner | `StackingClassifier` with 5-fold CV → `LogisticRegression` |
| Threshold | `0.35` (not default 0.5) — tuned to improve recall on the minority churn class |
| Artifacts saved | `ensemble.pkl`, `scaler.pkl`, `preprocessor.pkl`, `feature_columns.pkl` |

**Actual output from the notebook:**

```
Accuracy : 0.7615  →  76.2%
ROC-AUC  : 0.8269  →  82.7%

              precision  recall  f1-score  support
Non-churners    0.88      0.79    0.83      1035
Churners        0.54      0.70    0.61       374

Confusion matrix:
[[813  222]
 [114  260]]
```

> The 0.35 classification threshold was deliberately chosen over 0.5 to prioritise recall — catching more real churners at the cost of some precision is more valuable for a retention use case.

### `churnpredictordataset.ipynb` — Dataset Exploration

This notebook walks through the same pipeline with a focus on understanding the dataset structure, feature distributions, and class imbalance before model training. It serves as the exploratory foundation for all feature engineering decisions.

### Running the notebooks locally

```bash
# Install Jupyter if needed
pip install notebook

# Launch from repo root
jupyter notebook notebooks/
```

> The notebooks reference `churn.csv` directly. Either copy `backend/data/churn.csv` into the `notebooks/` directory or update the path in the notebook cell before running.

---

## Deployment

### Backend (Docker)

```bash
docker build -t tricp-backend ./backend
docker run -p 8000:8000 --env-file backend/.env tricp-backend
```

### Frontend

```bash
cd frontend-react
npm run build          # outputs to frontend-react/dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages, S3). Set the environment variable:

```
VITE_API_URL=https://your-backend-url.com
```

---

## License

MIT — see `LICENSE` for details. Add a `LICENSE` file if publishing.

---

<div align="center">
  <sub>Built with FastAPI · React · scikit-learn · XGBoost · LightGBM</sub>
</div>
