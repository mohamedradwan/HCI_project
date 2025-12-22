package repository;

import entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

       @Query("SELECT m FROM ChatMessage m WHERE " +
                     "(m.sender.id = :userId AND m.recipient.id = :otherUserId) OR " +
                     "(m.sender.id = :otherUserId AND m.recipient.id = :userId) " +
                     "AND m.isDeleted = false " +
                     "ORDER BY m.createdAt ASC")
       List<ChatMessage> findConversation(Long userId, Long otherUserId);

       @Query("SELECT m FROM ChatMessage m WHERE m.recipient.id = :userId AND m.isRead = false AND m.isDeleted = false ORDER BY m.createdAt DESC")
       List<ChatMessage> findUnreadMessages(Long userId);

       @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.recipient.id ELSE m.sender.id END " +
                     "FROM ChatMessage m WHERE (m.sender.id = :userId OR m.recipient.id = :userId) AND m.isDeleted = false")
       List<Long> findChatUserIds(Long userId);

       Optional<ChatMessage> findByIdAndIsDeletedFalse(Long id);
}