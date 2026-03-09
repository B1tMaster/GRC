FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    graphicsmagick \
    ghostscript \
    poppler-utils \
    apt-utils \
    libreoffice \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV PATH="/usr/bin:/usr/local/bin:${PATH}" \
    GS_PATH="/usr/bin/gs" \
    GS_LIB="/usr/share/ghostscript/current:/usr/share/ghostscript/current/Resource/Init" \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Create non-root user and set up permissions
RUN useradd -r -u 1001 -g root pyuser && \
    mkdir -p /tmp/zerox && \
    chown -R pyuser:root /tmp/zerox && \
    chown -R pyuser:root /app

# Install Python dependencies as root first
RUN pip install --no-cache-dir -r requirements.txt

# Copy source after
COPY src/ ./src/
COPY py_zerox/ ./py_zerox/

# Switch to non-root after installation
USER pyuser

# Ensure temp directory exists and has correct permissions
RUN chmod 777 /tmp/zerox

EXPOSE 3000

CMD ["python", "-m", "src.main"]