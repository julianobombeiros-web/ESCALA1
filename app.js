// IMPORTS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyB1PrF8UE5TkNB7FDLBb6uhqKEYXF8dqG8",
  authDomain: "escalaapp-cfaea.firebaseapp.com",
  projectId: "escalaapp-cfaea",
  storageBucket: "escalaapp-cfaea.appspot.com",
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
    nome,
    posto
  });

  nomeInput.value = "";
  postoInput.value = "";

  carregar();
}

// EXCLUIR
async function excluir(id) {
  if (confirm("Deseja excluir este registro?")) {
    await deleteDoc(doc(db, "efetivo", id));
    carregar();
  }
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

    // botão excluir
    const btn = document.createElement("button");
    btn.textContent = "❌";
    btn.onclick = () => excluir(docSnap.id);

    li.appendChild(btn);
    lista.appendChild(li);
  });
}

// CARREGAR AO ABRIR
carregar();

// GLOBAL
window.salvar = salvar;
window.excluir = excluir;
