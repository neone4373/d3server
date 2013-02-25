# -*- coding: utf-8 -*-
"""
    This little bit of code powers my d3Sever!!!

"""
import os, analytics
from flask import Flask, jsonify, render_template, request, abort
from jinja2 import TemplateNotFound
from flask.ext.assets import Environment, Bundle

analytics.init('82cl6i9bo6h4cnptal9b')

#instatntiate the web app 
app = Flask(__name__)



#determines if I am using this on Titan and turns of analytics
@app.context_processor
def isItTitan():
  if 'COMPUTERNAME' in os.environ.keys():
    t = os.environ['COMPUTERNAME'] == 'TITAN'
  else:
    t = False
  return dict(Titan = t)

#sets the asset environment to allow for scss compiling :)
if 'COMPUTERNAME' in os.environ.keys():
  if os.environ['COMPUTERNAME'] == 'TITAN'
    qq = True
if qq:
  app.debug = True

assets = Environment(app)
assets.url = app.static_url_path
scss = Bundle('stylyn.scss', filters='pyscss', output='all.css')
assets.register('scss_all', scss)


#define the rout for the index page
@app.route('/')
def index():
    return render_template('index.html')

#this nifty code just makes it so routes will be queried based on what
# the user enters in the URI if the page exists it is displayed :)
@app.route('/<page>')
def show(page):
    try:
        return render_template('%s.html' % page)
    except TemplateNotFound:
        abort(404)

#this makes the app initiate
if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)


