package ec.edu.espe.master.config;

import ec.edu.espe.master.entity.*;
import ec.edu.espe.master.repository.ParametroRepository;
import ec.edu.espe.master.repository.PersonRepository;
import ec.edu.espe.master.repository.RoleRepository;
import ec.edu.espe.master.repository.UserRepository;
import ec.edu.espe.master.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final UserRoleRepository userRoleRepository;
    private final ParametroRepository parametroRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedParametros();

        if (roleRepository.count() > 0 || userRepository.count() > 0) {
            log.info("Los datos de prueba ya existen. Se omite la inicialización.");
            return;
        }

        log.info("Inicializando datos de prueba...");

        // 1. Crear roles (nombres en minúscula: el frontend compara roles como 'admin'/'client')
        Role adminRole = createRole("admin", "Administrador del sistema");
        Role clientRole = createRole("client", "Cliente / comprador de boletos");

        // 2. Usuario admin (username = email, igual que espera Login.jsx)
        createUserWithRoles(
                "1000000001", "Admin", "", "Principal",
                "admin@espe.edu.ec", "0991111111", "Calle Falsa 123",
                "Ecuatoriana", "admin@espe.edu.ec", "password123",
                adminRole
        );

        // 3. Usuario cliente
        createUserWithRoles(
                "1000000002", "Juan", "", "Perez",
                "cliente@gmail.com", "0992222222", "Av. Amazonas 456",
                "Ecuatoriana", "cliente@gmail.com", "password123",
                clientRole
        );

        // 4. Usuario mixto (admin + client)
        createUserWithRoles(
                "1000000003", "Usuario", "", "Mixto",
                "mixto@espe.edu.ec", "0993333333", "Av. 6 de Diciembre 789",
                "Ecuatoriana", "mixto@espe.edu.ec", "password123",
                adminRole, clientRole
        );

        log.info("Datos de prueba creados exitosamente.");
    }

    private void seedParametros() {
        seedParametro("MAX_ENTRADAS_POR_PARTIDO", "6", "Máximo de entradas que un cliente puede reservar por partido");
        seedParametro("MINUTOS_EXPIRACION_RESERVA", "10", "Minutos antes de liberar automáticamente una reserva pendiente no confirmada");
    }

    private void seedParametro(String clave, String valor, String descripcion) {
        if (parametroRepository.findByClave(clave).isPresent()) {
            return;
        }
        parametroRepository.save(Parametro.builder()
                .clave(clave)
                .valor(valor)
                .descripcion(descripcion)
                .active(true)
                .build());
    }

    private Role createRole(String name, String description) {
        Role role = Role.builder()
                .name(name)
                .description(description)
                .active(true)
                .build();
        return roleRepository.save(role);
    }

    private void createUserWithRoles(String dni, String firstName, String middleName, String lastName,
                                     String email, String phone, String address, String nationality,
                                     String username, String rawPassword, Role... roles) {

        // Crear Person
        Person person = Person.builder()
                .dni(dni)
                .firstName(firstName)
                .middleName(middleName)
                .lastName(lastName)
                .email(email)
                .phone(phone)
                .address(address)
                .nationality(nationality)
                .active(true)
                .build();
        person = personRepository.save(person);

        // Crear User (el id se asigna automáticamente por @MapsId)
        User user = User.builder()
                .person(person)
                .username(username)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .active(true)
                .tokenVersion(0L)
                .build();
        user = userRepository.save(user);

        // Asignar roles
        for (Role role : roles) {
            UserRoleId userRoleId = new UserRoleId(user.getId(), role.getId());
            UserRole userRole = UserRole.builder()
                    .id(userRoleId)
                    .user(user)
                    .role(role)
                    .active(true)
                    .build();
            userRoleRepository.save(userRole);
        }

        log.info("Usuario '{}' creado con rol(es): {}",
                username, java.util.Arrays.stream(roles).map(Role::getName).toList());
    }
}