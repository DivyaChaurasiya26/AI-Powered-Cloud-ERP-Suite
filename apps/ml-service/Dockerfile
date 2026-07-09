FROM python:3.11-slim

# Prophet's pip install compiles a local CmdStan backend, which needs a C++
# toolchain present at install time (python:3.11-slim ships without one).
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential g++ && \
    rm -rf /var/lib/apt/lists/*

# HOME is set before pip install so CmdStan's install directory (~/.cmdstan)
# lands at a fixed, known path regardless of which OS user resolves it later.
ENV HOME=/app
WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

RUN addgroup --system --gid 1001 mlservice && \
    adduser --system --uid 1001 --gid 1001 mlservice

COPY . .
RUN chown -R mlservice:mlservice /app

USER mlservice

EXPOSE 8000

ENV MODEL_STORE_PATH=/app/models

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
