package domain

import (
	"context"
	"time"
)

type CallType string

const (
	CallTypeAudio CallType = "AUDIO"
	CallTypeVideo CallType = "VIDEO"
)

type CallStatus string

const (
	CallStatusPending   CallStatus = "PENDING"
	CallStatusActive    CallStatus = "ACTIVE"
	CallStatusCompleted CallStatus = "COMPLETED"
	CallStatusFailed    CallStatus = "FAILED"
)

type CallSession struct {
	RoomID          string     `json:"room_id"`
	CallerID        string     `json:"caller_id"`
	ReceiverID      string     `json:"receiver_id"`
	Type            CallType   `json:"type"`
	Status          CallStatus `json:"status"`
	DurationLimitSec int32     `json:"duration_limit_sec"`
	CreatedAt       time.Time  `json:"created_at"`
	StartedAt       *time.Time `json:"started_at,omitempty"`
	EndedAt         *time.Time `json:"ended_at,omitempty"`
}

type CallRepository interface {
	SaveSession(ctx context.Context, session *CallSession) error
	GetSession(ctx context.Context, roomID string) (*CallSession, error)
	UpdateSessionStatus(ctx context.Context, roomID string, status CallStatus) error
	SetSessionStart(ctx context.Context, roomID string, startTime time.Time) error
	SetSessionEnd(ctx context.Context, roomID string, endTime time.Time) error
}

type TokenResponse struct {
	RoomID        string `json:"room_id"`
	CallerToken   string `json:"caller_token"`
	ReceiverToken string `json:"receiver_token"`
	LivekitURL    string `json:"livekit_url"`
}
