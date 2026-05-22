#!/usr/bin/env bash

set -xe

# Override the git branch by a manual value
if [ -n "$GIT_BRANCH_MANUAL" ]; then
    GIT_BRANCH="$GIT_BRANCH_MANUAL"
fi

if [ -z "$GIT_BRANCH" ]; then echo "\$GIT_BRANCH not set"; exit 1; fi

# go to root directory of Neos.Neos.Ui
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../../

path_to_yarn=$(which yarn) || true
if [ -z "$path_to_yarn" ] ; then
    echo "installing yarn:"
    npm install -g yarn
fi

GIT_SHA1=`git rev-parse HEAD`
GIT_TAG=`git describe --exact-match HEAD 2>/dev/null || true`

# Override the git tag by a manual value
if [ -n "$GIT_TAG_MANUAL" ]; then
    GIT_TAG="$GIT_TAG_MANUAL"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

export NODE_OPTIONS="--max-old-space-size=4096"

nvm install && nvm use
make clean && make setup
NEOS_UI_VERSION="${GIT_TAG:-${GIT_BRANCH#*/}-dev}" make build-production

rm -Rf tmp_compiled_pkg
git clone --depth 1 git@github.com:neos/neos-ui-compiled.git --single-branch --branch=${GIT_BRANCH/origin\//} tmp_compiled_pkg

mkdir -p tmp_compiled_pkg/Resources/Public/Build

cp -Rf Resources/Public/Build/* tmp_compiled_pkg/Resources/Public/Build

cd tmp_compiled_pkg
git add Resources/Public/
git commit -m "Compile Neos UI - $GIT_SHA1" || true

BRANCH_OR_TAG_PUSHED=0

BASE_BRANCH_PATTERN="^origin\/[0-9]+\.[0-9]$"
if [[ "$GIT_BRANCH" =~ $BASE_BRANCH_PATTERN ]]; then
    echo "Git branch '$GIT_BRANCH' matches pattern, pushing to this branch."
    git push origin HEAD:${GIT_BRANCH#*/}
    BRANCH_OR_TAG_PUSHED=1
fi

if [ "$GIT_TAG" != "" ]; then
    echo "Git tag $GIT_TAG found; also tagging the UI-compiled package."
    git tag -a -m "$GIT_TAG" $GIT_TAG
    git push origin $GIT_TAG
    BRANCH_OR_TAG_PUSHED=1
fi

if [[ BRANCH_OR_TAG_PUSHED -eq 0 ]]; then
  echo "Git branch '$GIT_BRANCH' is not a valid development git branch like ('origin/X.X') and git tag is empty '$GIT_TAG'"
  exit 1
fi
