package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.bookmark.Bookmark;
import com.promonts.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {
    
    private final BookmarkService bookmarkService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<?> add(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            Bookmark bookmark = bookmarkService.add(userId, entityType, entityId);
            return ResponseEntity.ok(bookmark);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping
    public ResponseEntity<?> remove(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            bookmarkService.remove(userId, entityType, entityId);
            return ResponseEntity.ok(Map.of("message", "Removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Bookmark>> getAll(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        List<Bookmark> bookmarks = bookmarkService.getAll(userId);
        return ResponseEntity.ok(bookmarks);
    }
    
    @GetMapping("/type/{entityType}")
    public ResponseEntity<List<Bookmark>> getByType(
            @PathVariable String entityType,
            @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        List<Bookmark> bookmarks = bookmarkService.getByType(userId, entityType);
        return ResponseEntity.ok(bookmarks);
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> check(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        boolean bookmarked = bookmarkService.isBookmarked(userId, entityType, entityId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }
}
