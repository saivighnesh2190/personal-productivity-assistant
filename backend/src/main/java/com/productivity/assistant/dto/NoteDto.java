package com.productivity.assistant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteDto {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String content;
    private String aiSummary;
    private String category;
    private boolean archived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
