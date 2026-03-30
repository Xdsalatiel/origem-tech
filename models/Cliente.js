const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    servico: {
        type: String, // Deixamos apenas como String para aceitar qualquer texto
        required: true
    },
    mensagem: String
});

module.exports = mongoose.model('Cliente', ClienteSchema);