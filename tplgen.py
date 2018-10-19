import os
import json

templates = {}

for template in os.listdir('templates'):
    content = open(os.path.join('templates', template)).read()
    templates[template] = json.dumps(content)

with open('frontend/js/templates.js', mode='w') as fp:
    fp.write('window.Templates = {}\n')
    for key, value in templates.items():
        fp.write(f'window.Templates["{key}"] = {value};\n')
