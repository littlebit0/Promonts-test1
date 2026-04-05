package com.promonts.dto;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class GlobalNoticeRequest {
    @NotBlank(message = "제목은 필수입니다")
    private String title;
    @NotBlank(message = "내용은 필수입니다")
    private String content;
    @NotNull(message = "강의 ID는 필수입니다")
    private Long courseId;
}
