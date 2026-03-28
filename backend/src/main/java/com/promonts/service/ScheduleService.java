package com.promonts.service;

import com.promonts.domain.course.Course;
import com.promonts.domain.schedule.Schedule;
import com.promonts.domain.user.User;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.ScheduleRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    
    private final ScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    
    @Transactional
    public Schedule create(Long userId, Long courseId, Schedule schedule) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        schedule.setUser(user);
        
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            schedule.setCourse(course);
        }
        
        return scheduleRepository.save(schedule);
    }
    
    @Transactional
    public Schedule update(Long scheduleId, Schedule scheduleData) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.setTitle(scheduleData.getTitle());
        schedule.setDescription(scheduleData.getDescription());
        schedule.setStartTime(scheduleData.getStartTime());
        schedule.setEndTime(scheduleData.getEndTime());
        schedule.setLocation(scheduleData.getLocation());
        schedule.setColor(scheduleData.getColor());
        schedule.setIsRecurring(scheduleData.getIsRecurring());
        schedule.setRecurrencePattern(scheduleData.getRecurrencePattern());
        
        return scheduleRepository.save(schedule);
    }
    
    @Transactional
    public void delete(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }
    
    @Transactional(readOnly = true)
    public List<Schedule> getMySchedules(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return scheduleRepository.findByUser(user);
    }
    
    @Transactional(readOnly = true)
    public List<Schedule> getSchedulesByDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return scheduleRepository.findByUserAndStartTimeBetween(user, start, end);
    }
    
    @Transactional(readOnly = true)
    public Schedule getById(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
    }
}
