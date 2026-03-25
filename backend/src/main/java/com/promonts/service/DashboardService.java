package com.promonts.service;
import com.promonts.domain.user.User;
import com.promonts.dto.DashboardResponse;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class DashboardService {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final TodoRepository todoRepository;
    private final AssignmentRepository assignmentRepository;
    private final NoticeRepository noticeRepository;
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        // User Stats
        int totalCourses = (user.getRole() == User.Role.PROFESSOR) 
                ? courseRepository.findByProfessor(user).size()
                : 0; // 학생용은 추후 enrollment 기능 필요
        
        var todos = todoRepository.findByUser(user);
        int totalTodos = todos.size();
        int completedTodos = (int) todos.stream().filter(t -> t.getCompleted()).count();
        
        int pendingAssignments = 0; // 학생용 제출 시스템 추후 구현
        
        DashboardResponse.UserStats stats = DashboardResponse.UserStats.builder()
                .totalCourses(totalCourses)
                .totalTodos(totalTodos)
                .completedTodos(completedTodos)
                .pendingAssignments(pendingAssignments)
                .build();
        // Upcoming Items (마감 임박)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime weekLater = now.plusDays(7);
        
        List<DashboardResponse.UpcomingItem> upcomingItems = new ArrayList<>();
        
        // Todos
        todos.stream()
                .filter(t -> !t.getCompleted() && t.getDueDate() != null 
                        && t.getDueDate().isAfter(now) && t.getDueDate().isBefore(weekLater))
                .forEach(t -> upcomingItems.add(DashboardResponse.UpcomingItem.builder()
                        .type("TODO")
                        .id(t.getId())
                        .title(t.getTitle())
                        .dueDate(t.getDueDate())
                        .courseName(t.getCourse() != null ? t.getCourse().getName() : null)
                        .build()));
        
        // Recent Activities
        List<DashboardResponse.RecentActivity> recentActivities = new ArrayList<>();
        
        return DashboardResponse.builder()
                .userStats(stats)
                .upcomingItems(upcomingItems)
                .recentActivities(recentActivities)
                .build();
    }
}
