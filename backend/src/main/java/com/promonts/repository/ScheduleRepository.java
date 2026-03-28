package com.promonts.repository;

import com.promonts.domain.schedule.Schedule;
import com.promonts.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByUser(User user);
    List<Schedule> findByUserAndStartTimeBetween(User user, LocalDateTime start, LocalDateTime end);
    List<Schedule> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
}
