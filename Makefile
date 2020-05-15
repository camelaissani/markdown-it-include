PATH        := ./node_modules/.bin:${PATH}

NPM_PACKAGE := $(shell node -e 'process.stdout.write(require("./package.json").name)')
NPM_VERSION := $(shell node -e 'process.stdout.write(require("./package.json").version)')

TMP_PATH    := /tmp/${NPM_PACKAGE}-$(shell date +%s)

REMOTE_NAME ?= origin
REMOTE_REPO ?= $(shell git config --get remote.${REMOTE_NAME}.url)

CURR_HEAD   := $(firstword $(shell git show-ref --hash HEAD | cut -b -6) master)
GITHUB_PROJ := https://github.com//camelaissani//markdown-it-include

lint:
	eslint .

test: lint
	mocha -R spec

coverage:
	rm -rf .nyc_output
	nyc mocha

test-ci: lint coverage
	nyc report --reporter=text-lcov | coveralls && rm -rf ./nyc_output

browserify:
	rm -rf ./dist
	mkdir dist
	# Browserify
	( printf "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" ; \
		browserify ./ -s markdownitInclude \
		) > dist/markdown-it-include.js
	# Minify
	uglifyjs dist/markdown-it-include.js -b beautify=false,ascii_only=true -c -m \
		--preamble "/*! ${NPM_PACKAGE} ${NPM_VERSION} ${GITHUB_PROJ} @license MIT */" \
		> dist/markdown-it-include.min.js

.PHONY: lint test coverage
.SILENT: lint test