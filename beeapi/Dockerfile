FROM python:3.10-alpine

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/puzzles && chmod 777 /app/puzzles

EXPOSE 5000

CMD ["python3", "server.py"]