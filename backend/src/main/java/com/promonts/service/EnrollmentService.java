package com.promonts.service;

import com.promonts.domain.course.Course;
import com.promonts.domain.enrollment.CourseEnrollment;
import com.promonts.domain.user.User;
import com.promonts.repository.CourseEnrollmentRepository;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    
    private final CourseEnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public CourseEnrollment enroll(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // 중복 수강 신청 확인
        boolean alreadyEnrolled = enrollmentRepository.findByCourse(course).stream()
                .anyMatch(e -> e.getUser().getId().equals(userId));
        
        if (alreadyEnrolled) {
            throw new RuntimeException("Already enrolled");
        }
        
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .course(course)
                .user(user)
                .enrolledAt(LocalDateTime.now())
                .build();
        
        return enrollmentRepository.save(enrollment);
    }
    
    @Transactional
    public void unenroll(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        CourseEnrollment enrollment = enrollmentRepository.findByCourse(course).stream()
                .filter(e -> e.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        enrollmentRepository.delete(enrollment);
    }
    
    @Transactional(readOnly = true)
    public List<CourseEnrollment> getEnrollmentsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return enrollmentRepository.findByCourse(course);
    }
    
    @Transactional(readOnly = true)
    public boolean isEnrolled(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return enrollmentRepository.findByCourse(course).stream()
                .anyMatch(e -> e.getUser().getId().equals(userId));
    }
}
