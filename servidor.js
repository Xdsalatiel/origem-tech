const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// MIDDLEWARES
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos
app.use(express.static(__dirname));

// =========================
// CONEXÃO COM MONGODB
// =========================
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Conectado ao MongoDB com sucesso!');
    })
    .catch((err) => {
        console.error('❌ Erro ao conectar ao MongoDB:', err);
    });

// =========================
// MODELO
// =========================
const Cliente = require('./cliente');

// =========================
// ROTAS
// =========================

// Página inicial
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health Check (útil para o Render)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date()
    });
});

// Salvar cliente
app.post('/api/clientes', async (req, res) => {
    try {
        const novoCliente = new Cliente(req.body);

        await novoCliente.save();

        res.status(201).json({
            sucesso: true,
            mensagem: 'Dados salvos com sucesso!'
        });

    } catch (error) {

        console.error(error);

        res.status(400).json({
            sucesso: false,
            erro: 'Erro ao salvar dados',
            detalhes: error.message
        });
    }
});

// =========================
// INICIAR SERVIDOR
// =========================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});