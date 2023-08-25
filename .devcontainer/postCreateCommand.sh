#!/usr/bin/env bash

# ssh installs won't work, let's use https instead
git config --global url.https://github.com/.insteadOf ssh://git@github.com/

# Create .venv and activate it
python -m venv .venv
.venv/bin/activate
