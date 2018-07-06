#!/usr/bin/env bash

source "include.sh"

yarn electron-packager "$DIR" --overwrite \
                              --platform=darwin \
                              --arch=x64 \
                              --icon="$DIR/assets/icons/mac/icon.icns" \
                              --prune=true \
                              --out=bundle
assert "Built macOS bundle" "Failed to build macOS bundle"
