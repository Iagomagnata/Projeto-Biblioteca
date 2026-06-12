const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'biblioteca123'
};

// Conecta ao banco de dados e apenas cria a tabela (sem inserir nada automaticamente)
const dbPath = path.resolve(__dirname, 'meubanco.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
});

const initialBooks = [
    { titulo: 'O Pequeno Príncipe', available_count: 0 },
    { titulo: 'História do Brasil', available_count: 2 },
    { titulo: 'Mistério na Biblioteca', available_count: 1 },
    { titulo: 'Ciência Divertida', available_count: 3 },
    { titulo: 'Aventuras na Floresta', available_count: 0 },
    { titulo: 'Matemática Fácil', available_count: 2 }
];

function startServer() {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS operacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        livro TEXT NOT NULL,
        acao TEXT NOT NULL,
        papel TEXT NOT NULL,
        student_name TEXT,
        turma TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS livros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT UNIQUE NOT NULL,
        available_count INTEGER NOT NULL
    )`);

    const lastBookIndex = initialBooks.length - 1;
    if (lastBookIndex < 0) {
        console.log('Conectado ao banco de dados SQLite com sucesso.');
        startServer();
        return;
    }

    initialBooks.forEach((book, index) => {
        db.run(
            `INSERT OR IGNORE INTO livros (titulo, available_count) VALUES (?, ?)`,
            [book.titulo, book.available_count],
            (err) => {
                if (err) {
                    console.error('Erro ao inserir livro inicial:', err.message);
                }
                if (index === lastBookIndex) {
                    console.log('Conectado ao banco de dados SQLite com sucesso.');
                    startServer();
                }
            }
        );
    });
});


// Middlewares cruciais para entender dados vindos de formulários HTML e JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Rota principal: Quando acessar localhost:3000, envia o arquivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para receber os dados do formulário e salvar no banco
app.post('/adicionar', (req, res) => {
    // Pega o que o usuário digitou no campo com name="nome"
    const nomeDigitado = req.body.nome; 

    if (!nomeDigitado) {
        return res.status(400).send('Erro: O nome não pode estar vazio. <a href="/">Voltar</a>');
    }

    // Insere o dado no banco
    db.run(`INSERT INTO usuarios (nome) VALUES (?)`, [nomeDigitado], function(err) {
        if (err) {
            console.error('Erro ao inserir o dado:', err.message);
            res.status(500).send('Erro no servidor ao salvar o nome.');
        } else {
            console.log(`Nome '${nomeDigitado}' salvo no banco! ID: ${this.lastID}`);
            // Mostra uma mensagem de sucesso com um link para voltar
            res.send(`<h2>Nome '${nomeDigitado}' salvo com sucesso!</h2><br><a href="/">Voltar e adicionar outro</a>`);
        }
    });
});

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        return res.json({ success: true, message: 'Login de administrador realizado com sucesso.' });
    }

    return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
});

function salvarOperacao(livro, acao, papel, studentName, turma, res) {
    if (!livro || !acao) {
        return res.status(400).json({ success: false, message: 'Livro e ação são obrigatórios.' });
    }

    db.run(
        `INSERT INTO operacoes (livro, acao, papel, student_name, turma) VALUES (?, ?, ?, ?, ?)` ,
        [livro, acao, papel, studentName || null, turma || null],
        function(err) {
            if (err) {
                console.error('Erro ao salvar operação:', err.message);
                return res.status(500).json({ success: false, message: 'Erro no servidor ao registrar a operação.' });
            }

            console.log(`Operação ${acao} registrada para livro '${livro}' pelo papel '${papel}'` +
                `${studentName ? `, aluno '${studentName}', turma '${turma}'` : ''}. ID: ${this.lastID}`);
            res.json({ success: true, message: `Operação '${acao}' registrada para '${livro}'.` });
        }
    );
}

app.post('/api/emprestimo', (req, res) => {
    const { title, role, studentName, turma } = req.body;
    if (!studentName || !turma) {
        return res.status(400).json({ success: false, message: 'Nome do aluno e turma são obrigatórios para empréstimo.' });
    }

    db.get(`SELECT available_count FROM livros WHERE titulo = ?`, [title], (err, row) => {
        if (err) {
            console.error('Erro ao consultar livro:', err.message);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao verificar estoque.' });
        }

        if (!row || row.available_count <= 0) {
            return res.status(400).json({ success: false, message: 'Não há exemplares livres para empréstimo.' });
        }

        db.run(`UPDATE livros SET available_count = available_count - 1 WHERE titulo = ?`, [title], function(err) {
            if (err) {
                console.error('Erro ao atualizar estoque:', err.message);
                return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
            }
            salvarOperacao(title, 'Empréstimo', role || 'admin', studentName, turma, res);
        });
    });
});

app.post('/api/reserva', (req, res) => {
    const { title, role, studentName, turma } = req.body;
    if (!studentName || !turma) {
        return res.status(400).json({ success: false, message: 'Nome do aluno e turma são obrigatórios para reserva.' });
    }

    db.get(`SELECT available_count FROM livros WHERE titulo = ?`, [title], (err, row) => {
        if (err) {
            console.error('Erro ao consultar livro:', err.message);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao verificar estoque.' });
        }

        if (row && row.available_count > 0) {
            db.run(`UPDATE livros SET available_count = available_count - 1 WHERE titulo = ?`, [title], function(err) {
                if (err) {
                    console.error('Erro ao atualizar estoque:', err.message);
                    return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
                }
                salvarOperacao(title, 'Reservar', role || 'admin', studentName, turma, res);
            });
        } else {
            salvarOperacao(title, 'Reservar', role || 'admin', studentName, turma, res);
        }
    });
});

app.post('/api/devolucao', (req, res) => {
    const { title, role, studentName, turma } = req.body;
    if (!title) {
        return res.status(400).json({ success: false, message: 'Título do livro é obrigatório para devolução.' });
    }

    db.run(`INSERT OR IGNORE INTO livros (titulo, available_count) VALUES (?, 0)`, [title], function(err) {
        if (err) {
            console.error('Erro ao garantir livro no estoque:', err.message);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
        }
        db.run(`UPDATE livros SET available_count = available_count + 1 WHERE titulo = ?`, [title], function(err) {
            if (err) {
                console.error('Erro ao atualizar estoque:', err.message);
                return res.status(500).json({ success: false, message: 'Erro no servidor ao atualizar estoque.' });
            }
            salvarOperacao(title, 'Devolução', role || 'admin', studentName || null, turma || null, res);
        });
    });
});

app.get('/api/livros', (req, res) => {
    db.all(`SELECT titulo, available_count FROM livros`, [], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar livros:', err.message);
            return res.status(500).json({ success: false, message: 'Erro no servidor ao buscar livros.' });
        }
        res.json({ success: true, livros: rows });
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
                  AND ifnull(d.student_name, '') = ifnull(o.student_name, '')
                  AND ifnull(d.turma, '') = ifnull(o.turma, '')
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

