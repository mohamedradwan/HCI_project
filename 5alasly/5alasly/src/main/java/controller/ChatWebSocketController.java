package controller;

import dto.ChatMessageDTO;
import dto.TypingIndicatorDTO;
import service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {
    
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate messagingTemplate;
    
    @MessageMapping("/chat/{recipientId}")
    @SendTo("/topic/messages/{recipientId}")
    public ChatMessageDTO handleMessage(ChatMessageDTO message, @DestinationVariable Long recipientId) {
        try {
            ChatMessageDTO savedMessage = chatMessageService.sendMessage(
                    message.getSenderId(),
                    recipientId,
                    message.getContent()
            );
            return savedMessage;
        } catch (Exception e) {
            throw new RuntimeException("Error sending message: " + e.getMessage());
        }
    }
    
    @MessageMapping("/chat/{recipientId}/typing")
    public void handleTypingIndicator(TypingIndicatorDTO indicator, @DestinationVariable Long recipientId) {
        indicator.setRecipientId(recipientId);
        // Send typing indicator to recipient
        messagingTemplate.convertAndSend(
                "/topic/typing/" + recipientId,
                indicator
        );
    }
    
    @MessageMapping("/chat/{recipientId}/delete/{messageId}")
    public void handleMessageDelete(
            @DestinationVariable Long recipientId,
            @DestinationVariable Long messageId,
            ChatMessageDTO request) {
        try {
            ChatMessageDTO deletedMessage = chatMessageService.deleteMessage(messageId, request.getSenderId());
            // Notify both sender and recipient
            messagingTemplate.convertAndSend("/topic/messages/" + recipientId, deletedMessage);
            messagingTemplate.convertAndSend("/topic/messages/" + request.getSenderId(), deletedMessage);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting message: " + e.getMessage());
        }
    }
}