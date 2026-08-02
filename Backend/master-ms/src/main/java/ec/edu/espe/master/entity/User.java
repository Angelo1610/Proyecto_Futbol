package ec.edu.espe.master.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
@Builder

public class User {

    @Id
    @Column(name = "id_person")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_person")
    private Person person;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(name="password_hash", nullable = false, length = 235)
    private String passwordHash;

    @Column(name = "Last_login")
    private LocalDateTime lastLogin;

    @Builder.Default
    private Boolean active=true;

    @Builder.Default
    @Column(nullable = false)
    private long tokenVersion=0L;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @OneToMany(mappedBy = "user", cascade =  CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @EqualsAndHashCode.Exclude
    private Set<UserRole> userRoles = new HashSet<>();

    @PrePersist
    protected void OnCreate(){
        createdAt = LocalDateTime.now();
    }




}
