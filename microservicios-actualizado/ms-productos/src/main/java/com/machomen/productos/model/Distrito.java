package com.machomen.productos.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_distrito")
public class Distrito {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer iddistrito;
    private String descripcion;

    public Integer getIddistrito() { return iddistrito; }
    public void setIddistrito(Integer v) { this.iddistrito = v; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
}
