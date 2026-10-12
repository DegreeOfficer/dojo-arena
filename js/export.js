// Official entry form as .xlsx (xlsx-js-style, loaded from CDN as window.XLSX).
import { age, fullName } from './fields.js';

const COLUMNS = [
    ['№', 5], ['Фамилия Имя Отчество', 30], ['Дата рождения', 13], ['Возраст', 8], ['Пол', 5],
    ['Вес, кг', 8], ['Рост, см', 8], ['Весовая категория', 14], ['Пояс', 20], ['Разряд', 10],
    ['Город', 14], ['Тренер', 22], ['Допуск врача (подпись, печать)', 22], ['Страховка', 10], ['Примечание', 22],
];

// cell with explicit type: without `t` SheetJS writes nothing
const c = (v, s) => ({ v, t: typeof v === 'number' ? 'n' : 's', s });

const ruDate = d => (d ? new Date(d).toLocaleDateString('ru-RU') : '');

const border = { style: 'thin', color: { rgb: '555555' } };
const boxed = { top: border, bottom: border, left: border, right: border };
const S = {
    title: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } },
    sub: { font: { sz: 12 }, alignment: { horizontal: 'center' } },
    meta: { font: { sz: 11 } },
    head: { font: { bold: true, sz: 10 }, fill: { fgColor: { rgb: 'EFE6D2' } }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: boxed },
    cell: { font: { sz: 10 }, alignment: { vertical: 'center', wrapText: true }, border: boxed },
    center: { font: { sz: 10 }, alignment: { horizontal: 'center', vertical: 'center' }, border: boxed },
    sign: { font: { sz: 11 } },
};

export function exportEntry(coach, participants) {
    const XLSX = window.XLSX;
    if (!XLSX) throw new Error('Библиотека Excel ещё загружается — попробуйте через пару секунд.');

    const at = coach.date ? new Date(coach.date) : new Date();
    const rows = [
        [c('ЗАЯВКА', S.title)],
        [c(`на участие в соревнованиях: ${coach.tournament || ''}`, S.sub)],
        [],
        [c(`Дата и место проведения: ${[ruDate(coach.date), coach.place].filter(Boolean).join(', ') || '—'}`, S.meta)],
        [c(`Команда (клуб): ${coach.club || ''}${coach.city ? ', г. ' + coach.city : ''}`, S.meta)],
        [c(`Тренер: ${coach.coach || ''}${coach.phone ? ', тел. ' + coach.phone : ''}`, S.meta)],
        [],
        COLUMNS.map(([h]) => c(h, S.head)),
    ];
    const headRow = rows.length - 1;

    participants.forEach((p, i) => {
        rows.push([
            c(i + 1, S.center),
            c(fullName(p), S.cell),
            c(ruDate(p.birthDate), S.center),
            c(age(p.birthDate, at), S.center),
            c(p.gender || '', S.center),
            c(p.weight ? Number(p.weight) : '', S.center),
            c(p.height ? Number(p.height) : '', S.center),
            c(p.weightClass || '', S.center),
            c(p.belt || '', S.cell),
            c(p.rank || '', S.center),
            c(p.city || '', S.cell),
            c(p.coach || coach.coach || '', S.cell),
            c(p.medical ? 'допущен' : '', S.center),
            c(p.insurance ? 'есть' : '', S.center),
            c(p.note || '', S.cell),
        ]);
    });

    rows.push([], [c(`Всего участников: ${participants.length}`, S.meta)], []);
    rows.push([c(`Тренер ______________________ / ${coach.coach || ''} /`, S.sign)]);
    rows.push([], [c('Допущено к соревнованиям ____ человек.   Врач ______________________ / ____________________ /', S.sign)]);
    rows.push([], [c('Руководитель клуба ______________________          М.П.', S.sign)]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const last = COLUMNS.length - 1;
    ws['!merges'] = [0, 1].map(r => ({ s: { r, c: 0 }, e: { r, c: last } }));
    ws['!cols'] = COLUMNS.map(([, w]) => ({ wch: w }));
    ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 24 };
    ws['!rows'][headRow] = { hpt: 32 };
    ws['!margins'] = { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Заявка');
    const safe = (coach.tournament || 'турнир').replace(/[\\/:*?"<>|«»]+/g, '').trim().slice(0, 40);
    XLSX.writeFile(wb, `Заявка — ${safe} — ${new Date().toLocaleDateString('ru-RU')}.xlsx`);
}
