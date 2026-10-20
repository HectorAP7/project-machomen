package com.machomen.usuarios.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_usuario")
public class Usuario {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idusuario;
    private String nombres;
    private String apellidos;
    @Column(unique = true) private String dni;
    @Column(unique = true) private String correo;
    private String clave;
    private String direccion;
    private String celular;
    @Column(name = "iddistrito") private Integer iddistrito;
    private Integer rol = 2;
    private Integer estado = 1;
    @Column(name = "fecha_reg") private LocalDateTime fechaReg;

    public Integer getIdusuario() { return idusuario; }
    public void setIdusuario(Integer v) { this.idusuario = v; }
    public String getNombres() { return nombres; }
    public void setNombres(String v) { this.nombres = v; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String v) { this.apellidos = v; }
    public String getDni() { return dni; }
    public void setDni(String v) { this.dni = v; }
    public String getCorreo() { return correo; }
    public void setCorreo(String v) { this.correo = v; }
    public String getClave() { return clave; }
    public void setClave(String v) { this.clave = v; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String v) { this.direccion = v; }
    public String getCelular() { return celular; }
    public void setCelular(String v) { this.celular = v; }
    public Integer getIddistrito() { return iddistrito; }
    public void setIddistrito(Integer v) { this.iddistrito = v; }
    public Integer getRol() { return rol; }
    public void setRol(Integer v) { this.rol = v; }
    public Integer getEstado() { return estado; }
    public void setEstado(Integer v) { this.estado = v; }
    public LocalDateTime getFechaReg() { return fechaReg; }
    public void setFechaReg(LocalDateTime v) { this.fechaReg = v; }
}
