package com.promonts.repository;

import com.promonts.domain.course.Course;
import com.promonts.domain.evaluation.CourseEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseEvaluationRepository extends JpaRepository<CourseEvaluation, Long> {
    List<CourseEvaluation> findByCourse(Course course);
}
