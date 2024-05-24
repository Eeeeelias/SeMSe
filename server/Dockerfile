FROM python:3.11.9

# Set environment variables for Python
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY requirements.txt /app
RUN pip install gunicorn

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt


EXPOSE 8000

# execute the start.sh script to start the server
CMD ["sh", "start.sh"]