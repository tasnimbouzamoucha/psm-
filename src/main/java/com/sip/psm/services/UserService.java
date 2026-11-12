package com.sip.psm.services;

import com.sip.psm.config.ResourceNotFoundException;
import com.sip.psm.dto.RegisterRequest;
import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;
import com.sip.psm.repositories.RoleRepository;
import com.sip.psm.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé");
        }
        User user = new User();
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setTel(req.tel());
        user.setNom(req.nom());
        user.setPrenom(req.prenom());
        // Par défaut un nouvel inscrit est COLLABORATEUR
        user.getRoles().add(getRole("COLLABORATEUR"));
        User saved = userRepository.save(user);

        emailService.notifierAdminInscription(saved);
        return saved;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));
    }

    public User updateRoles(Long id, List<String> roles) {
        if (roles == null || roles.isEmpty()) {
            throw new IllegalArgumentException("Un utilisateur doit avoir au moins un rôle");
        }
        User user = findById(id);
        Set<Role> newRoles = new HashSet<>();
        for (String r : roles) {
            newRoles.add(getRole(r.toUpperCase()));
        }
        user.setRoles(newRoles);
        return userRepository.save(user);
    }

    public void delete(Long id, String currentEmail) {
        User user = findById(id);
        if (user.getEmail().equalsIgnoreCase(currentEmail)) {
            throw new IllegalArgumentException("Vous ne pouvez pas supprimer votre propre compte");
        }
        userRepository.delete(user);
    }

    public Role getRole(String libelle) {
        return roleRepository.findByLibelle(libelle)
                .orElseThrow(() -> new IllegalArgumentException("Rôle inconnu : " + libelle));
    }
}
