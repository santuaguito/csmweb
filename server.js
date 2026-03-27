require("dotenv").config();

const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const validator = require("validator");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

// 🔒 Seguridad básica
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // límite por IP
});
app.use(limiter);

// 📁 Servir frontend (ajustar si tu carpeta es distinta)
app.use(express.static(path.join(__dirname, "public")));

// 📩 Endpoint formulario
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, website, challenge, budget } = req.body;

    console.log("REQ BODY:", req.body);

    // 🔍 Validación
    if (!name || !email || !challenge || !budget) {
      return res.status(400).json({ error: "Campos obligatorios" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // 📩 Mail para vos
    await resend.emails.send({
      from: "CSM Web <onboarding@resend.dev>", // cambiar cuando tengas dominio
      to: "santiagomcei@gmail.com", 
      subject: "Nueva solicitud desde la web",
      html: `
        <h2>Nuevo lead</h2>
        <p><b>Nombre:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Web:</b> ${website || "No tiene"}</p>
        <p><b>Desafío:</b> ${challenge}</p>
        <p><b>Presupuesto:</b> ${budget}</p>
      `,
    });

    // 📩 Mail al cliente
    await resend.emails.send({
      from: "CSM Web <onboarding@resend.dev>",
      to: email,
      subject: "Recibimos tu solicitud",
      html: `
        <h2>Gracias ${name}</h2>
        <p>Recibimos tu solicitud correctamente.</p>
        <p>En breve te vamos a contactar.</p>
      `,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("ERROR RESEND:", error);
    res.status(500).json({ error: "Error enviando correo" });
  }
});

// 🚀 Puerto dinámico (Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});