package com.promonts.service;

import com.promonts.domain.attendance.Attendance;
import com.promonts.domain.attendance.AttendanceSession;
import com.promonts.domain.course.Course;
import com.promonts.domain.user.User;
import com.promonts.repository.AttendanceRepository;
import com.promonts.repository.AttendanceSessionRepository;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public AttendanceSession createSession(Long courseId, int durationMinutes) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // 기존 활성 세션 비활성화
        sessionRepository.findByCourseAndIsActiveTrue(course)
                .ifPresent(session -> {
                    session.setIsActive(false);
                    sessionRepository.save(session);
                });
        
        // 새 QR 코드 생성
        String qrCode = UUID.randomUUID().toString();
        
        AttendanceSession session = AttendanceSession.builder()
                .course(course)
                .qrCode(qrCode)
                .expiresAt(LocalDateTime.now().plusMinutes(durationMinutes))
                .isActive(true)
                .build();
        
        return sessionRepository.save(session);
    }
    
    @Transactional
    public Attendance checkAttendance(String qrCode, Long userId) {
        AttendanceSession session = sessionRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new RuntimeException("Invalid QR code"));
        
        if (!session.getIsActive()) {
            throw new RuntimeException("Session expired");
        }
        
        if (LocalDateTime.now().isAfter(session.getExpiresAt())) {
            session.setIsActive(false);
            sessionRepository.save(session);
            throw new RuntimeException("Session expired");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 오늘 이미 출석했는지 확인
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        LocalDateTime tomorrow = today.plusDays(1);
        
        boolean alreadyAttended = attendanceRepository.existsByCourseAndUserAndAttendedAtBetween(
                session.getCourse(), user, today, tomorrow);
        
        if (alreadyAttended) {
            throw new RuntimeException("Already attended today");
        }
        
        Attendance attendance = Attendance.builder()
                .course(session.getCourse())
                .user(user)
                .qrCode(qrCode)
                .status(Attendance.AttendanceStatus.PRESENT)
                .build();
        
        return attendanceRepository.save(attendance);
    }
    
    @Transactional(readOnly = true)
    public List<Attendance> getAttendancesByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return attendanceRepository.findByCourse(course);
    }
    
    @Transactional(readOnly = true)
    public List<Attendance> getMyAttendances(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return attendanceRepository.findByUser(user);
    }
    
    @Transactional(readOnly = true)
    public AttendanceSession getActiveSession(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return sessionRepository.findByCourseAndIsActiveTrue(course)
                .orElse(null);
    }
}
