

let semesterData = {};

document.addEventListener('DOMContentLoaded', function () {

    function formatSemester(key) {
        const [ano, semestre] = key.split("-");
        const nomes = {
            "1": "Primeiro",
            "2": "Segundo",
            "3": "Terceiro"
        };
        return `${ano}/${semestre} - ${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
    }

    const select = document.getElementById("semesterSelect");

    fetch("JSON/processo_seletivo_pos_doc.json")
        .then(response => response.json())
        .then(data => {
            semesterData = data;
            select.innerHTML = "";

            const keys = Object.keys(data).filter(key => key !== 'folder').sort().reverse();


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
        const folder = semesterData.folder || 'processos_seletivos';

        const dados = semesterData[selectedSemester];
        if (!dados) return;

        const [ano, semestre] = selectedSemester.split("-");
        const nomes = {
            "1": "Primeiro",
            "2": "Segundo",
            "3": "Terceiro"
        };
        const titulo = `${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
        document.getElementById("semesterTitle").textContent = titulo;

        const listaRegulares = document.querySelector(".document-category .documents-list");


        listaRegulares.innerHTML = "";

        // REGULARES
        if (dados.regulares && dados.regulares.length > 0) {
            dados.regulares.forEach(item => {
                const link = document.createElement("a");
                link.className = "document-item regular";
                link.target = "_blank";
                link.href = item.link ? item.link : `docs/${selectedSemester}/${folder}/${item.arquivo}`;

                const wrapper = document.createElement("div");
                wrapper.className = "document-content";

                const title = document.createElement("h4");
                title.textContent = item.titulo || item.arquivo;

                const description = document.createElement("p");
                description.textContent = item.texto;

                wrapper.appendChild(title);
                wrapper.appendChild(description);
                link.appendChild(wrapper);
                listaRegulares.appendChild(link);
            });
        } else {
            listaRegulares.innerHTML = `<div class="no-documents"><p>Não há documentos disponíveis para alunos regulares neste período.</p></div>`;
        }        
    }
});
