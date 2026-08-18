FROM python:3.11-slim AS base

WORKDIR /app

RUN groupadd --system osint && useradd --system --gid osint --create-home osint

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chown -R osint:osint /app
USER osint

EXPOSE 8000

CMD ["uvicorn", "osint_hub.main:app", "--host", "0.0.0.0", "--port", "8000"]
