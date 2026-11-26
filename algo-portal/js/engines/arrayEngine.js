/**
 * Движок 1D-визуализации массивов (ячейки, индексы, указатели L/R/M/i/j/ans).
 */
export function renderArrayFrame(container, frame, options = {}) {
  const {
    array = [],
    pointers = {},
    activeRange = null,
    midIndex = null,
    foundIndex = null,
    primaryLabel = null,
    secondaryArray = null,
    secondaryLabel = null,
    secondaryHighlight = []
  } = frame;

  const { clickable = false, onCellClick = null } = options;

  const wrap = document.createElement('div');
  wrap.className = 'array-container';

  array.forEach((val, idx) => {
    const cellWrap = document.createElement('div');
    cellWrap.className = 'array-cell-wrap';

    // Верхние указатели (L, R, M, i, j, ans)
    const ptrRow = document.createElement('div');
    ptrRow.className = 'array-pointers-top';

    const ptrDefs = [
      { key: 'L', label: 'L', cls: 'ptr-L' },
      { key: 'R', label: 'R', cls: 'ptr-R' },
      { key: 'M', label: 'M', cls: 'ptr-M' },
      { key: 'i', label: 'i', cls: 'ptr-L' },
      { key: 'j', label: 'j', cls: 'ptr-R' },
      { key: 'ans', label: 'ans', cls: 'ptr-ans' }
    ];

    ptrDefs.forEach(({ key, label, cls }) => {
      if (pointers[key] === idx) {
        const tag = document.createElement('span');
        tag.className = `ptr-tag ${cls}`;
        tag.textContent = label;
        ptrRow.appendChild(tag);
      }
    });

    // Сама ячейка массива
    const cell = document.createElement('div');
    cell.className = 'array-cell';
    cell.textContent = val;

    if (activeRange) {
      const [lo, hi] = activeRange;
      if (idx >= lo && idx <= hi) {
        cell.classList.add('in-range');
      } else {
        cell.classList.add('dimmed');
      }
    }

    if (midIndex === idx) {
      cell.classList.add('mid');
    }

    if (foundIndex === idx) {
      cell.classList.add('found');
    }

    if (clickable && onCellClick) {
      cell.classList.add('clickable');
      cell.title = `Выбрать индекс ${idx}`;
      cell.addEventListener('click', () => onCellClick(idx));
    }

    // Индекс под ячейкой
    const indexEl = document.createElement('div');
    indexEl.className = 'array-index';
    indexEl.textContent = idx;

    cellWrap.appendChild(ptrRow);
    cellWrap.appendChild(cell);
    cellWrap.appendChild(indexEl);
    wrap.appendChild(cellWrap);
  });

  container.innerHTML = '';
  if (primaryLabel) {
    const lbl = document.createElement('div');
    lbl.style.cssText = 'font-size:12px; color:var(--text-secondary); font-family:var(--font-mono); margin-bottom:2px;';
    lbl.textContent = primaryLabel;
    container.appendChild(lbl);
  }
  container.appendChild(wrap);

  if (Array.isArray(secondaryArray) && secondaryArray.length > 0) {
    if (secondaryLabel) {
      const lbl2 = document.createElement('div');
      lbl2.style.cssText = 'font-size:12px; color:var(--accent-light); font-family:var(--font-mono); margin-top:6px;';
      lbl2.textContent = secondaryLabel;
      container.appendChild(lbl2);
    }
    const secHighlightSet = new Set(secondaryHighlight);
    const secWrap = document.createElement('div');
    secWrap.className = 'array-container';
    secWrap.style.padding = '8px 8px 10px';
    secondaryArray.forEach((val, idx) => {
      const cw = document.createElement('div');
      cw.className = 'array-cell-wrap';
      const cell = document.createElement('div');
      cell.className = 'array-cell';
      if (secHighlightSet.has(idx)) cell.classList.add('mid');
      cell.textContent = val;
      const idxEl = document.createElement('div');
      idxEl.className = 'array-index';
      idxEl.textContent = idx + 1; // 1-based for BIT
      cw.appendChild(cell);
      cw.appendChild(idxEl);
      secWrap.appendChild(cw);
    });
    container.appendChild(secWrap);
  }
}
