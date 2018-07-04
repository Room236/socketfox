#!/usr/bin/env bash

# exit on interrupt
trap "printf '\n'; exit" INT

# get directory of project
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../" && pwd )"

# text color escape sequences
RESET="\033[0m"
GREEN="\033[32m"
RED="\033[31m"
YELLOW="\033[33m"
BOLD="\033[1m"

# status indicator strings
PASS="✅"
WARN="⚠️"
FAIL="🚫"

# whether or not a warning occurred
warnings=false

# assert that command completed successfully
assert () {
    if [[ "$?" == "0" ]]; then
        printf "$PASS $1\n"
    else
        printf "$FAIL $2\n" >&2
        exit 1
    fi
}

# softly assert that command completed successfully - if not, just print a warning
assert-soft () {
    if [[ "$?" == "0" ]]; then
        printf "$PASS $1\n"
    else
        printf "$WARN $2\n"
        warnings=true
    fi
}

# count down from a certain time
countdown () {
    remaining=$1
    while [ ${remaining} -gt 0 ]; do
        printf "${YELLOW}Wait ${remaining} seconds${RESET}"
        sleep 1
        remaining=$(($remaining - 1))
        printf "\r\033[K"
    done
}