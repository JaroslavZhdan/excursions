const API_URL = 'http://127.0.0.1:8000/excursions';
const IS_ADMIN = true; // ← поменяй на false, если пользователь не админ

document.addEventListener('DOMContentLoaded', () => {
  if (IS_ADMIN) {
    document.getElementById('adminSection').style.display = 'block';
  }

  document.getElementById('excursionForm').addEventListener('submit', handleSubmit);
  document.getElementById('loadBtn').addEventListener('click', loadExcursions);
  document.getElementById('limitSelect').addEventListener('change', loadExcursions);

  loadExcursions();
});

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const gid = form.gid.value.trim();
  const date = new Date(form.date.value).toISOString();
  const photoFile = form.photo.files[0];

  if (!name || !gid || !date || !photoFile) {
    document.getElementById('postResult').innerText = '❌ Все поля обязательны';
    return;
  }

  const queryParams = new URLSearchParams({ name, gid, date });
  const formData = new FormData();
  formData.append('photo', photoFile);

  try {
    const res = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: 'POST',
      body: formData
    });

    const text = await res.text();
    document.getElementById('postResult').innerText = res.ok
      ? '✅ Успешно добавлено!'
      : `❌ Ошибка: ${text}`;

    if (res.ok) {
      form.reset();
      loadExcursions();
    }
  } catch (err) {
    document.getElementById('postResult').innerText = '❌ Ошибка соединения';
  }
}

function getPhotoUrl(path) {
  // Если путь уже абсолютный — возвращаем как есть
  if (path.startsWith('http')) return path;
  // Иначе добавляем базовый адрес
  return `http://127.0.0.1:8000/${path}`;
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
        ${item.photo ? `<img src="${getPhotoUrl(item.photo)}" alt="Фото экскурсии" />` : ''}
      `;
      container.appendChild(card);
    });
  } catch (err) {
    document.getElementById('excursionGrid').innerText = '❌ Не удалось загрузить данные';
  }
}
