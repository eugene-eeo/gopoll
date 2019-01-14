build:
	python tplgen.py

deploy:
	git push origin
	git push heroku master
