package com.machomen.boletas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_boleta_det")
@IdClass(BoletaDetallePK.class)
public class BoletaDetalle {

    @Id @Column(name = "idboleta")   private Integer idboleta;
    @Id @Column(name = "idproducto") private Integer idproducto;

    private Integer    cantidad;
    private BigDecimal preciovta;
    private BigDecimal importe;

    @Column(name = "talla", length = 10)
    private String talla;

    @ManyToOne @JoinColumn(name = "idboleta",   insertable = false, updatable = false) @JsonIgnore
    private Boleta boleta;

    @ManyToOne @JoinColumn(name = "idproducto", insertable = false, updatable = false)
    private Producto producto;

    public Integer    getIdboleta()   { return idboleta; }
    public void       setIdboleta(Integer v)   { this.idboleta = v; }
    public Integer    getIdproducto() { return idproducto; }
    public void       setIdproducto(Integer v) { this.idproducto = v; }
    public Integer    getCantidad()   { return cantidad; }
    public void       setCantidad(Integer v)   { this.cantidad = v; }
    public BigDecimal getPreciovta()  { return preciovta; }
    public void       setPreciovta(BigDecimal v) { this.preciovta = v; }
    public BigDecimal getImporte()    { return importe; }
    public void       setImporte(BigDecimal v)   { this.importe = v; }
    public String     getTalla()      { return talla; }
    public void       setTalla(String v)         { this.talla = v; }
    public Boleta     getBoleta()     { return boleta; }
    public Producto   getProducto()   { return producto; }
}
