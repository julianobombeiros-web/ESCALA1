// IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyB1PrF8UE5TkNB7FDLBb6uhqKEYXF8dqG8",
  authDomain: "escalaapp-cfaea.firebaseapp.com",
  projectId: "escalaapp-cfaea",
  storageBucket: "escalaapp-cfaea.appspot.com",
  messagingSenderId: "498190680044",
  appId: "1:498190680044:web:eaec7887e2253816d1cac9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SALVAR
async function salvar() {
  const nome = document.getElementById("nome").value;
  const posto = document.getElementById("posto").value;

  if (!nome || !posto) {
    alert("Preencha nome e posto");
    return;
  }

  await addDoc(collection(db, "efetivo"), {
    nome,
    posto
  });

  document.getElementById("nome").value = "";
  document.getElementById("posto").value = "";

  carregar();
}

// EXCLUIR
async function excluir(id) {
  if (confirm("Deseja excluir?")) {
    await deleteDoc(doc(db, "efetivo", id));
    carregar();
  }
}

// EDITAR
async function editar(id, nomeAtual, postoAtual) {
  const novoNome = prompt("Editar nome:", nomeAtual);
  const novoPosto = prompt("Editar posto:", postoAtual);

  if (!novoNome || !novoPosto) return;

  await updateDoc(doc(db, "efetivo", id), {
    nome: novoNome,
    posto: novoPosto
  });

  carregar();
}

// LISTAR
async function carregar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "efetivo"));

  querySnapshot.forEach((docSnap) => {
    const dados = docSnap.data();

    const li = document.createElement("li");
    li.textContent = `${dados.nome} - ${dados.posto} `;

    // botão editar
    const btnEditar = document.createElement("button");
    btnEditar.textContent = "✏️";
    btnEditar.onclick = () => editar(docSnap.id, dados.nome, dados.posto);

    // botão excluir
    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "❌";
    btnExcluir.onclick = () => excluir(docSnap.id);

    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);

    lista.appendChild(li);
  });
}

// iniciar
carregar();

window.salvar = salvar;
