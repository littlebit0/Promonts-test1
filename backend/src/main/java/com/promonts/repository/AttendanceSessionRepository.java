package com.promonts.repository;

import com.promonts.domain.attendance.AttendanceSession;
import com.promonts.domain.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByQrCode(String qrCode);
    Optional<AttendanceSession> findByCourseAndIsActiveTrue(Course course);
}
