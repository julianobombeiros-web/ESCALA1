// IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyB1PrF8UE5TkNB7FDLBb6uhqKEYXF8dqG8",
  authDomain: "escalaapp-cfaea.firebaseapp.com",
  projectId: "escalaapp-cfaea",
  storageBucket: "escalaapp-cfaea.firebasestorage.app",
  messagingSenderId: "498190680044",
  appId: "1:498190680044:web:eaec7887e2253816d1cac9"
};

// INICIAR FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SALVAR
async function salvar() {
  const nomeInput = document.getElementById("nome");
  const postoInput = document.getElementById("posto");

  const nome = nomeInput.value;
  const posto = postoInput.value;

  if (!nome || !posto) {
    alert("Preencha nome e posto");
    return;
  }

  await addDoc(collection(db, "efetivo"), {
    nome: nome,
    posto: posto
  });

  nomeInput.value = "";
  postoInput.value = "";

  carregar();
}

// LISTAR
async function carregar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "efetivo"));

  querySnapshot.forEach((doc) => {
    const dados = doc.data();

    const li = document.createElement("li");
    li.textContent = dados.nome + " - " + dados.posto;

    lista.appendChild(li);
  });
}

// CARREGAR AO ABRIR
carregar();

// GLOBAL
window.salvar = salvar;