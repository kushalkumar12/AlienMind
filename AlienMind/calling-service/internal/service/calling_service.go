package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/kushalkumar12/alienmind/calling-service/config"
	"github.com/kushalkumar12/alienmind/calling-service/internal/domain"
)

type CallingService struct {
	cfg        *config.Config
	repo       domain.CallRepository
	livekitSvc *LiveKitService
}

func NewCallingService(cfg *config.Config, repo domain.CallRepository, lk *LiveKitService) *CallingService {
	return &CallingService{
		cfg:        cfg,
		repo:       repo,
		livekitSvc: lk,
	}
}

// generateRandomRoomID creates a secure randomized ID for a room
func generateRandomRoomID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *CallingService) InitiateCall(ctx context.Context, callerID, receiverID string, callType domain.CallType, durationLimitSec int32) (*domain.TokenResponse, error) {
	roomID := fmt.Sprintf("room_%s", generateRandomRoomID())

	// Create room on LiveKit with 2 max participants and 5 minute empty timeout
	_, err := s.livekitSvc.CreateRoom(ctx, roomID, 300, 2)
	if err != nil {
		return nil, fmt.Errorf("failed to provision livekit room: %w", err)
	}

	// Save session in Redis
	session := &domain.CallSession{
		RoomID:           roomID,
		CallerID:         callerID,
		ReceiverID:       receiverID,
		Type:             callType,
		Status:           domain.CallStatusPending,
		DurationLimitSec: durationLimitSec,
		CreatedAt:        time.Now(),
	}

	err = s.repo.SaveSession(ctx, session)
	if err != nil {
		return nil, fmt.Errorf("failed to save call session: %w", err)
	}

	// Generate Join tokens for both clients
	tokenDuration := 10 * time.Minute // Tokens expire quickly to secure the join flow
	callerToken, err := s.livekitSvc.GenerateJoinToken(roomID, callerID, tokenDuration)
	if err != nil {
		return nil, fmt.Errorf("failed to generate caller token: %w", err)
	}

	receiverToken, err := s.livekitSvc.GenerateJoinToken(roomID, receiverID, tokenDuration)
	if err != nil {
		return nil, fmt.Errorf("failed to generate receiver token: %w", err)
	}

	return &domain.TokenResponse{
		RoomID:        roomID,
		CallerToken:   callerToken,
		ReceiverToken: receiverToken,
		LivekitURL:    s.cfg.LivekitURL,
	}, nil
}

func (s *CallingService) TerminateCall(ctx context.Context, roomID string) error {
	// 1. Kick everyone and delete the room on LiveKit SFU
	err := s.livekitSvc.DeleteRoom(ctx, roomID)
	if err != nil {
		// Log and continue, as room might already be cleaned up
		fmt.Printf("Warning: LiveKit room deletion failed for %s: %v\n", roomID, err)
	}

	// 2. Mark completed in state repository
	err = s.repo.SetSessionEnd(ctx, roomID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to mark session as ended: %w", err)
	}

	return nil
}

func (s *CallingService) HandleWebhookRoomStarted(ctx context.Context, roomID string) error {
	return s.repo.SetSessionStart(ctx, roomID, time.Now())
}

func (s *CallingService) HandleWebhookRoomFinished(ctx context.Context, roomID string) error {
	return s.repo.SetSessionEnd(ctx, roomID, time.Now())
}

func (s *CallingService) GetSessionStatus(ctx context.Context, roomID string) (*domain.CallSession, error) {
	return s.repo.GetSession(ctx, roomID)
}
