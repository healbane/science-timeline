const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

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
    // Если index.html лежит в корне, а JSON в папке data/
    const response = await fetch('./data/discoveries.json');

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    allData = data; // Сохраняем для фильтров

    createFilterButtons(data);
    renderTimeline(data, container);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    container.innerHTML = `<p class="error-msg">Ошибка: ${error.message}</p>`;
  }
}
function createFilterButtons(data) {
    const filterContainer = document.getElementById('filter-buttons');

    data.forEach(epochData => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = epochData.epoch.split(' (')[0]; // Укорачиваем название для кнопок
        btn.dataset.epoch = epochData.epoch;

        btn.addEventListener('click', (e) => {
            // Смена активной кнопки
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Фильтрация
            const selected = e.target.dataset.epoch;
            if (selected === 'all') {
                renderTimeline(allData);
            } else {
                const filtered = allData.filter(d => d.epoch === selected);
                renderTimeline(filtered);
            }
        });

        filterContainer.appendChild(btn);
    });
}

function renderTimeline(data, container) {
  container.innerHTML = '';

  data.forEach((epochData, epochIndex) => {
    const section = document.createElement('section');
    section.className = 'epoch-section';

    const title = document.createElement('div');
    title.className = 'epoch-title';
    title.textContent = epochData.epoch;
    section.appendChild(title);

    const line = document.createElement('div');
    line.className = 'tl-line';

    epochData.items.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'tl-item';
      wrap.dataset.category = item.category || '';

      const dot = document.createElement('div');
      dot.className = 'tl-dot';

      const btn = document.createElement('button');
      btn.className = 'tl-btn';
      btn.innerHTML = `
        <span class="tl-year">${item.year}</span>
        <span class="tl-name">${item.title}</span>
        <span class="tl-chevron">▼</span>
      `;

      // Картинка если есть, иначе серый плейсхолдер
      const mediaBanner = item.image
        ? `<img src="${item.image}" class="card-img" alt="${item.title}" />`
        : `<div class="card-img-placeholder"><span>Нет изображения</span></div>`;

      const card = document.createElement('div');
      card.className = 'tl-card';
      card.innerHTML = `
        ${mediaBanner}
        <div class="card-body">
          <div class="card-meta">
            <span class="card-year-badge">${item.year}</span>
            <span class="card-category">${item.category || ''}</span>
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

    if (epochIndex < data.length - 1) {
      const sep = document.createElement('div');
      sep.className = 'epoch-sep';
      container.appendChild(sep);
    }
  });
}


  document.querySelectorAll('.epoch-section').forEach(section => {
    const visible = section.querySelectorAll('.tl-item:not(.hidden)').length;
    section.classList.toggle('all-hidden', visible === 0);
  });
}
