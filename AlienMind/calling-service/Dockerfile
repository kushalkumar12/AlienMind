# Build stage
FROM golang:1.26.3-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o calling-service ./cmd/server/main.go

# Production stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/calling-service .
EXPOSE 8080 9090
USER 10001:10001
ENTRYPOINT ["./calling-service"]
