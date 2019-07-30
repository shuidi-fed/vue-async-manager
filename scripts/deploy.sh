#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run docs:build

# navigate into the build output directory
cd docs/.vuepress/dist

git init
git config user.name 'HcySunYang'
git config user.email 'HcySunYang@outlook.com'
git add -A
git commit -m 'deploy'

git push -f git@github.com:vue-contrib/vue-async-manager.git master:gh-pages

cd -

pwd

rm -rf docs/.vuepress/dist