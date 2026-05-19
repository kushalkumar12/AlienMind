package com.interviewtogether.service;

import com.interviewtogether.domain.Notification;
import com.interviewtogether.domain.UserAccount;
import com.interviewtogether.domain.UserConnection;
import com.interviewtogether.repository.NotificationRepository;
import com.interviewtogether.repository.UserAccountRepository;
import com.interviewtogether.repository.UserConnectionRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {
    private final UserConnectionRepository connectionRepository;
    private final UserAccountRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ConnectionService(UserConnectionRepository connectionRepository,
                             UserAccountRepository userRepository,
                             NotificationRepository notificationRepository,
                             SimpMessagingTemplate messagingTemplate) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public UserConnection requestConnection(Long requesterId, Long receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new RuntimeException("Cannot connect with yourself");
        }

        Optional<UserConnection> existing = connectionRepository.findBetween(requesterId, receiverId);
        if (existing.isPresent()) {
            return existing.get();
        }

        UserAccount requester = userRepository.findById(requesterId).orElseThrow();
        UserAccount receiver = userRepository.findById(receiverId).orElseThrow();

        UserConnection connection = new UserConnection(requester, receiver, "PENDING");
        UserConnection saved = connectionRepository.save(connection);

        // Create notification
        Notification notification = new Notification(
            receiver,
            "New Connection Request",
            requester.getFullName() + " wants to connect with you.",
            "CONNECTION"
        );
        notificationRepository.save(notification);

        // Real-time notify receiver
        messagingTemplate.convertAndSendToUser(
            receiver.getId().toString(),
            "/queue/notifications",
            notification
        );

        return saved;
    }

    @Transactional
    public UserConnection acceptConnection(Long connectionId, Long userId) {
        UserConnection connection = connectionRepository.findById(connectionId)
            .orElseThrow(() -> new RuntimeException("Connection not found"));

        if (!connection.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to accept this connection");
        }

        connection.setStatus("ACCEPTED");
        return connectionRepository.save(connection);
    }

    public List<UserConnection> getPendingRequests(Long userId) {
        return connectionRepository.findPendingRequests(userId);
    }

    public List<UserConnection> getConnections(Long userId) {
        return connectionRepository.findAcceptedConnections(userId);
    }

    public int getMutualConnectionCount(Long user1Id, Long user2Id) {
        List<Long> connections1 = connectionRepository.findConnectedUserIds(user1Id);
        List<Long> connections2 = connectionRepository.findConnectedUserIds(user2Id);
        
        connections1.retainAll(connections2);
        return connections1.size();
    }
}
