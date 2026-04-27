let seminariosData = {};

document.addEventListener('DOMContentLoaded', function () {

    function formatSemester(key) {
        // Para seminários, o formato pode ser diferente (ex: "2022-2")
        if (key.includes('-')) {
            const [ano, semestre] = key.split("-");
            const nomes = {
                "1": "Primeiro",
                "2": "Segundo"
            }

    // Função para mostrar o modal do cover;
            return `${ano}/${semestre} - ${nomes[semestre] || semestre + "º"} Semestre de ${ano}`;
        }
        return key; // Retorna a chave original se não seguir o padrão
    }

    const select = document.getElementById("semesterSelect");

    // Verificação inicial
    console.log("Iniciando carregamento do JSON de seminários...");
    
    fetch("JSON/seminarios.json")
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados carregados:", data); // Debug
            seminariosData = data;
            select.innerHTML = "";

            const keys = Object.keys(data).sort().reverse();
            console.log("Chaves encontradas:", keys); // Debug

            if (keys.length === 0) {
                const option = document.createElement("option");
                option.value = "";
                option.textContent = "Nenhum período disponível";
                option.disabled = true;
                select.appendChild(option);
                return;
            }

            keys.forEach(key => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = formatSemester(key);
                select.appendChild(option);
            });

            // Seleciona o primeiro item e atualiza o conteúdo
            if (keys.length > 0) {
                select.value = keys[0];
                updateContent(keys[0]);
            }
        })
        .catch(error => {
            console.error("Erro ao carregar JSON:", error);
            select.innerHTML = '<option disabled>Erro ao carregar dados</option>';
            
            // Mostra mensagem de erro na lista
            const listaSeminarios = document.querySelector(".seminars-list");
            if (listaSeminarios) {
                listaSeminarios.innerHTML = `<div class="no-seminars"><p>Erro ao carregar seminários. Verifique o console para mais detalhes.</p></div>`;
            }
        });

    select.addEventListener("change", () => {
        updateContent(select.value);
    });

    function updateContent(selectedSemester) {
        console.log("Atualizando conteúdo para:", selectedSemester); // Debug
        const dados = seminariosData[selectedSemester];
        
        if (!dados) {
            console.error("Dados não encontrados para:", selectedSemester);
            return;
        }

        console.log("Dados do período:", dados); // Debug

        // Atualiza o título
        const titleElement = document.getElementById("semesterTitle");
        if (titleElement) {
            titleElement.textContent = dados.titulo || `Seminários - ${selectedSemester}`;
        }

        const listaSeminarios = document.querySelector(".seminars-list");
        if (!listaSeminarios) {
            console.error("Elemento .seminars-list não encontrado");
            return;
        }
        
        listaSeminarios.innerHTML = "";

        if (dados.seminarios && dados.seminarios.length > 0) {
            // Ordenar seminários por data (cronológica: mais antiga primeiro)
            const seminariosOrdenados = [...dados.seminarios].sort((a, b) => {
                const dataA = parseDataBrasileira(a.data);
                const dataB = parseDataBrasileira(b.data);
                
                // Ordem crescente: mais antiga primeiro, mais recente último
                return dataA.getTime() - dataB.getTime();
            });

            console.log(`Renderizando ${seminariosOrdenados.length} seminários em ordem cronológica`); // Debug
            seminariosOrdenados.forEach((seminario, index) => {
                const seminarItem = document.createElement("div");
                seminarItem.className = "seminar-item";
                seminarItem.style.animationDelay = `${(index + 1) * 0.1}s`;

                // Header com data e horário
                const seminarHeader = document.createElement("div");
                seminarHeader.className = "seminar-header";

                const seminarDateTime = document.createElement("div");
                seminarDateTime.className = "seminar-date-time";

                const seminarDate = document.createElement("div");
                seminarDate.className = "seminar-date";
                seminarDate.textContent = seminario.data;

                const seminarTime = document.createElement("div");
                seminarTime.className = "seminar-time";
                seminarTime.textContent = seminario.horario;

                seminarDateTime.appendChild(seminarDate);
                seminarDateTime.appendChild(seminarTime);
                seminarHeader.appendChild(seminarDateTime);

                // Título da palestra
                const seminarTitle = document.createElement("h3");
                seminarTitle.className = "seminar-title";
                seminarTitle.textContent = seminario.titulo;

                // Palestrante
                const seminarSpeaker = document.createElement("div");
                seminarSpeaker.className = "seminar-speaker";
                seminarSpeaker.textContent = seminario.palestrante;

                // Ações/Links
                const seminarActions = document.createElement("div");
                seminarActions.className = "seminar-actions";

                // Link para ver cover (sempre presente)
                const coverLink = document.createElement("a");
                coverLink.className = "seminar-link cover";
                coverLink.href = "#";
                coverLink.textContent = "Folder Divulgação";
                coverLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    showCoverModal(seminario);
                });
                seminarActions.appendChild(coverLink);

                // Link para o evento (se disponível)
                if (seminario.link && seminario.link.trim() !== "") {
                    const eventLink = document.createElement("a");
                    eventLink.className = "seminar-link";
                    eventLink.href = seminario.link;
                    eventLink.target = "_blank";
                    eventLink.rel = "noopener noreferrer";
                    eventLink.textContent = seminario.linktipo || "Acessar Evento";
                    seminarActions.appendChild(eventLink);
                }

                // Link para vídeo (se disponível)
                if (seminario.video && seminario.video.trim() !== "") {
                    const videoLink = document.createElement("a");
                    videoLink.className = "seminar-link video";
                    videoLink.href = seminario.video;
                    videoLink.target = "_blank";
                    videoLink.rel = "noopener noreferrer";
                    videoLink.textContent = "Assistir Vídeo";
                    seminarActions.appendChild(videoLink);
                }

                // Link para bio (se disponível)
                if (seminario.bio && seminario.bio.trim() !== "") {
                    const bioLink = document.createElement("a");
                    bioLink.className = "seminar-link bio";
                    bioLink.href = seminario.bio;
                    bioLink.target = "_blank";
                    bioLink.rel = "noopener noreferrer";
                    bioLink.textContent = "Bio e Resumo";
                    seminarActions.appendChild(bioLink);
                }

                // Link para inscrições (se disponível)
                if (seminario.inscricoes && seminario.inscricoes.trim() !== "") {
                    const inscricoesLink = document.createElement("a");
                    inscricoesLink.className = "seminar-link inscricoes";
                    inscricoesLink.href = seminario.inscricoes;
                    inscricoesLink.target = "_blank";
                    inscricoesLink.rel = "noopener noreferrer";
                    inscricoesLink.textContent = "Inscrições";
                    seminarActions.appendChild(inscricoesLink);
                }

                // Monta a estrutura
                seminarItem.appendChild(seminarHeader);
                seminarItem.appendChild(seminarTitle);
                seminarItem.appendChild(seminarSpeaker);
                seminarItem.appendChild(seminarActions);

                listaSeminarios.appendChild(seminarItem);
            });
        } else {
            listaSeminarios.innerHTML = `<div class="no-seminars"><p>Não há seminários disponíveis para este período.</p></div>`;
        }        
    }

    // Adiciona efeitos de hover para melhor interação
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.seminar-item')) {
            const item = e.target.closest('.seminar-item');
            // Adicionar efeitos se necessário
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.seminar-item')) {
            const item = e.target.closest('.seminar-item');
            // Remover efeitos se necessário
        }
    });

    // Função para converter data brasileira para objeto Date
    function parseDataBrasileira(dataString) {
        try {
            // Mapear nomes dos meses para números (0-11)
            const meses = {
                'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
                'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
                'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
            };
            
            // Limpar e dividir a string da data
            const dataLimpa = dataString.toLowerCase()
                .replace(/\s+de\s+/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            const partes = dataLimpa.split(' ');
            
            if (partes.length >= 3) {
                const dia = parseInt(partes[0]);
                const mesNome = partes[1].toLowerCase();
                const ano = parseInt(partes[2]);
                const mesNumero = meses[mesNome];
                
                if (mesNumero !== undefined && !isNaN(dia) && !isNaN(ano)) {
                    return new Date(ano, mesNumero, dia);
                }
            }
            
            return new Date(0); // Fallback
        } catch (error) {
            console.error('Erro ao processar data:', dataString, error);
            return new Date(0);
        }
    }
    function showCoverModal(seminario) {
        const modal = document.getElementById('coverModal');
        const modalImage = document.getElementById('modalCoverImage');
        const modalTitle = document.getElementById('modalCoverTitle');
        const modalSpeaker = document.getElementById('modalCoverSpeaker');

        modalImage.src = seminario.cover;
        modalImage.alt = `Cover - ${seminario.titulo}`;
        modalTitle.textContent = seminario.titulo;
        modalSpeaker.textContent = seminario.palestrante;

        modal.style.display = 'block';
    }

    // Funcionalidade do modal
    const modal = document.getElementById('coverModal');
    const closeBtn = modal.querySelector('.custom-close');

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Log para debug
    console.log('Página de Seminários carregada com sucesso!');
});