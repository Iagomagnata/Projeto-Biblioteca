const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'biblioteca.sqlite');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (fs.existsSync(DB_PATH)) {
  try {
    fs.unlinkSync(DB_PATH);
    console.log('Banco de dados existente removido:', DB_PATH);
  } catch (err) {
    console.error('Erro ao remover DB antigo:', err);
    process.exit(1);
  }
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Erro ao criar/open DB:', err.message);
    process.exit(1);
  }
});

function criarTabelasEInserir() {
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
      inserirLivrosLocais(() => {
        db.get('SELECT COUNT(*) as c FROM livros', (err, row) => {
          if (err) console.error('Erro contagem livros:', err.message);
          else console.log('Livros no DB:', row.c);
          db.close();
        });
      });
    });
  });
}

function inserirLivrosLocais(cb) {
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
    { titulo: 'Prefácio um homem bom é difícil de encontrar', author: "Flannery O'Connor", editora: 'Diversa', ano: 1955 },
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

  let inserted = 0;
  livrosLocais.forEach((livro) => {
    db.run(sql, [livro.titulo, livro.autor || '', livro.editora || '', livro.ano || null], function (err) {
      if (err) {
        console.error('Erro ao inserir livro local:', err.message);
      } else {
        if (this.changes && this.changes > 0) inserted += 1;
      }
    });
  });

  // Wait a moment for all inserts to finish, then callback
  setTimeout(() => {
    console.log('Inserções tentadas. Novos registros inseridos (aprox):', inserted);
    if (cb) cb();
  }, 500);
}

criarTabelasEInserir();
