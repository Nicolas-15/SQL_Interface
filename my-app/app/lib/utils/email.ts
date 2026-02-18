import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APPPASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const BRAND_NAME = "Aplicas | Municipalidad El Quisco";
const SITE_URL = process.env.SITE_URL || "https://aplicas.elquisco.cl";
const CONTACT_EMAIL = process.env.EMAIL_FROM;

// Brand Colors
const COLORS = {
  primary: "#2e40fd",
  text: "#1d2674",
  background: "#f8fafc",
  secondary: "#1e2ab0",
  accent: "#98baff",
  white: "#ffffff",
  border: "#e2e8f0",
  textMuted: "#64748b",
};

const getEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: ${COLORS.background};">
    <tr>
      <td style="padding: 40px 10px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 8px; border-top: 5px solid ${COLORS.accent}; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          
          <!-- Header (Simple & Clean) -->
          <div style="padding: 30px 40px 10px 40px; text-align: left;">
             <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${COLORS.textMuted}; text-transform: uppercase; letter-spacing: 1px;">Municipalidad El Quisco</p>
             <h1 style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: ${COLORS.text};">${BRAND_NAME}</h1>
          </div>

          <!-- Divider -->
          <div style="margin: 0 40px; border-bottom: 1px solid ${COLORS.border};"></div>

          <!-- Body -->
          <div style="padding: 30px 40px; color: #334155; font-size: 16px; line-height: 1.6;">
            <h2 style="color: ${COLORS.text}; margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 600;">${title}</h2>
            
            <div style="color: #475569;">
              ${content}
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f1f5f9; padding: 25px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid ${COLORS.border};">
            <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted}; line-height: 1.5;">
              Este es un mensaje automático del sistema de trámites digitales.<br>
              Para más información, visita <a href="${SITE_URL}" style="color: ${COLORS.primary}; text-decoration: none; font-weight: 600;">tramites.munielquisco.gob.cl</a>
            </p>
             <p style="margin: 15px 0 0; font-size: 12px; color: #94a3b8;">
              &copy; ${new Date().getFullYear()} I. Municipalidad de El Quisco
            </p>
          </div>
          
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * 1. Confirmación solicitud ingresada al usuario
 * Si es denuncia anónima, dar el id público.
 */
export const sendRequestConfirmation = async (
  email: string,
  name: string,
  requestTitle: string,
  isAnonymous: boolean,
  publicId?: string | null,
) => {
  const title = "Solicitud Recibida";
  let content = `
    <p>Hola <strong>${name || "Vecino/a"}</strong>,</p>
    <p>Te informamos que hemos recibido tu solicitud <strong>"${requestTitle}"</strong> correctamente.</p>
  `;

  if (isAnonymous && publicId) {
    content += `
      <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 20px; margin: 25px 0; border-radius: 6px;">
        <p style="margin: 0 0 10px; font-weight: bold; color: #92400e; font-size: 0.95em;">⚠️ CÓDIGO DE SEGUIMIENTO</p>
        <p style="margin: 0 0 15px; color: #92400e; font-size: 0.95em;">Al ser una solicitud anónima, este código es la <strong>única llave</strong> para consultar tu estado:</p>
        <div style="font-size: 26px; font-weight: bold; color: ${COLORS.text}; text-align: center; letter-spacing: 2px; background: #ffffff; padding: 12px; border: 1px dashed #d97706; border-radius: 4px;">${publicId}</div>
      </div>
    `;
  } else if (publicId) {
    content += `
      <div style="margin: 25px 0; padding: 15px; background-color: #f8fafc; border-left: 4px solid ${COLORS.accent}; border-radius: 4px;">
        <p style="margin: 0; font-size: 0.9em; color: ${COLORS.textMuted}; text-transform: uppercase; font-weight: 600;">Folio de Solicitud</p>
        <p style="margin: 5px 0 0; font-size: 22px; font-weight: bold; color: ${COLORS.text};">${publicId}</p>
      </div>
    `;
  }

  content += `
    <p>Tu caso ya se encuentra en nuestro sistema y será derivado al área correspondiente. Te notificaremos cualquier avance a este correo.</p>
    <div style="margin-top: 35px;">
      <a href="${SITE_URL}/consulta" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Consultar Estado</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Confirmación de Solicitud - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 2. Solicitud derivada (notificar al usuario cuando se le asigne una nueva solicitud en la plataforma)
 */
export const sendRequestAssigned = async (
  email: string,
  name: string,
  requestTitle: string,
  requestId: string,
) => {
  const title = "Nueva Asignación";
  const content = `
    <p>Estimado/a <strong>${name}</strong>,</p>
    <p>Se te ha asignado una nueva solicitud en el sistema de trámites.</p>
    
    <div style="margin: 25px 0; border: 1px solid ${COLORS.border}; border-radius: 8px; overflow: hidden;">
       <div style="background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px solid ${COLORS.border};">
         <span style="font-weight: 600; color: ${COLORS.textMuted}; font-size: 13px;">DETALLES</span>
       </div>
       <div style="padding: 20px;">
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Solicitud</p>
          <p style="margin: 0 0 15px; color: ${COLORS.text}; font-weight: 600; font-size: 16px;">${requestTitle}</p>
          
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Folio</p>
          <p style="margin: 0; color: ${COLORS.text}; font-family: monospace; font-size: 16px;">${requestId}</p>
       </div>
    </div>

    <p>Por favor, ingresa a la plataforma para gestionar este caso.</p>
    
    <div style="margin-top: 35px;">
      <a href="${SITE_URL}/admin/dashboard" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Ir al Panel de Gestión</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Nueva Asignación - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 3. Solicitud respondida (notificar al usuario que se respondió su solicitud)
 */
export const sendRequestAnswered = async (
  email: string,
  name: string,
  requestTitle: string,
  requestId: string,
  responseSnippet?: string,
) => {
  const title = "Respuesta a tu Solicitud";
  let content = `
    <p>Hola <strong>${name || "Vecino/a"}</strong>,</p>
    <p>Tu solicitud <strong>"${requestTitle}"</strong> (Folio: ${requestId}) ha sido revisada y respondida.</p>
  `;

  if (responseSnippet) {
    content += `
      <div style="background-color: #f0f9ff; border-left: 4px solid ${COLORS.primary}; padding: 20px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0 0 5px; color: ${COLORS.primary}; font-size: 12px; font-weight: bold; text-transform: uppercase;">Extracto de respuesta</p>
        <p style="margin: 0; color: ${COLORS.text}; font-style: italic;">"${responseSnippet}"</p>
      </div>
    `;
  }

  content += `
    <p>Para ver la respuesta, por favor ingresa al portal.</p>
    
    <div style="margin-top: 35px;">
        <a href="${SITE_URL}/consulta" style="display: inline-block; background-color: #059669; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);">Ver Respuesta Completa</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Respuesta Disponible - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 5. Notificar actualización de Rol y Dirección
 */
export const sendUserRoleUpdated = async (
  email: string,
  name: string,
  role: string,
  area: string,
) => {
  const title = "Actualización de Cuenta";
  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Te informamos que tus permisos en el <strong>Sistema de Trámites Municipales</strong> han sido actualizados.</p>
    
    <div style="margin: 25px 0; border: 1px solid ${COLORS.border}; border-radius: 8px; overflow: hidden;">
       <div style="background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px solid ${COLORS.border};">
         <span style="font-weight: 600; color: ${COLORS.textMuted}; font-size: 13px;">NUEVA ASIGNACIÓN</span>
       </div>
       <div style="padding: 20px;">
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Rol</p>
          <p style="margin: 0 0 15px; color: ${COLORS.text}; font-weight: 600; font-size: 16px;">${role}</p>
          
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Dirección / Área</p>
          <p style="margin: 0; color: ${COLORS.text}; font-weight: 600; font-size: 16px;">${area}</p>
       </div>
    </div>

    <div style="margin-top: 35px;">
      <a href="${SITE_URL}/admin/dashboard" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Ir al Sistema</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Cuenta Actualizada - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 6. Notificar remoción de acceso (Soft Delete)
 */
export const sendUserRoleRemoved = async (email: string, name: string) => {
  const title = "Acceso Revocado";
  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Te informamos que tu rol administrativo en el <strong>Sistema de Trámites Municipales</strong> ha sido revocado.</p>
    <p>Ya no tienes acceso al panel de gestión interna.</p>
    <p>Si crees que esto es un error, por favor contacta al administrador del sistema.</p>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Acceso Revocado - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 4. Notificar asignación de Rol y Dirección al usuario (Bienvenida al sistema)
 */
export const sendUserRoleAssignment = async (
  email: string,
  name: string,
  role: string,
  area: string,
) => {
  const title = "Bienvenido al Sistema de Trámites";
  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Le informamos que ha sido habilitado en el <strong>Sistema de Trámites Municipales</strong>.</p>
    
    <div style="margin: 25px 0; border: 1px solid ${COLORS.border}; border-radius: 8px; overflow: hidden;">
       <div style="background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px solid ${COLORS.border};">
         <span style="font-weight: 600; color: ${COLORS.textMuted}; font-size: 13px;">SU ASIGNACIÓN</span>
       </div>
       <div style="padding: 20px;">
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Rol</p>
          <p style="margin: 0 0 15px; color: ${COLORS.text}; font-weight: 600; font-size: 16px;">${role}</p>
          
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Dirección / Área</p>
          <p style="margin: 0; color: ${COLORS.text}; font-weight: 600; font-size: 16px;">${area}</p>
       </div>
    </div>

    <p>A través de esta plataforma se le notificará automáticamente cuando tenga solicitudes pendientes de gestión.</p>
    <p>Puede ingresar al sistema usando su Clave Única.</p>
    
    <div style="margin-top: 35px;">
      <a href="${SITE_URL}/admin/dashboard" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Ir al Sistema</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Acceso Habilitado - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };
  return transporter.sendMail(message);
};

/**
 * 7. Notificar finalización por canal alternativo (No email)
 */
export const sendRequestFinalizedWithChannel = async (
  email: string,
  name: string,
  requestTitle: string,
  requestId: string,
  channel: string,
) => {
  const title = "Solicitud Finalizada";
  let content = `
    <p>Hola <strong>${name || "Vecino/a"}</strong>,</p>
    <p>Le informamos que su solicitud <strong>"${requestTitle}"</strong> (Folio: ${requestId}) ha sido finalizada.</p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <p style="margin: 0 0 5px; color: #166534; font-size: 12px; font-weight: bold; text-transform: uppercase;">Estado: Finalizada</p>
      <p style="margin: 0; color: ${COLORS.text};">La respuesta a su solicitud fue entregada mediante: <strong>${channel}</strong>.</p>
    </div>
  `;

  if (channel === "Retiro" || channel === "Retiro en Oficina") {
    content += `
      <p>Puede acercarse a la oficina municipal correspondiente para retirar su documentación o respuesta física.</p>
    `;
  } else if (channel === "Llamada" || channel === "Llamada Telefónica") {
    content += `
      <p>Se ha tomado contacto telefónico con usted para dar respuesta a su requerimiento.</p>
    `;
  }

  content += `
    <div style="margin-top: 35px;">
        <a href="${SITE_URL}/consulta" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 15px;">Ver Detalle</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Solicitud Finalizada - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 8. Recuperar Contraseña
 */
/**
 * 8. Enviar Código de Verificación (6 dígitos)
 */
export const sendVerificationCodeEmail = async (
  email: string,
  code: string,
  name: string,
) => {
  const title = "Tu Código de Recuperación";

  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Hemos recibido una solicitud para restablecer tu contraseña en el <strong>Sistema de Trámites Municipales</strong>.</p>
    
    <p>Usa el siguiente código para completar el proceso:</p>
    
    <div style="margin: 35px 0; text-align: center;">
      <span style="display: inline-block; background-color: #eff6ff; color: ${COLORS.primary}; padding: 15px 30px; border: 2px dashed ${COLORS.primary}; border-radius: 8px; font-weight: 700; font-size: 32px; letter-spacing: 5px;">${code}</span>
    </div>

    <div style="background-color: #fff1f2; border: 1px solid #fda4af; padding: 15px; margin: 25px 0; border-radius: 6px;">
       <p style="margin: 0; color: #be123c; font-size: 13px;"><strong>Importante:</strong> Este código expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Código de Recuperación: ${code} - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 9. Enviar Nueva Contraseña (Admin Reset)
 */
export const sendNewPasswordEmail = async (
  email: string,
  name: string,
  password: string,
) => {
  const title = "Tu Contraseña ha sido Restablecida";

  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Un administrador ha restablecido tu contraseña en el <strong>Sistema de Trámites Municipales</strong>.</p>
    
    <p>Tu nueva contraseña temporal es:</p>
    
    <div style="margin: 35px 0; text-align: center;">
      <span style="display: inline-block; background-color: #f0fdf4; color: #166534; padding: 15px 30px; border: 2px dashed #16a34a; border-radius: 8px; font-weight: 700; font-size: 24px; letter-spacing: 2px;">${password}</span>
    </div>

    <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; margin: 25px 0; border-radius: 6px;">
       <p style="margin: 0; color: #92400e; font-size: 13px;"><strong>Recomendación:</strong> Te sugerimos cambiar esta contraseña inmediatamente después de iniciar sesión.</p>
    </div>
    
    <div style="margin-top: 35px; text-align: center;">
      <a href="${SITE_URL}/login" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Iniciar Sesión</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Nueva Contraseña - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};

/**
 * 10. Enviar Credenciales de Bienvenida (Nuevo Usuario)
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  username: string,
  password: string,
) => {
  const title = "Bienvenido al Sistema de Trámites";

  const content = `
    <p>Hola <strong>${name}</strong>,</p>
    <p>Tu cuenta ha sido creada exitosamente en el <strong>Sistema de Trámites Municipales</strong>.</p>
    
    <p>A continuación tus credenciales de acceso:</p>
    
    <div style="margin: 25px 0; border: 1px solid ${COLORS.border}; border-radius: 8px; overflow: hidden;">
       <div style="background-color: #f8fafc; padding: 12px 20px; border-bottom: 1px solid ${COLORS.border};">
         <span style="font-weight: 600; color: ${COLORS.textMuted}; font-size: 13px;">CREDENCIALES</span>
       </div>
       <div style="padding: 20px;">
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Usuario / Email</p>
          <p style="margin: 0 0 15px; color: ${COLORS.text}; font-weight: 600; font-size: 16px;">${username}</p>
          
          <p style="margin: 0 0 5px; color: ${COLORS.textMuted}; font-size: 14px;">Contraseña Temporal</p>
          <span style="display: inline-block; background-color: #f0fdf4; color: #166534; padding: 8px 15px; border: 1px dashed #16a34a; border-radius: 6px; font-weight: 700; font-size: 18px; letter-spacing: 1px;">${password}</span>
       </div>
    </div>

    <div style="background-color: #fffbeb; border: 1px solid #fcd34d; padding: 15px; margin: 25px 0; border-radius: 6px;">
       <p style="margin: 0; color: #92400e; font-size: 13px;"><strong>Importante:</strong> Por su seguridad, le recomendamos cambiar esta contraseña al iniciar sesión por primera vez.</p>
    </div>
    
    <div style="margin-top: 35px; text-align: center;">
      <a href="${SITE_URL}/login" style="display: inline-block; background-color: ${COLORS.primary}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px;">Ir al Sistema</a>
    </div>
  `;

  const message = {
    from: `${BRAND_NAME} <${CONTACT_EMAIL}>`,
    to: email,
    subject: `Bienvenido - Credenciales de Acceso - ${BRAND_NAME}`,
    html: getEmailTemplate(title, content),
  };

  return transporter.sendMail(message);
};
