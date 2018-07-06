#!/usr/bin/env bash

source "include.sh"

yarn electron-packager "DIR" socketfox --overwrite \
                                       --asar=true \
                                       --platform=linux \
                                       --arch=x64 \
                                       --icon=assets/icons/png/1024x1024.png \
                                       --prune=true \
                                       --out=release
assert "Built Linux bundle" "Failed to build Linux bundle"
