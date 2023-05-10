visyn_core  
=====================
[![NPM version](https://badge.fury.io/js/visyn_core.svg)](https://npmjs.org/package/visyn_core)
[![build](https://github.com/datavisyn/visyn_core/actions/workflows/build.yml/badge.svg?branch=develop)](https://github.com/datavisyn/visyn_core/actions/workflows/build.yml)

Installation
------------

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

Local development
------------

```bash
# Frontend
yarn start

# Backend
python visyn_core
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

<a href="https://www.datavisyn.io"><img src="https://www.datavisyn.io/wp-content/uploads/2021/11/datavisyn_RGB_A.svg" align="left" width="200px" hspace="10" vspace="6"></a>