let disciplinasData = {};

document.addEventListener('DOMContentLoaded', function () {

    function formatSemester(key) {
        const [ano, semestre] = key.split("-");
        const nomes = {
            "1": "Primeiro",
            "2": "Segundo"
        };
        return `${ano}/${semestre} - ${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
    }

    const select = document.getElementById("semesterSelect");

    fetch("JSON/oferta_disciplinas.json")
        .then(response => response.json())
        .then(data => {
            disciplinasData = data;
            select.innerHTML = "";

            const keys = Object.keys(data).sort().reverse();

            keys.forEach(key => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = formatSemester(key);
                select.appendChild(option);
            });

            updateContent(select.value);
        })
        .catch(error => {
            console.error("Erro ao carregar JSON:", error);
        });

    select.addEventListener("change", () => {
        updateContent(select.value);
    });

    function updateContent(selectedSemester) {
        const dados = disciplinasData[selectedSemester];
        if (!dados) return;

        const [ano, semestre] = selectedSemester.split("-");
        const nomes = {
            "1": "Primeiro",
            "2": "Segundo"
        };
        const titulo = `${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
        document.getElementById("semesterTitle").textContent = titulo;

        const listaDisciplinas = document.querySelector(".disciplines-list");
        listaDisciplinas.innerHTML = "";

        if (dados.disciplinas && dados.disciplinas.length > 0) {
            dados.disciplinas.forEach(disciplina => {
                const disciplineItem = document.createElement("div");
                disciplineItem.className = "discipline-item";

                const disciplineContent = document.createElement("div");
                disciplineContent.className = "discipline-content";

                const disciplineName = document.createElement("h4");
                disciplineName.textContent = disciplina.nome;

                const disciplineInfo = document.createElement("div");
                disciplineInfo.className = "discipline-info";

                const docente = document.createElement("p");
                docente.className = "docente";
                docente.textContent = `Docente: ${disciplina.docente}`;

                const unidade = document.createElement("p");
                unidade.className = "unidade";
                unidade.textContent = `Unidade: ${disciplina.unidade}`;

                const horario = document.createElement("p");
                horario.className = "horario";
                horario.textContent = `Horário: ${disciplina.horario}`;

                disciplineInfo.appendChild(docente);
                disciplineInfo.appendChild(unidade);

                if (disciplina.local && disciplina.local.trim() !== "") {
                    const local = document.createElement("p");
                    local.className = "local";
                    local.textContent = `Local: ${disciplina.local}`;
                    disciplineInfo.appendChild(local);
                }

                disciplineInfo.appendChild(horario);

                disciplineContent.appendChild(disciplineName);
                disciplineContent.appendChild(disciplineInfo);

                const ementaLink = document.createElement("a");
                ementaLink.className = "ementa-link";
                ementaLink.href = disciplina.ementa_link;
                ementaLink.target = "_blank";
                ementaLink.textContent = "Ementa";

                disciplineItem.appendChild(disciplineContent);
                disciplineItem.appendChild(ementaLink);
                listaDisciplinas.appendChild(disciplineItem);
            });
        } else {
            listaDisciplinas.innerHTML = `<div class="no-disciplines"><p>Não há disciplinas disponíveis para este período.</p></div>`;
        }        
    }
});