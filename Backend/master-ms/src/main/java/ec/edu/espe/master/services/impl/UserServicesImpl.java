package ec.edu.espe.master.services.impl;

import ec.edu.espe.master.dto.request.UpdateUserRequest;
import ec.edu.espe.master.dto.request.UserRequest;
import ec.edu.espe.master.dto.response.PersonResponse;
import ec.edu.espe.master.dto.response.UserResponse;
import ec.edu.espe.master.entity.Person;
import ec.edu.espe.master.entity.Role;
import ec.edu.espe.master.entity.User;
import ec.edu.espe.master.entity.UserRole;
import ec.edu.espe.master.entity.UserRoleId;
import ec.edu.espe.master.repository.PersonRepository;
import ec.edu.espe.master.repository.UserRepository;
import ec.edu.espe.master.repository.RoleRepository;
import ec.edu.espe.master.services.EmailService;
import ec.edu.espe.master.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServicesImpl implements UserService {

    @Autowired
    private UserRepository usersRepository;

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    public List<UserResponse> getAllUsers() {
        return usersRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse createUser(UserRequest userRequest) {
        if (personRepository.existsByDni(userRequest.getDni()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dni already exists");

        if (personRepository.existsByEmail(userRequest.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");

        if (personRepository.existsByPhone(userRequest.getPhone()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El número de celular ya está registrado");

        Person objPerson = Person.builder()
                .dni(userRequest.getDni())
                .firstName(userRequest.getFirstName())
                .middleName(userRequest.getMiddleName() == null ? "" : userRequest.getMiddleName())
                .lastName(userRequest.getLastName())
                .email(userRequest.getEmail())
                .phone(userRequest.getPhone())
                .nationality(userRequest.getNationality())
                .address(userRequest.getAddress())
                .build();

        objPerson = personRepository.save(objPerson);

        // Username y contraseña de primer acceso se generan automáticamente
        // (no los elige el usuario) y se envían al correo registrado.
        String username = generarUsername(objPerson.getFirstName(), objPerson.getLastName());
        String rawPassword = generarPasswordTemporal();
        String hashedPassword = passwordEncoder.encode(rawPassword);

        User objUser = User.builder()
                .person(objPerson)
                .username(username)
                .passwordHash(hashedPassword)
                .build();

        // Todo usuario nuevo arranca con el rol 'client'; el panel de administración
        // puede añadir 'admin' después vía POST /users/{id}/roles/{roleId}
        Role clientRole = roleRepository.findByName("client")
                .orElseThrow(() -> new IllegalStateException("Rol 'client' no configurado"));
        objUser.getUserRoles().add(
                UserRole.builder()
                        .id(new UserRoleId(objUser.getId(), clientRole.getId()))
                        .user(objUser)
                        .role(clientRole)
                        .active(true)
                        .build());

        objUser = usersRepository.save(objUser);

        emailService.enviarCredencialesAcceso(objPerson.getEmail(), objPerson.getFirstName(), username, rawPassword);

        return mapToUserResponse(objUser);
    }

    private String generarUsername(String firstName, String lastName) {
        String base = normalizar(firstName.substring(0, 1) + lastName);
        if (base.isBlank()) {
            base = "user";
        }
        String username = base;
        int sufijo = 1;
        while (usersRepository.existsByUsername(username)) {
            username = base + sufijo;
            sufijo++;
        }
        return username;
    }

    private String normalizar(String texto) {
        String sinAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return Pattern.compile("[^a-zA-Z0-9]").matcher(sinAcentos).replaceAll("").toLowerCase();
    }

    private String generarPasswordTemporal() {
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(PASSWORD_CHARS.charAt(RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    @Override
    public UserResponse updateUser(UUID userId, UpdateUserRequest updateUserRequest) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        Person person = user.getPerson();

        if (updateUserRequest.getFirstName() != null) person.setFirstName(updateUserRequest.getFirstName());
        if (updateUserRequest.getMiddleName() != null) person.setMiddleName(updateUserRequest.getMiddleName());
        if (updateUserRequest.getLastName() != null) person.setLastName(updateUserRequest.getLastName());
        if (updateUserRequest.getPhone() != null) person.setPhone(updateUserRequest.getPhone());
        if (updateUserRequest.getAddress() != null) person.setAddress(updateUserRequest.getAddress());
        if (updateUserRequest.getNationality() != null) person.setNationality(updateUserRequest.getNationality());
        if (updateUserRequest.getActive() != null) person.setActive(updateUserRequest.getActive());

        personRepository.save(person);
        user = usersRepository.save(user);
        return mapToUserResponse(user);
    }

    public UserResponse getUserById(UUID userId) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return mapToUserResponse(user);
    }

    public void deleteUser(UUID userId) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        usersRepository.delete(user);
    }

    public void removeRole(UUID userId, UUID roleId) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        user.getUserRoles().removeIf(ur -> ur.getRole().getId().equals(roleId));
        usersRepository.save(user);
    }

    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contraseña actual es incorrecta");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        usersRepository.save(user);
    }

    public UserResponse assigneRole(UUID userId, UUID roleId) {
        User user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        var role = roleRepository.findById(roleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
        
        UserRole userRole = UserRole.builder()
                .id(new UserRoleId(userId, roleId))
                .user(user)
                .role(role)
                .active(true)
                .build();
        
        user.getUserRoles().add(userRole);
        user = usersRepository.save(user);
        return mapToUserResponse(user);
    }

    private UserResponse mapToUserResponse(User user) {
        List<String> roles = user.getUserRoles().stream()
                .filter(UserRole::getActive)
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toList());

        Person person = user.getPerson();
        PersonResponse personResponse = PersonResponse.builder()
                .id(person.getId())
                .dni(person.getDni())
                .firstName(person.getFirstName())
                .middleName(person.getMiddleName())
                .lastName(person.getLastName())
                .email(person.getEmail())
                .phone(person.getPhone())
                .address(person.getAddress())
                .nationality(person.getNationality())
                .active(person.getActive())
                .build();

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .active(user.getPerson().getActive())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .person(personResponse)
                .roles(roles)
                .build();
    }
}   