# This Dockerfile is used as standalone container for simple deployments, it will be built automatically by GH Actions in the build.yml
FROM python:3.10-buster

# Copy everything from our backend to our app folder # need to copy backend because we have to install the python packages
COPY visyn_core/ /app/visyn_core/
COPY Makefile MANIFEST.in README.md setup.py setup.cfg package.json requirements.txt requirements_dev.txt /app/

# define target folder
WORKDIR /app/

# Install some build tools and finally python dependencies (numpy is required to build opentsne)
RUN make install

# Override the setttings.py to use include the bundled frontend
ENV VISYN_CORE__BUNDLES_DIR /app/bundles

# copy the pre-built front-end --> comment for development because we mount the volume anyway
COPY bundles/ /app/bundles/

# expose default port
EXPOSE 9000

CMD ["uvicorn", "visyn_core.server.main:app", "--host", "0.0.0.0", "--port", "9000"]
