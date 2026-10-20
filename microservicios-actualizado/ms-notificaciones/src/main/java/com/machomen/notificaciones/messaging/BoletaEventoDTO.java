package com.machomen.notificaciones.messaging;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO deserializado del JSON que llega desde ms-boletas vía RabbitMQ.
 * Los campos deben coincidir exactamente con BoletaEventoDTO del producer.
 */
public class BoletaEventoDTO {

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

    public Integer       getIdBoleta()      { return idBoleta; }
    public void          setIdBoleta(Integer v)       { this.idBoleta = v; }
    public Integer       getIdUsuario()     { return idUsuario; }
    public void          setIdUsuario(Integer v)      { this.idUsuario = v; }
    public String        getNombreUsuario() { return nombreUsuario; }
    public void          setNombreUsuario(String v)   { this.nombreUsuario = v; }
    public String        getCorreoUsuario() { return correoUsuario; }
    public void          setCorreoUsuario(String v)   { this.correoUsuario = v; }
    public BigDecimal    getImporteTotal()  { return importeTotal; }
    public void          setImporteTotal(BigDecimal v) { this.importeTotal = v; }
    public Integer       getTipoPago()      { return tipoPago; }
    public void          setTipoPago(Integer v)       { this.tipoPago = v; }
    public String        getNroOperacion()  { return nroOperacion; }
    public void          setNroOperacion(String v)    { this.nroOperacion = v; }
    public LocalDateTime getFecha()         { return fecha; }
    public void          setFecha(LocalDateTime v)    { this.fecha = v; }
    public int           getCantidadItems() { return cantidadItems; }
    public void          setCantidadItems(int v)      { this.cantidadItems = v; }
}
