package com.promonts.domain.user;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false, length = 100)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false, length = 50)
    private String name;
    @Column(length = 20)
    private String studentId;
    @Column(length = 100)
    private String department;
    @Column(length = 20)
    private String phone;
    @Column(length = 500)
    private String avatarUrl;


    @Column(length = 8192)
    private String msAccessToken;

    @Column(length = 8192)
    private String msRefreshToken;

    @Column
    private java.time.LocalDateTime msTokenExpiresAt;

    @Column(length = 100)
    private String msEmail;

    @Column(length = 50)
    private String msName;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20)
    private Role role;
    @CreationTimestamp @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    public enum Role { STUDENT, PROFESSOR, ADMIN }
}
