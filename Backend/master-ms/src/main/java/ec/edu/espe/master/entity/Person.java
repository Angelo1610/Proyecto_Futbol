package ec.edu.espe.master.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "persons")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
@Builder

public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 30)
    private String dni;

    @Column(name= "first_name", nullable = false, length = 30)
    private String firstName;

    @Column(name= "middle_name",nullable = false, length = 30)
    private String middleName;

    @Column(name= "last_name",nullable = false, length = 30)
    private String lastName;

    @Column(nullable = false, length = 50, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, length = 15, unique = true)
    private String phone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false, length = 30)
    private String nationality;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;



}
