package com.interviewtogether.repository;

import com.interviewtogether.domain.UserAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByEmail(String email);

    boolean existsByEmail(String email);
    
    java.util.List<UserAccount> findByFullNameContainingIgnoreCase(String name);
    
    Optional<UserAccount> findByLastSessionId(String sessionId);
}
