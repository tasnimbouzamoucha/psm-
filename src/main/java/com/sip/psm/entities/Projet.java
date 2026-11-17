package com.sip.psm.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "projets")
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String libelle;

    private Double budget;

    // Durée en mois
    private Integer duree;

    @Column(length = 2000)
    private String description;

    // Relation Many-to-One : plusieurs projets appartiennent à un client (colonne id_client)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_client", nullable = false)
    private Client client;

    // Cahier des charges du projet (PDF stocké dans la table fichiers)
    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cahier_charges_id")
    private Fichier cahierCharges;

    // Nom du PDF, gardé ici pour l'afficher sans charger tout le fichier
    @Column(name = "cahier_charges_nom")
    private String cahierChargesNom;

    public Projet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }

    public Fichier getCahierCharges() { return cahierCharges; }
    public void setCahierCharges(Fichier cahierCharges) { this.cahierCharges = cahierCharges; }

    public String getCahierChargesNom() { return cahierChargesNom; }
    public void setCahierChargesNom(String cahierChargesNom) { this.cahierChargesNom = cahierChargesNom; }

    @JsonProperty(value = "hasCahierCharges", access = JsonProperty.Access.READ_ONLY)
    public boolean hasCahierCharges() { return cahierCharges != null; }
}
