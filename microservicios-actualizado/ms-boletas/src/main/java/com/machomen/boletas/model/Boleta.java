package com.machomen.boletas.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tb_boleta")
public class Boleta {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idboleta;

    private LocalDateTime fecha;

    /**
     * FIX: FetchType.EAGER en usuario y distrito para evitar
     * LazyInitializationException cuando el servicio mapea a Map plano.
     * El detalle (OneToMany) sigue siendo LAZY pero se carga explícitamente
     * en el servicio con findByIdboleta.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "idusuario")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "iddistrito")
    private Distrito distrito;

    @Column(name = "tipo_pago")       private Integer    tipoPago;
    @Column(name = "nro_operacion")   private String     nroOperacion;
    @Column(name = "direccion_envio") private String     direccionEnvio;

    private BigDecimal importe_productos;
    private BigDecimal importe_envio;
    private BigDecimal importe_neto;
    private BigDecimal importe_igv;
    private BigDecimal importe_total;
    private Integer    estado;

    @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<BoletaDetalle> detalles;

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Integer       getIdboleta()               { return idboleta; }
    public void          setIdboleta(Integer v)       { this.idboleta = v; }
    public LocalDateTime getFecha()                   { return fecha; }
    public void          setFecha(LocalDateTime v)    { this.fecha = v; }
    public Usuario       getUsuario()                 { return usuario; }
    public void          setUsuario(Usuario v)        { this.usuario = v; }
    public Distrito      getDistrito()                { return distrito; }
    public void          setDistrito(Distrito v)      { this.distrito = v; }
    public Integer       getTipoPago()                { return tipoPago; }
    public void          setTipoPago(Integer v)       { this.tipoPago = v; }
    public String        getNroOperacion()            { return nroOperacion; }
    public void          setNroOperacion(String v)    { this.nroOperacion = v; }
    public String        getDireccionEnvio()          { return direccionEnvio; }
    public void          setDireccionEnvio(String v)  { this.direccionEnvio = v; }
    public BigDecimal    getImporte_productos()       { return importe_productos; }
    public void          setImporte_productos(BigDecimal v) { this.importe_productos = v; }
    public BigDecimal    getImporte_envio()           { return importe_envio; }
    public void          setImporte_envio(BigDecimal v)     { this.importe_envio = v; }
    public BigDecimal    getImporte_neto()            { return importe_neto; }
    public void          setImporte_neto(BigDecimal v)      { this.importe_neto = v; }
    public BigDecimal    getImporte_igv()             { return importe_igv; }
    public void          setImporte_igv(BigDecimal v)       { this.importe_igv = v; }
    public BigDecimal    getImporte_total()           { return importe_total; }
    public void          setImporte_total(BigDecimal v)     { this.importe_total = v; }
    public Integer       getEstado()                  { return estado; }
    public void          setEstado(Integer v)         { this.estado = v; }
    public List<BoletaDetalle> getDetalles()          { return detalles; }
    public void          setDetalles(List<BoletaDetalle> v) { this.detalles = v; }
}
