// Tournament themes: colours, fonts, wording and the logo mark.
// A new theme is one more entry here — the rest of the app reads everything from it.

// Laurel wreath: leaves placed along two arcs, mirrored.
function laurel(color) {
    const leaves = [];
    for (let i = 0; i < 10; i++) {
        const a = 255 - i * 13; // from the bottom up the left side, degrees
        const r = a * Math.PI / 180;
        const x = 50 + 40 * Math.cos(r);
        const y = 54 - 40 * Math.sin(r);
        const rot = -a + 25;
        leaves.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="7.5" transform="rotate(${rot} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
        leaves.push(`<ellipse cx="${(100 - x).toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="7.5" transform="rotate(${-rot} ${(100 - x).toFixed(1)} ${y.toFixed(1)})"/>`);
    }
    return `<g fill="${color}">${leaves.join('')}</g>`;
}

const helmet = (metal, crest) => `
    <path d="M30 70 Q30 38 50 34 Q70 38 70 70 L62 70 L62 58 Q50 54 38 58 L38 70 Z" fill="${metal}"/>
    <path d="M44 58 L44 72 M56 58 L56 72" stroke="${crest}" stroke-width="2.4"/>
    <path d="M34 36 Q50 6 66 36 Q58 22 50 22 Q42 22 34 36 Z" fill="${crest}"/>`;

export const THEMES = {
    colosseum: {
        name: 'Колизей · Древний Рим',
        vars: {
            '--bg': '#1b1410',
            '--bg-img': 'radial-gradient(1200px 600px at 50% -10%, rgba(201,162,74,.22), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(122,31,31,.35), transparent 60%), linear-gradient(180deg, #2a1f18 0%, #15100c 100%)',
            '--panel': '#f4ead3',
            '--panel-edge': '#c9a24a',
            '--ink': '#2b1d12',
            '--muted': '#6e5a45',
            '--accent': '#8e2424',
            '--accent-ink': '#fff6e6',
            '--gold': '#c9a24a',
            '--gold-2': '#e7c873',
            '--stone': '#d8ccb2',
            '--stone-ink': '#4a3a2a',
            '--head-ink': '#f4e2b8',
            '--font-head': "'Forum', 'PT Serif', serif",
            '--font-body': "'PT Serif', Georgia, serif",
        },
        logoMark: `<svg viewBox="0 0 100 100" aria-hidden="true">${laurel('#c9a24a')}${helmet('#c9a24a', '#8e2424')}</svg>`,
        texts: {
            appTitle: 'Арена Доджо',
            appSub: 'Турнир гладиаторов',
            participant: 'Гладиатор',
            participants: 'Гладиаторы',
            rosterTitle: 'Отряд гладиаторов',
            count: 'Гладиаторов',
            print: 'Печать заявки',
            save: 'Сохранить',
            selectAll: 'Выбрать всех записанных',
            regTitle: 'Регистрация тренера',
            regSubmit: 'Открыть арену',
            introTitle: 'Добро пожаловать на арену',
            introText: 'Зарегистрируйтесь как тренер, укажите число гладиаторов и заполните карточку каждого. Готовые карточки отметьте и нажмите «Печать заявки» — получите таблицу Excel для приёмной комиссии.',
            empty: 'Карточка не заполнена',
            filledHint: 'Отметьте записанных гладиаторов галочкой и нажмите «Печать заявки» слева вверху. Без отметок в заявку попадут все записанные.',
        },
    },
    classic: {
        name: 'Классика · без тематики',
        vars: {
            '--bg': '#eef1f5',
            '--bg-img': 'linear-gradient(180deg, #f6f8fb 0%, #e9edf3 100%)',
            '--panel': '#ffffff',
            '--panel-edge': '#d7dde7',
            '--ink': '#1c2433',
            '--muted': '#5f6b7d',
            '--accent': '#1f5fbf',
            '--accent-ink': '#ffffff',
            '--gold': '#1f5fbf',
            '--gold-2': '#4f86d9',
            '--stone': '#e4e9f1',
            '--stone-ink': '#3a4658',
            '--head-ink': '#1c2433',
            '--font-head': "'PT Sans', Arial, sans-serif",
            '--font-body': "'PT Sans', Arial, sans-serif",
        },
        logoMark: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="#1f5fbf" stroke-width="6"/><path d="M30 50 L45 64 L72 36" fill="none" stroke="#1f5fbf" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
        texts: {
            appTitle: 'Доджо',
            appSub: 'Панель тренера',
            participant: 'Участник',
            participants: 'Участники',
            rosterTitle: 'Участники',
            count: 'Участников',
            print: 'Печать заявки',
            save: 'Сохранить',
            selectAll: 'Выбрать все заполненные',
            regTitle: 'Регистрация тренера',
            regSubmit: 'Зарегистрироваться',
            introTitle: 'Панель тренера',
            introText: 'Зарегистрируйтесь, укажите количество участников и заполните карточку каждого. Отметьте готовые карточки и нажмите «Печать заявки» — получите таблицу Excel для приёмной комиссии.',
            empty: 'Карточка не заполнена',
            filledHint: 'Отметьте заполненные карточки и нажмите «Печать заявки» слева вверху. Без отметок в заявку попадут все заполненные.',
        },
    },
};
