let defensesData = {};

document.addEventListener('DOMContentLoaded', function () {

    function formatSemester(key) {
        const [ano, semestre] = key.split("-");
        const nomes = {
            "1": "Primeiro",
            "2": "Segundo"
        };
        return `${ano}/${semestre} - ${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
    }

    function getModalityClass(modality) {
        if (modality.toLowerCase().includes('presencial')) {
            return 'presencial';
        } else if (modality.toLowerCase().includes('videoconferência') || modality.toLowerCase().includes('videoconferencia')) {
            return 'videoconferencia';
        }
        return 'presencial'; // default
    }

    const select = document.getElementById("semesterSelect");

    fetch("JSON/agenda_defesas.json")
        .then(response => response.json())
        .then(data => {
            defensesData = data;
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
        const dados = defensesData[selectedSemester];
        if (!dados) return;

        const [ano, semestre] = selectedSemester.split("-");
        const nomes = {
            "1": "Primeiro",
            "2": "Segundo"
        };
        const titulo = `${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
        document.getElementById("semesterTitle").textContent = titulo;

        const listaDefesas = document.querySelector(".defenses-list");
        listaDefesas.innerHTML = "";

        if (dados.defesas && dados.defesas.length > 0) {
            dados.defesas.forEach((defesa, index) => {
                const defenseItem = document.createElement("div");
                defenseItem.className = "defense-item";
                defenseItem.style.animationDelay = `${(index + 1) * 0.1}s`;

                const defenseHeader = document.createElement("div");
                defenseHeader.className = "defense-header";

                const defenseContent = document.createElement("div");
                defenseContent.className = "defense-content";

                // Data da defesa
                const defenseDate = document.createElement("div");
                defenseDate.className = "defense-date";
                defenseDate.textContent = defesa.data;

                defenseHeader.appendChild(defenseDate);

                // Horário (só mostra se não for null)
                if (defesa.horario !== null && defesa.horario !== undefined) {
                    const defenseTime = document.createElement("div");
                    defenseTime.className = "defense-time";
                    defenseTime.textContent = defesa.horario;
                    defenseHeader.appendChild(defenseTime);
                }

                // Título da dissertação
                const defenseTitle = document.createElement("h4");
                defenseTitle.className = "defense-title";
                defenseTitle.textContent = defesa.titulo;

                // Nome do aluno
                const defenseStudent = document.createElement("div");
                defenseStudent.className = "defense-student";
                defenseStudent.textContent = `Aluno(a): ${defesa.aluno}`;

                // Informações da defesa
                const defenseInfo = document.createElement("div");
                defenseInfo.className = "defense-info";

                // Modalidade
                const defenseModality = document.createElement("span");
                defenseModality.className = `defense-modality ${getModalityClass(defesa.modalidade)}`;
                defenseModality.textContent = defesa.modalidade;
                
                // Se for videoconferência e tiver link, torna a modalidade clicável
                if (getModalityClass(defesa.modalidade) === 'videoconferencia' && defesa.link) {
                    const modalityLink = document.createElement("a");
                    modalityLink.href = defesa.link;
                    modalityLink.target = "_blank";
                    modalityLink.rel = "noopener noreferrer";
                    modalityLink.className = `defense-modality ${getModalityClass(defesa.modalidade)}`;
                    modalityLink.textContent = defesa.modalidade;
                    modalityLink.style.textDecoration = "none";
                    modalityLink.style.cursor = "pointer";
                    
                    // Adiciona evento de clique para feedback
                    modalityLink.addEventListener('click', function() {
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 100);
                    });
                    
                    defenseInfo.appendChild(modalityLink);
                } else {
                    defenseInfo.appendChild(defenseModality);
                }

                // Local
                const defenseLocation = document.createElement("span");
                defenseLocation.className = "defense-location";
                defenseLocation.textContent = defesa.local;

                defenseInfo.appendChild(defenseLocation);

                defenseContent.appendChild(defenseTitle);
                defenseContent.appendChild(defenseStudent);
                defenseContent.appendChild(defenseInfo);

                defenseItem.appendChild(defenseHeader);
                defenseItem.appendChild(defenseContent);

                // Não adiciona mais o botão "Assistir Online" separado

                listaDefesas.appendChild(defenseItem);
            });
        } else {
            listaDefesas.innerHTML = `<div class="no-defenses"><p>Não há defesas programadas para este período.</p></div>`;
        }        
    }

    // Adiciona hover effects para melhor interação
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.defense-item')) {
            const item = e.target.closest('.defense-item');
            
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.defense-item')) {
            const item = e.target.closest('.defense-item');
            item.style.transform = 'translateX(0)';
        }
    });

    // Log para debug
    console.log('Página de Agenda de Defesas carregada com sucesso!');
});