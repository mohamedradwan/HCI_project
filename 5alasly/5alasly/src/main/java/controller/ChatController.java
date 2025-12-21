package controller;

import dto.ChatMessageDTO;
import service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ChatController {
    
    private final ChatMessageService chatMessageService;
    
    @PostMapping("/send")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestParam Long senderId,
            @RequestParam Long recipientId,
            @RequestBody MessageRequest request) {
        try {
            ChatMessageDTO message = chatMessageService.sendMessage(senderId, recipientId, request.getContent());
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessageDTO>> getConversation(
            @RequestParam Long userId,
            @RequestParam Long otherUserId) {
        try {
            List<ChatMessageDTO> messages = chatMessageService.getConversation(userId, otherUserId);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<ChatMessageDTO>> getUnreadMessages(@PathVariable Long userId) {
        try {
            List<ChatMessageDTO> messages = chatMessageService.getUnreadMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/mark-read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable Long messageId) {
        try {
            chatMessageService.markAsRead(messageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/delete/{messageId}")
    public ResponseEntity<ChatMessageDTO> deleteMessage(
            @PathVariable Long messageId,
            @RequestParam Long userId) {
        try {
            ChatMessageDTO deletedMessage = chatMessageService.deleteMessage(messageId, userId);
            return ResponseEntity.ok(deletedMessage);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/chat-users/{userId}")
    public ResponseEntity<List<Long>> getChatUserIds(@PathVariable Long userId) {
        try {
            List<Long> userIds = chatMessageService.getChatUserIds(userId);
            return ResponseEntity.ok(userIds);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    public static class MessageRequest {
        private String content;
        
        public String getContent() {
            return content;
        }
        
        public void setContent(String content) {
            this.content = content;
        }
    }
}