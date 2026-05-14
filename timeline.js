const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

document.addEventListener('DOMContentLoaded', () => {
  const userInfo = document.getElementById('user-info');
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    userInfo.textContent = `Привет, ${tg.initDataUnsafe.user.first_name}!`;
  }

  loadTimelineData();
  setupFilters();
});

async function loadTimelineData() {
  const container = document.getElementById('timeline-container');
  try {
    const response = await fetch('data/discoveries.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderTimeline(data, container);
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    container.innerHTML = `<p class="error-msg">Не удалось загрузить данные.<br>Убедитесь, что файл <code>data/discoveries.json</code> существует.</p>`;
  }
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

      const card = document.createElement('div');
      card.className = 'tl-card';
      card.innerHTML = `
        <div class="card-emoji-banner">${item.emoji || '🔬'}</div>
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

function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.cat);
    });
  });
}

function applyFilter(category) {
  document.querySelectorAll('.tl-item.open').forEach(el => el.classList.remove('open'));

  document.querySelectorAll('.tl-item').forEach(item => {
    if (category === 'all' || item.dataset.category === category) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });

  document.querySelectorAll('.epoch-section').forEach(section => {
    const visible = section.querySelectorAll('.tl-item:not(.hidden)').length;
    section.classList.toggle('all-hidden', visible === 0);
  });
}