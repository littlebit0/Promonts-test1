package com.promonts.dto;
import com.promonts.domain.todo.Todo;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private Boolean completed;
    private Todo.Priority priority;
    private String relatedCourse; // 과제 자동 생성 시 강의명
    private CourseInfo course;
    private LocalDateTime createdAt;

    @Data
    @AllArgsConstructor
    public static class CourseInfo {
        private Long id;
        private String name;
        private String code;
    }

    public static TodoResponse from(Todo todo) {
        CourseInfo courseInfo = null;
        if (todo.getCourse() != null) {
            courseInfo = new CourseInfo(
                    todo.getCourse().getId(),
                    todo.getCourse().getName(),
                    todo.getCourse().getCode()
            );
        }

        return TodoResponse.builder()
                .id(todo.getId())
                .title(todo.getTitle())
                .description(todo.getDescription())
                .dueDate(todo.getDueDate())
                .completed(todo.getCompleted())
                .priority(todo.getPriority())
                .relatedCourse(todo.getRelatedCourse())
                .course(courseInfo)
                .createdAt(todo.getCreatedAt())
                .build();
    }
}

