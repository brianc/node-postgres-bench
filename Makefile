.PHONY: clean install

install:
	rm -r node_modules || true
	npm install pg@3.4.5
	mv node_modules/pg node_modules/pg@3.4.5
	npm install
	node index.js
