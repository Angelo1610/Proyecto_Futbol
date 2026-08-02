package ec.edu.espe.master.repository;

import ec.edu.espe.master.entity.UserRole;
import org.springframework.beans.propertyeditors.UUIDEditor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    boolean existsByRoleAndUser(UUID idRole, UUID idUser);

}
