#!/usr/bin/env bash

source "include.sh"

# run tslint tests first
node "$DIR/node_modules/tslint/bin/tslint" --project "$DIR"
assert "Lint tests passed" "Lint tests failed"

# run typescript compiler
node "$DIR/node_modules/typescript/bin/tsc"
assert "Compiled TypeScript files" "Failed to compile TypeScript files"
