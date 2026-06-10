const api_url = '/api/usuarios';

let usuarios = [];

async function carregarUsuarios() {
    try {
        const resposta = await fetch(api_url);
        if (resposta.ok) {
            usuarios = await resposta.json();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function cadastrarUsuario(event) {
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
        const resposta = await fetch(api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (resposta.ok) {
            alert('Usuário cadastrado com sucesso!');
            limparCampos();
            window.location.href = 'Alexandria.html';
        } else {
            const data = await resposta.json().catch(() => ({}));
            alert(data.error || 'Erro ao cadastrar usuário.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de rede: ' + error);
    }
}

async function loginAdministrador(event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario')?.value.trim();
    const senha = document.getElementById('senha')?.value.trim();

    if (!usuario || !senha) {
        alert('Preencha usuário e senha.');
        return;
    }

    try {
        const resposta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        if (resposta.ok) {
            window.location.href = 'Alexandria.html';
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
