const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// CONFIGURACIÓN CRÍTICA: Aumentar el límite de tamaño para recibir imágenes pesadas
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Servir archivos estáticos
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Modelo de Servicio
const ServiceSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    location: String,
    whatsapp: String,
    image: String, // Aquí se guarda el código Base64 de la foto
    date: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', ServiceSchema);

// API para obtener servicios
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find().sort({ date: -1 });
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API para guardar un nuevo servicio (Ahora acepta archivos grandes)
app.post('/api/services', async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        console.error("Error al guardar:", err);
        res.status(400).json({ error: "Error al guardar el anuncio. La imagen podría ser demasiado grande." });
    }
});

// Ruta para el frontend
app.get('*', (req, res) => {
    const pathPublic = path.join(__dirname, 'public', 'index.html');
    const pathRoot = path.join(__dirname, 'index.html');
    if (fs.existsSync(pathPublic)) return res.sendFile(pathPublic);
    if (fs.existsSync(pathRoot)) return res.sendFile(pathRoot);
    res.status(404).send("No se encontró index.html");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});
