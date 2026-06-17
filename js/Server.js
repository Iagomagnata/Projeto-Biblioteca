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
        ano INTEGER,
        available_count INTEGER DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, () => {
      atualizarEsquemaLivros();
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS operacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro TEXT NOT NULL,
        acao TEXT NOT NULL,
        papel TEXT NOT NULL,
        student_name TEXT,
        turma TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Comentários compartilhados por todos os usuários (salvos no SQLite)
    db.run(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro_titulo TEXT NOT NULL,
        user TEXT NOT NULL,
        rating INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (livro_titulo) REFERENCES livros(titulo)
      )
    `);
  });
}


function atualizarEsquemaLivros() {
  db.all(`PRAGMA table_info(livros)`, (err, rows) => {
    if (err) {
      console.error('Erro ao verificar esquema de livros:', err.message);
      return;
    }

    const existeAvailableCount = rows.some(row => row.name === 'available_count');
    if (!existeAvailableCount) {
      db.run('ALTER TABLE livros ADD COLUMN available_count INTEGER DEFAULT 1', (alterErr) => {
        if (alterErr) {
          console.error('Erro ao adicionar a coluna available_count:', alterErr.message);
        } else {
          console.log('Coluna available_count adicionada à tabela livros.');
        }
      });
    }
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

/* app.post('/api/usuarios', (req, res) => {
  const { matricula, email } = req.body;

  if (!matricula || !email) {
    return res.status(400).json({ error: 'matricula e email são obrigatórios' });
  }

  const sql = 'INSERT INTO usuarios (matricula, email) VALUES (?, ?)';
  db.run(sql, [matricula, email], function (err) {
    if (err) {
      console.error('Erro ao inserir usuário:', err.message || err);
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('sqlite_constraint') || msg.includes('unique constraint failed') || msg.includes('constraint failed') || msg.includes('unique')) {
        return res.status(409).json({ error: 'Email ou matrícula já cadastrado' });
      }
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
      console.error('Erro ao cadastrar aluno:', err.message || err);
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('sqlite_constraint') || msg.includes('unique constraint failed') || msg.includes('constraint failed') || msg.includes('unique')) {
        return res.status(409).send('Email ou matrícula já cadastrado.');
      }
      return res.status(500).send('Não foi possível cadastrar o aluno.');
    }
    // Retorna JSON para chamadas AJAX; cliente pode redirecionar com base no campo `redirect`
    res.status(201).json({ ok: true, redirect: '/Alexandria.html' });
  });
}); */

app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ error: 'usuario e senha são obrigatórios' });
  }

  const adminUsuario = 'DonaAda234';
  const adminSenha = 'admin@123';

  console.log(`Tentativa de login: usuario="${usuario}"`);

  // permite comparação do usuário sem diferenciar maiúsculas/minúsculas
  if (usuario.toLowerCase() === adminUsuario.toLowerCase() && senha === adminSenha) {
    // Retorna JSON consistente para que o cliente (fetch) trate o redirecionamento
    return res.status(200).json({ ok: true, redirect: 'Alexandria.html' });
  }

  return res.status(401).json({ error: 'Credenciais inválidas' });
});

function salvarOperacao(livro, acao, papel, studentName, turma, res) {
  if (!livro || !acao) {
    return res.status(400).json({ success: false, message: 'Livro e ação são obrigatórios.' });
  }

  db.run(
    'INSERT INTO operacoes (livro, acao, papel, student_name, turma) VALUES (?, ?, ?, ?, ?)',
    [livro, acao, papel, studentName || null, turma || null],
    function (err) {
      if (err) {
        console.error('Erro ao salvar operação:', err.message);
        return res.status(500).json({ success: false, message: 'Erro no servidor ao registrar a operação.' });
      }
      return res.json({ success: true, message: `Operação '${acao}' registrada para '${livro}'.` });
    }
  );
}

app.get('/api/livros', (req, res) => {
  db.all('SELECT * FROM livros ORDER BY criado_em DESC', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar livros:', err.message);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json({ success: true, livros: rows });
  });
});

app.post('/api/livros', (req, res) => {
  const { titulo, autor, editora, ano } = req.body;
  
  //cadastro de livros
  const sql = 'INSERT OR IGNORE INTO livros (titulo, autor, editora, ano, available_count) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [titulo, autor || '', editora || '', ano || null, 1], function (err) {
    if (err) {
      console.error('Erro ao inserir livro:', err.message);
      return res.status(500).json({ error: 'Não foi possível cadastrar o livro' });
    }
    // Se nenhuma linha foi afetada, o livro já existia (INSERT OR IGNORE)
    if (this.changes === 0) {
      return res.status(409).json({ error: 'Livro já existe' });
    }
    res.status(201).json({ id: this.lastID, titulo, autor, editora, ano, available_count: 1 });
  });
});

// ===== Comentários compartilhados (SQLite) =====
app.get('/api/comentarios', (req, res) => {
  const bookTitle = (req.query.bookTitle || '').trim();
  if (!bookTitle) {
    return res.status(400).json({ success: false, error: 'bookTitle é obrigatório' });
  }

  db.all(
    `SELECT id, user, rating, text, created_at as date
     FROM comentarios
     WHERE livro_titulo = ?
     ORDER BY datetime(created_at) DESC`,
    [bookTitle],
    (err, rows) => {
      if (err) {
        console.error('Erro ao buscar comentários:', err.message);
        return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
      }
      res.json({ success: true, comentarios: rows || [] });
    }
  );
});

app.post('/api/comentarios', (req, res) => {
  const { bookTitle, user, rating, text } = req.body || {};

  if (!bookTitle || !user || !text || rating === undefined || rating === null) {
    return res.status(400).json({ success: false, error: 'bookTitle, user, rating e text são obrigatórios' });
  }

  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 5) {
    return res.status(400).json({ success: false, error: 'rating deve ser entre 1 e 5' });
  }

  const sql = `
    INSERT INTO comentarios (livro_titulo, user, rating, text)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [bookTitle.trim(), user.trim(), r, text.trim()], function (err) {
    if (err) {
      console.error('Erro ao salvar comentário:', err.message);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }

    res.status(201).json({
      success: true,
      comentario: {
        id: this.lastID,
        bookTitle: bookTitle.trim(),
        user: user.trim(),
        rating: r,
        text: text.trim(),
        date: new Date().toISOString()
      }
    });
  });
});

app.delete('/api/comentarios/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ success: false, error: 'ID inválido' });
  }

  db.run(`DELETE FROM comentarios WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erro ao apagar comentário:', err.message);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, error: 'Comentário não encontrado' });
    }

    res.json({ success: true, ok: true });
  });
});


app.post('/api/emprestimo', (req, res) => {
  const { title, studentName, turma } = req.body;

  if (!title || !studentName || !turma) {
    return res.status(400).json({ success: false, message: 'Título, nome do aluno e turma são obrigatórios.' });
  }

  const completeLoan = () => {
    db.run('UPDATE livros SET available_count = available_count - 1 WHERE titulo = ?', [title], function (updateErr) {
      if (updateErr) {
        console.error('Erro ao atualizar disponibilidade:', updateErr.message);
        return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
      }
      salvarOperacao(title, 'Empréstimo', 'admin', studentName, turma, res);
    });
  };

  db.get('SELECT available_count FROM livros WHERE titulo = ?', [title], (err, row) => {
    if (err) {
      console.error('Erro ao consultar livro:', err.message);
      return res.status(500).json({ success: false, message: 'Erro no servidor ao verificar disponibilidade.' });
    }

    if (!row || row.available_count <= 0) {
     
          return res.status(500).json({ success: false, message: 'Erro no servidor ao inicializar o livro.' });
        }
         db.run('UPDATE livros SET avaliable_count = avaliable_count - 1 WHERE titulo = ?', [title], function (err) {
        if (err) {
          console.error('Erro ao atualizar estoque:', err.message);
          return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });;
    }
    salvarOperacao(title, 'Empréstimo', 'admin', studentName, turma, res);
  });
});
});

app.post('/api/reserva', (req, res) => {
  const { title, studentName, turma } = req.body;

  if (!title || !studentName || !turma) {
    return res.status(400).json({ success: false, message: 'Título, nome do aluno e turma são obrigatórios.' });
  }

  const saveReservation = () => {
    salvarOperacao(title, 'Reservar', 'admin', studentName, turma, res);
  };

  db.get('SELECT available_count FROM livros WHERE titulo = ?', [title], (err, row) => {
    if (err) {
      console.error('Erro ao consultar livro:', err.message);
      return res.status(500).json({ success: false, message: 'Erro no servidor ao verificar disponibilidade.' });
    }

    if (!row) {
      db.run('INSERT INTO livros (titulo, available_count) VALUES (?, ?)', [title, 3], function (insertErr) {
        if (insertErr) {
          console.error('Erro ao inserir livro no estoque:', insertErr.message);
          return res.status(500).json({ success: false, message: 'Erro no servidor ao inicializar o livro.' });
        }
        saveReservation();
      });
      return;
    }

    if (row.available_count > 0) {
      db.run('UPDATE livros SET available_count = available_count - 1 WHERE titulo = ?', [title], function (updateErr) {
        if (updateErr) {
          console.error('Erro ao atualizar disponibilidade:', updateErr.message);
          return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
        }
        saveReservation();
      });
    } else {
      saveReservation();
    }
  });
});

app.post('/api/devolucao', (req, res) => {
  const { title, studentName, turma } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Título do livro é obrigatório.' });
  }

  db.run('INSERT OR IGNORE INTO livros (titulo, available_count) VALUES (?, 0)', [title], function (err) {
    if (err) {
      console.error('Erro ao garantir livro no estoque:', err.message);
      return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
    }

    db.run('UPDATE livros SET available_count = available_count + 1 WHERE titulo = ?', [title], function (updateErr) {
      if (updateErr) {
        console.error('Erro ao atualizar disponibilidade:', updateErr.message);
        return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
      }

      db.run('INSERT INTO operacoes (livro, acao, papel, student_name, turma) VALUES (?, ?, ?, ?, ?)',
        [title, 'Devolução', 'admin', studentName || null, turma || null], function (insertErr) {
          if (insertErr) {
            console.error('Erro ao salvar operação:', insertErr.message);
            return res.status(500).json({ success: false, message: 'Erro ao registrar devolução.' });
          }
          res.json({ success: true, message: 'Devolução registrada com sucesso.' });
        });
    });
  });
});

app.get('/api/relatorio', (req, res) => {
  db.all(`SELECT id, livro, acao, papel, student_name, turma, created_at
          FROM operacoes AS o
          WHERE acao IN ('Empréstimo', 'Reservar')
          AND NOT EXISTS (
            SELECT 1 FROM operacoes AS d
            WHERE d.acao = 'Devolução'
              AND d.livro = o.livro
              AND IFNULL(d.student_name, '') = IFNULL(o.student_name, '')
              AND IFNULL(d.turma, '') = IFNULL(o.turma, '')
              AND datetime(d.created_at) > datetime(o.created_at)
          )
          ORDER BY datetime(created_at) DESC`, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar relatório:', err.message);
      return res.status(500).json({ success: false, message: 'Erro no servidor ao gerar relatório.' });
    }

    const now = new Date();
    const report = rows.map((row) => {
      const createdAt = new Date(row.created_at);
      const deltaDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      let status = row.acao === 'Empréstimo' ? 'Emprestado' : 'Reservado';
      if (row.acao === 'Reservar' && deltaDays > 7) {
        status = 'Atraso de reserva';
      }

      return {
        id: row.id,
        livro: row.livro,
        acao: row.acao,
        papel: row.papel,
        aluno: row.student_name || 'N/A',
        turma: row.turma || 'N/A',
        created_at: row.created_at,
        status
      };
    });

    res.json({ success: true, report });
  });
});

// delete de livros (admin)
app.delete('/api/livros/:id', (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const sql = 'DELETE FROM livros WHERE id = ?';
  db.run(sql, [id], function (err) {
    if (err) {
      console.error('Erro ao deletar livro:', err.message);
      return res.status(500).json({ error: 'Não foi possível deletar o livro' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    return res.status(200).json({ ok: true, deletedId: id });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Banco SQLite: ${DB_PATH}`);
});
