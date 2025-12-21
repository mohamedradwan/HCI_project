package service;

import dto.ChatMessageDTO;
import entity.ChatMessage;
import entity.User;
import repository.ChatMessageRepository;
import repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ChatMessageDTO sendMessage(Long senderId, Long recipientId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
        
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }
        
        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        message.setIsRead(false);
        message.setIsDeleted(false);
        
        ChatMessage saved = chatMessageRepository.save(message);
        return convertToDTO(saved);
    }
    
    public List<ChatMessageDTO> getConversation(Long userId, Long otherUserId) {
        // Verify both users exist
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.findById(otherUserId).orElseThrow(() -> new RuntimeException("Other user not found"));
        
        List<ChatMessage> messages = chatMessageRepository.findConversation(userId, otherUserId);
        return messages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    public List<ChatMessageDTO> getUnreadMessages(Long userId) {
        return chatMessageRepository.findUnreadMessages(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(Long messageId) {
        ChatMessage message = chatMessageRepository.findByIdAndIsDeletedFalse(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        chatMessageRepository.save(message);
    }
    
    @Transactional
    public ChatMessageDTO deleteMessage(Long messageId, Long userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        // Only sender can delete their own message
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own messages");
        }
        
        message.setIsDeleted(true);
        message.setContent("Message deleted");
        ChatMessage updated = chatMessageRepository.save(message);
        return convertToDTO(updated);
    }
    
    public List<Long> getChatUserIds(Long userId) {
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return chatMessageRepository.findChatUserIds(userId);
    }
    
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        return new ChatMessageDTO(
                message.getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getAvatarUrl(),
                message.getRecipient().getId(),
                message.getRecipient().getName(),
                message.getContent(),
                message.getIsRead(),
                message.getIsDeleted(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}