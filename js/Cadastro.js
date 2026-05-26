let cadastrados = []

function cadastrar() {
    let email = document.getElementById("email").value    
    let nome = document.getElementById("nome").value
    let senha = document.getElementById("senha").value

    let pessoa = {
        nome: nome,
        email: email,
        senha: senha
    }

    cadastrados.push(pessoa)
    console.log(cadastrados)
}
