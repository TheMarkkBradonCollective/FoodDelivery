#!/bin/bash
# Copy built APKs into release/ and refresh version.json (MBC App Store distribution).
set -e
node "$(dirname "$0")/publish-apk.mjs"
