build:
	python tplgen.py

watch:
	node watch.js

concat:
	cat frontend/js/jquery.js \
		frontend/js/jquery.hashroute.js \
		frontend/js/mustache.js \
		frontend/js/templates.js \
		frontend/js/semantic.min.js \
		frontend/js/ui.js > frontend/js/dist.js

minify:
	cat frontend/js/dist.js | node_modules/.bin/uglifyjs --compress --mangle > tmp.js
	mv tmp.js frontend/js/dist.js

deploy:
	git push origin
	git push heroku master
