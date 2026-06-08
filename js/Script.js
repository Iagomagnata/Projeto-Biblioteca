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

    let matricula = document.getElementById('Matricula').value;
    let email = document.getElementById('email').value;

    if (!matricula || !email) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const novoUsuario = {
        email: email,
        matricula: matricula
    };
    console.log('url: ', api_url);

    try {
        const resposta = await fetch(api_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        console.log('Status', resposta.status);
        const texto = await resposta.text();
        console.log('Resposta:', texto);

        if (resposta.ok) {
            alert('Usuário cadastrado com sucesso!');
            carregarUsuarios();
            limparCampos();
        } else {
            alert('Erro ao cadastrar usuário: ' + resposta.status + ' ' + resposta.statusText);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de rede: ' + error);
    }

    window.location.href = 'Alexandria.html';
} 

function limparCampos() {
    document.getElementById('email').value = '';
    document.getElementById('Matricula').value = '';
}

window.addEventListener('load', carregarUsuarios);

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


//login cadastro

