package service

import (
	"context"
	"fmt"
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
	"github.com/kushalkumar12/alienmind/calling-service/config"
)

type LiveKitService struct {
	cfg        *config.Config
	roomClient *lksdk.RoomServiceClient
}

func NewLiveKitService(cfg *config.Config) *LiveKitService {
	// Initialize room service client
	roomClient := lksdk.NewRoomServiceClient(cfg.LivekitURL, cfg.LivekitApiKey, cfg.LivekitApiSecret)
	return &LiveKitService{
		cfg:        cfg,
		roomClient: roomClient,
	}
}

// GenerateJoinToken generates a secure token for a participant to join a LiveKit room
func (s *LiveKitService) GenerateJoinToken(roomName, identity string, validDuration time.Duration) (string, error) {
	at := auth.NewAccessToken(s.cfg.LivekitApiKey, s.cfg.LivekitApiSecret)
	at.SetIdentity(identity).SetValidFor(validDuration)

	grant := &auth.VideoGrant{
		RoomJoin:             true,
		Room:                 roomName,
	}
	grant.SetCanPublish(true)
	grant.SetCanSubscribe(true)
	grant.SetCanPublishData(true)
	
	at.AddGrant(grant)

	token, err := at.ToJWT()
	if err != nil {
		return "", fmt.Errorf("failed to sign access token: %w", err)
	}

	return token, nil
}

// CreateRoom creates a room with custom parameters on LiveKit server
func (s *LiveKitService) CreateRoom(ctx context.Context, roomName string, emptyTimeout uint32, maxParticipants uint32) (*livekit.Room, error) {
	room, err := s.roomClient.CreateRoom(ctx, &livekit.CreateRoomRequest{
		Name:            roomName,
		EmptyTimeout:    emptyTimeout,
		MaxParticipants: maxParticipants,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create livekit room: %w", err)
	}

	return room, nil
}

// DeleteRoom deletes a room and kicks all participants out
func (s *LiveKitService) DeleteRoom(ctx context.Context, roomName string) error {
	_, err := s.roomClient.DeleteRoom(ctx, &livekit.DeleteRoomRequest{
		Room: roomName,
	})
	if err != nil {
		return fmt.Errorf("failed to delete livekit room: %w", err)
	}

	return nil
}
