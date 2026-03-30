const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const Cliente = require('./models/Cliente');

const app = express();

// 1. CONFIGURAÇÃO DE SEGURANÇA (ADMIN)
// No Render, você criará as chaves ADMIN_USER e ADMIN_PASS
const seguranca = basicAuth({
    users: { [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASS || '123' }, 
    challenge: true,
    realm: 'Origem Tech Admin'
});

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve o index.html e pedidos.html

// 3. CONEXÃO COM O MONGODB
// A URI agora vem de uma variável de ambiente para proteger sua senha
const uri = process.env.MONGO_URI || 'mongodb+srv://adm:FjMgGAahTwTUt72T@cluster0.8earwd6.mongodb.net/origemDB?retryWrites=true&w=majority';

mongoose.connect(uri)
    .then(() => console.log('✅ Conexão estabelecida: Origem Tech está Online!'))
    .catch(err => console.error('❌ Erro de conexão:', err));

// 4. ROTAS DO SISTEMA

// ROTA: Receber novo pedido (Público)
app.post('/novo-cliente', async (req, res) => {
    try {
        console.log("Recebi um pedido:", req.body);
        const novoCliente = new Cliente(req.body);
        await novoCliente.save();
        res.status(201).send("✅ Cliente salvo com sucesso!");
    } catch (error) {
        console.error("Erro ao salvar:", error.message);
        res.status(400).send("❌ Erro ao salvar: " + error.message);
    }
});

// ROTA: Listar pedidos (Protegido por senha)
app.get('/api/pedidos', seguranca, async (req, res) => {
    try {
        const pedidos = await Cliente.find();
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar pedidos" });
    }
});

// ROTA: Excluir pedido (Protegido por senha)
app.delete('/api/pedidos/:id', seguranca, async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.send("✅ Pedido removido!");
    } catch (error) {
        res.status(500).send("❌ Erro ao deletar");
    }
});

// 5. INICIALIZAÇÃO DO SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});