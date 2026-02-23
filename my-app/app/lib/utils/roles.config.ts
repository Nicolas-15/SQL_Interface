/**
 * Configuración centralizada de roles y permisos.
 * Los nombres DEBEN coincidir EXACTAMENTE con nombre_rol en la tabla [rol].
 * Roles en la DB:admin, Soporte, Tesorería, Tránsito, Finanzas, Adm. Municipal
 */

// Nombres de roles tal como están en la BD
export const ROLES = {
  ADMIN: "admin",
  SOPORTE: "Soporte",
  TESORERIA: "Tesorería",
  TRANSITO: "Tránsito",
  FINANZAS: "Finanzas",
  ADMINISTRACION_MUNICIPAL: "Adm.Titular",
} as const;

// Lista de roles asignables para dropdowns
export const ROLES_LIST = [
  ROLES.ADMIN,
  ROLES.SOPORTE,
  ROLES.TESORERIA,
  ROLES.TRANSITO,
  ROLES.FINANZAS,
  ROLES.ADMINISTRACION_MUNICIPAL,
];

// Etiquetas legibles para mostrar en UI
export const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: "Admin",
  [ROLES.SOPORTE]: "Soporte",
  [ROLES.TESORERIA]: "Tesorería",
  [ROLES.TRANSITO]: "Tránsito",
  [ROLES.FINANZAS]: "Finanzas",
  [ROLES.ADMINISTRACION_MUNICIPAL]: "Adm.Titular",
};

// ──────────────────────────────────────────────────────────────
// Rutas permitidas por rol (admin tiene acceso total)
//
// ADMIN          → Todo
// SOPORTE        → Módulo gestión financiera completo (sin usuarios ni titulares)
// TESORERÍA      → Solo regularización de pagos (aún no implementado)
// TRÁNSITO       → Solo reporte de transparencia PC
// FINANZAS       → Solo regularización por folio y decretos
// ADM. MUNICIPAL → Solo intercambiar titularidad
// ──────────────────────────────────────────────────────────────
const rutasPermitidas: Record<string, string[]> = {
  [ROLES.SOPORTE]: [
    "/consultas",
    "/consultas/intercambiar-titular",
    "/consultas/reporte-transparencia",
    "/consultas/regularizar-folio",
    "/consultas/regularizacion",
    "/consultas/gestion-cas",
  ],
  [ROLES.TESORERIA]: ["/consultas", "/consultas/regularizacion"],
  [ROLES.TRANSITO]: ["/consultas", "/consultas/reporte-transparencia"],
  [ROLES.FINANZAS]: ["/consultas", "/consultas/regularizar-folio"],
  [ROLES.ADMINISTRACION_MUNICIPAL]: [
    "/consultas",
    "/consultas/intercambiar-titular",
  ],
};

export function tieneAcceso(nombreRol: string | null, ruta: string): boolean {
  if (!nombreRol) return false;
  if (nombreRol === ROLES.ADMIN) return true;

  const rutas = rutasPermitidas[nombreRol];
  if (!rutas) return false;

  return rutas.some((r) => {
    if (ruta === r) return true;

    // Si la ruta permitida es una base general, requerimos coincidencia exacta.
    // Esto evita que "/consultas" autorice por error "/consultas/reporte-transparencia"
    const basesGenerales = ["/consultas", "/usuarios", "/titulares"];
    if (basesGenerales.includes(r)) return false;

    // Para rutas específicas (ej: /consultas/reporte-transparencia), permite subrutas
    return ruta.startsWith(r + "/");
  });
}

/**
 * Retorna la lista de módulos de consultas visibles para un rol.
 */
export function getModulosConsultas(nombreRol: string | null) {
  const todos = [
    {
      id: 1,
      titulo: "Gestión de Firmantes (Titularidad)",
      descripcion:
        "Administración del funcionario habilitado (Alcalde o Administrador Municipal) para la firma digital de decreto en la plataforma DPW",
      href: "/consultas/intercambiar-titular",
      color: "blue",
      disponible: true,
    },
    {
      id: 2,
      titulo: "Reporte de Transparencia (PC)",
      descripcion:
        "Generación de informes consolidados de Permisos de Circulación. Incluye exportación a Excel y filtros avanzados para cumplimiento normativo.",
      href: "/consultas/reporte-transparencia",
      color: "rose",
      disponible: true,
    },
    {
      id: 3,
      titulo: "Regularización de Decretos",
      descripcion:
        "Permite la liberación y regularización de Decretos de Pago para corrección de irregularidades.",
      href: "/consultas/regularizar-folio",
      color: "yellow",
      disponible: true,
    },
    {
      id: 4,
      titulo: "Regularización Pagos Inconclusos Módulo de Tesorería",
      descripcion:
        "Eliminación de registros de pagos inconclusos para su regularización",
      href: "/consultas/regularizacion",
      color: "green",
      disponible: true,
    },
    {
      id: 5,
      titulo: "Gestión de usuarios aplicaciones CAS",
      descripcion: "Permite la gestión de usuarios de las aplicaciones CAS.",
      href: "/consultas/gestion-cas",
      color: "purple",
      disponible: true,
    },
  ];

  if (!nombreRol || nombreRol === ROLES.ADMIN) return todos;

  const rutas = rutasPermitidas[nombreRol] || [];
  return todos.filter((m) => rutas.includes(m.href));
}

/**
 * Retorna las cards del Home visibles para un rol.
 */
export function getCardsHome(nombreRol: string | null) {
  const cards = [
    {
      id: "consultas",
      title: "Gestión Financiera y Operativa",
      description:
        "Módulo integral para la ejecución de acciones complementarias para las aplicaciones de CAS",
      href: "/consultas",
    },
    {
      id: "usuarios",
      title: "Administración de Seguridad",
      description:
        "Panel de control para la administracion de usuarios del sistema.",
      href: "/usuarios",
    },
    {
      id: "titulares",
      title: "Configuración de Firmantes",
      description:
        "Administración de autoridades habilitadas para firma de Decreto Pago Web.",
      href: "/titulares",
    },
    {
      id: "auditoria",
      title: "Control de Auditoría",
      description:
        "Seguimiento exhaustivo de cambios, accesos y operaciones críticas en la plataforma.",
      href: "/auditoria",
    },
  ];

  if (!nombreRol || nombreRol === ROLES.ADMIN) return cards;

  const rutas = rutasPermitidas[nombreRol] || [];

  return cards.filter((card) =>
    rutas.some((r) => r === card.href || r.startsWith(card.href + "/")),
  );
}

/**
 * Retorna los links de navegación principal para el Navbar/Header.
 */
export function getNavLinks(nombreRol: string | null) {
  const allLinks = [
    { href: "/consultas", label: "Consultas" },
    { href: "/usuarios", label: "Usuarios" },
    { href: "/titulares", label: "Firmantes" },
    { href: "/consultas/regularizacion", label: "Tesorería" },
    { href: "/auditoria", label: "Bitácora" },
  ];

  if (!nombreRol || nombreRol === ROLES.ADMIN) return allLinks;

  const rutas = rutasPermitidas[nombreRol] || [];
  return allLinks.filter((link) =>
    rutas.some((r) => r === link.href || r.startsWith(link.href + "/")),
  );
}
