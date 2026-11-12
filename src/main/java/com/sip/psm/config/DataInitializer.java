package com.sip.psm.config;

import com.sip.psm.entities.Client;
import com.sip.psm.entities.Projet;
import com.sip.psm.entities.Role;
import com.sip.psm.entities.User;
import com.sip.psm.repositories.ClientRepository;
import com.sip.psm.repositories.ProjetRepository;
import com.sip.psm.repositories.RoleRepository;
import com.sip.psm.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Au démarrage : crée les rôles ADMIN / COLLABORATEUR, un admin, un collaborateur
// et quelques données de démonstration (uniquement si la base est vide).
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjetRepository projetRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.init.admin.email}") private String adminEmail;
    @Value("${app.init.admin.password}") private String adminPassword;
    @Value("${app.init.collab.email}") private String collabEmail;
    @Value("${app.init.collab.password}") private String collabPassword;

    public DataInitializer(RoleRepository roleRepository, UserRepository userRepository,
                           ClientRepository clientRepository, ProjetRepository projetRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.projetRepository = projetRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Role admin = roleRepository.findByLibelle("ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ADMIN")));
        Role collab = roleRepository.findByLibelle("COLLABORATEUR")
                .orElseGet(() -> roleRepository.save(new Role("COLLABORATEUR")));

        if (!userRepository.existsByEmail(adminEmail)) {
            User u = new User();
            u.setEmail(adminEmail);
            u.setPassword(passwordEncoder.encode(adminPassword));
            u.setNom("Admin");
            u.setPrenom("Super");
            u.setTel("+216 70 000 000");
            u.getRoles().add(admin);
            userRepository.save(u);
            log.info(">>> Compte ADMIN créé : {} / {}", adminEmail, adminPassword);
        }
        if (!userRepository.existsByEmail(collabEmail)) {
            User u = new User();
            u.setEmail(collabEmail);
            u.setPassword(passwordEncoder.encode(collabPassword));
            u.setNom("Collaborateur");
            u.setPrenom("Demo");
            u.setTel("+216 71 000 000");
            u.getRoles().add(collab);
            userRepository.save(u);
            log.info(">>> Compte COLLABORATEUR créé : {} / {}", collabEmail, collabPassword);
        }

        if (clientRepository.count() == 0) {
            Client c1 = client("SmartSoft Solutions", "+216 71 123 456", "contact@smartsoft.tn", "Tunis, Les Berges du Lac");
            Client c2 = client("Tunisie Telecom", "+216 71 901 000", "contact@tt.tn", "Tunis, Jardins du Lac");
            Client c3 = client("Poulina Group", "+216 71 940 000", "info@poulina.tn", "Ben Arous");
            projet("Application mobile e-banking", 120000.0, 8, "Développement d'une application mobile Android/iOS.", c1);
            projet("Refonte du site web", 25000.0, 3, "Nouveau site vitrine responsive.", c1);
            projet("Portail client B2B", 80000.0, 6, "Portail web pour les clients professionnels.", c2);
            projet("ERP logistique", 200000.0, 12, "Intégration d'un ERP pour la gestion des stocks.", c3);
            log.info(">>> Données de démonstration créées (3 clients, 4 projets)");
        }
    }

    private Client client(String nom, String tel, String email, String adresse) {
        Client c = new Client();
        c.setNom(nom); c.setTel(tel); c.setEmail(email); c.setAdresse(adresse);
        return clientRepository.save(c);
    }

    private void projet(String libelle, Double budget, Integer duree, String desc, Client client) {
        Projet p = new Projet();
        p.setLibelle(libelle); p.setBudget(budget); p.setDuree(duree); p.setDescription(desc); p.setClient(client);
        projetRepository.save(p);
    }
}
