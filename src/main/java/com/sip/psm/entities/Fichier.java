package com.sip.psm.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Fichier stocké en base de données (logo d'un client, cahier des charges d'un projet).
// On le stocke en base (et non sur le disque) car l'hébergeur (Render) efface son disque
// à chaque redémarrage : la base Aiven, elle, conserve les données.
@Entity
@Table(name = "fichiers")
public class Fichier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;              // nom d'origine, ex : logo.png

    @Column(name = "content_type", nullable = false)
    private String contentType;      // ex : image/png, application/pdf

    private Long taille;             // en octets

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] donnees;          // contenu binaire du fichier

    @Column(name = "date_upload")
    private LocalDateTime dateUpload;

    public Fichier() {}

    public Fichier(String nom, String contentType, byte[] donnees) {
        this.nom = nom;
        this.contentType = contentType;
        this.donnees = donnees;
        this.taille = (long) donnees.length;
        this.dateUpload = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getTaille() { return taille; }
    public void setTaille(Long taille) { this.taille = taille; }

    public byte[] getDonnees() { return donnees; }
    public void setDonnees(byte[] donnees) { this.donnees = donnees; }

    public LocalDateTime getDateUpload() { return dateUpload; }
    public void setDateUpload(LocalDateTime dateUpload) { this.dateUpload = dateUpload; }
}
