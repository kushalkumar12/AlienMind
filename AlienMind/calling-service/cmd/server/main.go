package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"google.golang.org/grpc"
	"github.com/kushalkumar12/alienmind/calling-service/config"
	deliverygrpc "github.com/kushalkumar12/alienmind/calling-service/internal/delivery/grpc"
	deliveryhttp "github.com/kushalkumar12/alienmind/calling-service/internal/delivery/http"
	"github.com/kushalkumar12/alienmind/calling-service/internal/repository"
	"github.com/kushalkumar12/alienmind/calling-service/internal/service"
	callingv1 "github.com/kushalkumar12/alienmind/calling-service/pb/v1"
)

func main() {
	log.Println("Starting Calling Microservice...")

	// 1. Load Configurations
	cfg := config.Load()

	// 2. Initialize Redis Repository
	repo, err := repository.NewRedisCallRepository(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Fatal: Redis initialization failed: %v", err)
	}
	log.Println("Redis client successfully connected.")

	// 3. Initialize Services
	livekitSvc := service.NewLiveKitService(cfg)
	callingSvc := service.NewCallingService(cfg, repo, livekitSvc)

	// 4. Start HTTP Server (Webhooks and REST)
	httpServer := deliveryhttp.NewServer(cfg, callingSvc)
	httpAddr := fmt.Sprintf(":%s", cfg.HttpPort)
	srv := &http.Server{
		Addr:    httpAddr,
		Handler: httpServer.Router(),
	}

	go func() {
		log.Printf("HTTP Server listening on %s", httpAddr)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Fatal: HTTP server listen failed: %v", err)
		}
	}()

	// 5. Start gRPC Server
	lis, err := net.Listen("tcp", fmt.Sprintf(":%s", cfg.GrpcPort))
	if err != nil {
		log.Fatalf("Fatal: gRPC port listening failed: %v", err)
	}

	grpcServer := grpc.NewServer()
	grpcHandler := deliverygrpc.NewGrpcHandler(callingSvc)
	callingv1.RegisterCallingServiceServer(grpcServer, grpcHandler)

	go func() {
		log.Printf("gRPC Server listening on port %s", cfg.GrpcPort)
		if err := grpcServer.Serve(lis); err != nil {
			log.Fatalf("Fatal: gRPC server serve failed: %v", err)
		}
	}()

	// 6. Graceful Shutdown Implementation
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down servers...")

	// Timeout context for graceful shutdowns
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Stop HTTP
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("Error: HTTP Server shutdown error: %v", err)
	} else {
		log.Println("HTTP Server stopped gracefully.")
	}

	// Stop gRPC
	grpcServer.GracefulStop()
	log.Println("gRPC Server stopped gracefully.")

	log.Println("Calling Microservice shutdown completed.")
}
