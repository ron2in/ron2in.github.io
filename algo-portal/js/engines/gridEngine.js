/**
 * 2D-движок визуализации матриц (таблицы ДП, переходы, восстановление ответа).
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

export function renderGridFrame(container, frame, options = {}) {
  const {
    grid = [],
    rowHeaders = [],
    colHeaders = [],
    currentCell = null,
    depCells = [],
    pathCells = [],
    arrows = []
  } = frame;

  const { clickable = false, onCellClick = null } = options;

  const isSameCell = (a, b) => a && b && a[0] === b[0] && a[1] === b[1];
  const depSet = new Set(depCells.map(([r, c]) => `${r},${c}`));
  const pathSet = new Set(pathCells.map(([r, c]) => `${r},${c}`));

  const wrapper = document.createElement('div');
  wrapper.className = 'grid-wrapper';

  const tableWrap = document.createElement('div');
  tableWrap.className = 'dp-table-wrap';

  const table = document.createElement('table');
  table.className = 'dp-grid';

  // Заголовок столбцов
  if (colHeaders.length > 0) {
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const corner = document.createElement('th');
    corner.className = 'dp-header-corner';
    corner.textContent = 'i \\ w';
    tr.appendChild(corner);

    colHeaders.forEach((ch) => {
      const th = document.createElement('th');
      th.className = 'dp-col-header';
      th.textContent = ch;
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  const tbody = document.createElement('tbody');
  const cellElements = new Map();

  grid.forEach((row, rIdx) => {
    const tr = document.createElement('tr');

    if (rowHeaders.length > 0) {
      const th = document.createElement('th');
      th.className = 'dp-row-header';
      th.textContent = rowHeaders[rIdx] ?? rIdx;
      tr.appendChild(th);
    }

    row.forEach((val, cIdx) => {
      const td = document.createElement('td');
      td.className = 'dp-cell';
      td.textContent = val === null || val === undefined ? '·' : val;

      const key = `${rIdx},${cIdx}`;
      if (isSameCell(currentCell, [rIdx, cIdx])) {
        td.classList.add('current');
      } else if (pathSet.has(key)) {
        td.classList.add('path');
      } else if (depSet.has(key)) {
        td.classList.add('dep');
      }

      if (clickable && onCellClick) {
        td.classList.add('clickable');
        td.title = `Выбрать ячейку (${rIdx}, ${cIdx})`;
        td.addEventListener('click', () => onCellClick(key));
      }

      cellElements.set(key, td);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrap.appendChild(table);
  wrapper.appendChild(tableWrap);

  container.innerHTML = '';
  container.appendChild(wrapper);

  // Отрисовка SVG-стрелок переходов поверх таблицы после рендера в DOM
  if (arrows.length > 0) {
    requestAnimationFrame(() => {
      const wrapRect = tableWrap.getBoundingClientRect();
      if (wrapRect.width === 0 || wrapRect.height === 0) return;

      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.classList.add('dp-arrows-svg');
      svg.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);

      const defs = document.createElementNS(SVG_NS, 'defs');
      const marker = document.createElementNS(SVG_NS, 'marker');
      marker.setAttribute('id', 'dp-arrow-head');
      marker.setAttribute('markerWidth', '7');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '6');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      const poly = document.createElementNS(SVG_NS, 'polygon');
      poly.setAttribute('points', '0 0, 7 3.5, 0 7');
      poly.setAttribute('fill', '#C084FC');
      marker.appendChild(poly);
      defs.appendChild(marker);
      svg.appendChild(defs);

      arrows.forEach(({ from, to }) => {
        const fromEl = cellElements.get(`${from[0]},${from[1]}`);
        const toEl = cellElements.get(`${to[0]},${to[1]}`);
        if (!fromEl || !toEl) return;

        const r1 = fromEl.getBoundingClientRect();
        const r2 = toEl.getBoundingClientRect();
        const x1 = r1.left - wrapRect.left + r1.width / 2;
        const y1 = r1.top - wrapRect.top + r1.height / 2;
        const x2 = r2.left - wrapRect.left + r2.width / 2;
        const y2 = r2.top - wrapRect.top + r2.height / 2;

        const line = document.createElementNS(SVG_NS, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#C084FC');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '4 2');
        line.setAttribute('marker-end', 'url(#dp-arrow-head)');
        svg.appendChild(line);
      });

      tableWrap.appendChild(svg);
    });
  }
}
