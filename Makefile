.PHONY: packageS3, clean, package

packageS3:
	mkdir -p .dist
	mkdir -p .dist/static
	mkdir -p .dist/info
	mkdir -p .dist/statement
	cp index.html .dist/index.html
	cp index.html .dist/info
	cp index.html .dist/statement
	cp index.html .dist/info/index.html
	cp index.html .dist/statement/index.html
	npm run build-js
	npm run build-css
	cp -r static/* .dist/static/
	cp .htaccess .dist/.htaccess

package:
	mkdir -p .dist
	mkdir -p .dist/static
	cp index.html .dist/index.html
	npm run build-js
	npm run build-css
	cp -r static/* .dist/static/
	cp .htaccess .dist/.htaccess

clean:
	rm -rf .dist