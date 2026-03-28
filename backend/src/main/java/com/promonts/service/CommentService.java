package com.promonts.service;

import com.promonts.domain.comment.Comment;
import com.promonts.domain.user.User;
import com.promonts.repository.CommentRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Comment create(Long userId, String entityType, Long entityId, String content, Long parentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Comment.CommentBuilder builder = Comment.builder()
                .user(user)
                .entityType(entityType)
                .entityId(entityId)
                .content(content);
        
        if (parentId != null) {
            Comment parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            builder.parent(parent);
        }
        
        return commentRepository.save(builder.build());
    }
    
    @Transactional
    public Comment update(Long commentId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }
    
    @Transactional
    public void delete(Long commentId) {
        commentRepository.deleteById(commentId);
    }
    
    @Transactional(readOnly = true)
    public List<Comment> getByEntity(String entityType, Long entityId) {
        return commentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtAsc(entityType, entityId);
    }
    
    @Transactional(readOnly = true)
    public List<Comment> getRootComments(String entityType, Long entityId) {
        return commentRepository.findByEntityTypeAndEntityIdAndParentIsNullOrderByCreatedAtAsc(entityType, entityId);
    }
    
    @Transactional(readOnly = true)
    public List<Comment> getReplies(Long parentId) {
        Comment parent = commentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        return commentRepository.findByParentOrderByCreatedAtAsc(parent);
    }
}
