package com.promonts.repository;

import com.promonts.domain.log.ActivityLog;
import com.promonts.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUser(User user);
    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);
    List<ActivityLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<ActivityLog> findByActionAndEntityTypeAndEntityId(String action, String entityType, Long entityId);
}
