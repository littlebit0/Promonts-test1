package com.promonts.service;

import com.promonts.domain.course.Course;
import com.promonts.domain.week.Week;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.WeekRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WeekService {
    private final WeekRepository weekRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public void initializeWeeksForCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // 1~15주차 자동 생성
        for (int i = 1; i <= 15; i++) {
            Week week = Week.builder()
                    .course(course)
                    .weekNumber(i)
                    .description(i + "주차")
                    .build();
            weekRepository.save(week);
        }
    }

    @Transactional(readOnly = true)
    public List<Week> getWeeksByCourse(Long courseId) {
        return weekRepository.findByCourseIdOrderByWeekNumberAsc(courseId);
    }

    @Transactional(readOnly = true)
    public Week getWeek(Long courseId, Integer weekNumber) {
        return weekRepository.findByCourseIdAndWeekNumber(courseId, weekNumber)
                .orElseThrow(() -> new RuntimeException("Week not found"));
    }

    @Transactional
    public Week updateWeekDescription(Long weekId, String description) {
        Week week = weekRepository.findById(weekId)
                .orElseThrow(() -> new RuntimeException("Week not found"));
        week.setDescription(description);
        return weekRepository.save(week);
    }
}
