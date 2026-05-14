const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Conexão com o MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('Conectado ao MongoDB com sucesso!'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Schema de Pedidos
const clienteSchema = new mongoose.Schema({
    nome: String,
    telefone: String,
    servico: String,
    mensagem: String,
    createdAt: { type: Date, default: Date.now }
});

const Cliente = mongoose.model('Cliente', clienteSchema);

// Autenticação básica para proteger a visualização dos pedidos
const auth = basicAuth({
    users: { [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASS || '123' },
    challenge: true,
    realm: 'Área da Origem Tech'
});

// Rotas da API
app.post('/api/pedidos', async (req, res) => {
    try {
        const novoPedido = new Cliente(req.body);
        await novoPedido.save();
        res.status(201).json({ message: 'Pedido enviado!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar.' });
    }
});

app.get('/api/pedidos', auth, async (req, res) => {
    try {
        const pedidos = await Cliente.find().sort({ createdAt: -1 });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar.' });
    }
});

// Inicialização
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});