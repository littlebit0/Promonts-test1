package com.promonts.domain.todo;
import com.promonts.domain.user.User;
import com.promonts.domain.course.Course;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
@Entity
@Table(name = "todos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Todo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 200)
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column
    private LocalDateTime dueDate;
    @Column(nullable = false) @Builder.Default
    private Boolean completed = false;
    @Enumerated(EnumType.STRING) @Column(length = 20)
    private Priority priority;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "course_id")
    private Course course;
    @CreationTimestamp @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    public enum Priority { LOW, MEDIUM, HIGH }
}
