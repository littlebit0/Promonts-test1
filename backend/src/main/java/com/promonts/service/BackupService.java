package com.promonts.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.course.Course;
import com.promonts.domain.notice.Notice;
import com.promonts.domain.todo.Todo;
import com.promonts.domain.user.User;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BackupService {
    
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final NoticeRepository noticeRepository;
    private final TodoRepository todoRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());
    
    @Transactional(readOnly = true)
    public String createBackup() throws IOException {
        Map<String, Object> backup = new HashMap<>();
        
        backup.put("timestamp", LocalDateTime.now());
        backup.put("users", userRepository.findAll());
        backup.put("courses", courseRepository.findAll());
        backup.put("assignments", assignmentRepository.findAll());
        backup.put("notices", noticeRepository.findAll());
        backup.put("todos", todoRepository.findAll());
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "backup_" + timestamp + ".json";
        String filepath = "backups/" + filename;
        
        File backupDir = new File("backups");
        if (!backupDir.exists()) {
            backupDir.mkdirs();
        }
        
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(filepath), backup);
        return filepath;
    }
    
    @Transactional
    public void restoreBackup(String filepath) throws IOException {
        File backupFile = new File(filepath);
        if (!backupFile.exists()) {
            throw new RuntimeException("Backup file not found: " + filepath);
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> backup = objectMapper.readValue(backupFile, Map.class);
        
        // Note: 실제 복원은 복잡함 (FK 제약, ID 재매핑 등)
        // 여기서는 기본 구조만 제공
        
        throw new UnsupportedOperationException("Restore not fully implemented - requires careful FK handling");
    }
    
    public List<String> listBackups() {
        File backupDir = new File("backups");
        if (!backupDir.exists()) {
            return List.of();
        }
        
        File[] files = backupDir.listFiles((dir, name) -> name.startsWith("backup_") && name.endsWith(".json"));
        return files != null ? List.of(files).stream().map(File::getName).toList() : List.of();
    }
}
