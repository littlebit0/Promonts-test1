package com.promonts.repository;

import com.promonts.domain.course.Course;
import com.promonts.domain.grade.Grade;
import com.promonts.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GradeRepository extends JpaRepository<Grade, Long> {
    List<Grade> findByUser(User user);
    List<Grade> findByCourse(Course course);
    Optional<Grade> findByUserAndCourse(User user, Course course);
}
