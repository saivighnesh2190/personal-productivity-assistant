package com.productivity.assistant.controller;

import com.productivity.assistant.dto.TaskDto;
import com.productivity.assistant.entity.Task;
import com.productivity.assistant.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:5173")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto, 
                                               Authentication authentication) {
        TaskDto createdTask = taskService.createTask(taskDto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id,
                                               @Valid @RequestBody TaskDto taskDto,
                                               Authentication authentication) {
        TaskDto updatedTask = taskService.updateTask(id, taskDto, authentication.getName());
        return ResponseEntity.ok(updatedTask);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id,
                                           Authentication authentication) {
        taskService.deleteTask(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id,
                                               Authentication authentication) {
        TaskDto task = taskService.getTaskById(id, authentication.getName());
        return ResponseEntity.ok(task);
    }
    
    @GetMapping
    public ResponseEntity<List<TaskDto>> getUserTasks(@RequestParam(required = false) Task.TaskStatus status,
                                                      @RequestParam(required = false) Task.TaskPriority priority,
                                                      Authentication authentication) {
        List<TaskDto> tasks = taskService.getUserTasks(authentication.getName(), status, priority);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<TaskDto>> searchTasks(@RequestParam String q,
                                                     Authentication authentication) {
        List<TaskDto> tasks = taskService.searchTasks(authentication.getName(), q);
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/overdue")
    public ResponseEntity<List<TaskDto>> getOverdueTasks(Authentication authentication) {
        List<TaskDto> tasks = taskService.getOverdueTasks(authentication.getName());
        return ResponseEntity.ok(tasks);
    }
}
