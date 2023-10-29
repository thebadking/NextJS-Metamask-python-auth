#!/bin/bash
imageName=fastapi-app:latest
containerName=fastapi-container

# Build the Docker image
docker build -t $imageName -f Dockerfile .

# Delete old container if it exists
if [ $(docker ps -aqf "name=$containerName") ]; then
    echo "Delete old container..."
    docker rm -f $containerName
fi

# Run new container
echo "Run new container..."
docker run -d -p 8000:8000 --name $containerName $imageName
