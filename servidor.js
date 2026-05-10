require('dotenv').config(); // Carrega as variáveis do arquivo .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const path = require('path');
const Cliente = require('./models/Cliente');

const app = express();

// 1. CONFIGURAÇÃO DE SEGURANÇA (ADMIN)
// Usa as variáveis definidas no Render ou valores padrão
const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || '123';

app.use('/pedidos.html', basicAuth({
    users: { [adminUser]: adminPass },
    challenge: true,
    realm: 'Origem Tech Admin'
}));

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json());
// Serve os arquivos estáticos (HTML, CSS, JS) da pasta atual
app.use(express.static(__dirname));

// 3. CONEXÃO COM MONGODB
// Certifique-se de que o nome no Render seja MONGODB_URI
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado ao MongoDB com sucesso!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// 4. ROTAS DA API

// Rota para salvar pedido (vinda do index.html)
app.post('/api/pedidos', async (req, res) => {
    try {
        const novoCliente = new Cliente(req.body);
        await novoCliente.save();
        res.status(201).json({ message: 'Pedido enviado com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: 'Erro ao salvar pedido.' });
    }
});

// Rota para buscar pedidos (usada no pedidos.html)
app.get('/api/pedidos', async (req, res) => {
    try {
        const pedidos = await Cliente.find().sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
});

// 5. INICIALIZAÇÃO DO SERVIDOR
// O Render define a porta automaticamente na variável PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);