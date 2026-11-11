let calendarData = {};

document.addEventListener('DOMContentLoaded', function () {

    const select = document.getElementById("semesterSelect");

    // Carrega o calendário e preenche o seletor (o ano mais recente fica como padrão)
    i18n.ready
        .then(() => i18n.fetchJSON("JSON/agenda_academica.json"))
        .then(data => {
            calendarData = data;
            select.innerHTML = "";

            const keys = Object.keys(data).sort().reverse();
            keys.forEach(key => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = key.split("-")[0];
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
        const dados = calendarData[selectedSemester];
        if (!dados) return;

        // Atualiza o título baseado no título do JSON
        const titleElement = document.getElementById("semesterTitle");
        if (titleElement) {
            titleElement.textContent = dados.titulo || i18n.t('agenda.titulo_padrao', 'Calendário Acadêmico - 2025');
        }

        const monthsList = document.querySelector(".months-list");
        monthsList.innerHTML = "";

        if (dados.eventos && dados.eventos.length > 0) {
            dados.eventos.forEach((monthData, index) => {
                const monthItem = document.createElement("div");
                monthItem.className = "month-item";
                monthItem.style.animationDelay = `${(index + 1) * 0.1}s`;

                // Header do mês
                const monthHeader = document.createElement("div");
                monthHeader.className = "month-header";

                const monthName = document.createElement("h3");
                monthName.className = "month-name";
                monthName.textContent = monthData.mes;

                monthHeader.appendChild(monthName);

                // Conteúdo do mês
                const monthContent = document.createElement("div");
                monthContent.className = "month-content";

                if (monthData.eventos && monthData.eventos.length > 0) {
                    const eventsList = document.createElement("ul");
                    eventsList.className = "events-list";

                    monthData.eventos.forEach(evento => {
                        const eventItem = document.createElement("li");
                        eventItem.className = "event-item";

                        // Data do evento
                        const eventDate = document.createElement("div");
                        eventDate.className = "event-date";
                        eventDate.textContent = evento.periodo;

                        // Conteúdo do evento
                        const eventContent = document.createElement("div");
                        eventContent.className = "event-content";

                        const eventDescription = document.createElement("p");
                        eventDescription.className = "event-description";
                        eventDescription.textContent = evento.evento;

                        eventContent.appendChild(eventDescription);
                        eventItem.appendChild(eventDate);
                        eventItem.appendChild(eventContent);
                        eventsList.appendChild(eventItem);
                    });

                    monthContent.appendChild(eventsList);
                } else {
                    // Mês sem eventos
                    const emptyMonth = document.createElement("div");
                    emptyMonth.className = "empty-month";
                    emptyMonth.innerHTML = `<p>${i18n.t('agenda.mes_vazio', 'Nenhum evento programado para este mês')}</p>`;
                    monthContent.appendChild(emptyMonth);
                }

                monthItem.appendChild(monthHeader);
                monthItem.appendChild(monthContent);
                monthsList.appendChild(monthItem);
            });
        } else {
            monthsList.innerHTML = `<div class="no-events"><p>${i18n.t('agenda.sem_eventos', 'Não há eventos programados para este período.')}</p></div>`;
        }        
    }

    // Log para debug
    console.log('Página de Agenda Acadêmica carregada com sucesso!');
});