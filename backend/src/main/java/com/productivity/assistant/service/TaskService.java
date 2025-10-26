package com.productivity.assistant.service;

import com.productivity.assistant.dto.TaskDto;
import com.productivity.assistant.entity.Note;
import com.productivity.assistant.entity.Task;
import com.productivity.assistant.entity.User;
import com.productivity.assistant.repository.NoteRepository;
import com.productivity.assistant.repository.TaskRepository;
import com.productivity.assistant.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NoteRepository noteRepository;
    
    public TaskDto createTask(TaskDto taskDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Task task = new Task();
        BeanUtils.copyProperties(taskDto, task, "id", "createdAt", "updatedAt", "completedAt");
        task.setUser(user);
        
        if (taskDto.getRelatedNoteId() != null) {
            Note note = noteRepository.findById(taskDto.getRelatedNoteId())
                    .orElseThrow(() -> new RuntimeException("Related note not found"));
            if (!note.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized to link to this note");
            }
            task.setRelatedNote(note);
        }
        
        Task savedTask = taskRepository.save(task);
        return convertToDto(savedTask);
    }
    
    public TaskDto updateTask(Long taskId, TaskDto taskDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this task");
        }
        
        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setStatus(taskDto.getStatus());
        task.setPriority(taskDto.getPriority());
        task.setDueDate(taskDto.getDueDate());
        
        if (taskDto.getStatus() == Task.TaskStatus.COMPLETED && task.getCompletedAt() == null) {
            task.setCompletedAt(LocalDateTime.now());
        }
        
        Task updatedTask = taskRepository.save(task);
        return convertToDto(updatedTask);
    }
    
    public void deleteTask(Long taskId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this task");
        }
        
        taskRepository.delete(task);
    }
    
    public TaskDto getTaskById(Long taskId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        if (!task.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to view this task");
        }
        
        return convertToDto(task);
    }
    
    public List<TaskDto> getUserTasks(String username, Task.TaskStatus status, Task.TaskPriority priority) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByUserIdAndStatusOrderByDueDateAsc(user.getId(), status);
        } else if (priority != null) {
            tasks = taskRepository.findByUserIdAndPriorityOrderByCreatedAtDesc(user.getId(), priority);
        } else {
            tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> searchTasks(String username, String searchTerm) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Task> tasks = taskRepository.searchTasks(user.getId(), searchTerm);
        
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<TaskDto> getOverdueTasks(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        List<Task> tasks = taskRepository.findOverdueTasks(user.getId(), LocalDateTime.now());
        
        return tasks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private TaskDto convertToDto(Task task) {
        TaskDto dto = new TaskDto();
        BeanUtils.copyProperties(task, dto);
        if (task.getRelatedNote() != null) {
            dto.setRelatedNoteId(task.getRelatedNote().getId());
        }
        return dto;
    }
}
