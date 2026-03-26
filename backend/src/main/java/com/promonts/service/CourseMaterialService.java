package com.promonts.service;

import com.promonts.domain.material.CourseMaterial;
import com.promonts.domain.user.User;
import com.promonts.domain.week.Week;
import com.promonts.repository.CourseMaterialRepository;
import com.promonts.repository.WeekRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseMaterialService {
    private final CourseMaterialRepository materialRepository;
    private final WeekRepository weekRepository;

    @Value("${file.upload-dir:uploads/materials}")
    private String uploadDir;

    @Transactional
    public CourseMaterial uploadMaterial(Long weekId, String title, String description,
                                          MultipartFile file, User uploadedBy) throws IOException {
        Week week = weekRepository.findById(weekId)
                .orElseThrow(() -> new RuntimeException("Week not found"));

        // 파일 저장
        String fileName = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID() + "_" + fileName;
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        // DB 저장
        CourseMaterial material = CourseMaterial.builder()
                .week(week)
                .title(title)
                .description(description)
                .fileName(fileName)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .contentType(file.getContentType())
                .uploadedBy(uploadedBy)
                .build();

        return materialRepository.save(material);
    }

    @Transactional(readOnly = true)
    public List<CourseMaterial> getMaterialsByWeek(Long weekId) {
        return materialRepository.findByWeekIdOrderByUploadedAtDesc(weekId);
    }

    @Transactional(readOnly = true)
    public List<CourseMaterial> getMaterialsByCourse(Long courseId) {
        return materialRepository.findByWeek_CourseIdOrderByUploadedAtDesc(courseId);
    }

    @Transactional
    public void deleteMaterial(Long materialId) {
        CourseMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        // 파일 삭제
        try {
            Path filePath = Paths.get(material.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file", e);
        }

        materialRepository.delete(material);
    }

    @Transactional(readOnly = true)
    public CourseMaterial getMaterial(Long materialId) {
        return materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));
    }

    @Transactional(readOnly = true)
    public Resource downloadMaterial(Long materialId) throws IOException {
        CourseMaterial material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        Path filePath = Paths.get(material.getFilePath());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("File not found or not readable");
        }
    }
}
