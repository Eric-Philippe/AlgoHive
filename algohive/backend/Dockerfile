# Use a lightweight Go image as a base
FROM golang:1.23-alpine

# Install gcc and musl-dev to compile the Go application
RUN apk add --no-cache gcc musl-dev

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files to cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code into the container
COPY . .

ENV CGO_ENABLED=1

# Build the Go application
RUN go build -o main .

EXPOSE 8080

# Run the Go application
CMD ["./main"]