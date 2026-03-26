package com.promonts.repository;

import com.promonts.domain.material.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByWeekIdOrderByUploadedAtDesc(Long weekId);
    List<CourseMaterial> findByWeek_CourseIdOrderByUploadedAtDesc(Long courseId);
}
