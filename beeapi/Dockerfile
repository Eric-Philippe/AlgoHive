FROM python:3.10-alpine

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/puzzles && chown -R 1000:1000 /app/puzzles

USER 1000:1000

EXPOSE 5000

CMD ["python3", "server.py"]