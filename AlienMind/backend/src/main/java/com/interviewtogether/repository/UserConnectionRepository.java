package com.interviewtogether.repository;

import com.interviewtogether.domain.UserConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface UserConnectionRepository extends JpaRepository<UserConnection, Long> {
    List<UserConnection> findByRequesterIdOrReceiverId(Long id1, Long id2);
    
    @Query("SELECT c FROM UserConnection c WHERE (c.requester.id = :uid OR c.receiver.id = :uid) AND c.status = 'ACCEPTED'")
    List<UserConnection> findAcceptedConnections(@Param("uid") Long userId);

    @Query("SELECT c FROM UserConnection c WHERE c.receiver.id = :uid AND c.status = 'PENDING'")
    List<UserConnection> findPendingRequests(@Param("uid") Long userId);

    @Query("SELECT c FROM UserConnection c WHERE (c.requester.id = :u1 AND c.receiver.id = :u2) OR (c.requester.id = :u2 AND c.receiver.id = :u1)")
    java.util.Optional<UserConnection> findBetween(@Param("u1") Long user1, @Param("u2") Long user2);

    @Query("SELECT CASE WHEN c.requester.id = :uid THEN c.receiver.id ELSE c.requester.id END FROM UserConnection c WHERE (c.requester.id = :uid OR c.receiver.id = :uid) AND c.status = 'ACCEPTED'")
    List<Long> findConnectedUserIds(@Param("uid") Long userId);
}
