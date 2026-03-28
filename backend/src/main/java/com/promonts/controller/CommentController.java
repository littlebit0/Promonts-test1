package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.comment.Comment;
import com.promonts.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<?> create(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestParam String content,
            @RequestParam(required = false) Long parentId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            Comment comment = commentService.create(userId, entityType, entityId, content, parentId);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestParam String content) {
        try {
            Comment comment = commentService.update(id, content);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            commentService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Comment>> getByEntity(
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        List<Comment> comments = commentService.getByEntity(entityType, entityId);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<Comment>> getRootComments(
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        List<Comment> comments = commentService.getRootComments(entityType, entityId);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/{parentId}/replies")
    public ResponseEntity<List<Comment>> getReplies(@PathVariable Long parentId) {
        List<Comment> replies = commentService.getReplies(parentId);
        return ResponseEntity.ok(replies);
    }
}
