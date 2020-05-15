PATH        := ./node_modules/.bin:${PATH}

NPM_PACKAGE := $(shell support/getGlobalName.js package)
NPM_VERSION := $(shell support/getGlobalName.js version)

GLOBAL_NAME := $(shell support/getGlobalName.js global)
BUNDLE_NAME := $(shell support/getGlobalName.js microbundle)

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut -b -6) master)
GITHUB_PROJ := https://github.com//camelaissani//markdown-it-include

build: lint bundle test coverage todo

lint:
	eslint .

lintfix:
	eslint --fix .

bundle:
	-rm -rf ./dist
	mkdir dist
	microbundle --no-compress --target node --strict --name ${GLOBAL_NAME}
	npx prepend-header 'dist/*js' support/header.js

test:
	mocha

coverage:
	-rm -rf coverage
	-rm -rf .nyc_output
	cross-env NODE_ENV=test nyc mocha

report-coverage: lint coverage

test-ci: lint coverage
	nyc report --reporter=text-lcov | coveralls && rm -rf ./nyc_output

todo:
	@echo ""
	@echo "TODO list"
	@echo "---------"
	@echo ""
	grep 'TODO' -n -r ./ --exclude-dir=node_modules --exclude-dir=unicode-homographs --exclude-dir=dist --exclude-dir=coverage --exclude=Makefile 2>/dev/null || test true

clean:
	-rm -rf ./coverage/
	-rm -rf ./dist/
	-rm -rf ./.nyc_output/

superclean: clean
	-rm -rf ./node_modules/
	-rm -f ./package-lock.json

prep: superclean
	-ncu -a --packageFile=package.json
	-npm install
	-npm audit fix


.PHONY: clean superclean prep publish lint fix test todo coverage report-coverage doc build gh-doc bundle
.SILENT: help lint test todo
