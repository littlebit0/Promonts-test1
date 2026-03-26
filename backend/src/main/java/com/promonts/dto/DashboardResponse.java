package com.promonts.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardResponse {
    private UserStats userStats;
    private List<UpcomingItem> upcomingItems;
    private List<RecentActivity> recentActivities;
    @Data @AllArgsConstructor @Builder
    public static class UserStats {
        private int totalCourses;
        private int totalTodos;
        private int completedTodos;
        private int pendingAssignments;
    }
    @Data @AllArgsConstructor @Builder
    public static class UpcomingItem {
        private String type; // "TODO", "ASSIGNMENT"
        private Long id;
        private Long assignmentId; // 과제 상세 조회용
        private String title;
        private LocalDateTime dueDate;
        private String courseName;
    }
    @Data @AllArgsConstructor @Builder
    public static class RecentActivity {
        private String type; // "NOTICE", "ASSIGNMENT", "CHAT"
        private Long id;
        private String title;
        private String description;
        private LocalDateTime createdAt;
        private String courseName;
    }
}
