package com.productivity.assistant.controller;

import com.productivity.assistant.ai.AIService;
import com.productivity.assistant.dto.NoteDto;
import com.productivity.assistant.dto.TaskDto;
import com.productivity.assistant.entity.Task;
import com.productivity.assistant.service.NoteService;
import com.productivity.assistant.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {
    
    @Autowired
    private AIService aiService;
    
    @Autowired
    private NoteService noteService;
    
    @Autowired
    private TaskService taskService;
    
    @PostMapping("/summarize")
    public ResponseEntity<Map<String, String>> summarizeText(@RequestBody Map<String, String> request,
                                                             Authentication authentication) {
        String text = request.get("text");
        String summary = aiService.summarizeText(text);
        
        Map<String, String> response = new HashMap<>();
        response.put("summary", summary);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/summarize-note/{noteId}")
    public ResponseEntity<Map<String, String>> summarizeNote(@PathVariable Long noteId,
                                                             Authentication authentication) {
        NoteDto note = noteService.getNoteById(noteId, authentication.getName());
        String summary = aiService.summarizeText(note.getContent());
        
        note.setAiSummary(summary);
        noteService.updateNote(noteId, note, authentication.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("summary", summary);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/generate-tasks")
    public ResponseEntity<Map<String, Object>> generateTasks(@RequestBody Map<String, String> request,
                                                             Authentication authentication) {
        String text = request.get("text");
        boolean autoCreate = Boolean.parseBoolean(request.getOrDefault("autoCreate", "false"));
        
        List<String> taskTitles = aiService.generateTasksFromText(text);
        
        if (autoCreate) {
            for (String title : taskTitles) {
                TaskDto taskDto = new TaskDto();
                taskDto.setTitle(title);
                taskDto.setStatus(Task.TaskStatus.PENDING);
                taskDto.setPriority(Task.TaskPriority.MEDIUM);
                taskDto.setAiGenerated(true);
                taskService.createTask(taskDto, authentication.getName());
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("tasks", taskTitles);
        response.put("created", autoCreate);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/daily-summary")
    public ResponseEntity<Map<String, String>> getDailySummary(Authentication authentication) {
        List<TaskDto> allTasks = taskService.getUserTasks(authentication.getName(), null, null);
        List<NoteDto> allNotes = noteService.getUserNotes(authentication.getName(), false);
        
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();
        
        long completedToday = allTasks.stream()
                .filter(t -> t.getStatus() == Task.TaskStatus.COMPLETED)
                .filter(t -> t.getCompletedAt() != null && t.getCompletedAt().isAfter(todayStart))
                .count();
        
        long pendingTasks = allTasks.stream()
                .filter(t -> t.getStatus() == Task.TaskStatus.PENDING || 
                           t.getStatus() == Task.TaskStatus.IN_PROGRESS)
                .count();
        
        long notesCreatedToday = allNotes.stream()
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isAfter(todayStart))
                .count();
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("completedTasks", (int) completedToday);
        userData.put("pendingTasks", (int) pendingTasks);
        userData.put("notesCreated", (int) notesCreatedToday);
        
        String summary = aiService.generateDailySummary(userData);
        
        Map<String, String> response = new HashMap<>();
        response.put("summary", summary);
        response.put("stats", String.format("Tasks: %d completed, %d pending | Notes: %d created today", 
                                           completedToday, pendingTasks, notesCreatedToday));
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chatWithAssistant(@RequestBody Map<String, Object> request,
                                                                 Authentication authentication) {
        String message = (String) request.get("message");
        List<String> history = (List<String>) request.getOrDefault("history", List.of());
        
        String response = aiService.chatWithAssistant(message, history);
        
        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/insights")
    public ResponseEntity<Map<String, String>> getInsights(Authentication authentication) {
        List<NoteDto> notes = noteService.getUserNotes(authentication.getName(), false);
        List<TaskDto> tasks = taskService.getUserTasks(authentication.getName(), null, null);
        
        String noteContent = notes.stream()
                .limit(5)
                .map(n -> n.getTitle() + ": " + (n.getContent() != null ? n.getContent().substring(0, 
                         Math.min(n.getContent().length(), 100)) : ""))
                .collect(Collectors.joining("\n"));
        
        String taskList = tasks.stream()
                .limit(10)
                .map(t -> t.getTitle() + " (" + t.getStatus() + ", " + t.getPriority() + ")")
                .collect(Collectors.joining("\n"));
        
        String insights = aiService.generateInsights(noteContent, taskList);
        
        Map<String, String> response = new HashMap<>();
        response.put("insights", insights);
        return ResponseEntity.ok(response);
    }
}
