package com.machomen.auth.security;

import com.machomen.auth.model.Usuario;
import com.machomen.auth.repository.IUsuarioRepository;
import com.machomen.auth.service.GoogleOAuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Se ejecuta cuando Google redirige de vuelta tras autenticación exitosa.
 * Busca o crea al usuario en BD, genera un JWT propio y redirige al frontend
 * con el token en la URL: http://localhost:4200/oauth2/callback?token=XXX
 */
@Component
public class GoogleOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuth2SuccessHandler.class);

    @Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Autowired
    private IUsuarioRepository usuarioRepo;

    @Autowired
    private GoogleOAuthService googleOAuthService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2AuthenticationToken token   = (OAuth2AuthenticationToken) authentication;
        OAuth2User oauthUser              = token.getPrincipal();

        String email      = oauthUser.getAttribute("email");
        String nombre     = oauthUser.getAttribute("given_name");
        String apellido   = oauthUser.getAttribute("family_name");
        String picture    = oauthUser.getAttribute("picture");

        log.info("Google login exitoso: {}", email);

        // Buscar o crear usuario en la BD
        Usuario usuario = googleOAuthService.buscarOCrear(email, nombre, apellido, picture);

        if (usuario.getEstado() == 0) {
            // Usuario desactivado
            String redirectUrl = frontendUrl + "/login?error=" +
                URLEncoder.encode("Tu cuenta está desactivada.", StandardCharsets.UTF_8);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        // Generar JWT propio (igual que el login normal)
        String jwt = jwtUtil.generateToken(usuario.getIdusuario(), usuario.getCorreo(), usuario.getRol());

        // Redirigir al Angular con el token en la URL
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" +
            URLEncoder.encode(jwt, StandardCharsets.UTF_8);

        log.info("Redirigiendo a: {}", redirectUrl);
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
