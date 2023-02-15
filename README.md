visyn_core  
=====================
[![NPM version](https://badge.fury.io/js/visyn_core.svg)](https://npmjs.org/package/visyn_core)
[![build](https://github.com/datavisyn/visyn_core/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/datavisyn/visyn_core/actions/workflows/build.yml)


Target discovery platform for exploring rankings of genes, disease models, and other entities.

Installation
------------

```bash
git clone -b develop https://github.com/datavisyn/core.git  # or any other branch you want to develop in
cd core

# Frontend
yarn install

# Backend
python3 -m venv .venv  # create a new virtual environment
source .venv/bin/activate  # active it
make develop  # install all dependencies
```

Local development
------------

```bash
# Frontend
yarn start

# Backend
python core
```

Testing
-------

```bash
# Frontend
yarn run test

# Backend
make test
```

Building
--------

```
yarn run build
```



***

<a href="https://www.datavisyn.io"><img src="https://www.datavisyn.io/img/logos/datavisyn-logo.png" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of the **Target Discovery Platform** (TDP). For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](https://wiki.datavisyn.io).
