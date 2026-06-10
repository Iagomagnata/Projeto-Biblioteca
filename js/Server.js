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
        email TEXT NOT NULL UNIQUE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL UNIQUE,
        autor TEXT,
        editora TEXT,
        ano INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      /* inserirLivrosLocais(); */
    });
  });
}

 function inserirLivrosLocais() {
  const livrosLocais = [
    { titulo: 'O Retrato do Artista quando Jovem', autor: 'James Joyce', editora: 'Diversa', ano: 1916 },
    { titulo: 'Delta: Um Comando para o Tempo', autor: 'Ana Cristina Melo', editora: 'Diversa', ano: 2022 },
    { titulo: 'Ilhados: Tratado sobre Guris', autor: 'Lourenço Cazarré', editora: 'Prêmio Açorianos', ano: 2018 },
    { titulo: 'O Namoro e o Noivado que Deus Sempre Quis', autor: 'A. Mendes e D. Merkh', editora: 'Diversa', ano: 2015 },
    { titulo: 'Crianças na Escuridão', autor: 'Júlio Emílio Braz', editora: 'Diversa', ano: 2010 },
    { titulo: 'A Casa da Praia', autor: 'Beth Reekles', editora: 'Diversa', ano: 2019 },
    { titulo: 'Dom Quixote', autor: 'Miguel de Cervantes', editora: 'Diversa', ano: 1605 },
    { titulo: 'O Outro Apaixonado por Marília de Dirceu', autor: 'Jair Vitória', editora: 'Diversa', ano: 2020 },
    { titulo: 'Oliver Twist', autor: 'Charles Dickens', editora: 'Diversa', ano: 1837 },
    { titulo: 'O amanhã cheio de histórias', autor: 'Joselía Aguiar', editora: 'Diversa', ano: null },
    { titulo: 'O imaginario cotidiano', autor: 'Moacyr Scliar', editora: 'Diversa', ano: null },
    { titulo: 'Dez dias no manicômio', autor: 'Nellie Bly', editora: 'Diversa', ano: null },
    { titulo: 'As filhas sem nome', autor: 'Xinran', editora: 'Diversa', ano: null },
    { titulo: 'Dinamene', autor: 'Maicon Tenfen', editora: 'Diversa', ano: null },
    { titulo: 'Prefácio um homem bom é difícil de encontrar', autor: "Flannery O'Connor", editora: 'Diversa', ano: 1955 },
    { titulo: 'Fogo contra fogo', autor: 'Je', editora: 'Diversa', ano: null },
    { titulo: 'Ramsés: O Filho da Luz (Vol. 1)', autor: 'Lene Kaaberbøl & Agnete Friis', editora: 'Diversa', ano: null },
    { titulo: 'Ramsés: A batalha de kadesh (Vol. 2)', autor: 'Lene Kaaberbøl & Agnete Friis', editora: 'Diversa', ano: null },
    { titulo: 'Ramsés: A batalha de kadesh (Vol. 3)', autor: 'Lene Kaaberbøl & Agnete Friis', editora: 'Diversa', ano: null },
    { titulo: 'O menino da mala', autor: 'Lene Kaaberbøl & Agnete Friis', editora: 'Diversa', ano: null },
    { titulo: 'Os filhos do imperador', autor: 'Claire Messud', editora: 'Diversa', ano: null },
    { titulo: 'Histórias Primordiais', autor: 'Edgar Allan Poe', editora: 'Diversa', ano: null },
    { titulo: 'A melhor coisa que nunca aconteceu na minha vida', autor: 'Laura Tait & Jimmy Rice', editora: 'Diversa', ano: null },
    { titulo: 'A juventude vai no cinema', autor: 'Inês Assunção de Castro Teixeira; José de Sousa Miguel Lopes; Juarez Dayrell', editora: 'Diversa', ano: null },
    { titulo: 'Poliana cresceu', autor: 'Eleanor H. Porter', editora: 'Diversa', ano: 1913 },
    { titulo: 'dez anos e nove meses', autor: 'Eleanor H. Porter', editora: 'Diversa', ano: null }
  ];

  const sql = 'INSERT OR IGNORE INTO livros (titulo, autor, editora, ano) VALUES (?, ?, ?, ?)';
  
  livrosLocais.forEach(livro => {
    db.run(sql, [livro.titulo, livro.autor, livro.editora, livro.ano], function (err) {
      if (err) {
        console.error('Erro ao inserir livro local:', err.message);
      } else if (this.changes === 0) {
        console.log(`Livro "${livro.titulo}" já existe no banco, pulando.`);
      } else {
        console.log(`Livro "${livro.titulo}" inserido localmente.`);
      }
    });
  });
} 

criarTabelas();

app.get('/api/usuarios', (req, res) => {
  db.all('SELECT * FROM usuarios ORDER BY id DESC', (err, rows) => {
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

app.post('/cadastrar-aluno', (req, res) => {
  const { matricula, email } = req.body;

  if (!matricula || !email) {
    return res.status(400).send('Matrícula e email são obrigatórios.');
  }

  const sql = 'INSERT INTO usuarios (matricula, email) VALUES (?, ?)';
  db.run(sql, [matricula, email], function (err) {
    if (err) {
      console.error('Erro ao cadastrar aluno:', err.message);
      if (err.message.includes('SQLITE_CONSTRAINT')) {
        return res.status(409).send('Email ou matrícula já cadastrado.');
      }
      return res.status(500).send('Não foi possível cadastrar o aluno.');
    }
    res.redirect('/Alexandria.html');
  });
});

app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'usuario e senha são obrigatórios' });
  }

  const adminUsuario = 'DonaAda234';
  const adminSenha = 'admin@123';

  if (usuario == adminUsuario && senha == adminSenha) {
    return res.json({ ok: true });
    res.redirect('/Alexandria.html');
    
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

