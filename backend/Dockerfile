# backend/Dockerfile
FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /app/

# Copy the certificates (assuming they are in backend/certs/)
COPY certs/backend.crt /app/certs/backend.crt
COPY certs/backend.key /app/certs/backend.key

EXPOSE 8000

RUN python manage.py makemigrations && python manage.py migrate

# Run Gunicorn with HTTPS options
CMD ["gunicorn", "secure_file_share.wsgi:application", "--bind", "0.0.0.0:8000"]

