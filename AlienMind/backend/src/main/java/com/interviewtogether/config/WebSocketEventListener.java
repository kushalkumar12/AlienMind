package com.interviewtogether.config;

import com.interviewtogether.domain.UserAccount;
import com.interviewtogether.repository.UserAccountRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Optional;

@Component
public class WebSocketEventListener {

    private final UserAccountRepository userRepository;

    public WebSocketEventListener(UserAccountRepository userRepository) {
        this.userRepository = userRepository;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        // Since we don't have full security context here yet, we'll assume the client sends userId in headers or we use session tracking
        System.out.println("Received a new web socket connection");
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        Optional<UserAccount> userOpt = userRepository.findByLastSessionId(sessionId);
        userOpt.ifPresent(user -> {
            user.setActive(false);
            userRepository.save(user);
            System.out.println("User Disconnected: " + user.getEmail());
        });
    }
}
