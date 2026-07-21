FROM mcr.microsoft.com/playwright/python:v1.52.0-noble

WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Playwright browsers are already included in the base image

# Copy application code
COPY . .

# Expose port (Render uses PORT env var)
EXPOSE 10000

# Start with gunicorn
CMD gunicorn app:app --bind 0.0.0.0:${PORT:-10000}
