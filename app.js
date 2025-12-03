// --- DADOS (IMUTÁVEIS) ---
const MODULES = {
  A: {
    name: "Módulo A: Força G",
    desc: "Superior (Ombros e Pescoço)",
    colorClass: "mod-A",
    exercises: [
      { name: "Desenvolvimento Ombros Halteres", sets: "3x 12-15" },
      { name: "Elevação Lateral", sets: "4x 15" },
      { name: "Encolhimento Trapézio", sets: "3x 15-20" },
      { name: "Isometria de Pescoço", sets: "3x 15s" },
      { name: "Flexão de Braço", sets: "3x Falha" },
    ],
  },
  B: {
    name: "Módulo B: Frenagem",
    desc: "Inferior (Pernas e Glúteo)",
    colorClass: "mod-B",
    exercises: [
      { name: "Leg Press 45º", sets: "4x 8-10 (Explosivo)" },
      { name: "Cadeira Extensora", sets: "3x 12" },
      { name: "Agachamento Goblet", sets: "3x 12" },
      { name: "Panturrilha Sentado", sets: "4x 15-20" },
      { name: "Prancha Abdominal", sets: "3x 1 min" },
    ],
  },
  C: {
    name: "Módulo C: Cockpit",
    desc: "Core e Antebraço (Pegada)",
    colorClass: "mod-C",
    exercises: [
      { name: "Pallof Press (Polia)", sets: "3x 12/lado" },
      { name: "Remada Baixa", sets: "3x 12" },
      { name: "Rosca Punho", sets: "3x Falha" },
      { name: "Farmer's Walk", sets: "3x 40m" },
      { name: "Russian Twist", sets: "3x 20" },
    ],
  },
  D: {
    name: "Módulo D: Ritmo",
    desc: "Cardio HIIT e Reflexo",
    colorClass: "mod-D",
    exercises: [
      { name: "HIIT Bike/Esteira", sets: "20 min (1:1)" },
      { name: "Reflexo c/ Bola Tênis", sets: "10 min" },
      { name: "Alongamento Completo", sets: "15 min" },
    ],
  },
}

const DAYS_KEY_MAP = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"]
const DAY_LABELS = {
  seg: "SEGUNDA",
  ter: "TERÇA",
  qua: "QUARTA",
  qui: "QUINTA",
  sex: "SEXTA",
  sab: "SÁBADO",
  dom: "DOMINGO",
}

const app = {
  // Carrega do LocalStorage ou usa padrão
  schedule: JSON.parse(localStorage.getItem("kartFit_week")) || {
    seg: "A",
    ter: "B",
    qua: "REST",
    qui: "C",
    sex: "D",
    sab: "REST",
    dom: "REST",
  },
  selectedDayForEdit: null,

  init: () => {
    app.renderPlanner()
    app.updateHeaderDate()
  },

  // --- LÓGICA DE NAVEGAÇÃO ---
  switchView: (viewName) => {
    // Alterna classes das seções
    document
      .querySelectorAll(".view")
      .forEach((el) => el.classList.remove("active"))
    document.getElementById(`view-${viewName}`).classList.add("active")

    // Alterna classes da navbar
    document
      .querySelectorAll(".nav-item")
      .forEach((btn) => btn.classList.remove("active"))
    // Seleciona o botão correspondente (truque simples baseado no texto ou index)
    const btnIndex = viewName === "planner" ? 0 : 1
    document.querySelectorAll(".nav-item")[btnIndex].classList.add("active")

    // Se for para o Treino, renderiza o dia de hoje
    if (viewName === "workout") {
      app.renderTodaysWorkout()
    }
  },

  updateHeaderDate: () => {
    const today = new Date()
    const options = { weekday: "long", day: "numeric" }
    document.getElementById("header-day-display").innerText = today
      .toLocaleDateString("pt-BR", options)
      .toUpperCase()
  },

  // --- VIEW 1: PLANNER (AGENDA) ---
  renderPlanner: () => {
    const grid = document.getElementById("week-grid")
    grid.innerHTML = ""

    // Ordem: Seg a Dom (ajuste se quiser começar domingo)
    const orderedDays = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"]

    orderedDays.forEach((dayKey) => {
      const moduleId = app.schedule[dayKey]
      const module = MODULES[moduleId]

      const card = document.createElement("div")
      // Adiciona classe de cor ou padrão
      card.className = `day-card ${module ? module.colorClass : ""}`

      card.innerHTML = `
                <div>
                    <span class="day-label">${DAY_LABELS[dayKey]}</span>
                    <span class="workout-name">${
                      module ? module.name : "Descanso"
                    }</span>
                </div>
                <span class="material-icons-round" style="opacity:0.5">edit</span>
            `

      card.onclick = () => app.openModal(dayKey)
      grid.appendChild(card)
    })
  },

  // --- VIEW 2: EXECUÇÃO (TREINO HOJE) ---
  renderTodaysWorkout: () => {
    const container = document.getElementById("workout-content")
    container.innerHTML = ""

    // Descobre o dia de hoje (0=Dom, 1=Seg...)
    const todayIndex = new Date().getDay()
    const todayKey = DAYS_KEY_MAP[todayIndex]

    const moduleId = app.schedule[todayKey]
    const module = MODULES[moduleId]

    if (!module || moduleId === "REST") {
      container.innerHTML = `
                <div class="rest-state">
                    <span class="material-icons-round rest-icon">nights_stay</span>
                    <h2>Dia de Descanso</h2>
                    <p>Recuperação é parte do treino.<br>Beba água e relaxe a musculatura.</p>
                </div>
            `
      return
    }

    // Cabeçalho do Treino
    let html = `
            <div class="workout-header" style="border-top: 4px solid ${getColor(
              moduleId
            )}">
                <h2 style="color: ${getColor(moduleId)}">${module.name}</h2>
                <p>${module.desc}</p>
            </div>
        `

    // Lista de Exercícios
    module.exercises.forEach((ex, index) => {
      // Link de Busca no Youtube
      const query = encodeURIComponent(`${ex.name} execução exercício`)
      const youtubeLink = `https://www.youtube.com/results?search_query=${query}`

      html += `
                <div class="exercise-item">
                    <label class="check-wrapper">
                        <input type="checkbox">
                        <span class="custom-check"></span>
                    </label>
                    <div class="ex-info">
                        <span class="ex-name">${ex.name}</span>
                        <span class="ex-sets">${ex.sets}</span>
                        <a href="${youtubeLink}" target="_blank" class="btn-youtube">
                            <span class="material-icons-round" style="font-size:14px">play_arrow</span>
                            Ver Execução
                        </a>
                    </div>
                </div>
            `
    })

    container.innerHTML = html
  },

  // --- MODAL DE EDIÇÃO ---
  openModal: (dayKey) => {
    app.selectedDayForEdit = dayKey
    const modal = document.getElementById("selection-modal")
    const container = document.getElementById("module-options")
    document.getElementById("modal-day-label").innerText = DAY_LABELS[dayKey]

    container.innerHTML = ""

    // Botão Descanso
    container.innerHTML += `
            <button class="module-btn" onclick="app.setDay('REST')">
                <strong style="color:#888">Descanso / OFF</strong>
            </button>
        `

    // Botões dos Módulos
    Object.keys(MODULES).forEach((key) => {
      const m = MODULES[key]
      container.innerHTML += `
                <button class="module-btn" onclick="app.setDay('${key}')">
                    <strong style="color:${getColor(key)}">${
        m.name
      }</strong><br>
                    <span style="font-size:0.8rem; color:#888">${m.desc}</span>
                </button>
            `
    })

    modal.classList.remove("hidden")
  },

  setDay: (moduleId) => {
    app.schedule[app.selectedDayForEdit] = moduleId
    localStorage.setItem("kartFit_week", JSON.stringify(app.schedule))
    app.renderPlanner() // Atualiza a visualização da agenda
    app.closeModal()
  },

  closeModal: () => {
    document.getElementById("selection-modal").classList.add("hidden")
  },
}

// Helper para pegar cor
function getColor(modKey) {
  if (modKey === "A") return "#ff0055"
  if (modKey === "B") return "#00d4ff"
  if (modKey === "C") return "#ccee00"
  if (modKey === "D") return "#aa00ff"
  return "#fff"
}

// Inicia App
app.init()
