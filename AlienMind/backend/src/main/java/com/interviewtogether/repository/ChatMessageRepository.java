package com.interviewtogether.repository;

import com.interviewtogether.domain.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    Page<ChatMessage> findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtDesc(Long s1, Long r1, Long r2, Long s2, Pageable pageable);
    
    List<ChatMessage> findBySenderIdAndReceiverIdAndStatusNot(Long senderId, Long receiverId, ChatMessage.MessageStatus status);
}
