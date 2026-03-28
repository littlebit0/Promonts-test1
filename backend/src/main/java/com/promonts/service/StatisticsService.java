package com.promonts.service;

import com.promonts.domain.user.User;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatisticsService {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final NoticeRepository noticeRepository;
    private final TodoRepository todoRepository;
    
    @Transactional(readOnly = true)
    public Map<String, Object> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalAssignments", assignmentRepository.count());
        stats.put("totalNotices", noticeRepository.count());
        stats.put("totalTodos", todoRepository.count());
        return stats;
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("myCourses", courseRepository.findAll().size());
        stats.put("myAssignments", assignmentRepository.findAll().size());
        stats.put("myTodos", todoRepository.findByUser(user).size());
        stats.put("completedTodos", todoRepository.findByUser(user).stream()
                .filter(t -> t.getCompleted()).count());
        return stats;
    }
}
