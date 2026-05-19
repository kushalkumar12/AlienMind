package http

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/webhook"
	"github.com/kushalkumar12/alienmind/calling-service/config"
	"github.com/kushalkumar12/alienmind/calling-service/internal/domain"
	"github.com/kushalkumar12/alienmind/calling-service/internal/service"
)

type Server struct {
	router     *chi.Mux
	callingSvc *service.CallingService
	authProv   auth.KeyProvider
}

func NewServer(cfg *config.Config, callingSvc *service.CallingService) *Server {
	r := chi.NewRouter()

	r.Use(Logger)
	r.Use(Cors)

	// Webhook validation key provider
	authProv := auth.NewSimpleKeyProvider(cfg.LivekitApiKey, cfg.LivekitApiSecret)

	s := &Server{
		router:     r,
		callingSvc: callingSvc,
		authProv:   authProv,
	}

	s.routes()
	return s
}

func (s *Server) Router() http.Handler {
	return s.router
}

func (s *Server) routes() {
	s.router.Get("/healthz", s.handleHealthCheck)
	s.router.Post("/api/v1/webhooks", s.handleLiveKitWebhook)
	s.router.Post("/api/v1/calls/initiate", s.handleInitiateCall)
}

func (s *Server) handleHealthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"UP"}`))
}

func (s *Server) handleLiveKitWebhook(w http.ResponseWriter, r *http.Request) {
	event, err := webhook.ReceiveWebhookEvent(r, s.authProv)
	if err != nil {
		http.Error(w, "Invalid signature or payload", http.StatusUnauthorized)
		return
	}

	ctx := r.Context()
	switch event.Event {
	case "room_started":
		if event.Room != nil {
			_ = s.callingSvc.HandleWebhookRoomStarted(ctx, event.Room.Name)
		}
	case "room_finished":
		if event.Room != nil {
			_ = s.callingSvc.HandleWebhookRoomFinished(ctx, event.Room.Name)
		}
	}

	w.WriteHeader(http.StatusOK)
}

type InitiateCallRequest struct {
	CallerID         string          `json:"caller_id"`
	ReceiverID       string          `json:"receiver_id"`
	Type             domain.CallType `json:"type"`
	DurationLimitSec int32           `json:"duration_limit_sec"`
}

func (s *Server) handleInitiateCall(w http.ResponseWriter, r *http.Request) {
	var req InitiateCallRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "malformed request body", http.StatusBadRequest)
		return
	}

	if req.CallerID == "" || req.ReceiverID == "" {
		http.Error(w, "caller_id and receiver_id are required", http.StatusBadRequest)
		return
	}

	if req.Type == "" {
		req.Type = domain.CallTypeAudio
	}

	if req.DurationLimitSec == 0 {
		req.DurationLimitSec = 1800 // Default 30 mins
	}

	resp, err := s.callingSvc.InitiateCall(r.Context(), req.CallerID, req.ReceiverID, req.Type, req.DurationLimitSec)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(resp)
}
