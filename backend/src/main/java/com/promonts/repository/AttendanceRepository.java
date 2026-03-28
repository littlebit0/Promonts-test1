package com.promonts.repository;

import com.promonts.domain.attendance.Attendance;
import com.promonts.domain.course.Course;
import com.promonts.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByCourse(Course course);
    List<Attendance> findByUser(User user);
    List<Attendance> findByCourseAndUser(Course course, User user);
    List<Attendance> findByCourseAndAttendedAtBetween(Course course, LocalDateTime start, LocalDateTime end);
    boolean existsByCourseAndUserAndAttendedAtBetween(Course course, User user, LocalDateTime start, LocalDateTime end);
}
