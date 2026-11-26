/**
 * Древовидный движок визуализации на SVG (дерево отрезков, бинарные/корневые деревья).
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Автоматически вычисляет координаты (x, y) для узлов дерева по уровням.
 * @param {Array} nodes - [{ id, val, range: [l, r], left?: id, right?: id, children?: id[] }]
 * @param {number|string} rootId
 * @param {number} width
 * @param {number} height
 */
function computeTreeLayout(nodes, rootId, width = 580, height = 270) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const levels = [];

  function dfs(id, depth, xMin, xMax) {
    const node = nodeMap.get(id);
    if (!node) return;
    if (!levels[depth]) levels[depth] = [];
    const x = (xMin + xMax) / 2;
    levels[depth].push({ id, x, depth });

    const children = [];
    if (node.left !== undefined && node.left !== null) children.push(node.left);
    if (node.right !== undefined && node.right !== null) children.push(node.right);
    if (Array.isArray(node.children)) children.push(...node.children);

    if (children.length > 0) {
      const span = (xMax - xMin) / children.length;
      children.forEach((childId, idx) => {
        dfs(childId, depth + 1, xMin + idx * span, xMin + (idx + 1) * span);
      });
    }
  }

  dfs(rootId, 0, 18, width - 18);

  const maxDepth = Math.max(1, levels.length - 1);
  const topPad = 32;
  const bottomPad = 42;
  const levelGap = (height - topPad - bottomPad) / maxDepth;

  const coords = new Map();
  levels.forEach((lvlNodes, depth) => {
    const y = topPad + depth * levelGap;
    lvlNodes.forEach(({ id, x }) => {
      coords.set(id, { x, y });
    });
  });
  return { coords, nodeMap };
}

export function renderTreeFrame(container, frame, options = {}) {
  const {
    nodes = [],
    rootId = 1,
    activeNodes = [],
    updatedNodes = [],
    queryNodes = [],
    activeEdges = [],
    jumpEdges = [],
    auxPanels = null
  } = frame;

  const { clickableNodes = false, onNodeClick = null } = options;

  const width = 580;
  const height = 270;
  const { coords, nodeMap } = computeTreeLayout(nodes, rootId, width, height);

  const activeSet = new Set(activeNodes);
  const updatedSet = new Set(updatedNodes);
  const querySet = new Set(queryNodes);
  const isEdgeActive = (u, v) =>
    activeEdges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));

  const wrapper = document.createElement('div');
  wrapper.className = 'tree-wrapper';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.classList.add('tree-svg');

  // Рёбра родитель -> ребёнок
  nodes.forEach((node) => {
    const pPos = coords.get(node.id);
    if (!pPos) return;

    const children = [];
    if (node.left !== undefined && node.left !== null) children.push(node.left);
    if (node.right !== undefined && node.right !== null) children.push(node.right);
    if (Array.isArray(node.children)) children.push(...node.children);

    children.forEach((cid) => {
      const cPos = coords.get(cid);
      if (!cPos) return;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', pPos.x);
      line.setAttribute('y1', pPos.y);
      line.setAttribute('x2', cPos.x);
      line.setAttribute('y2', cPos.y);
      line.classList.add('tree-edge');
      if (isEdgeActive(node.id, cid)) {
        line.classList.add('active');
      }
      svg.appendChild(line);
    });
  });

  // Узлы дерева
  nodes.forEach((node) => {
    const pos = coords.get(node.id);
    if (!pos) return;

    const g = document.createElementNS(SVG_NS, 'g');
    g.classList.add('tree-node');

    if (activeSet.has(node.id)) g.classList.add('active');
    if (updatedSet.has(node.id)) g.classList.add('updated');
    if (querySet.has(node.id)) g.classList.add('query');

    if (clickableNodes && onNodeClick) {
      g.classList.add('clickable');
      g.addEventListener('click', () => onNodeClick(node.id));
    }

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', pos.x);
    circle.setAttribute('cy', pos.y);
    circle.setAttribute('r', 17);

    const valText = document.createElementNS(SVG_NS, 'text');
    valText.setAttribute('x', pos.x);
    valText.setAttribute('y', pos.y);
    valText.classList.add('tree-node-val');
    valText.textContent = node.val === null || node.val === undefined ? '·' : node.val;

    g.appendChild(circle);
    g.appendChild(valText);

    if (Array.isArray(node.range)) {
      const rangeText = document.createElementNS(SVG_NS, 'text');
      rangeText.setAttribute('x', pos.x);
      rangeText.setAttribute('y', pos.y + 27);
      rangeText.classList.add('tree-node-range');
      rangeText.textContent = `[${node.range[0]},${node.range[1]}]`;
      g.appendChild(rangeText);
    } else if (node.subLabel !== undefined) {
      const subText = document.createElementNS(SVG_NS, 'text');
      subText.setAttribute('x', pos.x);
      subText.setAttribute('y', pos.y + 27);
      subText.classList.add('tree-node-range');
      subText.textContent = node.subLabel;
      g.appendChild(subText);
    }

    svg.appendChild(g);
  });

  // Двоичные прыжки вверх (для LCA)
  jumpEdges.forEach(([fromId, toId]) => {
    const p1 = coords.get(fromId);
    const p2 = coords.get(toId);
    if (!p1 || !p2) return;
    const path = document.createElementNS(SVG_NS, 'path');
    const mx = (p1.x + p2.x) / 2 - 26;
    const my = (p1.y + p2.y) / 2;
    path.setAttribute('d', `M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#38BDF8');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('stroke-dasharray', '5 3');
    svg.appendChild(path);
  });

  wrapper.appendChild(svg);

  if (Array.isArray(auxPanels) && auxPanels.length > 0) {
    const auxRow = document.createElement('div');
    auxRow.className = 'graph-aux-row';
    auxRow.style.marginTop = '8px';
    auxPanels.forEach((panel) => {
      const box = document.createElement('div');
      box.className = 'graph-aux-box';
      const titleDiv = document.createElement('div');
      titleDiv.className = 'graph-aux-title';
      titleDiv.textContent = panel.title;
      const valDiv = document.createElement('div');
      valDiv.style.color = panel.color || 'var(--accent-light)';
      valDiv.textContent = panel.value;
      box.appendChild(titleDiv);
      box.appendChild(valDiv);
      auxRow.appendChild(box);
    });
    wrapper.appendChild(auxRow);
  }

  container.innerHTML = '';
  container.appendChild(wrapper);
}
