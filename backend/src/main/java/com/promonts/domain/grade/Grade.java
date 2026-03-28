package com.promonts.domain.grade;

import com.promonts.domain.course.Course;
import com.promonts.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "grades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @Column(name = "midterm_score")
    private Double midtermScore;
    
    @Column(name = "final_score")
    private Double finalScore;
    
    @Column(name = "assignment_score")
    private Double assignmentScore;
    
    @Column(name = "attendance_score")
    private Double attendanceScore;
    
    @Column(name = "total_score")
    private Double totalScore;
    
    @Column(name = "letter_grade", length = 2)
    private String letterGrade;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
