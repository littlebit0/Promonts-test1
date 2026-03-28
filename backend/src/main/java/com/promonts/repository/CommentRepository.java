package com.promonts.repository;

import com.promonts.domain.comment.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(String entityType, Long entityId);
    List<Comment> findByEntityTypeAndEntityIdAndParentIsNullOrderByCreatedAtAsc(String entityType, Long entityId);
    List<Comment> findByParentOrderByCreatedAtAsc(Comment parent);
}
