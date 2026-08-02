package ec.edu.espe.master.repository;

import ec.edu.espe.master.entity.Parametro;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParametroRepository extends JpaRepository<Parametro, UUID> {
    Optional<Parametro> findByClave(String clave);
}
