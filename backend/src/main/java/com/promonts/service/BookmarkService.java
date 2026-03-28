package com.promonts.service;

import com.promonts.domain.bookmark.Bookmark;
import com.promonts.domain.user.User;
import com.promonts.repository.BookmarkRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {
    
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Bookmark add(Long userId, String entityType, Long entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (bookmarkRepository.existsByUserAndEntityTypeAndEntityId(user, entityType, entityId)) {
            throw new RuntimeException("Already bookmarked");
        }
        
        Bookmark bookmark = Bookmark.builder()
                .user(user)
                .entityType(entityType)
                .entityId(entityId)
                .build();
        
        return bookmarkRepository.save(bookmark);
    }
    
    @Transactional
    public void remove(Long userId, String entityType, Long entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Bookmark bookmark = bookmarkRepository.findByUserAndEntityTypeAndEntityId(user, entityType, entityId)
                .orElseThrow(() -> new RuntimeException("Bookmark not found"));
        
        bookmarkRepository.delete(bookmark);
    }
    
    @Transactional(readOnly = true)
    public List<Bookmark> getAll(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookmarkRepository.findByUser(user);
    }
    
    @Transactional(readOnly = true)
    public List<Bookmark> getByType(Long userId, String entityType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookmarkRepository.findByUserAndEntityType(user, entityType);
    }
    
    @Transactional(readOnly = true)
    public boolean isBookmarked(Long userId, String entityType, Long entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookmarkRepository.existsByUserAndEntityTypeAndEntityId(user, entityType, entityId);
    }
}
