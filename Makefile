.PHONY: package, clean

package:
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

clean:
	rm -rf .dist