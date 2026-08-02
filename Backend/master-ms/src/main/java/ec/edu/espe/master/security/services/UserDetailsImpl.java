package ec.edu.espe.master.security.services;
import ec.edu.espe.master.entity.User;
import ec.edu.espe.master.entity.UserRole;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;




public class UserDetailsImpl implements  UserDetails{
    private final UUID id;
    private final String username;
    private final String password;
    private final boolean active;
    private final Long tokenVersion;
    private final Collection<? extends GrantedAuthority> authorities;


    public UserDetailsImpl(User user){
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPasswordHash();
        this.active = user.getPerson().getActive();
        this.tokenVersion = user.getTokenVersion();
        this.authorities = user.getUserRoles()
                .stream()
                .filter(UserRole::getActive)
                .map(ur -> new SimpleGrantedAuthority("ROLE_" + ur.getRole().getName().toUpperCase()))
                .collect(Collectors.toSet());
    }
    public UUID getId() {
        return id;
    }

    public Long getTokenVersion() {
        return tokenVersion;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}