const API_URL = 'http://127.0.0.1:8000/excursions';
const IS_ADMIN = true;
let currentPage = 1;
const PAGE_LIMIT = 6; // или получай из select


document.addEventListener('DOMContentLoaded', () => {
  if (IS_ADMIN) {
    const adminSection = document.getElementById('adminSection');
    if (adminSection) adminSection.style.display = 'block';
  }

  const form = document.getElementById('excursionForm');
  if (form) form.addEventListener('submit', handleSubmit);

  const loadBtn = document.getElementById('loadBtn');
  if (loadBtn) loadBtn.addEventListener('click', loadExcursions);

  const limitSelect = document.getElementById('limitSelect');
  if (limitSelect) limitSelect.addEventListener('change', loadExcursions);

  if (window.location.pathname.endsWith('excursion.html')) {
    loadExcursionById();
  } else {
    loadExcursions();
  }
});

function getPhotoUrl(path) {
  return path.startsWith('http') ? path : `http://127.0.0.1:8000/${path}`;
}

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const gid = form.gid.value.trim();
  const date = new Date(form.date.value).toISOString();
  const photoFile = form.photo.files[0];
  const status = document.getElementById('postResult');

  if (!name || !gid || !date || !photoFile) {
    showStatus('❌ Все обязательные поля должны быть заполнены', status);
    return;
  }

  const queryParams = new URLSearchParams({ name, gid, date });

  const priceRaw = form.price.value.trim();
  const maxRaw = form.max_people.value.trim();

  if (priceRaw) {
    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
      showStatus('❌ Цена должна быть неотрицательной', status);
      return;
    }
    queryParams.append('price', price.toString());
  }

  if (maxRaw) {
    const max_people = parseInt(maxRaw, 10);
    if (isNaN(max_people) || max_people < 5) {
      showStatus('❌ Максимум человек должен быть ≥ 5', status);
      return;
    }
    queryParams.append('max_people', max_people.toString());
  }

  const formData = new FormData();
  formData.append('photo', photoFile);

  try {
    const res = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'POST',
      body: formData
    });

    const text = await res.text();
    showStatus(res.ok ? '✅ Успешно добавлено!' : `❌ Ошибка: ${text}`, status);

    if (res.ok) {
      form.reset();
      loadExcursions();
    }
  } catch {
    showStatus('❌ Ошибка соединения', status);
  }
}

function showStatus(message, element) {
  element.innerText = message;
  element.classList.add('show-status');
  setTimeout(() => element.classList.remove('show-status'), 2000);
}

async function loadExcursions() {
  const limit = parseInt(document.getElementById('limitSelect').value, 10);

  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const container = document.getElementById('excursionGrid');
    container.innerHTML = '';

    data.slice(0, limit).forEach(item => {
      const card = document.createElement('div');
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p><strong>Гид:</strong> ${item.gid}</p>
        <p><strong>Дата:</strong> ${item.date}</p>
        <p><strong>Цена:</strong> ${item.price} BYN</p>
        <p><strong>Мест:</strong> ${item.actual_people}/${item.max_people ?? '∞'}</p>
        ${item.photo ? `<img src="${getPhotoUrl(item.photo)}" alt="Фото экскурсии" />` : ''}
      `;
      card.addEventListener('click', () => {
        window.location.href = `excursion.html?id=${item.id}`;
      });
      container.appendChild(card);
    });
  } catch {
    document.getElementById('excursionGrid').innerText = '❌ Не удалось загрузить данные';
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadExcursionById() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Ошибка загрузки');

    const item = await res.json();

    // Заполнение текстовых полей
    document.getElementById('excName').textContent = item.name;
    document.getElementById('excGid').textContent = item.gid;
    document.getElementById('excDate').textContent = formatDate(item.date);
    document.getElementById('excCreated').textContent = formatDate(item.created);
    document.getElementById('excPrice').textContent = item.price;
    document.getElementById('excPeople').textContent = `${item.actual_people}/${item.max_people ?? '∞'}`;

    // Фото
    if (item.photo) {
      document.getElementById('excPhoto').innerHTML = `<img src="${getPhotoUrl(item.photo)}" alt="Фото экскурсии" />`;
    }

    // Круг занятости
    const percent = item.max_people
      ? Math.round((item.actual_people / item.max_people) * 100)
      : 0;

    const circle = document.getElementById('circleProgress');
    const text = document.getElementById('circleText');

    if (circle && text) {
      circle.style.setProperty('--percent', `${percent}`);
      circle.setAttribute('stroke-dasharray', `0, 100`);
      setTimeout(() => {
      animateCircle(circle, percent);
      }, 100);

      text.textContent = `${percent}%`;

      if (percent < 50) {
        circle.setAttribute('stroke', '#4caf50');
      } else if (percent < 80) {
        circle.setAttribute('stroke', '#ff9800');
      } else {
        circle.setAttribute('stroke', '#f44336');
      }
    }

    // Кнопка бронирования
    const bookBtn = document.getElementById('bookBtn');
    const bookStatus = document.getElementById('bookStatus');

    if (item.max_people && item.actual_people >= item.max_people) {
      bookBtn.disabled = true;
      bookStatus.textContent = '❌ Все места заняты';
    } else {
      bookBtn.disabled = false;
      bookStatus.textContent = '';
      bookBtn.onclick = () => {
        document.getElementById('confirmModal').classList.remove('hidden');
      };

      document.getElementById('confirmNo').onclick = () => {
        document.getElementById('confirmModal').classList.add('hidden');
      };

      document.getElementById('confirmYes').onclick = async () => {
        document.getElementById('confirmModal').classList.add('hidden');
        try {
          const res = await fetch(`${API_URL}/book/${item.id}`, { method: 'POST' });
          if (!res.ok) throw new Error('Ошибка бронирования');

          bookStatus.textContent = '✅ Место успешно забронировано';
          bookBtn.disabled = true;

          item.actual_people += 1;
          document.getElementById('excPeople').textContent = `${item.actual_people}/${item.max_people ?? '∞'}`;
          const newPercent = item.max_people
            ? Math.round((item.actual_people / item.max_people) * 100)
            : 0;
          animateCircle(circle, newPercent);
          text.textContent = `${newPercent}%`;

          if (newPercent < 50) {
            circle.setAttribute('stroke', '#4caf50');
          } else if (newPercent < 80) {
            circle.setAttribute('stroke', '#ff9800');
          } else {
            circle.setAttribute('stroke', '#f44336');
          }
        } catch {
          bookStatus.textContent = '❌ Не удалось забронировать';
        }
      };

    }
  } catch (err) {
    document.querySelector('.container').innerHTML = '❌ Не удалось загрузить экскурсию';
    console.error(err);
  }
}

function animateCircle(circle, targetPercent) {
  let current = 0;
  const existing = circle.getAttribute('stroke-dasharray');
  if (existing) {
    const parts = existing.split(',');
    current = parseFloat(parts[0]) || 0;
  }

  const step = () => {
    current += 2;
    if (current > targetPercent) current = targetPercent;
    circle.setAttribute('stroke-dasharray', `${current}, 100`);
    if (current < targetPercent) {
      requestAnimationFrame(step);
    }
  };
  requestAnimationFrame(step);
}


