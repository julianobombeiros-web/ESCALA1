console.log("APP.JS CARREGADO");

/* =========================
   FIREBASE INIT (COMPAT)
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyB1PrF8UE5TkNB7FDLBb6uhqKEYXF8dqG8",
  authDomain: "escalaapp-cfaea.firebaseapp.com",
  projectId: "escalaapp-cfaea",
  storageBucket: "escalaapp-cfaea.appspot.com",
  messagingSenderId: "498190680044",
  appId: "1:498190680044:web:eaec7887e2253816d1cac9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
window.db = db;

/* =========================
   ESTADO
========================= */
let editId = null;

/* =========================
   SALVAR
========================= */
window.salvar = async function () {

  const dados = {
    idFuncional: document.getElementById("idFuncional").value || "",
    nome: document.getElementById("nome").value || "",
    posto: document.getElementById("posto").value || "",
    cpf: document.getElementById("cpf").value || "",
    credor: document.getElementById("credor").value || "",
    obm: document.getElementById("obm").value || "",
    valorHE: document.getElementById("valorHE").value || ""
  };

  if (!dados.idFuncional) {
    alert("ID Funcional obrigatório");
    return;
  }

  try {
    const docRef = editId
      ? db.collection("efetivo").doc(editId)
      : db.collection("efetivo").doc(dados.idFuncional);

    await docRef.set(dados);

    editId = null;
    limparCampos();

  } catch (e) {
    console.error(e);
  }
};

/* =========================
   LISTA
========================= */
document.addEventListener("DOMContentLoaded", function () {

  db.collection("efetivo").onSnapshot(snapshot => {

    const lista = document.getElementById("lista");
    if (!lista) return;

    lista.innerHTML = "";

    snapshot.forEach(docSnap => {

      const d = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.style.padding = "8px";
      div.style.borderBottom = "1px solid #ccc";

      div.innerHTML = `<b>${d.idFuncional || id}</b> - ${d.nome} - ${d.posto}`;

      const btnEditar = document.createElement("button");
      btnEditar.innerText = "Editar";
      btnEditar.onclick = () => {
        editar(id, d.idFuncional, d.nome, d.posto, d.cpf, d.credor, d.obm, d.valorHE);
      };

      const btnExcluir = document.createElement("button");
      btnExcluir.innerText = "Excluir";
      btnExcluir.onclick = async () => {
        if (!confirm("Deseja excluir?")) return;
        await db.collection("efetivo").doc(id).delete();
      };

      div.appendChild(btnEditar);
      div.appendChild(btnExcluir);

      lista.appendChild(div);
    });

  });

});

/* =========================
   EDITAR
========================= */
window.editar = function (id, idFuncional, nome, posto, cpf, credor, obm, valorHE) {

  editId = id;

  document.getElementById("idFuncional").value = idFuncional || "";
  document.getElementById("nome").value = nome || "";
  document.getElementById("posto").value = posto || "";
  document.getElementById("cpf").value = cpf || "";
  document.getElementById("credor").value = credor || "";
  document.getElementById("obm").value = obm || "";
  document.getElementById("valorHE").value = valorHE || "";
};

/* =========================
   IMPORTAR
========================= */
window.importarColagem = async function () {

  const texto = document.getElementById("areaEfetivo").value;
  if (!texto) return alert("Cole os dados");

  const linhas = texto.split("\n");
  let importados = 0;

  for (let i = 1; i < linhas.length; i++) {

    const col = linhas[i].split(/\t| {2,}/);

    const id = (col[1] || "").trim();
    const nome = (col[2] || "").trim();

    if (!id || !nome) continue;

    await db.collection("efetivo").doc(id).set({
      idFuncional: id,
      nome,
      posto: col[3] || "",
      cpf: col[4] || "",
      credor: col[5] || "",
      obm: col[6] || "",
      valorHE: col[7] || ""
    });

    importados++;
  }

  alert("Importado: " + importados);
};

/* =========================
   🔥 CALENDÁRIO EM LINHA (AGORA CERTO)
========================= */
function gerarCalendario() {

  const container = document.getElementById("calendarioDias");
  if (!container) return;

  const mes = parseInt(document.getElementById("mesSelecionado").value);
  const ano = new Date().getFullYear();

  const total = new Date(ano, mes + 1, 0).getDate();

  const diasSemana = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  document.getElementById("nomeMes").innerText =
    meses[mes] + " " + ano;

  container.innerHTML = "";

  // LINHA SEMANA
  const linhaSemana = document.createElement("div");
  linhaSemana.style.display = "flex";
  linhaSemana.style.gap = "10px";
  linhaSemana.style.flexWrap = "nowrap";

  // LINHA DIAS
  const linhaDias = document.createElement("div");
  linhaDias.style.display = "flex";
  linhaDias.style.gap = "10px";
  linhaDias.style.flexWrap = "nowrap";

  for (let dia = 1; dia <= total; dia++) {

    const data = new Date(ano, mes, dia);

    const elSemana = document.createElement("div");
    elSemana.innerText = diasSemana[data.getDay()];
    elSemana.style.minWidth = "40px";
    elSemana.style.textAlign = "center";
    elSemana.style.fontWeight = "bold";

    const elDia = document.createElement("div");
    elDia.innerText = dia;
    elDia.style.minWidth = "40px";
    elDia.style.textAlign = "center";

    linhaSemana.appendChild(elSemana);
    linhaDias.appendChild(elDia);
  }

  container.appendChild(linhaSemana);
  container.appendChild(linhaDias);
}

/* =========================
   LIMPAR
========================= */
function limparCampos() {
  ["idFuncional","nome","posto","cpf","credor","obm","valorHE"]
    .forEach(id => document.getElementById(id).value = "");
}

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  gerarCalendario();
});