package com.machomen.boletas.messaging;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO publicado en RabbitMQ cuando se registra una boleta exitosa.
 * ms-notificaciones recibe este mensaje y lo procesa de forma asíncrona.
 */
public class BoletaEventoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer       idBoleta;
    private Integer       idUsuario;
    private String        nombreUsuario;
    private String        correoUsuario;
    private BigDecimal    importeTotal;
    private Integer       tipoPago;
    private String        nroOperacion;
    private LocalDateTime fecha;
    private int           cantidadItems;

    public BoletaEventoDTO() {}

    public BoletaEventoDTO(Integer idBoleta, Integer idUsuario, String nombreUsuario,
                           String correoUsuario, BigDecimal importeTotal, Integer tipoPago,
                           String nroOperacion, LocalDateTime fecha, int cantidadItems) {
        this.idBoleta      = idBoleta;
        this.idUsuario     = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.correoUsuario = correoUsuario;
        this.importeTotal  = importeTotal;
        this.tipoPago      = tipoPago;
        this.nroOperacion  = nroOperacion;
        this.fecha         = fecha;
        this.cantidadItems = cantidadItems;
    }

    public Integer       getIdBoleta()      { return idBoleta; }
    public void          setIdBoleta(Integer v)      { this.idBoleta = v; }
    public Integer       getIdUsuario()     { return idUsuario; }
    public void          setIdUsuario(Integer v)     { this.idUsuario = v; }
    public String        getNombreUsuario() { return nombreUsuario; }
    public void          setNombreUsuario(String v)  { this.nombreUsuario = v; }
    public String        getCorreoUsuario() { return correoUsuario; }
    public void          setCorreoUsuario(String v)  { this.correoUsuario = v; }
    public BigDecimal    getImporteTotal()  { return importeTotal; }
    public void          setImporteTotal(BigDecimal v){ this.importeTotal = v; }
    public Integer       getTipoPago()      { return tipoPago; }
    public void          setTipoPago(Integer v)      { this.tipoPago = v; }
    public String        getNroOperacion()  { return nroOperacion; }
    public void          setNroOperacion(String v)   { this.nroOperacion = v; }
    public LocalDateTime getFecha()         { return fecha; }
    public void          setFecha(LocalDateTime v)   { this.fecha = v; }
    public int           getCantidadItems() { return cantidadItems; }
    public void          setCantidadItems(int v)     { this.cantidadItems = v; }
}
