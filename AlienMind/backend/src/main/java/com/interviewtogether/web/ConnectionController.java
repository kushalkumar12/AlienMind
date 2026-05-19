package com.interviewtogether.web;

import com.interviewtogether.domain.UserConnection;
import com.interviewtogether.service.ConnectionService;
import com.interviewtogether.web.dto.SuccessResponse;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {
    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/request")
    public SuccessResponse<UserConnection> requestConnection(@RequestParam Long requesterId, @RequestParam Long receiverId) {
        UserConnection connection = connectionService.requestConnection(requesterId, receiverId);
        return new SuccessResponse<>(200, "Connection request sent", connection, Instant.now());
    }

    @PostMapping("/{connectionId}/accept")
    public SuccessResponse<UserConnection> acceptConnection(@PathVariable Long connectionId, @RequestParam Long userId) {
        UserConnection connection = connectionService.acceptConnection(connectionId, userId);
        return new SuccessResponse<>(200, "Connection accepted", connection, Instant.now());
    }

    @GetMapping("/pending")
    public SuccessResponse<List<UserConnection>> getPendingRequests(@RequestParam Long userId) {
        List<UserConnection> pending = connectionService.getPendingRequests(userId);
        return new SuccessResponse<>(200, "Pending requests fetched", pending, Instant.now());
    }

    @GetMapping
    public SuccessResponse<List<UserConnection>> getConnections(@RequestParam Long userId) {
        List<UserConnection> connections = connectionService.getConnections(userId);
        return new SuccessResponse<>(200, "Connections fetched", connections, Instant.now());
    }
}
