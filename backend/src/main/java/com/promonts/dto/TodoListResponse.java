package com.promonts.dto;
import com.promonts.domain.todo.Todo;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TodoListResponse {
    private Long id;
    private String title;
    private LocalDateTime dueDate;
    private Boolean completed;
    private Todo.Priority priority;
    private String courseName;
    private Long courseId;
    private Long assignmentId;

    public static TodoListResponse from(Todo todo) {
        String courseName = null;
        Long courseId = null;
        if (todo.getCourse() != null) {
            courseName = todo.getCourse().getName();
            courseId = todo.getCourse().getId();
        }
        return TodoListResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .dueDate(todo.getDueDate())
                .completed(todo.getCompleted())
                .priority(todo.getPriority())
                .courseName(courseName)
                .courseId(courseId)
                .assignmentId(todo.getAssignmentId())
                .build();
    }
}
