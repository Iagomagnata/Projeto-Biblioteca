
const API_URL = 'http://localhost:3000';

// Função para carregar usuários e operações
async function carregarDados() {
    try {
        const resUsuarios = await fetch(`${API_URL}/usuarios`);
        const usuarios = await resUsuarios.json();
        console.log('Usuários cadastrados:', usuarios);

        const resOperacoes = await fetch(`${API_URL}/operacoes`);
        const operacoes = await resOperacoes.json();
        console.log('Operações cadastradas:', operacoes);
    } catch (error) {
        console.error('Erro ao buscar dados do servidor:', error);
    }
}

// Função para cadastrar usuário
async function cadastrarUsuario(nome) {
    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        if (response.ok) {
            alert('Usuário cadastrado com sucesso!');
            carregarDados();
        }
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
    }
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDados);console.log("SCRIPT FUNCIONANDO");

document.addEventListener("DOMContentLoaded", () => {
    const alunoForm = document.getElementById("loginForm");
    const adminForm = document.getElementById("adminLoginForm");
    const searchInput = document.getElementById("searchInput");
    const bookCards = Array.from(document.querySelectorAll(".book-card"));
    const genreCards = Array.from(document.querySelectorAll(".genre-card"));

    if (alunoForm) {
        alunoForm.addEventListener("submit", handleAlunoLogin);
    }

    if (adminForm) {
        adminForm.addEventListener("submit", handleAdminLogin);
    }

    const role = getQueryParam("role");
    if (genreCards.length) {
        genreCards.forEach((card) => {
            card.addEventListener("click", () => {
                const genre = card.dataset.genre;
                if (genre) {
                    const query = `genre=${encodeURIComponent(genre)}${role ? `&role=${encodeURIComponent(role)}` : ""}`;
                    window.location.href = `biblioteca.html?${query}`;
                }
            });
        });
    }

    const reportLink = document.getElementById("reportLink");
    if (reportLink && role === "admin") {
        reportLink.style.display = "block";
        reportLink.href = `relatorio.html?role=admin`;
    }

    const modal = document.getElementById("bookModal");
    const modalCloseButton = document.getElementById("modalCloseButton");

    const adminActionForm = document.getElementById("adminActionForm");
    const studentNameInput = document.getElementById("studentName");
    const studentClassInput = document.getElementById("studentClass");

    if (bookCards.length) {
        bookCards.forEach((card) => {
            card.addEventListener("click", () => {
                openBookModal(card);
            });
        });
    }

    if (adminActionForm) {
        adminActionForm.addEventListener("submit", (event) => {
            event.preventDefault();
            submitAdminOperation();
        });
    }

    if (modalCloseButton) {
        modalCloseButton.addEventListener("click", closeBookModal);
    }

    if (modal) {
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                closeBookModal();
            }
        });
    }

    if (searchInput && bookCards.length) {
        const params = new URLSearchParams(window.location.search);
        const selectedGenre = params.get("genre");

        if (selectedGenre) {
            searchInput.value = selectedGenre;
        }

        const filterBooks = () => {
            const query = searchInput.value.toLowerCase();
            const noResults = document.getElementById("noResults");
            let visibleCount = 0;

            bookCards.forEach((card) => {
                const title = card.dataset.title.toLowerCase();
                const author = card.dataset.author.toLowerCase();
                const genre = card.dataset.genre.toLowerCase();
                const matches = title.includes(query) || author.includes(query) || genre.includes(query);

                card.style.display = matches ? "grid" : "none";
                if (matches) {
                    visibleCount += 1;
                }
            });

            if (noResults) {
                noResults.style.display = visibleCount ? "none" : "block";
            }
        };

        searchInput.addEventListener("input", filterBooks);
        if (selectedGenre) {
            filterBooks();
        }
    }

    refreshBookStocks();
});

let pendingAdminAction = null;

async function refreshBookStocks() {
    if (!window.location.pathname.endsWith('biblioteca.html')) {
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:3000/api/livros');
        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.livros)) {
            return;
        }

        data.livros.forEach((book) => {
            const card = document.querySelector(`.book-card[data-title="${book.titulo.replace(/"/g, '\\"')}"]`);
            if (!card) return;

            card.dataset.available = book.available_count;
            const meta = card.querySelector('.book-meta');
            if (!meta) return;

            const disponibilidade = book.available_count > 0
                ? `${book.available_count} exemplar${book.available_count === 1 ? '' : 'es'} livre${book.available_count === 1 ? '' : 's'}`
                : 'Sem exemplares livres';

            let availabilityNode = Array.from(meta.querySelectorAll('p')).find(p => p.textContent.includes('Disponibilidade'));
            if (!availabilityNode) {
                availabilityNode = document.createElement('p');
                meta.appendChild(availabilityNode);
            }

            availabilityNode.innerHTML = `<span class="label">Disponibilidade</span><br>${disponibilidade}`;
        });
    } catch (error) {
        console.error('Falha ao atualizar estoque dos livros:', error);
    }
}

function openBookModal(card) {
    const modal = document.getElementById("bookModal");
    if (!modal) return;

    const role = getQueryParam("role");
    const available = Number(card.dataset.available || 0);
    document.getElementById("modalTitle").textContent = card.dataset.title;
    document.querySelector(".modal-author").textContent = `Autor: ${card.dataset.author}`;
    document.querySelector(".modal-genre").textContent = `Gênero: ${card.dataset.genre}`;
    document.querySelector(".modal-summary").textContent = card.dataset.summary || "Resumo não disponível.";
    document.getElementById("modalCover").textContent = card.dataset.title;

    const modalStatus = document.getElementById("modalStatus");
    if (modalStatus) {
        if (role === "admin") {
            modalStatus.textContent = available > 0
                ? `${available} exemplar${available === 1 ? "" : "es"} livre${available === 1 ? "" : "s"}.`
                : "Sem exemplares livres. Disponível apenas para reserva.";
        } else {
            modalStatus.textContent = available > 0
                ? "Disponível para empréstimo."
                : "Livro indisponível para empréstimo no momento.";
        }
    }

    const actions = document.querySelector(".modal-actions");
    const loanBtn = document.getElementById("modalLoanBtn");
    const reserveBtn = document.getElementById("modalReserveBtn");
    const adminForm = document.getElementById("adminActionForm");

    if (actions) {
        actions.style.display = role === "admin" ? "grid" : "none";
    }

    if (loanBtn) {
        loanBtn.style.display = role === "admin" && available > 0 ? "inline-block" : "none";
    }
    if (reserveBtn) {
        reserveBtn.style.display = role === "admin" ? "inline-block" : "none";
    }

    if (adminForm) {
        adminForm.style.display = "none";
    }
    pendingAdminAction = null;

    modal.classList.add("open");
}

function closeBookModal() {
    const modal = document.getElementById("bookModal");
    if (!modal) return;
    modal.classList.remove("open");
}

async function handleAdminAction(action, title, studentName, turma) {
    const role = getQueryParam("role") || "admin";
    const endpointMap = {
        Emprestar: "emprestimo",
        Emprestimo: "emprestimo",
        "Empréstimo": "emprestimo",
        Reservar: "reserva",
        Devolução: "devolucao"
    };
    const endpoint = endpointMap[action];

    if (!endpoint) {
        alert("Ação inválida.");
        return;
    }

    if ((action === "Emprestar" || action === "Emprestimo" || action === "Empréstimo" || action === "Reservar") && (!studentName || !turma)) {
        pendingAdminAction = action;
        const adminForm = document.getElementById("adminActionForm");
        const adminFormTitle = document.getElementById("adminActionFormTitle");
        if (adminForm && adminFormTitle) {
            adminFormTitle.textContent = action === "Reservar" ? "Registrar reserva do aluno" : "Registrar empréstimo do aluno";
            adminForm.style.display = "grid";
        }
        return;
    }

    try {
        const bodyData = {
            title,
            role
        };
        if (studentName) bodyData.studentName = studentName;
        if (turma) bodyData.turma = turma;

        const response = await fetch(`http://127.0.0.1:3000/api/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        const result = await response.json();
        if (response.ok && result.success) {
            alert(result.message);
            cancelAdminOperation();
            refreshBookStocks();
        } else {
            alert(result.message || "Falha ao realizar a operação.");
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar com o servidor. Tente novamente mais tarde.");
    }
}

function submitAdminOperation() {
    const title = document.getElementById("modalTitle").textContent;
    const studentName = document.getElementById("studentName")?.value.trim();
    const turma = document.getElementById("studentClass")?.value.trim();

    if (!pendingAdminAction) {
        alert("Nenhuma ação selecionada.");
        return;
    }

    if (!studentName || !turma) {
        alert("Por favor, informe o nome do aluno e a turma.");
        return;
    }

    handleAdminAction(pendingAdminAction, title, studentName, turma);
}

function cancelAdminOperation() {
    const adminForm = document.getElementById("adminActionForm");
    if (adminForm) {
        adminForm.style.display = "none";
    }
    const studentNameInput = document.getElementById("studentName");
    const studentClassInput = document.getElementById("studentClass");
    if (studentNameInput) studentNameInput.value = "";
    if (studentClassInput) studentClassInput.value = "";
    pendingAdminAction = null;
}

function handleAlunoLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById("usuario")?.value.trim();
    const senha = document.getElementById("senha")?.value;

    if (!usuario || !senha) {
        alert("Por favor, informe nome de usuário e senha.");
        return;
    }

    window.location.href = "generos.html";
}

async function handleAdminLogin(event) {
    event.preventDefault();

    const usuario = document.getElementById("adminUser")?.value.trim();
    const senha = document.getElementById("adminPass")?.value;

    if (!usuario || !senha) {
        alert("Por favor, informe usuário e senha de administrador.");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:3000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: usuario,
                password: senha
            })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            window.location.href = "generos.html?role=admin";
        } else {
            alert(data.message || "Credenciais inválidas.");
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao conectar ao servidor. Tente novamente mais tarde.");
    }
}

function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

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

