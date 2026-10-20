package com.machomen.auth.dto;

public class LoginRequest {
    private String correo;
    private String clave;
    public String getCorreo() { return correo; }
    public void setCorreo(String v) { this.correo = v; }
    public String getClave() { return clave; }
    public void setClave(String v) { this.clave = v; }
}
