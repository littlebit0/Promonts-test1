package com.promonts.service;

import com.promonts.domain.course.Course;
import com.promonts.domain.grade.Grade;
import com.promonts.domain.user.User;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.GradeRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeService {
    
    private final GradeRepository gradeRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    
    @Transactional
    public Grade createOrUpdate(Long userId, Long courseId, Double midterm, Double finalScore, 
                                 Double assignment, Double attendance) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        Grade grade = gradeRepository.findByUserAndCourse(user, course)
                .orElse(Grade.builder().user(user).course(course).build());
        
        if (midterm != null) grade.setMidtermScore(midterm);
        if (finalScore != null) grade.setFinalScore(finalScore);
        if (assignment != null) grade.setAssignmentScore(assignment);
        if (attendance != null) grade.setAttendanceScore(attendance);
        
        // 총점 계산 (중간 30%, 기말 30%, 과제 30%, 출석 10%)
        double total = 0;
        if (grade.getMidtermScore() != null) total += grade.getMidtermScore() * 0.3;
        if (grade.getFinalScore() != null) total += grade.getFinalScore() * 0.3;
        if (grade.getAssignmentScore() != null) total += grade.getAssignmentScore() * 0.3;
        if (grade.getAttendanceScore() != null) total += grade.getAttendanceScore() * 0.1;
        
        grade.setTotalScore(total);
        grade.setLetterGrade(calculateLetterGrade(total));
        grade.setUpdatedAt(LocalDateTime.now());
        
        return gradeRepository.save(grade);
    }
    
    @Transactional(readOnly = true)
    public List<Grade> getMyGrades(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return gradeRepository.findByUser(user);
    }
    
    @Transactional(readOnly = true)
    public List<Grade> getCourseGrades(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return gradeRepository.findByCourse(course);
    }
    
    @Transactional(readOnly = true)
    public Grade getGrade(Long userId, Long courseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return gradeRepository.findByUserAndCourse(user, course)
                .orElse(null);
    }
    
    private String calculateLetterGrade(double total) {
        if (total >= 95) return "A+";
        if (total >= 90) return "A";
        if (total >= 85) return "B+";
        if (total >= 80) return "B";
        if (total >= 75) return "C+";
        if (total >= 70) return "C";
        if (total >= 65) return "D+";
        if (total >= 60) return "D";
        return "F";
    }
}
