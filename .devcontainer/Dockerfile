
FROM mcr.microsoft.com/devcontainers/python:3.11-bullseye

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm

# Install valgrind
RUN apt-get install -y valgrind