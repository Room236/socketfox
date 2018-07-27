#!/usr/bin/env bash

source "include.sh"

# run tslint tests first
node "$DIR/node_modules/tslint/bin/tslint" --project "$DIR"
assert "Lint tests passed" "Lint tests failed"

# run typescript compiler
node "$DIR/node_modules/typescript/bin/tsc"
assert "Compiled TypeScript files" "Failed to compile TypeScript files"

# run sass compiler
node "$DIR/node_modules/sass/sass.js" ${DIR}/app/assets/scss/* "$DIR/app/assets/css/styles.css"
assert "Compiled SCSS files" "Failed to compile SCSS files"
