package ec.edu.espe.master.repository;

import ec.edu.espe.master.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PersonRepository extends JpaRepository<Person, UUID> {
    boolean existsByEmail(String email);
    boolean existsByDni(String dni);
    boolean existsByPhone(String phone);
}
