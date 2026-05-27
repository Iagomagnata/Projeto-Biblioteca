let usuarios = [];  
    function atualizarTotal() {
        document.getElementById('totalUsuarios').textContent = usuarios.length;
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
         if (!nome || !email || !dataNascimento || !genero || !endereco || !numero || !bairro || !cidade || !cep || !telefone) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }
        // ADICIONA no array (posição automática)
        usuarios.push({
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
        });
        alert('Usuário cadastrado com sucesso!');
        atualizarTotal();
        limparCampos();
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