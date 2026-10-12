// Participant card fields. The same list drives the form, the roster label and the Excel columns.

export const BELTS = [
    '10 гып (белый)', '9 гып (бело-жёлтый)', '8 гып (жёлтый)', '7 гып (жёлто-зелёный)',
    '6 гып (зелёный)', '5 гып (зелёно-синий)', '4 гып (синий)', '3 гып (сине-красный)',
    '2 гып (красный)', '1 гып (красно-чёрный)', '1 дан', '2 дан', '3 дан', '1 пум', '2 пум',
];

export const RANKS = ['б/р', '3 юн.', '2 юн.', '1 юн.', '3 разряд', '2 разряд', '1 разряд', 'КМС', 'МС'];

export const FIELDS = [
    { key: 'lastName', label: 'Фамилия', required: true },
    { key: 'firstName', label: 'Имя', required: true },
    { key: 'middleName', label: 'Отчество' },
    { key: 'birthDate', label: 'Дата рождения', type: 'date', required: true },
    { key: 'gender', label: 'Пол', type: 'select', options: ['М', 'Ж'], required: true },
    { key: 'height', label: 'Рост, см', type: 'number', min: 80, max: 230 },
    { key: 'weight', label: 'Вес, кг', type: 'number', min: 10, max: 150, step: 0.1, required: true },
    { key: 'weightClass', label: 'Весовая категория', placeholder: 'напр. до 45 кг' },
    { key: 'belt', label: 'Пояс', type: 'select', options: BELTS, required: true },
    { key: 'rank', label: 'Спортивный разряд', type: 'select', options: RANKS },
    { key: 'city', label: 'Город' },
    { key: 'coach', label: 'Тренер' },
    { key: 'medical', label: 'Допуск врача есть', type: 'checkbox' },
    { key: 'insurance', label: 'Страховка есть', type: 'checkbox' },
    { key: 'note', label: 'Примечание', type: 'textarea', wide: true },
];

export function age(birthDate, at = new Date()) {
    if (!birthDate) return '';
    const b = new Date(birthDate);
    if (Number.isNaN(b.getTime())) return '';
    let a = at.getFullYear() - b.getFullYear();
    const m = at.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && at.getDate() < b.getDate())) a--;
    return a >= 0 ? a : '';
}

export const isFilled = p => !!p && FIELDS.filter(f => f.required).every(f => String(p[f.key] ?? '').trim() !== '');

export const shortName = p => `${p.lastName} ${p.firstName ? p.firstName[0] + '.' : ''}`.trim();

export const fullName = p => [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ');
