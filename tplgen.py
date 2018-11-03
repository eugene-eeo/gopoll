import os
import json

with open('frontend/js/templates.js', mode='w') as fp:
    t = json.dumps({
        template: open(os.path.join('templates', template)).read()
        for template in os.listdir('templates')
    })
    fp.write(f'window.Templates = {t}\n')
