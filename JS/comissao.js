let comissaoData = {};

document.addEventListener('DOMContentLoaded', function () {

    function formatPeriod(key) {
        if (key === 'atual') {
            return 'Atual Formação';
        }
        return key.replace('-', ' a ');
    }

    const select = document.getElementById("periodSelect");

    fetch("JSON/comissao.json")
        .then(response => response.json())
        .then(data => {
            comissaoData = data;
            select.innerHTML = "";

            const keys = Object.keys(data);
            // Ordenar para mostrar 'atual' primeiro, depois os períodos em ordem reversa
            keys.sort((a, b) => {
                if (a === 'atual') return -1;
                if (b === 'atual') return 1;
                return b.localeCompare(a);
            });

            keys.forEach(key => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = formatPeriod(key);
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

    function updateContent(selectedPeriod) {
        const dados = comissaoData[selectedPeriod];
        if (!dados) return;

        document.getElementById("periodTitle").textContent = formatPeriod(selectedPeriod);
        document.getElementById("comissaoTitle").textContent = dados.titulo;

        const listaMembros = document.querySelector(".members-list");
        listaMembros.innerHTML = "";

        if (dados.membros && dados.membros.length > 0) {
            dados.membros.forEach(membro => {
                const memberItem = document.createElement("div");
                memberItem.className = "member-item";

                const memberContent = document.createElement("div");
                memberContent.className = "member-content";

                const memberName = document.createElement("h4");
                memberName.textContent = membro.nome;

                const memberRole = document.createElement("p");
                memberRole.textContent = membro.cargo;

                memberContent.appendChild(memberName);
                memberContent.appendChild(memberRole);
                memberItem.appendChild(memberContent);
                listaMembros.appendChild(memberItem);
            });
        } else {
            listaMembros.innerHTML = `<div class="no-members"><p>Não há informações de membros disponíveis para este período.</p></div>`;
        }        
    }
});

