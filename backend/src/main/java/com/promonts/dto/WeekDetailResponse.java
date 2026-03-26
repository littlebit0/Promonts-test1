package com.promonts.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeekDetailResponse {
    private WeekResponse week;
    private List<CourseMaterialResponse> materials;
    private List<AssignmentResponse> assignments;
}
