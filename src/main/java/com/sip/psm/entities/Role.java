package com.sip.psm.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Valeurs : "ADMIN" ou "COLLABORATEUR"
    @Column(nullable = false, unique = true)
    private String libelle;

    public Role() {}

    public Role(String libelle) {
        this.libelle = libelle;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
}
