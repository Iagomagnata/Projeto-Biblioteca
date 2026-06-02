const api_url = '/api/usuarios';
const login_url = '/api/login';

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
    if (event) {
        event.preventDefault();
    }

    let matricula = document.getElementById('Matricula')?.value;
    let email = document.getElementById('email')?.value;

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
            window.location.href = 'home.html';
        } else {
            alert('Erro ao cadastrar usuário: ' + resposta.status + ' ' + resposta.statusText);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de rede: ' + error);
    }
}

async function loginAdm(event) {
    if (event) {
        event.preventDefault();
    }

    const nome = document.getElementById('nome')?.value;
    const senha = document.getElementById('senha')?.value;

    if (!nome || !senha) {
        alert('Preencha nome e senha.');
        return;
    }

    try {
        const resposta = await fetch(login_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            window.location.href = 'home.html';
        } else {
            alert(dados.error || 'Login inválido.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de rede: ' + error);
    }
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

function pesquisarLivros() {
    const textoPesquisa = document
        .getElementById("barraDePesquisa")
        .value
        .toLowerCase();

    const tipoPesquisa = document
        .getElementById("tipoPesquisa")
        .value;

    const livros = document.querySelectorAll(".livro");

    livros.forEach(livro => {
        let textoComparacao = "";

        if (tipoPesquisa === "titulo") {
            textoComparacao = livro
                .querySelector("h2")
                .textContent
                .toLowerCase();
        }

        else if (tipoPesquisa === "autor") {
            textoComparacao = livro
                .querySelector("p")
                .textContent
                .toLowerCase();
        }

        else if (tipoPesquisa === "editora") {
            textoComparacao = livro
                .dataset.editora
                ?.toLowerCase() || "";
        }

        if (textoComparacao.includes(textoPesquisa)) {
            livro.style.display = "";
        } else {
            livro.style.display = "none";
        }
    });
}



//Iago mexendo


        // /* Seletores de busca e filtragem */
        // const searchInput = document.getElementById('searchInput');
        // const categoryFilter = document.getElementById('categoryFilter');
        // const sortOrder = document.getElementById('sortOrder');
        // const productList = document.getElementById('productList');
        // const cards = Array.from(document.querySelectorAll('.card'));
        // /* elementos do diálogo */
        // const productDialog = document.getElementById('productDialog');
        // const dialogTitle = document.getElementById('dialogTitle');
        // const dialogImage = document.getElementById('dialogImage');
        // const dialogDescription = document.getElementById('dialogDescription');

        // /* Seletores dos botões de fechar declarados  */
        // const closeDialog = document.getElementById('closeDialog');
        // const closeDialogCross = document.getElementById('closeDialogCross');


        // /*essa parte legal é para o botao de fav para que nao se misture com o dialogo e consiga mudar de cor*/
        // document.querySelectorAll('.btn-favorito').forEach(botao => {
        //     botao.addEventListener('click', (evento) => {
        //         // Evita que o clique abra o modal ou faça outra ação indesejada no card
        //         evento.stopPropagation();

        //         // Alterna a classe 'favoritado'. Se não tem, adiciona; se tem, remove.
        //         botao.classList.toggle('favoritado');

        //         // (Opcional) Guardar na consola ou enviar para uma lista de memória
        //         if (botao.classList.contains('favoritado')) {
        //             console.log("Livro adicionado aos favoritos!");
        //         } else {
        //             console.log("Livro removido dos favoritos.");
        //         }
        //     });
        // });

        // /* Função de filtragem de produtos e ordem  */
        // function filterProducts() {
        //     const query = searchInput.value.toLowerCase().trim();
        //     const selectedCategory = categoryFilter.value;
        //     const selectedSort = sortOrder.value;

        //     // 1. Primeiro Passo: Filtrar as visibilidades dos cartões
        //     cards.forEach(card => {
        //         const category = card.dataset.category;
        //         const name = card.dataset.name.toLowerCase();

        //         const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
        //         const matchesSearch = name.includes(query);

        //         card.classList.toggle('hide', !(matchesCategory && matchesSearch));
        //     });

        //     //vai fazer com que os livros coletados sejam clonados para a sessao de ordenagem e filtro
        //     let sortedCards = [...cards];

        //     if (selectedSort === 'title-asc') {
        //         sortedCards.sort((a, b) => {
        //             const titleA = a.querySelector('h3').textContent;
        //             const titleB = b.querySelector('h3').textContent;
        //             return titleA.localeCompare(titleB);
        //         });
        //     } else if (selectedSort === 'title-desc') {
        //         sortedCards.sort((a, b) => {
        //             const titleA = a.querySelector('h3').textContent;
        //             const titleB = b.querySelector('h3').textContent;
        //             return titleB.localeCompare(titleA);
        //         });
        //     }

        //     // 3. Terceiro Passo: Reinserir os cartões reordenados dentro do container principal
        //     sortedCards.forEach(card => {
        //         productList.appendChild(card);
        //     });
        // }

        // /* isso sao os "ouvintes" da funcao */
        // categoryFilter.addEventListener('change', filterProducts);
        // searchInput.addEventListener('input', filterProducts);
        // sortOrder.addEventListener('change', filterProducts);
        // /* Função para abrir o diálogo com os dados dinâmicos do botão */
        // document.querySelectorAll('.open-dialog-btn').forEach(button => {
        //     button.addEventListener('click', () => {
        //         dialogTitle.textContent = button.dataset.title;
        //         dialogImage.src = button.dataset.image;
        //         dialogImage.alt = button.dataset.title;
        //         dialogDescription.textContent = button.dataset.description;
        //         productDialog.showModal();
        //     });
        // });

        // /* Função para Fechar dialogo/Modal */
        // const closeModal = () => {
        //     productDialog.close();
        // };

        // /* Adicionando ouvintes aos botões de fechar selecionados */
        // closeDialog.addEventListener('click', closeModal);
        // closeDialogCross.addEventListener('click', closeModal);

        // /* abrir dialogo */
        // productDialog.addEventListener('click', (e) => {
        //     const rect = productDialog.getBoundingClientRect();
        //     const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        //         && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
        //     if (!isInDialog) {
        //         closeModal();
        //     }
        // });

