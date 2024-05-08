echo "Starting setup script"
python setup_db.py &
echo "Starting gunicorn"
gunicorn semse.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120