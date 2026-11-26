/**
 * Строковый движок визуализации (КМП / префикс-функция и Z-функция).
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderStringFrame(container, frame, options = {}) {
  const {
    text = '',
    values = [],
    valuesLabel = 'π[i]',
    prefixRange = null,
    suffixRange = null,
    compareIndices = [],
    matchIndices = [],
    arc = null
  } = frame;

  const { clickable = false, onCharClick = null } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'string-wrapper';

  const compareSet = new Set(compareIndices);
  const matchSet = new Set(matchIndices);

  const inRange = (idx, rng) => rng && idx >= rng[0] && idx <= rng[1];

  const tapeWrap = document.createElement('div');
  tapeWrap.className = 'string-tape-wrap';

  const tape = document.createElement('div');
  tape.className = 'string-tape';

  const chars = [...text];
  const cellRefs = [];

  chars.forEach((ch, idx) => {
    const col = document.createElement('div');
    col.className = 'string-col';

    const idxEl = document.createElement('div');
    idxEl.className = 'string-idx';
    idxEl.textContent = idx;

    const charEl = document.createElement('div');
    charEl.className = 'string-char';
    charEl.textContent = ch;

    if (matchSet.has(idx)) charEl.classList.add('match');
    else if (compareSet.has(idx)) charEl.classList.add('compare');
    else if (inRange(idx, suffixRange)) charEl.classList.add('suffix');
    else if (inRange(idx, prefixRange)) charEl.classList.add('prefix');

    if (clickable && onCharClick) {
      charEl.classList.add('clickable');
      charEl.title = `Выбрать позицию ${idx}`;
      charEl.addEventListener('click', () => onCharClick(idx));
    }

    const valEl = document.createElement('div');
    valEl.className = 'string-val';
    valEl.textContent = values[idx] === null || values[idx] === undefined ? '·' : values[idx];

    col.appendChild(idxEl);
    col.appendChild(charEl);
    col.appendChild(valEl);
    tape.appendChild(col);
    cellRefs.push(charEl);
  });

  const legend = document.createElement('div');
  legend.className = 'string-legend';
  legend.innerHTML = `
    <span class="badge badge-muted">${valuesLabel}</span>
    <span style="color:var(--info);">■ префикс</span>
    <span style="color:var(--accent-light);">■ суффикс / Z-блок</span>
    <span style="color:var(--warning);">■ сравнение</span>
    <span style="color:var(--success);">■ совпадение</span>
  `;

  tapeWrap.appendChild(tape);
  wrapper.appendChild(tapeWrap);
  wrapper.appendChild(legend);

  container.innerHTML = '';
  container.appendChild(wrapper);

  // Отрисовка SVG-дуги над лентой
  if (arc && arc.from !== undefined && arc.to !== undefined && cellRefs[arc.from] && cellRefs[arc.to]) {
    requestAnimationFrame(() => {
      const wrapRect = tapeWrap.getBoundingClientRect();
      const r1 = cellRefs[arc.from].getBoundingClientRect();
      const r2 = cellRefs[arc.to].getBoundingClientRect();
      if (wrapRect.width === 0) return;

      const x1 = r1.left - wrapRect.left + r1.width / 2;
      const x2 = r2.left - wrapRect.left + r2.width / 2;
      const y = r1.top - wrapRect.top - 2;
      const ctrlY = Math.max(4, y - Math.min(34, Math.abs(x2 - x1) * 0.25 + 14));

      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.classList.add('string-arc-svg');
      svg.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);

      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', `M ${x1} ${y} Q ${(x1 + x2) / 2} ${ctrlY} ${x2} ${y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#C084FC');
      path.setAttribute('stroke-width', '2.2');
      path.setAttribute('stroke-dasharray', '4 2');
      svg.appendChild(path);
      tapeWrap.appendChild(svg);
    });
  }
}
