import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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

async function carregar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "efetivo"));

  querySnapshot.forEach((doc) => {
    const dados = doc.data();

    const li = document.createElement("li");
    li.textContent = `${dados.nome} - ${dados.posto}`;

    lista.appendChild(li);
  });
}

carregar();

window.salvar = salvar;
