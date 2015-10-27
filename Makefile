dev:
	webpack-dev-server -d --progress --colors --content-base www/

build: 
	webpack -p

