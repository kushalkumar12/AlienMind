package com.interviewtogether.web;

import com.interviewtogether.domain.ChatMessage;
import com.interviewtogether.domain.UserAccount;
import com.interviewtogether.repository.ChatMessageRepository;
import com.interviewtogether.repository.UserAccountRepository;
import com.interviewtogether.web.dto.ChatDTO;
import com.interviewtogether.web.dto.CallSignalDTO;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatRepository;
    private final UserAccountRepository userRepository;

    public ChatController(SimpMessagingTemplate messagingTemplate, 
                          ChatMessageRepository chatRepository,
                          UserAccountRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.chatRepository = chatRepository;
        this.userRepository = userRepository;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatDTO chatDTO) {
        UserAccount sender = userRepository.findById(chatDTO.senderId()).orElseThrow();
        UserAccount receiver = userRepository.findById(chatDTO.receiverId()).orElseThrow();

        // 1. Persist to DB
        ChatMessage message = new ChatMessage(sender, receiver, chatDTO.content());
        
        // Check if receiver is active to mark as DELIVERED
        if (receiver.isActive()) {
            message.setStatus(ChatMessage.MessageStatus.DELIVERED);
        }
        
        chatRepository.save(message);

        // Update DTO with status
        ChatDTO responseDTO = new ChatDTO(
            chatDTO.senderId(), 
            chatDTO.receiverId(), 
            chatDTO.content(), 
            message.getCreatedAt().toString(),
            message.getStatus().name()
        );

        // 2. Broadcast to receiver
        messagingTemplate.convertAndSend("/topic/messages/" + receiver.getId(), responseDTO);
        
        // 3. Broadcast to sender
        messagingTemplate.convertAndSend("/topic/messages/" + sender.getId(), responseDTO);
    }

    @MessageMapping("/chat.seen")
    public void markAsSeen(@Payload ChatDTO chatDTO) {
        // Find all SENT/DELIVERED messages from sender to receiver and mark as SEEN
        List<ChatMessage> messages = chatRepository.findBySenderIdAndReceiverIdAndStatusNot(
            chatDTO.senderId(), chatDTO.receiverId(), ChatMessage.MessageStatus.SEEN);
        
        for (ChatMessage msg : messages) {
            msg.setStatus(ChatMessage.MessageStatus.SEEN);
        }
        chatRepository.saveAll(messages);

        // Notify the original sender that their messages were seen
        messagingTemplate.convertAndSend("/topic/messages/" + chatDTO.senderId(), 
            new ChatDTO(chatDTO.senderId(), chatDTO.receiverId(), "STATUS_UPDATE", "", "SEEN"));
    }

    @MessageMapping("/chat.call")
    public void handleCallSignal(@Payload CallSignalDTO callDTO) {
        String receiverTopic = "/topic/calls/" + callDTO.receiverId();
        String senderTopic = "/topic/calls/" + callDTO.senderId();
        
        System.out.println(">>> [ROUTING] From: " + callDTO.senderId() + " -> To: " + callDTO.receiverId() + " (" + callDTO.action() + ")");
        
        // Persist call attempt to chat history if it's an INITIATE action
        if ("INITIATE".equals(callDTO.action())) {
            try {
                UserAccount sender = userRepository.findById(callDTO.senderId()).orElseThrow();
                UserAccount receiver = userRepository.findById(callDTO.receiverId()).orElseThrow();
                String content = String.format("[%s_CALL] Call attempt at %s", 
                    callDTO.type(), 
                    java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("HH:mm")));
                
                ChatMessage log = new ChatMessage(sender, receiver, content);
                chatRepository.save(log);
                
                // Also broadcast the history update to both parties
                messagingTemplate.convertAndSend("/topic/messages/" + sender.getId(), 
                    new ChatDTO(sender.getId(), receiver.getId(), content, log.getCreatedAt().toString(), log.getStatus().name()));
                messagingTemplate.convertAndSend("/topic/messages/" + receiver.getId(), 
                    new ChatDTO(sender.getId(), receiver.getId(), content, log.getCreatedAt().toString(), log.getStatus().name()));
            } catch (Exception e) {
                System.err.println("Failed to log call to history: " + e.getMessage());
            }
        }
        
        // Route signaling directly to receiver
        messagingTemplate.convertAndSend(receiverTopic, callDTO);
        
        // Also echo back to sender to sync states
        messagingTemplate.convertAndSend(senderTopic, callDTO);
    }
    @GetMapping("/api/chat/history")
    public List<ChatDTO> getChatHistory(
            @RequestParam Long userId1, 
            @RequestParam Long userId2,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        List<ChatMessage> messages = chatRepository.findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtDesc(
                userId1, userId2, userId1, userId2, pageable).getContent();
        
        // Convert to DTO and REVERSE for UI (so newest are at bottom)
        List<ChatDTO> dtos = messages.stream().map(m -> new ChatDTO(
                m.getSender().getId(),
                m.getReceiver().getId(),
                m.getContent(),
                m.getCreatedAt().toString(),
                m.getStatus().name()
        )).collect(Collectors.toList());
        
        Collections.reverse(dtos);
        return dtos;
    }
}
