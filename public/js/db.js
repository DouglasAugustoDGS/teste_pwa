// dados offline
db.enablePersistence().catch(err => {
    if(err.code == "failed-precondition"){
        // provavelmente várias abas abertas
        console.log("Falha na persistência");
    }else if (err.code == "unimplemented"){
        // não suportado pelo navegador
        console.log("Persistência indisponível")
    }
});

// dados em tempo real
db.collection('recipes').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach(change => {
        //console.log(change, change.doc.data(), change.doc.id);
        if( change.type === "added"){
            //inserir dados na página
            renderRecipe(change.doc.data(), change.doc.id);
        }
        if( change.type === "removed"){
            //remover dados da página
            removeRecipe(change.doc.id);
        }
    });
});

// adicionando receitas
const form = document.querySelector('.add-recipe');
form.addEventListener('submit', evt => {
    
    evt.preventDefault();
    
    const recipe = {
        title: form.title.value,
        ingredients: form.ingredients.value
    }

    db.collection('recipes').add(recipe)
    .catch(err => console.log("Erro ao adicionar receita: " + err));

    form.title.value = "";
    form.ingredients.value = "";

});

// remover receita
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', evt => {
//console.log(evt);
if(evt.target.tagName == "I"){
    const id = evt.target.getAttribute('data-id');
    db.collection('recipes').doc(id).delete();
}
});