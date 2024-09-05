# visyn_core

[![NPM version](https://badge.fury.io/js/visyn_core.svg)](https://npmjs.org/package/visyn_core)
[![build](https://github.com/datavisyn/visyn_core/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/datavisyn/visyn_core/actions/workflows/build.yml)

## Features

- [Telemetry](./docs/TELEMETRY.md): OpenTelemetry integration for the three pillar of observability: metrics, logs, and traces

## Installation

```bash
git clone -b develop https://github.com/datavisyn/visyn_core.git  # or any other branch you want to develop in
cd visyn_core

# Frontend
yarn install

# Backend
python3 -m venv .venv  # create a new virtual environment
source .venv/bin/activate  # active it
make develop  # install all dependencies
```

## Local development

```bash
# Frontend
yarn start

# Backend
python visyn_core
```

## Testing

```bash
# Frontend
yarn run test

# Backend
make test
```

### Playwright and Chromatic

To run all tests and create snapshots, execute Playwright first. With this command all snapshots are already taken and captured in an archive. Make sure to commit all your changes before taking any snapshots.
Before executing this command, make sure backend and frontend are running smoothly.

```bash
yarn pw:run
```

To upload these snapshots to Chromatic’s cloud and review them, execute:

```bash
yarn chromatic --playwright -t=<TOKEN>
```

Chromatic creates for every test a story in storybook, although these are not responsive. When clicking on the link in the terminal, all changes can be reviewed and storybook can be opened.

Playwright documentation: [https://playwright.dev/docs/intro](https://playwright.dev/docs/intro)

Chromatic with Playwright: [https://www.chromatic.com/docs/playwright/](https://www.chromatic.com/docs/playwright/)

## Building

```
yarn run build
```

---

<a href="https://www.datavisyn.io"><img src="https://www.datavisyn.io/wp-content/uploads/2021/11/datavisyn_RGB_A.svg" align="left" width="200px" hspace="10" vspace="6"></a>
