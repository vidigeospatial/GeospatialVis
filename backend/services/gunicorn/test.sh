#! /bin/bash
gunicorn --bind 0.0.0.0:6010 wsgi:app