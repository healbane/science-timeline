// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Разворачиваем приложение на максимальную высоту
tg.expand();
tg.ready();

document.addEventListener('DOMContentLoaded', () => {
    // Вывод имени пользователя, если открыто в Telegram
    const userInfo = document.getElementById('user-info');
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        userInfo.textContent = `Привет, ${tg.initDataUnsafe.user.first_name}!`;
    }

    loadTimelineData();
});

async function loadTimelineData() {
    const container = document.getElementById('timeline-container');

    try {
        // Запрос к JSON. Путь указан относительно index.html.
        // Согласно структуре, папка data находится на одном уровне с webapp.
        const response = await fetch('../data/discoveries.json');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        renderTimeline(data, container);

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        container.innerHTML = `<p style="color: red; text-align: center;">Ошибка загрузки базы данных открытий. Убедитесь, что discoveries.json доступен по пути ../data/discoveries.json.</p>`;
    }
}

function renderTimeline(data, container) {
    container.innerHTML = ''; // Очистка лоадера

    // Ожидаемая структура data: [{ epoch: "XVIII век", items: [{ year: "1711", title: "...", desc: "..." }] }]
    data.forEach(epochData => {
        const section = document.createElement('section');
        section.className = 'epoch-section';

        const title = document.createElement('h2');
        title.className = 'epoch-title';
        title.textContent = epochData.epoch;
        section.appendChild(title);

        epochData.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';

            div.innerHTML = `
                <div class="item-year">${item.year}</div>
                <h3 class="item-title">${item.title}</h3>
                <p class="item-desc">${item.desc}</p>
            `;

            section.appendChild(div);
        });

        container.appendChild(section);
    });
}