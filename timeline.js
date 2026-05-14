const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let allData = []; 

document.addEventListener('DOMContentLoaded', () => {
  const userInfo = document.getElementById('user-info');
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    userInfo.textContent = `Привет, ${tg.initDataUnsafe.user.first_name}!`;
  }
  loadTimelineData();
});

async function loadTimelineData() {
  const container = document.getElementById('timeline-container');
  try {
    // Исправленный путь: ./data/... гарантирует поиск от корня сайта
    const response = await fetch('./data/discoveries.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    allData = await response.json();
    
    // Сначала создаем кнопки, потом рисуем ленту
    createFilterButtons(allData);
    renderTimeline(allData);
    
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    container.innerHTML = `<p class="error-msg">Ошибка: ${error.message}. Проверьте наличие файла в /data/discoveries.json</p>`;
  }
}

function createFilterButtons(data) {
    const filterContainer = document.getElementById('filter-buttons');
    if (!filterContainer) return;
    
    // 1. Очищаем контейнер
    filterContainer.innerHTML = '';

    // 2. Создаем массив из всех нужных нам кнопок (сначала "Все", потом остальные)
    const buttonsToCreate = [
        { label: 'Все эпохи', epoch: 'all' },
        ...data.map(item => ({ label: item.epoch.split(' (')[0], epoch: item.epoch }))
    ];

    // 3. Создаем кнопки в одном цикле, чтобы у каждой был рабочий обработчик
    buttonsToCreate.forEach((btnInfo, index) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (btnInfo.epoch === 'all' ? ' active' : '');
        btn.textContent = btnInfo.label;
        btn.dataset.epoch = btnInfo.epoch;
        
        btn.addEventListener('click', (e) => {
            // Убираем активный класс у всех и ставим текущей
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Фильтруем данные
            const selected = e.target.dataset.epoch;
            if (selected === 'all') {
                renderTimeline(allData); // Показываем всё
            } else {
                renderTimeline(allData.filter(d => d.epoch === selected)); // Фильтруем
            }
        });
        
        filterContainer.appendChild(btn);
    });
}
function renderTimeline(data) {
  const container = document.getElementById('timeline-container');
  container.innerHTML = ''; 

  data.forEach((epochData, epochIndex) => {
    const section = document.createElement('section');
    section.className = 'epoch-section';
    section.innerHTML = `<h2 class="epoch-title">${epochData.epoch}</h2>`;

    const line = document.createElement('div');
    line.className = 'tl-line';

    epochData.items.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'tl-item';

      const dot = document.createElement('div');
      dot.className = 'tl-dot';

      const btn = document.createElement('button');
      btn.className = 'tl-btn';
      btn.innerHTML = `
        <span class="tl-year">${item.year}</span>
        <span class="tl-title">${item.title}</span>
      `;

      const mediaBanner = item.image 
        ? `<img src="${item.image}" class="card-img" alt="${item.title}" onerror="this.style.display='none'"/>`
        : '';

      const card = document.createElement('div');
      card.className = 'tl-card';
      card.innerHTML = `
        ${mediaBanner}
        <div class="card-body">
          <div class="card-meta">
            <span class="card-year-badge">${item.year}</span>
          </div>
          <div class="card-title">${item.title}</div>
          <div class="card-desc">${item.desc}</div>
        </div>
      `;

      btn.addEventListener('click', () => {
        const isOpen = wrap.classList.contains('open');
        document.querySelectorAll('.tl-item.open').forEach(el => el.classList.remove('open'));
        if (!isOpen) wrap.classList.add('open');
      });

      wrap.appendChild(dot);
      wrap.appendChild(btn);
      wrap.appendChild(card);
      line.appendChild(wrap);
    });

    section.appendChild(line);
    container.appendChild(section);
  });
}
