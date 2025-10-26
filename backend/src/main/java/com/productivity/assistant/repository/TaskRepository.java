package com.productivity.assistant.repository;

import com.productivity.assistant.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Task> findByUserIdAndStatusOrderByDueDateAsc(Long userId, Task.TaskStatus status);
    List<Task> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, Task.TaskPriority priority);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findUserTasksBetweenDates(Long userId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.dueDate < :now AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks(Long userId, LocalDateTime now);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = :status")
    Long countUserTasksByStatus(Long userId, Task.TaskStatus status);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Task> searchTasks(Long userId, String searchTerm);
}
