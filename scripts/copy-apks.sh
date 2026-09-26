#!/bin/bash
# Copy built APKs into release/apks/* + release/latest/ and refresh version.json.
set -e
node "$(dirname "$0")/publish-apk.mjs"
