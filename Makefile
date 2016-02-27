WEBPACK_RUNNING := $(shell pgrep -f webpack-dev-server)

size:
	NODE_ENV=prod webpack --json | analyze-bundle-size
dev:
ifndef WEBPACK_RUNNING
	  NODE_ENV=dev webpack-dev-server -d --progress --colors --content-base www/
endif

build: 
	NODE_ENV=prod webpack -p

testunit:
	./node_modules/.bin/mocha --compilers js:babel-core/register

teste2e: dev 
	# phantomjs doesn't support vdom-parser (and slimerjs is not supported by mocha-casperjs...)
	# ./node_modules/.bin/mocha-casperjs test/e2e/*
	# ./node_modules/.bin/mocha-casperjs --engine=slimerjs test/e2e/*
	./node_modules/.bin/casperjs --engine=slimerjs test test/e2e/*

test:testunit teste2e
