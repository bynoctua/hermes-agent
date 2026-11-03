# Corvux / ZARA — Hermes Dashboard (prototipo v0.1)

Complemento **no destructivo** para el dashboard web nativo de Hermes: tema oscuro tipo cockpit y plugin de consola de solo lectura.

- Estado: **código preparado en GitHub, NO desplegado ni probado en el host**.
- Motor: el Hermes existente en Debian (no añade OpenJarvis, Ollama ni nuevos modelos).
- URL deseada: `https://agente.corvux.xyz`.
- Vercel: **no requerido** para este plugin; el propio Hermes sirve la interfaz y el backend.
- Seguridad: mantener backend en `127.0.0.1:9119`, publicar mediante Cloudflare Tunnel y exigir autenticación OAuth de Nous u OIDC. No usar solamente usuario/contraseña de Hermes en Internet.
- No altera el gateway, la memoria, los cron jobs ni los tokens.

## Instalación del tema y plugin (ejecutar desde Debian, previa revisión)

```bash
git clone --depth 1 --filter=blob:none --sparse --branch feature/corvux-dashboard-v1 https://github.com/bynoctua/hermes-agent.git /tmp/corvux-dashboard-src
cd /tmp/corvux-dashboard-src
git sparse-checkout set corvux-dashboard

install -d -m 700 ~/.hermes/dashboard-themes
install -m 600 corvux-dashboard/theme/corvux.yaml ~/.hermes/dashboard-themes/corvux.yaml
install -d -m 700 ~/.hermes/plugins/corvux-control
cp -a corvux-dashboard/plugin/dashboard ~/.hermes/plugins/corvux-control/
```

Después abrir Hermes Dashboard y seleccionar tema **Corvux — ZARA**. Visitar la ruta `/corvux`; la barra lateral requiere `layoutVariant: cockpit`, ya incluido en el tema.

## Publicación segura (pendiente, NO ejecutada)

1. Verificar versión Hermes y que el dashboard nativo arranque sin afectar el gateway:
   `hermes dashboard --host 127.0.0.1 --port 9119 --no-open`.
2. Registrar OAuth en el host: `hermes dashboard register --name "ZARA Corvux" --redirect-uri https://agente.corvux.xyz/auth/callback`. Esto requiere la cuenta Nous activa o un proveedor OIDC configurado.
3. Configurar `dashboard.public_url: "https://agente.corvux.xyz"` en `~/.hermes/config.yaml` (o variable `HERMES_DASHBOARD_PUBLIC_URL`). Esto fuerza autenticación incluso con bind a loopback.
4. Configurar un túnel Cloudflare de hostname `agente.corvux.xyz` al origin `http://127.0.0.1:9119`; crear registro DNS del túnel. Considerar protección adicional Cloudflare Access, verificando compatibilidad de OAuth/WebSockets.
5. Configurar persistencia de dashboard y `cloudflared` con systemd; no modificar unidades existentes sin inspección.
6. Probar: respuesta no autenticada denegada, login/callback OAuth, chat WebSocket, reinicio, reconexión, y que no aparecen secretos en respuestas públicas.

**Limitaciones:** sin acceso de ejecución SSH ni MCP Cloudflare conectado no es posible confirmar este despliegue desde ChatGPT. El plugin tampoco reemplaza todavía las páginas principales de Hermes.

## Validación y rollback

- Confirmar versión exacta de Hermes con soporte de temas/plugins (`Extending the Dashboard`).
- Validar rutas reales /chat, /sessions, /cron, /analytics, /mcp, /logs, /config en versión instalada.
- Para deshacer: eliminar `~/.hermes/plugins/corvux-control` y `~/.hermes/dashboard-themes/corvux.yaml`, volver al tema anterior. No requiere cambios en datos.
- Nunca incorporar `~/.hermes/.env`, claves OAuth, tokens de Cloudflare ni contenido del vault a GitHub.

Referencias:
- https://hermes-agent.nousresearch.com/docs/user-guide/features/web-dashboard
- https://hermes-agent.nousresearch.com/docs/user-guide/features/extending-the-dashboard
- https://github.com/open-jarvis/OpenJarvis
