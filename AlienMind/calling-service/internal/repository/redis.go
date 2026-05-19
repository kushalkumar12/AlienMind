package repository

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/kushalkumar12/alienmind/calling-service/internal/domain"
)

type RedisCallRepository struct {
	client *redis.Client
}

func NewRedisCallRepository(redisURL string) (*RedisCallRepository, error) {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse redis url: %w", err)
	}

	client := redis.NewClient(opts)
	// Check connection
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to redis: %w", err)
	}

	return &RedisCallRepository{client: client}, nil
}

func (r *RedisCallRepository) sessionKey(roomID string) string {
	return fmt.Sprintf("calling:session:%s", roomID)
}

func (r *RedisCallRepository) SaveSession(ctx context.Context, session *domain.CallSession) error {
	data, err := json.Marshal(session)
	if err != nil {
		return fmt.Errorf("failed to marshal session: %w", err)
	}

	key := r.sessionKey(session.RoomID)
	// Set TTL to 24 hours to auto-expire stale sessions
	err = r.client.Set(ctx, key, data, 24*time.Hour).Err()
	if err != nil {
		return fmt.Errorf("failed to save session to redis: %w", err)
	}
	return nil
}

func (r *RedisCallRepository) GetSession(ctx context.Context, roomID string) (*domain.CallSession, error) {
	key := r.sessionKey(roomID)
	data, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return nil, fmt.Errorf("session not found: %s", roomID)
		}
		return nil, fmt.Errorf("failed to get session from redis: %w", err)
	}

	var session domain.CallSession
	if err := json.Unmarshal(data, &session); err != nil {
		return nil, fmt.Errorf("failed to unmarshal session: %w", err)
	}

	return &session, nil
}

func (r *RedisCallRepository) UpdateSessionStatus(ctx context.Context, roomID string, status domain.CallStatus) error {
	session, err := r.GetSession(ctx, roomID)
	if err != nil {
		return err
	}

	session.Status = status
	return r.SaveSession(ctx, session)
}

func (r *RedisCallRepository) SetSessionStart(ctx context.Context, roomID string, startTime time.Time) error {
	session, err := r.GetSession(ctx, roomID)
	if err != nil {
		return err
	}

	session.StartedAt = &startTime
	session.Status = domain.CallStatusActive
	return r.SaveSession(ctx, session)
}

func (r *RedisCallRepository) SetSessionEnd(ctx context.Context, roomID string, endTime time.Time) error {
	session, err := r.GetSession(ctx, roomID)
	if err != nil {
		return err
	}

	session.EndedAt = &endTime
	session.Status = domain.CallStatusCompleted
	return r.SaveSession(ctx, session)
}
