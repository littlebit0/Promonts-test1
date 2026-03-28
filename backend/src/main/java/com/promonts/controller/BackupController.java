package com.promonts.controller;

import com.promonts.config.RequireRole;
import com.promonts.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {
    
    private final BackupService backupService;
    
    @PostMapping("/create")
    @RequireRole({"ADMIN"})
    public ResponseEntity<?> createBackup() {
        try {
            String filepath = backupService.createBackup();
            return ResponseEntity.ok(Map.of("message", "Backup created", "filepath", filepath));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/restore")
    @RequireRole({"ADMIN"})
    public ResponseEntity<?> restoreBackup(@RequestParam String filepath) {
        try {
            backupService.restoreBackup(filepath);
            return ResponseEntity.ok(Map.of("message", "Backup restored"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/list")
    @RequireRole({"ADMIN"})
    public ResponseEntity<List<String>> listBackups() {
        List<String> backups = backupService.listBackups();
        return ResponseEntity.ok(backups);
    }
}
