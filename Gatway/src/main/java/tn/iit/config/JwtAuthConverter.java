package tn.iit.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractAllRoles(jwt);
        return new JwtAuthenticationToken(jwt, authorities, jwt.getClaim("preferred_username"));
    }

    private Collection<GrantedAuthority> extractAllRoles(Jwt jwt) {
        Set<GrantedAuthority> authorities = new HashSet<>();

        // Extraction depuis realm_access.app-projectPFE.roles
        try {
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            if (realmAccess != null) {
                Map<String, Object> appRoles = (Map<String, Object>) realmAccess.get("app-projectPFE");
                if (appRoles != null) {
                    List<String> roles = (List<String>) appRoles.get("roles");
                    roles.forEach(role ->
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                }
            }
        } catch (ClassCastException ignored) {}

        // Extraction depuis resource_access
        try {
            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            if (resourceAccess != null) {
                Map<String, Object> appAccess = (Map<String, Object>) resourceAccess.get("app-projectPFE");
                if (appAccess != null) {
                    List<String> roles = (List<String>) appAccess.get("roles");
                    roles.forEach(role ->
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                }
            }
        } catch (ClassCastException ignored) {}

        return authorities;
    }
}
