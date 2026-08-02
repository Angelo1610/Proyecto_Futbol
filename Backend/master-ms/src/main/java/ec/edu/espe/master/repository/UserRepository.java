package ec.edu.espe.master.repository;

import ec.edu.espe.master.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByUsername(String username);

    @Query("select distinct u from User u join fetch u.person left join fetch u.userRoles ur left join fetch ur.role where u.id = :id")
    Optional<User> findByIdWithDetails(@Param("id") UUID id);

    //anthony nestor villarreal macias
    //anvillarrealm
    //andrea nicole villarreal moran
    //anvillarrealm1

    @Query(value = "SELECT * FROM users WHERE username LIKE ('%' || :username || '%')",
            nativeQuery = true)
    List<User> findByLikeUsername(String username);

    Optional<User> findByUsername(String username);
}