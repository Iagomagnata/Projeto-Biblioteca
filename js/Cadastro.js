const api_url = '';

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

function cadastrarUsuario() {
    let nome = document.getElementById('nome').value;
    let nomeSocial = document.getElementById('nomeSocial').value;
    let email = document.getElementById('email').value;
    let dataNascimento = document.getElementById('dataNascimento').value;
    let genero = document.getElementById('genero').value;
    let endereco = document.getElementById('endereco').value;
    let numero = document.getElementById('numero').value;
    let bairro = document.getElementById('bairro').value;
    let cidade = document.getElementById('cidade').value;
    let cep = document.getElementById('cep').value;
    let telefone = document.getElementById('telefone').value;
    let telefoneResponsavel = document.getElementById('telefoneresponsavel').value;
    let cep = document.getElementById('cep').value;

    if (!nome || !email || !dataNascimento || !genero || !endereco || !numero || !bairro || !cidade || !cep || !telefone || !telefoneResponsavel) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    const novoUsuario = {
        nome: nome,
        nomeSocial: nomeSocial,
        email: email,
        dataNascimento: dataNascimento,
        genero: genero,
        endereco: endereco,
        numero: numero,
        bairro: bairro,
        cidade: cidade,
        cep: cep,
        telefone: telefone,
        telefoneResponsavel: telefoneResponsavel
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

    window.location.href = 'home.html';
} 

function limparCampos() {
    document.getElementById('matricula').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('nomeSocial').value = '';
    document.getElementById('email').value = '';
    document.getElementById('dataNascimento').value = '';
    document.getElementById('genero').value = '';
    document.getElementById('endereco').value = '';
    document.getElementById('numero').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('cep').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('telefoneresponsavel').value = '';
}

window.addEventListener('load', carregarUsuarios);