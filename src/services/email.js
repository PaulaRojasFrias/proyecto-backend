const configObject = require("../config/config.js");
const { password_aplicacion, gmail_aplicacion } = configObject;
const nodemailer = require("nodemailer");

class EmailManager {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: gmail_aplicacion,
        pass: password_aplicacion,
      },
    });
  }

  async enviarCorreoCompra(email, first_name, ticket) {
    try {
      const mailOptions = {
        from: `Yungas Herbal <${gmail_aplicacion}>`,
        to: email,
        subject: "Confirmación de compra",
        html: `
          <h1>Confirmación de compra</h1>
          <p>Gracias por tu compra, ${first_name}!</p>
          <p>El número de tu orden es: ${ticket}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
    }
  }

  async enviarCorreoRestablecimiento(email, first_name, token) {
    try {
      const mailOptions = {
        from: gmail_aplicacion,
        to: email,
        subject: "Restablecimiento de Contraseña",
        html: `
          <h1>Restablecimiento de Contraseña</h1>
          <p>Hola ${first_name},</p>
          <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para cambiar tu contraseña:</p>
          <p><strong>${token}</strong></p>
          <p>Este código expirará en 1 hora.</p>
          <a href="http://localhost:8080/password">Restablecer Contraseña</a>
          <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error al enviar correo electrónico:", error);
      throw new Error("Error al enviar correo electrónico");
    }
  }

  async enviarCorreoProductoEliminado(email, first_name, product_name) {
    try {
      const mailOptions = {
        from: `Yungas Herbal <${gmail_aplicacion}>`,
        to: email,
        subject: "Producto Eliminado",
        html: `
          <h1>Producto Eliminado</h1>
          <p>Hola ${first_name},</p>
          <p>Te informamos que tu producto "${product_name}" ha sido eliminado de nuestro sistema.</p>
          <p>Si tienes alguna pregunta o inquietud, no dudes en contactarnos.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
    }
  }

  async enviarCorreoCuentaEliminada(email, first_name) {
    try {
      const mailOptions = {
        from: `Yungas Herbal <${gmail_aplicacion}>`,
        to: email,
        subject: "Cuenta Eliminada por Inactividad",
        html: `
          <h1>Cuenta Eliminada</h1>
          <p>Hola ${first_name},</p>
          <p>Te informamos que tu cuenta ha sido eliminada debido a inactividad prolongada.</p>
          <p>Si tienes alguna pregunta o inquietud, no dudes en contactarnos.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error al enviar el correo electrónico:", error);
    }
  }
}

module.exports = EmailManager;
