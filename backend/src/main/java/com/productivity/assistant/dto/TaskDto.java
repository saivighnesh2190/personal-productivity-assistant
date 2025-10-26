package com.productivity.assistant.dto;

import com.productivity.assistant.entity.Task;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskDto {
    private Long id;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private LocalDateTime dueDate;
    private boolean aiGenerated;
    private String aiSuggestion;
    private Long relatedNoteId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
