package grpc

import (
	"context"
	"time"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"github.com/kushalkumar12/alienmind/calling-service/internal/domain"
	"github.com/kushalkumar12/alienmind/calling-service/internal/service"
	callingv1 "github.com/kushalkumar12/alienmind/calling-service/pb/v1"
)

type GrpcHandler struct {
	callingv1.UnimplementedCallingServiceServer
	callingSvc *service.CallingService
}

func NewGrpcHandler(svc *service.CallingService) *GrpcHandler {
	return &GrpcHandler{
		callingSvc: svc,
	}
}

func (h *GrpcHandler) CreateCallSession(ctx context.Context, req *callingv1.CreateCallSessionRequest) (*callingv1.CreateCallSessionResponse, error) {
	if req.CallerId == "" || req.ReceiverId == "" {
		return nil, status.Error(codes.InvalidArgument, "caller_id and receiver_id cannot be empty")
	}

	callType := domain.CallTypeAudio
	if req.CallType == "VIDEO" {
		callType = domain.CallTypeVideo
	}

	limit := req.DurationLimitSec
	if limit == 0 {
		limit = 1800 // Default 30 mins
	}

	resp, err := h.callingSvc.InitiateCall(ctx, req.CallerId, req.ReceiverId, callType, limit)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to initiate call: %v", err)
	}

	return &callingv1.CreateCallSessionResponse{
		RoomId:        resp.RoomID,
		CallerToken:   resp.CallerToken,
		ReceiverToken: resp.ReceiverToken,
		LivekitUrl:    resp.LivekitURL,
		CreatedAt:     time.Now().Unix(),
	}, nil
}

func (h *GrpcHandler) EndCallSession(ctx context.Context, req *callingv1.EndCallSessionRequest) (*callingv1.EndCallSessionResponse, error) {
	if req.RoomId == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id cannot be empty")
	}

	err := h.callingSvc.TerminateCall(ctx, req.RoomId)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to terminate call: %v", err)
	}

	return &callingv1.EndCallSessionResponse{
		Success: true,
		EndedAt: time.Now().Unix(),
	}, nil
}

func (h *GrpcHandler) GetCallSessionStatus(ctx context.Context, req *callingv1.GetCallSessionStatusRequest) (*callingv1.GetCallSessionStatusResponse, error) {
	if req.RoomId == "" {
		return nil, status.Error(codes.InvalidArgument, "room_id cannot be empty")
	}

	session, err := h.callingSvc.GetSessionStatus(ctx, req.RoomId)
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "session not found: %v", err)
	}

	var duration int64
	if session.StartedAt != nil {
		if session.EndedAt != nil {
			duration = int64(session.EndedAt.Sub(*session.StartedAt).Seconds())
		} else {
			duration = int64(time.Since(*session.StartedAt).Seconds())
		}
	}

	return &callingv1.GetCallSessionStatusResponse{
		RoomId:      session.RoomID,
		Status:      string(session.Status),
		DurationSec: duration,
	}, nil
}
