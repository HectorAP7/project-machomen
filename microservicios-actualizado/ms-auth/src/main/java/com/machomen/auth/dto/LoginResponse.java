package com.machomen.auth.dto;

import com.machomen.auth.model.Usuario;

/**
 * Angular espera: { "token": "...", "usuario": { idusuario, nombres, rol, ... } }
 */
public class LoginResponse {
    private String token;
    private Usuario usuario;

    public LoginResponse(String token, Usuario usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() { return token; }
    public void setToken(String v) { this.token = v; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario v) { this.usuario = v; }
}
