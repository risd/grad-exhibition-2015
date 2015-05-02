.PHONY: package, clean

package:
	mkdir -p .dist
	mkdir -p .dist/static
	cp index.html .dist/index.html
	npm run build-js
	npm run build-css
	cp -r static/* .dist/static/

clean:
	rm -rf .dist