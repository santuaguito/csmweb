require("dotenv").config();

const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const validator = require("validator");

const app = express();

// 🔐 Middleware base
app.use(express.json());

// 🚫 Rate limit (anti abuso)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 requests por IP
});
app.use("/api/contact", limiter);

// 🌐 Servir frontend
app.use(express.static(path.join(__dirname, "public")));

// 📩 Configurar mail (Gmail con App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🚀 Endpoint del formulario
app.post("/api/contact", async (req, res) => {
  let { name, email, website, challenge, budget, company } = req.body;

  // 🕵️ Honeypot (anti bots)
  if (company) {
    return res.status(400).end();
  }

  // 🔍 Validación básica
  if (!name || !email || !challenge || !budget) {
    return res.status(400).json({ error: "Campos obligatorios" });
  }

  // 🔒 Sanitización
  name = validator.escape(name.trim());
  email = validator.normalizeEmail(email);
  website = website ? validator.escape(website.trim()) : "";
  challenge = validator.escape(challenge.trim());
  budget = validator.escape(budget);

  // 📧 Validación de email real
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  try {
    // 📩 Mail para vos
    await transporter.sendMail({
      from: `"CSM Web - Lead" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Nuevo lead desde la web",
      html: `
        <h2>Nuevo contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sitio web:</strong> ${website || "No tiene"}</p>
        <p><strong>Desafío:</strong></p>
        <p>${challenge}</p>
        <p><strong>Presupuesto:</strong> ${budget}</p>
      `,
    });

    // 📩 Mail al cliente
    await transporter.sendMail({
      from: `"CSM Web" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recibimos tu solicitud 🚀",
      html: `
        <h2>Hola ${name},</h2>
        <p>Gracias por contactarte con <strong>CSM Web</strong>.</p>
        <p>Recibimos tu solicitud y te vamos a responder en menos de 24 horas.</p>

        <br>

        <p><strong>Resumen:</strong></p>
        <ul>
          <li>Presupuesto: ${budget}</li>
          <li>Sitio web: ${website || "No tiene"}</li>
        </ul>

        <br>

        <p>— Equipo CSM Web</p>
      `,
    });

    res.status(200).json({ message: "OK" });

  } catch (error) {
    console.error("Error enviando mail:", error);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

// 🚀 Start server
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});