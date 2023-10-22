#Builder Stage
FROM python:3.9.12-slim AS builder

#for psql dependcies
RUN apt-get update && \
    apt-get install -y libpq-dev gcc g++

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"


RUN apt-get update && \
    apt-get install -y libpq-dev && \
    apt-get install libgdal-dev -y && \
    rm -rf /var/lib/apt/lists/* 

COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install gunicorn gevent==22.8.0
# RUN pip install fiona
# RUN python -m nltk.downloader punkt


# Operational Stage
FROM python:3.9.12-slim 

    # apt-get install -y libgdal-dev
# RUN apt-get install --yes libgdal-dev

COPY --from=builder /opt/venv /opt/venv

WORKDIR /code

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PATH="/opt/venv/bin:$PATH"

COPY . /code/