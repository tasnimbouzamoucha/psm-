package com.sip.psm.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    private String tel;

    @Email(message = "Email invalide")
    private String email;

    private String adresse;

    // Relation One-to-Many : un client possède plusieurs projets.
    // @JsonIgnore évite la boucle infinie Client -> Projet -> Client...
    // cascade + orphanRemoval : supprimer un client supprime ses projets.
    @JsonIgnore
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Projet> projets = new ArrayList<>();

    // Logo du client (image stockée dans la table fichiers).
    // LAZY : l'image n'est chargée que lorsqu'on la demande (GET /api/clients/{id}/logo).
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "logo_id")
    private Fichier logo;

    public Client() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getTel() { return tel; }
    public void setTel(String tel) { this.tel = tel; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public List<Projet> getProjets() { return projets; }
    public void setProjets(List<Projet> projets) { this.projets = projets; }

    public Fichier getLogo() { return logo; }
    public void setLogo(Fichier logo) { this.logo = logo; }

    // Renvoyé dans le JSON : indique au front s'il doit afficher le logo
    @JsonProperty(value = "hasLogo", access = JsonProperty.Access.READ_ONLY)
    public boolean hasLogo() { return logo != null; }
}
