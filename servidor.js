const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve arquivos estáticos (CSS, Imagens, JS do navegador)
// Isso garante que o site carregue o visual corretamente
app.use(express.static(__dirname)); 

// 2. CONEXÃO COM MONGODB
// Usa a URI que vimos no seu arquivo .env
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
    .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

// 3. MODELO DE DADOS (Cliente)
const Cliente = require('./cliente');

// 4. ROTAS

// Rota Principal: Resolve o erro "Cannot GET /" enviando o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para receber dados do formulário de contato
app.post('/api/clientes', async (req, res) => {
    try {
        const novoCliente = new Cliente(req.body);
        await novoCliente.save();
        res.status(201).json({ mensagem: 'Dados salvos com sucesso!' });
    } catch (error) {
        res.status(400).json({ erro: 'Erro ao salvar dados', detalhes: error.message });
    }
});