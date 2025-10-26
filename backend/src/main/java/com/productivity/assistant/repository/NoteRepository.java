package com.productivity.assistant.repository;

import com.productivity.assistant.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Note> findByUserIdAndArchivedOrderByCreatedAtDesc(Long userId, boolean archived);
    List<Note> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);
    
    @Query("SELECT n FROM Note n WHERE n.user.id = :userId AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<Note> searchNotes(Long userId, String searchTerm);
    
    @Query("SELECT COUNT(n) FROM Note n WHERE n.user.id = :userId AND n.createdAt >= :startDate")
    Long countUserNotesAfterDate(Long userId, LocalDateTime startDate);
}
