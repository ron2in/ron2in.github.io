/**
 * Движок пошаговых математических вычислений:
 * 1) Режим сетки чисел ('sieve' — Решето Эратосфена)
 * 2) Режим пошаговой таблицы формул ('table' — binpow, ext-gcd, КТО)
 */
export function renderMathFrame(container, frame, options = {}) {
  const { mode = 'table' } = frame;
  const { clickable = false, onItemClick = null } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'math-wrapper';

  if (mode === 'sieve') {
    const {
      n = 30,
      currentPrime = null,
      currentMultiple = null,
      composites = [],
      primes = []
    } = frame;

    const compSet = new Set(composites);
    const primeSet = new Set(primes);

    const grid = document.createElement('div');
    grid.className = 'math-sieve-grid';

    for (let num = 2; num <= n; num++) {
      const cell = document.createElement('div');
      cell.className = 'sieve-cell';
      cell.textContent = num;

      if (currentPrime === num) {
        cell.classList.add('current-p');
      } else if (currentMultiple === num) {
        cell.classList.add('current-mult');
      } else if (compSet.has(num)) {
        cell.classList.add('composite');
      } else if (primeSet.has(num)) {
        cell.classList.add('prime');
      }

      if (clickable && onItemClick) {
        cell.classList.add('clickable');
        cell.title = `Выбрать число ${num}`;
        cell.addEventListener('click', () => onItemClick(num));
      }

      grid.appendChild(cell);
    }

    wrapper.appendChild(grid);
  } else {
    const {
      formula = '',
      columns = [],
      rows = [],
      activeRow = -1
    } = frame;

    if (formula) {
      const fBox = document.createElement('div');
      fBox.className = 'math-formula-box';
      fBox.textContent = formula;
      wrapper.appendChild(fBox);
    }

    const tableWrap = document.createElement('div');
    tableWrap.className = 'math-table-wrap';

    const table = document.createElement('table');
    table.className = 'math-iter-table';

    if (columns.length > 0) {
      const thead = document.createElement('thead');
      const tr = document.createElement('tr');
      columns.forEach((col) => {
        const th = document.createElement('th');
        th.textContent = col;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
    }

    const tbody = document.createElement('tbody');
    rows.forEach((row, rIdx) => {
      const tr = document.createElement('tr');
      tr.className = 'math-iter-row';
      if (rIdx === activeRow) tr.classList.add('active');

      if (clickable && onItemClick) {
        tr.classList.add('clickable');
        tr.addEventListener('click', () => onItemClick(rIdx));
      }

      row.forEach((val) => {
        const td = document.createElement('td');
        td.textContent = val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableWrap.appendChild(table);
    wrapper.appendChild(tableWrap);
  }

  container.innerHTML = '';
  container.appendChild(wrapper);
}
