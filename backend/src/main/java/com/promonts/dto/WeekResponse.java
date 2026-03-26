package com.promonts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeekResponse {
    private Long id;
    private Long courseId;
    private Integer weekNumber;
    private String description;
    private LocalDateTime createdAt;
}
