# Use an official Python runtime as a parent image
FROM python:3.11.9

# Set environment variables for Python
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /app

# install ffmpeg as well as ffprobe
RUN apt-get update && apt-get install -y ffmpeg

COPY requirements.txt /app
# Install gunicorn
RUN pip install gunicorn

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt


# Expose the port your Django app runs on
EXPOSE 8000