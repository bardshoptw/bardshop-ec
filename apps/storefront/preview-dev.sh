#!/bin/zsh
# Wrapper so the preview tool (clean env, no nvm) can find Node/npm.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 >/dev/null 2>&1
exec npm run dev
