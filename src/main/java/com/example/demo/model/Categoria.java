package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name ="categorias")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String nombre;
    @Column(name="imagen_url")
    private String imagenUrl;

    public Categoria() {
    }

    public Categoria(Integer id, String nombre, String imagenUrl) {
        this.id = id;
        this.nombre = nombre;
        this.imagenUrl = imagenUrl;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }
    
    

}
