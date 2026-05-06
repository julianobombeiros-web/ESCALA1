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
   ABREVIAÇÕES
========================= */
function abreviarPosto(posto) {
  posto = (posto || "").toUpperCase();

  if (posto.includes("TENENTE")) return "TEN";
  if (posto.includes("SARGENTO")) return "SGT";
  if (posto.includes("SOLDADO") || posto.includes("SD")) return "SD";

  return posto;
}

function abreviarNome(nome) {
  const partes = (nome || "").trim().split(" ").filter(Boolean);

  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0].toUpperCase();

  const primeiraLetra = partes[0][0];
  const sobrenome = partes[partes.length - 1];

  return (primeiraLetra + sobrenome).toUpperCase();
}

/* =========================
   CALENDÁRIO GERAL
========================= */
async function gerarCalendario() {
  const mes = parseInt(document.getElementById("mesSelecionado").value);
  const ano = new Date().getFullYear();
  const total = new Date(ano, mes + 1, 0).getDate();

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  document.getElementById("nomeMes").innerText = meses[mes] + " " + ano;

  const header = document.getElementById("headerDias");
  const container = document.getElementById("linhasEscala");

  if (!header || !container) return;

  header.innerHTML = "";
  container.innerHTML = "";

  const snapshot = await db.collection("efetivo").get();
  const nomes = [];

  snapshot.forEach(doc => {
    const d = doc.data();
    const posto = abreviarPosto(d.posto || "");
    const nome = abreviarNome(d.nome || "");
    nomes.push(`${posto} ${nome}`);
  });

  const diasSemana = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];

  header.style.width = "max-content";
  container.style.width = "max-content";

  const colunas = `150px repeat(${total}, 40px)`;

  const linhaSemana = document.createElement("div");
  linhaSemana.style.display = "grid";
  linhaSemana.style.gridTemplateColumns = colunas;
  linhaSemana.appendChild(document.createElement("div"));

  for (let d = 1; d <= total; d++) {
    const data = new Date(ano, mes, d);
    const dia = document.createElement("div");

    dia.className = "dia";

    if (data.getDay() === 0 || data.getDay() === 6) {
      dia.classList.add("fim-semana");
    }

    dia.innerText = diasSemana[data.getDay()];
    dia.style.height = "28px";
    dia.style.boxSizing = "border-box";

    linhaSemana.appendChild(dia);
  }

  const linhaNumeros = document.createElement("div");
  linhaNumeros.style.display = "grid";
  linhaNumeros.style.gridTemplateColumns = colunas;
  linhaNumeros.appendChild(document.createElement("div"));

  for (let d = 1; d <= total; d++) {
    const data = new Date(ano, mes, d);
    const dia = document.createElement("div");

    dia.className = "dia";

    if (data.getDay() === 0 || data.getDay() === 6) {
      dia.classList.add("fim-semana");
    }

    dia.innerText = d;
    dia.style.height = "28px";
    dia.style.boxSizing = "border-box";

    linhaNumeros.appendChild(dia);
  }

  header.appendChild(linhaSemana);
  header.appendChild(linhaNumeros);

  nomes.forEach(nome => {
    const blocoPessoa = document.createElement("div");
    blocoPessoa.style.display = "grid";
    blocoPessoa.style.gridTemplateColumns = `150px ${total * 40}px`;
    blocoPessoa.style.width = "max-content";

    const nomeDiv = document.createElement("div");
    nomeDiv.className = "nome-item";
    nomeDiv.innerText = nome;
    nomeDiv.style.height = "60px";
    nomeDiv.style.boxSizing = "border-box";

    const gradePessoa = document.createElement("div");
    gradePessoa.style.display = "grid";
    gradePessoa.style.gridTemplateRows = "30px 30px";

    const linha1 = document.createElement("div");
    linha1.style.display = "grid";
    linha1.style.gridTemplateColumns = `repeat(${total}, 40px)`;

    const linha2 = document.createElement("div");
    linha2.style.display = "grid";
    linha2.style.gridTemplateColumns = `repeat(${total}, 40px)`;

    for (let d = 1; d <= total; d++) {
      const data = new Date(ano, mes, d);

      const celula1 = document.createElement("div");
      celula1.className = "celula";

      if (data.getDay() === 0 || data.getDay() === 6) {
        celula1.classList.add("fim-semana");
      }

      celula1.style.height = "30px";
      celula1.style.boxSizing = "border-box";
      linha1.appendChild(celula1);

      const celula2 = document.createElement("div");
      celula2.className = "celula";

      if (data.getDay() === 0 || data.getDay() === 6) {
        celula2.classList.add("fim-semana");
      }

      celula2.style.height = "30px";
      celula2.style.boxSizing = "border-box";
      linha2.appendChild(celula2);
    }

    gradePessoa.appendChild(linha1);
    gradePessoa.appendChild(linha2);

    blocoPessoa.appendChild(nomeDiv);
    blocoPessoa.appendChild(gradePessoa);

    container.appendChild(blocoPessoa);
  });
}

window.gerarCalendario = gerarCalendario;

/* =========================
   EDITOR
========================= */
window.gerarEditor = async function () {
  const mesSelect = document.getElementById("mesSelecionado");
  const header = document.getElementById("editorHeader");
  const linhas = document.getElementById("editorLinhas");

  if (!mesSelect || !header || !linhas) return;

  const mes = parseInt(mesSelect.value);
  const ano = new Date().getFullYear();
  const total = new Date(ano, mes + 1, 0).getDate();

  header.innerHTML = "";
  linhas.innerHTML = "";

  const diasSemana = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];
  const funcoes = ["CG","COV","COBOM","L1","L2","L3","L4"];

  const colunas = `90px repeat(${total}, 140px 30px)`;

  const nomesCadastrados = new Set();
  const horasPrimeiraLinha = {};

  function normalizarTexto(texto) {
    return (texto || "")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");
  }

  function calcularHoras(periodo) {
    const texto = normalizarTexto(periodo).replace(/\s/g, "");
    const match = texto.match(/^(\d{1,2})(?::?(\d{2}))?X(\d{1,2})(?::?(\d{2}))?$/);

    if (!match) return "";

    let h1 = parseInt(match[1], 10);
    let m1 = parseInt(match[2] || "0", 10);
    let h2 = parseInt(match[3], 10);
    let m2 = parseInt(match[4] || "0", 10);

    let inicio = h1 * 60 + m1;
    let fim = h2 * 60 + m2;

    if (fim < inicio) {
      fim += 24 * 60;
    }

    const totalMin = fim - inicio;
    const horas = totalMin / 60;

    return Number.isInteger(horas) ? String(horas) : String(horas.toFixed(2)).replace(".", ",");
  }

  const snapshot = await db.collection("efetivo").get();

  snapshot.forEach(doc => {
    const d = doc.data();

    const posto = abreviarPosto(d.posto || "");
    const nomeCompleto = (d.nome || "").trim().toUpperCase();
    const nomeAbreviado = abreviarNome(d.nome || "");

    if (posto && nomeCompleto) {
      nomesCadastrados.add(normalizarTexto(`${posto} ${nomeCompleto}`));
    }

    if (posto && nomeAbreviado) {
      nomesCadastrados.add(normalizarTexto(`${posto} ${nomeAbreviado}`));
    }
  });

  const linhaDias = document.createElement("div");
  linhaDias.className = "editor-linha";
  linhaDias.style.gridTemplateColumns = colunas;
  linhaDias.appendChild(document.createElement("div"));

  for (let d = 1; d <= total; d++) {
    const data = new Date(ano, mes, d);

    const dia = document.createElement("div");
    dia.className = "editor-dia";
    dia.style.gridColumn = "span 2";
    dia.innerHTML = `${diasSemana[data.getDay()]}<br>${d}`;

    if (data.getDay() === 0 || data.getDay() === 6) {
      dia.classList.add("editor-fds");
    }

    linhaDias.appendChild(dia);
  }

  header.appendChild(linhaDias);

  funcoes.forEach(funcao => {
    for (let linhaExtra = 0; linhaExtra < 2; linhaExtra++) {
      const linha = document.createElement("div");
      linha.className = "editor-linha";
      linha.style.gridTemplateColumns = colunas;

      const nome = document.createElement("div");
      nome.className = "editor-funcao";

      if (linhaExtra === 0) {
        nome.innerText = funcao;
      } else {
        nome.classList.add("editor-funcao-extra");
      }

      linha.appendChild(nome);

      for (let d = 1; d <= total; d++) {
        const data = new Date(ano, mes, d);
        const chave = `${funcao}-${d}`;

        const inputNome = document.createElement("input");
        inputNome.className = "editor-input nome";

        let inputHora;

        if (linhaExtra === 0) {
          inputHora = document.createElement("input");
          inputHora.className = "editor-input hora";

          horasPrimeiraLinha[chave] = inputHora;

          inputNome.addEventListener("input", () => {
            inputNome.value = inputNome.value.toUpperCase();

            const digitado = normalizarTexto(inputNome.value);

            if (!digitado) {
              inputHora.value = "";
              inputNome.classList.remove("editor-erro");
              return;
            }

            if (nomesCadastrados.has(digitado)) {
              inputHora.value = "24";
              inputNome.classList.remove("editor-erro");
            } else {
              inputHora.value = "";
              inputNome.classList.add("editor-erro");
            }
          });

        } else {
          inputHora = document.createElement("select");
          inputHora.className = "editor-input hora";

          ["", "D", "N", "O"].forEach(op => {
            const option = document.createElement("option");
            option.value = op;
            option.text = op;
            inputHora.appendChild(option);
          });

          inputNome.readOnly = true;

          inputHora.addEventListener("change", () => {
            const horaDeCima = horasPrimeiraLinha[chave];

            if (inputHora.value === "D") {
              inputNome.value = "08X20";
              inputNome.readOnly = true;
              if (horaDeCima) horaDeCima.value = "12";
            }

            if (inputHora.value === "N") {
              inputNome.value = "20X08";
              inputNome.readOnly = true;
              if (horaDeCima) horaDeCima.value = "12";
            }

            if (inputHora.value === "O") {
              inputNome.value = "";
              inputNome.readOnly = false;
              inputNome.focus();
              if (horaDeCima) horaDeCima.value = "";
            }

            if (inputHora.value === "") {
              inputNome.value = "";
              inputNome.readOnly = true;
              if (horaDeCima) horaDeCima.value = "";
            }
          });

          inputNome.addEventListener("input", () => {
            inputNome.value = inputNome.value.toUpperCase();

            if (inputHora.value !== "O") return;

            const horaDeCima = horasPrimeiraLinha[chave];
            const totalHoras = calcularHoras(inputNome.value);

            if (horaDeCima) {
              horaDeCima.value = totalHoras;
            }
          });
        }

        if (data.getDay() === 0 || data.getDay() === 6) {
          inputNome.classList.add("editor-fds");
          inputHora.classList.add("editor-fds");
        }

        linha.appendChild(inputNome);
        linha.appendChild(inputHora);
      }

      linhas.appendChild(linha);
    }
  });
};
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
  gerarEditor();
});

/* =========================
   ABAS
========================= */
window.trocarAba = function (id) {
  document.querySelectorAll(".aba").forEach(el => {
    el.classList.remove("ativa");
  });

  const alvo = document.getElementById(id);
  if (alvo) alvo.classList.add("ativa");
};
