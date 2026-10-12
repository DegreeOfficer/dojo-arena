import { THEMES } from './themes.js';
import { FIELDS, isFilled, shortName, age } from './fields.js';
import { load, save, reset } from './store.js';
import { exportEntry } from './export.js';

const MAX = 60;
let state = load();
let open = null; // index of the expanded card (not persisted)

const $ = sel => document.querySelector(sel);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const theme = () => THEMES[state.theme] || THEMES.colosseum;
const t = key => theme().texts[key] || key;
const commit = () => { save(state); render(); };

function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.hidden = true; }, 3200);
}

/* ---------- Theme ---------- */
function applyTheme() {
    const th = theme();
    Object.entries(th.vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    document.body.dataset.theme = state.theme;
    $('#logoMark').innerHTML = th.logoMark;
    $('#logoTitle').textContent = state.coach?.club || th.texts.appTitle;
    $('#logoSub').textContent = state.coach?.tournament || th.texts.appSub;
    document.querySelectorAll('[data-text]').forEach(el => { el.textContent = t(el.dataset.text); });
    document.title = `${th.texts.appTitle} — панель тренера`;
}

/* ---------- Header right: registration / participant count ---------- */
function renderTopRight() {
    const box = $('#topRight');
    if (!state.coach) {
        box.innerHTML = `<button type="button" class="btn btn-gold" data-act="register">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>
            <span class="btn-label">${esc(t('regTitle'))}</span></button>`;
        return;
    }
    const n = state.participants.length;
    box.innerHTML = `
        <button type="button" class="coach-chip" data-act="register" title="Изменить данные тренера и турнира">
            <span class="coach-ic">${esc(state.coach.coach.trim()[0] || '?')}</span>
            <span class="btn-label">${esc(state.coach.coach)}</span>
        </button>
        <div class="stepper" title="Количество участников">
            <span class="stepper-label">${esc(t('count'))}</span>
            <button type="button" data-act="dec" aria-label="Убрать участника">−</button>
            <input type="number" id="countInput" min="0" max="${MAX}" value="${n}" aria-label="Количество участников">
            <button type="button" data-act="inc" aria-label="Добавить участника">+</button>
        </div>`;
}

/* ---------- Intro ---------- */
function renderIntro() {
    const el = $('#intro');
    if (!state.coach) {
        el.innerHTML = `<div class="hero">
            <div class="hero-mark">${theme().logoMark}</div>
            <h1 class="h1">${esc(t('introTitle'))}</h1>
            <p>${esc(t('introText'))}</p>
            <button type="button" class="btn btn-gold btn-lg" data-act="register">${esc(t('regTitle'))}</button>
        </div>`;
        return;
    }
    const c = state.coach;
    const when = [c.date ? new Date(c.date).toLocaleDateString('ru-RU') : '', c.place].filter(Boolean).join(' · ');
    const filled = state.participants.filter(isFilled).length;
    el.innerHTML = `<div class="banner">
        <div><span class="eyebrow">Турнир</span><strong>${esc(c.tournament)}</strong>${when ? `<span class="muted">${esc(when)}</span>` : ''}</div>
        <div class="banner-stat"><strong>${filled}</strong><span>из ${state.participants.length} карточек заполнено</span></div>
    </div>`;
}

/* ---------- Roster of numbers ---------- */
function renderRoster() {
    const sec = $('#rosterSection');
    sec.hidden = !state.coach;
    if (!state.coach) return;
    const list = $('#numbers');
    if (!state.participants.length) {
        list.innerHTML = `<p class="muted">Добавьте участников кнопкой «+» справа вверху.</p>`;
        $('#rosterHint').textContent = '';
        return;
    }
    list.innerHTML = state.participants.map((p, i) => {
        const filled = isFilled(p);
        const sel = state.selected.includes(i);
        return `<div class="num ${filled ? 'is-filled' : ''} ${open === i ? 'is-open' : ''} ${sel ? 'is-selected' : ''}" role="listitem">
            <button type="button" class="num-btn" data-act="open" data-i="${i}" title="${filled ? 'Открыть карточку' : esc(t('empty'))}">
                <span class="num-n">${toRoman(i + 1)}</span>
                <span class="num-name">${filled ? esc(shortName(p)) : `№ ${i + 1}`}</span>
            </button>
            ${filled ? `<label class="num-check" title="Включить в заявку"><input type="checkbox" data-act="select" data-i="${i}" ${sel ? 'checked' : ''}><span></span></label>` : ''}
        </div>`;
    }).join('');
    $('#rosterHint').textContent = state.participants.some(isFilled) ? t('filledHint') : 'Нажмите на номер, чтобы заполнить карточку.';
}

function toRoman(n) {
    if (state.theme !== 'colosseum') return String(n);
    const map = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let out = '';
    for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
    return out;
}

/* ---------- Participant card ---------- */
function fieldHtml(f, p) {
    const v = p[f.key] ?? (f.key === 'coach' ? state.coach?.coach : f.key === 'city' ? state.coach?.city : '') ?? '';
    const req = f.required ? 'required' : '';
    const label = `${esc(f.label)}${f.required ? ' *' : ''}`;
    if (f.type === 'checkbox') {
        return `<label class="check"><input type="checkbox" name="${f.key}" ${p[f.key] ? 'checked' : ''}><span>${label}</span></label>`;
    }
    if (f.type === 'select') {
        return `<label class="field"><span>${label}</span><select name="${f.key}" ${req}>
            <option value="">—</option>${f.options.map(o => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}
        </select></label>`;
    }
    if (f.type === 'textarea') {
        return `<label class="field wide"><span>${label}</span><textarea name="${f.key}" rows="2">${esc(v)}</textarea></label>`;
    }
    const extra = [f.min != null && `min="${f.min}"`, f.max != null && `max="${f.max}"`, f.step && `step="${f.step}"`, f.placeholder && `placeholder="${esc(f.placeholder)}"`].filter(Boolean).join(' ');
    return `<label class="field"><span>${label}</span><input name="${f.key}" type="${f.type || 'text'}" value="${esc(v)}" ${req} ${extra}></label>`;
}

function renderCard() {
    const area = $('#cardArea');
    if (open === null || !state.coach || !state.participants[open]) {
        area.hidden = true;
        area.innerHTML = '';
        return;
    }
    const p = state.participants[open];
    const a = age(p.birthDate);
    area.hidden = false;
    area.innerHTML = `<form class="card" id="cardForm" novalidate>
        <div class="card-head">
            <div class="card-seal">${toRoman(open + 1)}</div>
            <div>
                <span class="eyebrow">${esc(t('participant'))} № ${open + 1}</span>
                <h2 class="h2">${isFilled(p) ? esc([p.lastName, p.firstName].join(' ')) : 'Новая карточка'}</h2>
                ${a !== '' ? `<span class="muted">${a} лет</span>` : ''}
            </div>
            <button type="button" class="icon-btn" data-act="collapse" title="Свернуть" aria-label="Свернуть карточку">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg>
            </button>
        </div>
        <div class="grid3">${FIELDS.map(f => fieldHtml(f, p)).join('')}</div>
        <p class="form-err" id="formErr" hidden></p>
        <div class="card-actions">
            <button type="button" class="link danger" data-act="clear">Очистить карточку</button>
            <button type="submit" class="btn btn-gold btn-lg">${esc(t('save'))}</button>
        </div>
    </form>`;
    area.querySelector('input, select')?.focus({ preventScroll: true });
}

function render() {
    applyTheme();
    renderTopRight();
    renderIntro();
    renderRoster();
    renderCard();
    const n = state.selected.length;
    $('#printCount').hidden = n === 0;
    $('#printCount').textContent = n;
}

/* ---------- Actions ---------- */
function setCount(n) {
    n = Math.max(0, Math.min(MAX, Number(n) || 0));
    const cur = state.participants.length;
    if (n < cur) {
        const lost = state.participants.slice(n).filter(isFilled).length;
        if (lost && !confirm(`Будут удалены ${lost} заполненн${lost === 1 ? 'ая карточка' : 'ых карточек'} в конце списка. Продолжить?`)) {
            render();
            return;
        }
        state.participants = state.participants.slice(0, n);
        state.selected = state.selected.filter(i => i < n);
        if (open !== null && open >= n) open = null;
    } else {
        while (state.participants.length < n) state.participants.push({});
    }
    commit();
}

function saveCard(form) {
    const err = form.querySelector('#formErr');
    const missing = FIELDS.filter(f => f.required && !String(form.elements[f.key].value).trim()).map(f => f.label);
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    if (missing.length) {
        FIELDS.filter(f => missing.includes(f.label)).forEach(f => form.elements[f.key].closest('.field')?.classList.add('is-invalid'));
        err.textContent = `Заполните: ${missing.join(', ')}.`;
        err.hidden = false;
        return;
    }
    const p = {};
    FIELDS.forEach(f => {
        const el = form.elements[f.key];
        p[f.key] = f.type === 'checkbox' ? el.checked : el.value.trim();
    });
    state.participants[open] = p;
    const done = open;
    // next card to fill: first empty after the current one, then from the start
    const order = [...state.participants.keys()].map(k => (done + 1 + k) % state.participants.length);
    const next = order.find(k => !isFilled(state.participants[k]));
    open = next === undefined ? null : next;
    commit();
    toast(next === undefined ? 'Все карточки заполнены — можно формировать заявку' : `Карточка № ${done + 1} сохранена`);
    document.getElementById('rosterSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function print() {
    const filled = state.participants.map((p, i) => [p, i]).filter(([p]) => isFilled(p));
    const chosen = state.selected.length ? filled.filter(([, i]) => state.selected.includes(i)) : filled;
    if (!state.coach) return openRegistration();
    if (!chosen.length) return toast('Сначала заполните хотя бы одну карточку');
    try {
        exportEntry(state.coach, chosen.map(([p]) => p));
        toast(`Заявка сформирована: ${chosen.length} чел.`);
    } catch (e) {
        toast(e.message);
    }
}

function openRegistration() {
    const dlg = $('#regModal');
    const form = $('#regForm');
    form.reset();
    if (state.coach) Object.entries(state.coach).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; });
    dlg.showModal();
}

function demo() {
    if (state.participants.some(isFilled) && !confirm('Заменить текущих участников демо-данными?')) return;
    const names = [
        ['Волков', 'Артём', 'М', '2014-03-12', 142, 36.5, '6 гып (зелёный)', '2 юн.'],
        ['Соколова', 'Мария', 'Ж', '2015-07-02', 135, 31, '8 гып (жёлтый)', '3 юн.'],
        ['Орлов', 'Максим', 'М', '2013-11-20', 150, 42.3, '4 гып (синий)', '1 юн.'],
        ['Лебедева', 'Ева', 'Ж', '2014-01-28', 140, 34.8, '7 гып (жёлто-зелёный)', '2 юн.'],
        ['Медведев', 'Тимур', 'М', '2012-05-16', 158, 47.1, '3 гып (сине-красный)', '3 разряд'],
    ];
    if (!state.coach) state.coach = { coach: 'Лихович Яна', club: 'Доджо', city: 'Москва', tournament: 'Турнир «Колизей»', date: '', place: '', phone: '' };
    state.participants = names.map(([lastName, firstName, gender, birthDate, height, weight, belt, rank]) => ({
        lastName, firstName, middleName: '', gender, birthDate, height: String(height), weight: String(weight),
        weightClass: '', belt, rank, city: state.coach.city, coach: state.coach.coach, medical: true, insurance: true, note: 'демо',
    }));
    state.participants.push({}, {});
    state.selected = [];
    open = null;
    commit();
    toast('Добавлены 5 демо-участников и 2 пустые карточки');
}

/* ---------- Events ---------- */
document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const i = Number(el.dataset.i);
    switch (el.dataset.act) {
        case 'register': openRegistration(); break;
        case 'inc': setCount(state.participants.length + 1); break;
        case 'dec': setCount(state.participants.length - 1); break;
        case 'open': open = open === i ? null : i; render(); if (open !== null) $('#cardArea').scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
        case 'collapse': open = null; render(); break;
        case 'clear':
            if (confirm('Очистить карточку?')) {
                state.participants[open] = {};
                state.selected = state.selected.filter(k => k !== open);
                commit();
            }
            break;
    }
});

document.addEventListener('change', e => {
    if (e.target.id === 'countInput') setCount(e.target.value);
    if (e.target.dataset.act === 'select') {
        const i = Number(e.target.dataset.i);
        state.selected = e.target.checked ? [...new Set([...state.selected, i])] : state.selected.filter(k => k !== i);
        commit();
    }
    if (e.target.id === 'themeSelect') { state.theme = e.target.value; commit(); }
});

document.addEventListener('submit', e => {
    if (e.target.id === 'cardForm') { e.preventDefault(); saveCard(e.target); }
});

$('#regForm').addEventListener('submit', e => {
    const form = e.target;
    if (!form.checkValidity()) { e.preventDefault(); form.reportValidity(); return; }
    state.coach = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v).trim()]));
    if (!state.participants.length) state.participants = Array.from({ length: 7 }, () => ({}));
    commit();
    toast('Тренер зарегистрирован');
});
$('#regCancel').addEventListener('click', () => $('#regModal').close());
$('#printBtn').addEventListener('click', print);
$('#selectAll').addEventListener('click', () => {
    state.selected = state.participants.map((p, i) => (isFilled(p) ? i : -1)).filter(i => i >= 0);
    commit();
});
$('#selectNone').addEventListener('click', () => { state.selected = []; commit(); });
$('#demoBtn').addEventListener('click', demo);
$('#resetBtn').addEventListener('click', () => {
    if (confirm('Удалить тренера и всех участников из этого браузера?')) { state = reset(); open = null; render(); }
});

$('#themeSelect').innerHTML = Object.entries(THEMES).map(([k, th]) => `<option value="${k}">${esc(th.name)}</option>`).join('');
$('#themeSelect').value = state.theme;
render();
