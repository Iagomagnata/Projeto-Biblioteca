
//Configurção de inicialização do servidor
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'biblioteca.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados SQLite:', err.message);
    process.exit(1);
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..')));

// trecho para inserir omandos mysql
function criarTabelas() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        matricula TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT,
        editora TEXT,
        ano INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  });
}

criarTabelas();

function alterarTabela() {
  db.serialize(() => {
    db.run(`
      ALTER TABLE usuarios DROP COLUMN criado_em
    `);
  });
}

alterarTabela();

app.get('/api/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios ORDER BY criado_em DESC', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar usuários:', err.message);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

app.post('/api/usuarios', (req, res) => {
  const { matricula, email } = req.body;

  if (!matricula || !email) {
    return res.status(400).json({ error: 'matricula e email são obrigatórios' });
  }

  const sql = 'INSERT INTO usuarios (matricula, email) VALUES (?, ?)';
  db.run(sql, [matricula, email], function (err) {
    if (err) {
      console.error('Erro ao inserir usuário:', err.message);
      return res.status(500).json({ error: 'Não foi possível cadastrar o usuário' });
    }
    res.status(201).json({ id: this.lastID, matricula, email });
  });
});

app.post('/api/login', (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ error: 'nome e senha são obrigatórios' });
  }

  const adminNome = 'admin';
  const adminSenha = 'admin123';

  if (nome === adminNome && senha === adminSenha) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Credenciais inválidas' });
});

app.get('/api/livros', (req, res) => {
  db.all('SELECT * FROM livros ORDER BY criado_em DESC', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar livros:', err.message);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

app.post('/api/livros', (req, res) => {
  const { titulo, autor, editora, ano } = req.body;

  if (!titulo) {
    return res.status(400).json({ error: 'titulo é obrigatório' });
  }

  //cadastro de livros
  const sql = 'INSERT INTO livros (titulo, autor, editora, ano) VALUES (?, ?, ?, ?)';
  db.run(sql, [titulo, autor || '', editora || '', ano || null], function (err) {
    if (err) {
      console.error('Erro ao inserir livro:', err.message);
      return res.status(500).json({ error: 'Não foi possível cadastrar o livro' });
    }
    res.status(201).json({ id: this.lastID, titulo, autor, editora, ano });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Banco SQLite: ${DB_PATH}`);
});
