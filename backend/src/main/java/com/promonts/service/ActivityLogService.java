package com.promonts.service;

import com.promonts.domain.log.ActivityLog;
import com.promonts.domain.user.User;
import com.promonts.repository.ActivityLogRepository;
import com.promonts.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {
    
    private final ActivityLogRepository logRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public void log(Long userId, String action, String entityType, Long entityId, String details) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;
        String ipAddress = getClientIP();
        
        ActivityLog log = ActivityLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .ipAddress(ipAddress)
                .build();
        
        logRepository.save(log);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityLog> getUserLogs(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return logRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityLog> getLogsByDateRange(LocalDateTime start, LocalDateTime end) {
        return logRepository.findByCreatedAtBetween(start, end);
    }
    
    @Transactional(readOnly = true)
    public List<ActivityLog> getAllLogs() {
        return logRepository.findAll();
    }
    
    private String getClientIP() {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader == null) {
                return request.getRemoteAddr();
            }
            return xfHeader.split(",")[0];
        } catch (Exception e) {
            return "unknown";
        }
    }
}
