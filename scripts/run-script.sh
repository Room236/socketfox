#!/usr/bin/env bash

# get directory of project
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )"

# make script executable if it's not
if [[ ! -x "$DIR/scripts/$1.sh" ]]; then
    chmod +x "$DIR/scripts/$1.sh"
fi

# change directory to the scripts folder so the scripts have a reliable working directory
cd "$DIR/scripts"

# run script
printf "\n"
"$DIR/scripts/$1.sh"
printf "\n"

# suppress the exit code so yarn doesn't print any massive error messages - we handle that ourselves
exit 0
