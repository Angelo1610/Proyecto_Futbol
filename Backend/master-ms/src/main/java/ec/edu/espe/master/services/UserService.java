package ec.edu.espe.master.services;

import ec.edu.espe.master.dto.request.UpdateUserRequest;
import ec.edu.espe.master.dto.request.UserRequest;
import ec.edu.espe.master.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse createUser(UserRequest userRequest);
    UserResponse updateUser(UUID userId, UpdateUserRequest updateUserRequest);
    UserResponse getUserById(UUID userId);
    void deleteUser(UUID userId);
    void removeRole(UUID userId, UUID roleId);
    UserResponse assigneRole(UUID userId, UUID roleId);
    void changePassword(UUID userId, String currentPassword, String newPassword);
}
