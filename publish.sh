#!/bin/bash
# set -e

npm run docs:clean 
npm run docs:build 
# cp CNAME _book
cd _book && git init 
git commit --allow-empty -m 'update book' 
git checkout -b gh-pages && touch .nojekyll 
git add . && git commit -am 'update book' 
git push git@github.com:zhujinxuan/redux-declare gh-pages --force
