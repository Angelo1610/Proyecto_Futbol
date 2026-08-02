package ec.edu.espe.master.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String username;
    private PersonResponse person;
    private boolean active;
    private List<String> roles;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;

}
