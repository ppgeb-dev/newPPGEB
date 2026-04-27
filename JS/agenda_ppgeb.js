let calendarData = {};

document.addEventListener('DOMContentLoaded', function () {

    // Carrega diretamente os dados do calendário 2026
    fetch("JSON/agenda_academica.json")
        .then(response => response.json())
        .then(data => {
            calendarData = data;
            // Carrega diretamente o calendário de 2026
            updateContent("2026-1");
        })
        .catch(error => {
            console.error("Erro ao carregar JSON:", error);
        });

    function updateContent(selectedSemester) {
        const dados = calendarData[selectedSemester];
        if (!dados) return;

        // Atualiza o título baseado no título do JSON
        const titleElement = document.getElementById("semesterTitle");
        if (titleElement) {
            titleElement.textContent = dados.titulo || "Calendário Acadêmico - 2025";
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
                    emptyMonth.innerHTML = "<p>Nenhum evento programado para este mês</p>";
                    monthContent.appendChild(emptyMonth);
                }

                monthItem.appendChild(monthHeader);
                monthItem.appendChild(monthContent);
                monthsList.appendChild(monthItem);
            });
        } else {
            monthsList.innerHTML = `<div class="no-events"><p>Não há eventos programados para este período.</p></div>`;
        }        
    }

    // Log para debug
    console.log('Página de Agenda Acadêmica carregada com sucesso!');
});