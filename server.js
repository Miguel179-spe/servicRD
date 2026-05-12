const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexión a MongoDB (La URL se configurará en Render)
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost/serviciosrd";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => console.error("❌ Error de conexión:", err));

// Modelo de Publicación
const ServiceSchema = new mongoose.Schema({
    name: String,
    category: String,
    description: String,
    location: String,
    whatsapp: String,
    image: String,
    date: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', ServiceSchema);

// RUTAS DE LA API
// 1. Obtener todos los servicios
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find().sort({ date: -1 });
        res.json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Crear un nuevo servicio
app.post('/api/services', async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Servir el index.html en cualquier otra ruta
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT}`);
});