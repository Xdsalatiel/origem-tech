// gerarZip.js
const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream('origem-tech.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`ZIP gerado com sucesso! Tamanho: ${archive.pointer()} bytes`);
});

archive.on('error', err => { throw err; });
archive.pipe(output);

// Estrutura de arquivos do projeto
const projectFiles = [
  { path: 'backend/package.json', content: `{
  "name": "origem-tech-backend",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.1.1",
    "mongoose": "^7.5.0"
  }
}` },
  { path: 'backend/models/Usuario.js', content: `const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);` },
  { path: 'backend/server.js', content: `require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Usuario = require('./models/Usuario');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.log(err));

app.post('/register', async (req, res) => {
  const { email, senha } = req.body;
  const hashedPassword = await bcrypt.hash(senha, 10);
  const user = new Usuario({ email, senha: hashedPassword });
  await user.save();
  res.send("Usuário cadastrado com sucesso!");
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await Usuario.findOne({ email });
  if (!user) return res.status(401).send("Usuário não encontrado");
  const isMatch = await bcrypt.compare(senha, user.senha);
  if (!isMatch) return res.status(401).send("Senha incorreta");
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

app.get('/dashboard', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send("Acesso negado");
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ msg: "Bem-vindo ao dashboard Origem Tech", userId: verified.id });
  } catch {
    res.status(401).send("Token inválido");
  }
});

app.listen(5000, () => console.log("Backend rodando na porta 5000"));` },

  // Frontend React (LandingPage, Login, Dashboard, App, api.js)
  { path: 'frontend/package.json', content: `{
  "name": "origem-tech-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}` },
  { path: 'frontend/src/services/api.js', content: `import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000'
});` },
  { path: 'frontend/src/components/LandingPage.js', content: `import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div>
      <header>
        <h1>Origem Tech</h1>
        <a href="https://wa.me/5548998284253" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <Link to="/login">Área do Cliente</Link>
      </header>

      <section className="hero">
        <h2>Sites e Sistemas Profissionais</h2>
        <p>Transformamos ideias em soluções digitais</p>
        <a href="https://wa.me/5548998284253" target="_blank" rel="noopener noreferrer" className="btn">Fale Conosco</a>
      </section>

      <section>
        <h2>Serviços</h2>
        <ul>
          <li>Criação de Sites</li>
          <li>Sistemas Web</li>
          <li>Automação</li>
        </ul>
      </section>

      <footer>
        <p>© 2026 Origem Tech | WhatsApp: +55 48 99828-4253</p>
      </footer>
    </div>
  );
}` },
  { path: 'frontend/src/components/Login.js', content: `import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/login', { email, senha });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch {
      alert('Erro no login');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
}` },
  { path: 'frontend/src/components/Dashboard.js', content: `import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function Dashboard() {
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    api.get('/dashboard', { headers: { Authorization: token } })
      .then(res => setMsg(res.data.msg))
      .catch(() => setMsg('Erro ao acessar dashboard'));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{msg}</p>
    </div>
  );
}` },
  { path: 'frontend/src/App.js', content: `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;` },
];

// Adiciona arquivos ao ZIP
projectFiles.forEach(file => {
  archive.append(file.content, { name: file.path });
});

// Finaliza ZIP
archive.finalize();