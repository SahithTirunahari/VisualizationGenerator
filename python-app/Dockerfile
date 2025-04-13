# Dockerfile for python-app
FROM python:3.9-slim

WORKDIR /app

# Install dependencies from requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the external script into the container
COPY your_script.py .

# Default command; note that this may be overridden by your backend's run command
CMD ["python"]

