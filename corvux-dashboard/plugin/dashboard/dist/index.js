(function () {
  "use strict";
  const SDK = window.__HERMES_PLUGIN_SDK__;
  const registry = window.__HERMES_PLUGINS__;
  if (!SDK || !registry) return;

  const h = SDK.React.createElement;
  const { useState, useEffect } = SDK.hooks;
  const links = [
    ["/corvux", "Resumen"], ["/chat", "Conversar"], ["/sessions", "Sesiones"],
    ["/cron", "Automatizaciones"], ["/skills", "Skills"], ["/analytics", "Analítica"],
    ["/mcp", "Integraciones MCP"], ["/logs", "Registros"], ["/config", "Configuración"]
  ];

  function Brand() {
    return h("span", { className: "corvux-brand" }, "CORVUX", h("span", null, " / ZARA"));
  }

  function Sidebar() {
    return h("aside", { className: "corvux-side" },
      h("div", { className: "corvux-eyebrow" }, "CENTRO DE CONTROL"),
      h("nav", { "aria-label": "Navegación de Corvux" },
        links.map(function (entry) {
          return h("a", { key: entry[0], href: entry[0], className: "corvux-nav-link" }, entry[1]);
        })
      ),
      h("p", { className: "corvux-side-note" }, "Hermes permanece como motor. Este plugin no administra secretos.")
    );
  }

  function Metric(props) {
    return h("div", { className: "corvux-metric" },
      h("span", { className: "corvux-metric-label" }, props.label),
      h("strong", { className: "corvux-metric-value" }, props.value)
    );
  }

  function Console() {
    const [state, setState] = useState({ loading: true, connected: false, version: "—", sessions: [], error: null });
    useEffect(function () {
      let active = true;
      Promise.allSettled([SDK.api.getStatus(), SDK.api.getSessions(10)]).then(function (results) {
        if (!active) return;
        const status = results[0].status === "fulfilled" ? results[0].value : null;
        const sessions = results[1].status === "fulfilled" ? results[1].value : null;
        setState({
          loading: false,
          connected: Boolean(status),
          version: status && typeof status.version === "string" ? status.version : "—",
          sessions: sessions && Array.isArray(sessions.sessions) ? sessions.sessions : [],
          error: !status ? "No se pudo consultar el estado del agente." : null
        });
      });
      return function () { active = false; };
    }, []);

    return h("section", { className: "corvux-console" },
      h("div", { className: "corvux-heading" },
        h("div", null,
          h("p", { className: "corvux-eyebrow" }, "AGENTE PERSONAL / TELEMETRÍA"),
          h("h1", null, "Centro de control ZARA"),
          h("p", { className: "corvux-subtitle" }, "Operaciones, conversaciones y recursos de Hermes en un único lugar.")
        ),
        h("span", { className: "corvux-connection" }, state.loading ? "Verificando" : state.connected ? "● Conectado" : "● Sin conexión")
      ),
      h("div", { className: "corvux-metrics" },
        h(Metric, { label: "Servicio", value: state.loading ? "Consultando" : state.connected ? "Disponible" : "Sin respuesta" }),
        h(Metric, { label: "Versión de Hermes", value: state.version }),
        h(Metric, { label: "Sesiones recientes obtenidas", value: state.loading ? "—" : String(state.sessions.length) })
      ),
      state.error ? h("p", { className: "corvux-error", role: "alert" }, state.error) : null,
      h("div", { className: "corvux-panel" },
        h("h2", null, "Acceso rápido"),
        h("p", null, "Los controles sensibles permanecen dentro del dashboard de Hermes, bajo su autenticación."),
        h("div", { className: "corvux-actions" },
          h("a", { href: "/chat" }, "Abrir chat"),
          h("a", { href: "/sessions" }, "Ver sesiones"),
          h("a", { href: "/cron" }, "Gestionar tareas"),
          h("a", { href: "/logs" }, "Consultar registros")
        )
      ),
      h("div", { className: "corvux-panel" },
        h("h2", null, "Últimas sesiones"),
        !state.sessions.length ? h("p", null, state.loading ? "Cargando…" : "No hay sesiones disponibles en esta consulta.") :
          h("ul", { className: "corvux-sessions" }, state.sessions.slice(0, 5).map(function (s, i) {
            const title = (typeof s.title === "string" && s.title) || (typeof s.preview === "string" && s.preview) || ("Sesión " + (i + 1));
            return h("li", { key: String(s.id || i) }, h("span", null, title));
          }))
      )
    );
  }
  registry.register("corvux-control", Console);
  registry.registerSlot("corvux-control", "sidebar", Sidebar);
  registry.registerSlot("corvux-control", "header-left", Brand);
})();
