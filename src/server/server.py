import os
import string
import sys
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, make_response
import uuid
import json
import datetime

app = Flask(__name__, static_url_path='', static_folder='public')
def getSecret():
    secret_path = 'server/secrets'
    os.system(f'mkdir -p {secret_path}')
    secret_path += '/secret'
    try:
        with open(secret_path, 'r') as s:
            return s.readlines()[0][:-1]
    except FileNotFoundError:
        import secrets
        with open(secret_path, 'w') as s:
            tok = secrets.token_urlsafe(64)
            s.write(tok)
            s.flush()
            return tok
app.config['SECRET_KEY'] = getSecret()

@app.route('/')
@app.route('/home')
def Home():
    return app.send_static_file('index.html')

@app.route('/assets/<path:path>')
def Assets(path):
    return app.send_static_file(f'assets/{path}')

@app.route('/portal')
def Portal():
    return app.send_static_file('index.html')

URL_ROOT = 'http://localhost:12001'
API_PREFIX = 'api/v1'

