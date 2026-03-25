package com.promonts.repository;
import com.promonts.domain.chat.ChatMessage;
import com.promonts.domain.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByCourseOrderByCreatedAtAsc(Course course);
    List<ChatMessage> findByCourseAndCreatedAtAfterOrderByCreatedAtAsc(Course course, LocalDateTime after);
    List<ChatMessage> findTop50ByCourseOrderByCreatedAtDesc(Course course);
}
