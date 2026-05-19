package config

import (
	"os"
)

type Config struct {
	HttpPort            string
	GrpcPort            string
	RedisURL            string
	LivekitURL          string
	LivekitApiKey       string
	LivekitApiSecret    string
	WebhookSharedSecret string
}

func Load() *Config {
	return &Config{
		HttpPort:            getEnv("HTTP_PORT", "8080"),
		GrpcPort:            getEnv("GRPC_PORT", "9090"),
		RedisURL:            getEnv("REDIS_URL", "redis://localhost:6379"),
		LivekitURL:          getEnv("LIVEKIT_URL", "http://localhost:7880"),
		LivekitApiKey:       getEnv("LIVEKIT_API_KEY", "devkey"),
		LivekitApiSecret:    getEnv("LIVEKIT_API_SECRET", "secret"),
		WebhookSharedSecret: getEnv("WEBHOOK_SHARED_SECRET", "webhook-secret"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
