package com.promonts.repository;

import com.promonts.domain.bookmark.Bookmark;
import com.promonts.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUser(User user);
    List<Bookmark> findByUserAndEntityType(User user, String entityType);
    Optional<Bookmark> findByUserAndEntityTypeAndEntityId(User user, String entityType, Long entityId);
    boolean existsByUserAndEntityTypeAndEntityId(User user, String entityType, Long entityId);
}
