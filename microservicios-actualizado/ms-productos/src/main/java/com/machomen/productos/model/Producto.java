package com.machomen.productos.model;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_producto")
public class Producto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idproducto;
    private String descripcion;
    private Integer stock;
    private double precio;
    private String imagen;
    private Integer estado;

    @Column(name = "talla_json", columnDefinition = "TEXT")
    @JsonProperty("talla_json")
    @JsonAlias({"talla_json", "tallaJson"})
    private String tallaJson;

    @Column(name = "caracteristicas", columnDefinition = "TEXT")
    private String caracteristicas;

    @ManyToOne
    @JoinColumn(name = "idcategoria")
    private Categoria categoria;

    @Transient
    private String imagenUrl;

    @PostLoad
    public void calcularUrl() {
        this.imagenUrl = (imagen == null || imagen.isEmpty()) ? "assets/img/no-image.png" : imagen;
    }

    public Integer getIdproducto() { return idproducto; }
    public void setIdproducto(Integer v) { this.idproducto = v; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
    public Integer getStock() { return stock; }
    public void setStock(Integer v) { this.stock = v; }
    public double getPrecio() { return precio; }
    public void setPrecio(double v) { this.precio = v; }
    public String getImagen() { return imagen; }
    public void setImagen(String v) { this.imagen = v; }
    public Integer getEstado() { return estado; }
    public void setEstado(Integer v) { this.estado = v; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria v) { this.categoria = v; }
    public String getImagenUrl() { return imagenUrl; }
    public String getTallaJson() { return tallaJson; }
    public void setTallaJson(String v) { this.tallaJson = v; }
    public String getCaracteristicas() { return caracteristicas; }
    public void setCaracteristicas(String v) { this.caracteristicas = v; }
}
