const api_url = '/api/usuarios';

let usuarios = [];

/* async function carregarUsuarios() {
    try {
        const resposta = await fetch(api_url);
        if (resposta.ok) {
            usuarios = await resposta.json();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
} */

/* async function cadastrarUsuario(event) {
    event.preventDefault();

    const matricula = document.getElementById('Matricula').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!matricula || !email) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const novoUsuario = {
        email,
        matricula
    };

    try {
        const base = (location.protocol === 'file:') ? 'http://localhost:3000' : '';
        const resposta = await fetch(base + api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        // Tenta ler JSON, se falhar lê texto cru
        let payload = null;
        try {
            payload = await resposta.json();
        } catch (e) {
            payload = await resposta.text().catch(() => null);
        }

        if (resposta.ok) {
            alert('Usuário cadastrado com sucesso!');
            limparCampos();
            const redirect = (payload && payload.redirect) ? payload.redirect : 'Alexandria.html';
            window.location.href = redirect;
            return;
        }

        // status específico para duplicado
        if (resposta.status === 409) {
            const msg = (payload && (payload.error || typeof payload === 'string')) ? (payload.error || payload) : 'Email ou matrícula já cadastrado.';
            alert(msg);
            return;
        }

        const errMsg = (payload && payload.error) ? payload.error : (typeof payload === 'string' ? payload : 'Erro ao cadastrar usuário.');
        alert(errMsg);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de rede: ' + error);
    }
} */

async function loginAdministrador(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario')?.value.trim();
    const senha = document.getElementById('senha')?.value.trim();

    if (!usuario || !senha) {
        alert('Preencha usuário e senha.');
        return;
    }

    try {
        const base = (location.protocol === 'file:') ? 'http://localhost:3000' : '';
        const resposta = await fetch(base + '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        if (resposta.ok) {
            const data = await resposta.json().catch(() => ({}));
            window.location.href = data.redirect || 'Alexandria.html';
            return;
        }

        const data = await resposta.json().catch(() => ({}));
        alert(data.error || 'Credenciais inválidas.');
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        alert('Erro de rede: ' + error);
    }
}

function limparCampos() {
    document.getElementById('email').value = '';
    document.getElementById('Matricula').value = '';
}

// disponibiliza para HTML inline (se existir)
window.deletarLivro = deletarLivro;

async function deletarLivro(id) {
    if (!id) return;

    const ok = confirm('Tem certeza que deseja deletar este livro?');
    if (!ok) return;

    try {
        const base = (location.protocol === 'file:') ? 'http://localhost:3000' : '';
        const resposta = await fetch(`${base}/api/livros/${id}`, { method: 'DELETE' });

        let payload = null;
        try {
            payload = await resposta.json();
        } catch (_) {
            payload = null;
        }

        if (!resposta.ok) {
            alert((payload && payload.error) ? payload.error : 'Não foi possível deletar o livro.');
            return;
        }

        // Remove do HTML (somente do item que tiver o id correspondente)
        const item = document.querySelector(`[data-livro-id="${id}"]`);
        if (item) item.remove();
    } catch (error) {
        console.error('Erro ao deletar livro:', error);
        alert('Erro de rede ao deletar o livro.');
    }
}

window.addEventListener('load', () => {
    carregarUsuarios();


    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', cadastrarUsuario);
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', loginAdministrador);
    }

    // Admin: habilita delete se a página tiver botões
    // (a função deletarLivro já existe no escopo global do script)
    document.querySelectorAll('[data-acao="deletar-livro"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-livro-id');
            deletarLivro(id);
        });
    });
});

//home 


document.addEventListener('DOMContentLoaded', () => {
    const livroPesquisado = document.getElementById('barraDePesquisa');
    const livros = document.getElementsByClassName('livro');

    if (livroPesquisado) {
        livroPesquisado.addEventListener('keyup', () => {
            const termo = livroPesquisado.value.toLowerCase();
            Array.from(livros).forEach(item => {
                const titulo = item.textContent.toLowerCase();
                item.style.display = titulo.includes(termo) ? '' : 'none';
            });
        });
    }

    const botaoAbrir = document.querySelectorAll('.abrirModal');
    const botaoFechar = document.querySelectorAll('.fecharModal');

    function abrirDialog(dialog) {
        if (!dialog) return;
        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }
    }

    function fecharDialog(dialog) {
        if (!dialog) return;
        if (typeof dialog.close === 'function') {
            dialog.close();
        } else {
            dialog.removeAttribute('open');
        }
    }

    botaoAbrir.forEach(botao => {
        botao.addEventListener('click', () => {
            const dialog = botao.closest('.livro')?.querySelector('.minhaJanela');
            abrirDialog(dialog);
        });
    });

    botaoFechar.forEach(botao => {
        botao.addEventListener('click', () => {
            const dialog = botao.closest('dialog');
            fecharDialog(dialog);
        });
    });
});
