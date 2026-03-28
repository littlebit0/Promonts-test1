package com.promonts.service;

import com.promonts.domain.course.Course;
import com.promonts.domain.exam.Exam;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.ExamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamService {
    
    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;
    
    @Transactional
    public Exam createExam(Long courseId, Exam exam) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        exam.setCourse(course);
        return examRepository.save(exam);
    }
    
    @Transactional
    public Exam updateExam(Long examId, Exam examData) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
        
        exam.setTitle(examData.getTitle());
        exam.setDescription(examData.getDescription());
        exam.setExamDate(examData.getExamDate());
        exam.setDurationMinutes(examData.getDurationMinutes());
        exam.setLocation(examData.getLocation());
        exam.setExamType(examData.getExamType());
        exam.setTotalScore(examData.getTotalScore());
        
        return examRepository.save(exam);
    }
    
    @Transactional
    public void deleteExam(Long examId) {
        examRepository.deleteById(examId);
    }
    
    @Transactional(readOnly = true)
    public List<Exam> getExamsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return examRepository.findByCourse(course);
    }
    
    @Transactional(readOnly = true)
    public List<Exam> getUpcomingExams(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return examRepository.findByCourseAndExamDateAfter(course, LocalDateTime.now());
    }
    
    @Transactional(readOnly = true)
    public Exam getExamById(Long examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));
    }
}
