package com.promonts.repository;

import com.promonts.domain.course.Course;
import com.promonts.domain.exam.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourse(Course course);
    List<Exam> findByCourseAndExamDateAfter(Course course, LocalDateTime date);
    List<Exam> findByExamDateBetween(LocalDateTime start, LocalDateTime end);
}
