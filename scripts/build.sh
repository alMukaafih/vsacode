#!/usr/bin/env bash
#
# Build Vsacode program.

#####################################################
# main
main() {
    npx tsc
    chmod +x ./dist/vsacode.js
    cp config.toml ./dist
}

# Code
main "$@"
