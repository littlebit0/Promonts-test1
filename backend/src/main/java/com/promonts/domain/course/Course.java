package com.promonts.domain.course;
import com.promonts.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
@Entity
@Table(name = "courses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(unique = true, nullable = false, length = 20)
    private String code;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "professor_id", nullable = false)
    private User professor;
    @Column(nullable = false, length = 20)
    private String semester;
    @Column(nullable = false, name = "course_year")
    private Integer year;
    @Column(columnDefinition = "TEXT")
    private String description;
    @CreationTimestamp @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
