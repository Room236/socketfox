#!/usr/bin/env bash

source "include.sh"

yarn electron-packager "DIR" socketfox --overwrite \
                                       --asar=true \
                                       --platform=win32 \
                                       --arch=ia32 \
                                       --icon=assets/icons/win/icon.ico \
                                       --prune=true \
                                       --out=release \
                                       --version-string.CompanyName=CE \
                                       --version-string.FileDescription=CE \
                                       --version-string.ProductName="Socketfox"
assert "Built Windows bundle" "Failed to build Windows bundle"
