FROM python:3.11-slim

WORKDIR /app

# System deps — libgomp1 required by LightGBM
RUN apt-get update && apt-get install -y \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy full backend source
COPY . .

# Train models if the main model artifact is missing.
# On Render free tier this runs once at deploy time and is cached
# in subsequent deploys as long as the build cache is preserved.
RUN python train_pipeline.py

EXPOSE 8000

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
