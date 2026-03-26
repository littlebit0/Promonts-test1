package com.promonts.repository;

import com.promonts.domain.week.Week;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeekRepository extends JpaRepository<Week, Long> {
    List<Week> findByCourseIdOrderByWeekNumberAsc(Long courseId);
    Optional<Week> findByCourseIdAndWeekNumber(Long courseId, Integer weekNumber);
}
