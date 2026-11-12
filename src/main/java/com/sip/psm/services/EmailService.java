package com.sip.psm.services;

import com.sip.psm.entities.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${spring.mail.username:}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 5) Envoi d'un email à l'admin après chaque inscription.
    // @Async : l'email part en arrière-plan, l'inscription répond tout de suite.
    @Async
    public void notifierAdminInscription(User user) {
        if (from == null || from.isBlank()) {
            log.warn("Email NON envoyé : spring.mail.username n'est pas configuré (voir application.properties).");
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(adminEmail);
            message.setSubject("[PSM] Nouvelle inscription : " + user.getPrenom() + " " + user.getNom());
            message.setText("""
                    Bonjour,

                    Un nouvel utilisateur vient de s'inscrire sur Projects Manager :

                      Nom      : %s
                      Prénom   : %s
                      Email    : %s
                      Téléphone: %s

                    Rôle attribué par défaut : COLLABORATEUR.
                    Vous pouvez modifier ses rôles depuis le menu Utilisateurs.

                    -- Projects Manager (SmartSoft Solutions)
                    """.formatted(user.getNom(), user.getPrenom(), user.getEmail(),
                    user.getTel() == null ? "-" : user.getTel()));
            mailSender.send(message);
            log.info("Email de notification envoyé à l'admin ({})", adminEmail);
        } catch (Exception e) {
            log.error("Echec de l'envoi de l'email à l'admin : {}", e.getMessage());
        }
    }
}
