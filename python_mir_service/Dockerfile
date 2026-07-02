FROM python:3.10-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Pre-install Cython, numpy, and scipy so madmom setup.py compiles successfully
RUN pip install --no-cache-dir --upgrade pip wheel setuptools Cython "numpy<2.0.0" scipy==1.12.0

# Install madmom with --no-build-isolation to use pre-installed Cython
RUN pip install --no-cache-dir --no-build-isolation madmom>=0.16.1

COPY --chown=user requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=user . /app

EXPOSE 7860

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
