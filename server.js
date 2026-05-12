const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// ESTO HACE QUE BUSQUE ARCHIVOS EN LA RAÍZ Y EN LA CARPETA PUBLIC
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(err => console.error("❌ Error de conexión:", err));

const ServiceSchema = new mongoose.Schema({
    name: String, category: String, description: String,
    location: String, whatsapp: String, image: String,
    date: { type: Date, default: Date.now }
});
const Service = mongoose.model('Service', ServiceSchema);

app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find().sort({ date: -1 });
        res.json(services);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/services', async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (err) { res.status(400).json({ error: err.message }); }
});

// ESTO BUSCA EL INDEX DONDE SEA QUE ESTÉ
app.get('*', (req, res) => {
    const fs = require('fs');
    const pathPublic = path.join(__dirname, 'public', 'index.html');
    const pathRoot = path.join(__dirname, 'index.html');

    if (fs.existsSync(pathPublic)) {
        res.sendFile(pathPublic);
    } else if (fs.existsSync(pathRoot)) {
        res.sendFile(pathRoot);
    } else {
        res.status(404).send("No se encontró index.html. Verifica tu GitHub.");
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en puerto ${PORT}`));
