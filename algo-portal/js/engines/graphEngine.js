/**
 * Движок визуализации графов на SVG (ориентированные/неориентированные,
 * взвешенные рёбра, 3-цветная раскраска DFS, очередь/стек/PQ/DSU).
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

function createArrowMarker(defs, id, color) {
  const marker = document.createElementNS(SVG_NS, 'marker');
  marker.setAttribute('id', id);
  marker.setAttribute('markerWidth', '7');
  marker.setAttribute('markerHeight', '7');
  marker.setAttribute('refX', '6');
  marker.setAttribute('refY', '3.5');
  marker.setAttribute('orient', 'auto');
  const poly = document.createElementNS(SVG_NS, 'polygon');
  poly.setAttribute('points', '0 0, 7 3.5, 0 7');
  poly.setAttribute('fill', color);
  marker.appendChild(poly);
  defs.appendChild(marker);
}

export function renderGraphFrame(container, frame, options = {}) {
  const {
    nodes = [],
    edges = [],
    directed = false,
    weighted = false,
    currentNode = null,
    queuedNodes = [],
    visitedNodes = [],
    nodeColors = null,
    nodePalette = null,
    nodeBadges = null,
    articulationNodes = [],
    activeEdge = null,
    treeEdges = [],
    backEdges = [],
    bridgeEdges = [],
    queue = [],
    dist = {},
    auxPanels = null
  } = frame;

  const {
    clickableNodes = false,
    onNodeClick = null,
    onCanvasClick = null,
    selectedForEdge = null
  } = options;

  const wrapper = document.createElement('div');
  wrapper.className = 'graph-wrapper';

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 560 260');
  svg.classList.add('graph-svg');

  if (directed) {
    const defs = document.createElementNS(SVG_NS, 'defs');
    createArrowMarker(defs, 'arrow-default', '#3B4963');
    createArrowMarker(defs, 'arrow-active', '#C084FC');
    createArrowMarker(defs, 'arrow-tree', '#22C55E');
    createArrowMarker(defs, 'arrow-back', '#EF4444');
    svg.appendChild(defs);
  }

  if (onCanvasClick) {
    svg.addEventListener('click', (e) => {
      if (e.target !== svg) return;
      const rect = svg.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 560);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 260);
      onCanvasClick(x, y);
    });
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const queuedSet = new Set(queuedNodes);
  const visitedSet = new Set(visitedNodes);

  const isSameEdge = (e1, e2) => {
    if (!e1 || !e2) return false;
    if (directed) return e1[0] === e2[0] && e1[1] === e2[1];
    return (
      (e1[0] === e2[0] && e1[1] === e2[1]) ||
      (e1[0] === e2[1] && e1[1] === e2[0])
    );
  };

  // Отрисовка рёбер
  edges.forEach((edge) => {
    const u = nodeMap.get(edge.from);
    const v = nodeMap.get(edge.to);
    if (!u || !v) return;

    let x1 = u.x;
    let y1 = u.y;
    let x2 = v.x;
    let y2 = v.y;

    if (directed) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const offset = 21; // радиус 18 + зазор под стрелку
      x1 += (dx / len) * 18;
      y1 += (dy / len) * 18;
      x2 -= (dx / len) * offset;
      y2 -= (dy / len) * offset;
    }

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.classList.add('graph-edge');

    let markerId = 'arrow-default';
    if (bridgeEdges.some((be) => isSameEdge([edge.from, edge.to], be))) {
      line.style.stroke = '#EF4444';
      line.style.strokeWidth = '4.5';
      markerId = 'arrow-back';
    } else if (backEdges.some((be) => isSameEdge([edge.from, edge.to], be))) {
      line.style.stroke = 'var(--danger)';
      line.style.strokeWidth = '2.8';
      line.setAttribute('stroke-dasharray', '5 3');
      markerId = 'arrow-back';
    } else if (activeEdge && isSameEdge([edge.from, edge.to], activeEdge)) {
      line.classList.add('active');
      markerId = 'arrow-active';
    } else if (treeEdges.some((te) => isSameEdge([edge.from, edge.to], te))) {
      line.classList.add('tree');
      markerId = 'arrow-tree';
    }

    if (directed) {
      line.setAttribute('marker-end', `url(#${markerId})`);
    }

    svg.appendChild(line);

    if (weighted && edge.weight !== undefined) {
      const mx = (u.x + v.x) / 2;
      const my = (u.y + v.y) / 2 - 7;
      const bg = document.createElementNS(SVG_NS, 'rect');
      bg.setAttribute('x', mx - 10);
      bg.setAttribute('y', my - 10);
      bg.setAttribute('width', 20);
      bg.setAttribute('height', 14);
      bg.setAttribute('rx', 3);
      bg.setAttribute('fill', '#0F1522');
      svg.appendChild(bg);

      const wText = document.createElementNS(SVG_NS, 'text');
      wText.setAttribute('x', mx);
      wText.setAttribute('y', my);
      wText.setAttribute('fill', '#F8FAFC');
      wText.setAttribute('font-size', '11');
      wText.setAttribute('font-weight', '600');
      wText.setAttribute('font-family', 'JetBrains Mono, monospace');
      wText.setAttribute('text-anchor', 'middle');
      wText.textContent = edge.weight;
      svg.appendChild(wText);
    }
  });

  // Отрисовка вершин
  nodes.forEach((node) => {
    const g = document.createElementNS(SVG_NS, 'g');
    g.classList.add('graph-node');

    const customColor = nodeColors ? nodeColors[node.id] : null;
    if (currentNode === node.id) {
      g.classList.add('current');
    } else if (customColor === 'gray' || (!customColor && queuedSet.has(node.id))) {
      g.classList.add('queued');
    } else if (customColor === 'black' || (!customColor && visitedSet.has(node.id))) {
      g.classList.add('visited');
    }

    if (clickableNodes || onNodeClick) {
      g.classList.add('clickable');
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onNodeClick) onNodeClick(node.id);
      });
    }

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    circle.setAttribute('r', 18);
    if (nodePalette && nodePalette[node.id]) {
      circle.style.stroke = nodePalette[node.id];
      circle.style.fill = `${nodePalette[node.id]}33`;
      circle.style.strokeWidth = '3';
    }
    if (articulationNodes.includes(node.id)) {
      circle.style.stroke = '#C084FC';
      circle.style.fill = 'rgba(168, 85, 247, 0.34)';
      circle.style.strokeWidth = '3.5';
    }
    if (selectedForEdge === node.id) {
      circle.setAttribute('stroke-dasharray', '4 3');
      circle.style.stroke = '#F59E0B';
    }

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', node.x);
    label.setAttribute('y', node.y);
    label.classList.add('graph-node-label');
    label.textContent = node.label ?? node.id;

    g.appendChild(circle);
    g.appendChild(label);

    if (nodeBadges && nodeBadges[node.id] !== undefined) {
      const badgeBg = document.createElementNS(SVG_NS, 'rect');
      badgeBg.setAttribute('x', node.x - 20);
      badgeBg.setAttribute('y', node.y + 21);
      badgeBg.setAttribute('width', 40);
      badgeBg.setAttribute('height', 15);
      badgeBg.setAttribute('rx', 3);
      badgeBg.setAttribute('fill', '#0F1522');
      g.appendChild(badgeBg);

      const badgeLabel = document.createElementNS(SVG_NS, 'text');
      badgeLabel.setAttribute('x', node.x);
      badgeLabel.setAttribute('y', node.y + 32);
      badgeLabel.classList.add('graph-dist-badge');
      badgeLabel.textContent = nodeBadges[node.id];
      g.appendChild(badgeLabel);
    } else if (dist && Object.keys(dist).length > 0 && dist[node.id] !== undefined) {
      const dVal = dist[node.id];
      const distLabel = document.createElementNS(SVG_NS, 'text');
      distLabel.setAttribute('x', node.x);
      distLabel.setAttribute('y', node.y + 30);
      distLabel.classList.add('graph-dist-badge');
      distLabel.textContent = `d=${dVal === Infinity ? '∞' : dVal}`;
      g.appendChild(distLabel);
    }

    svg.appendChild(g);
  });

  wrapper.appendChild(svg);

  // Вспомогательные панели (очередь/стек/PQ/DSU/dist)
  const auxRow = document.createElement('div');
  auxRow.className = 'graph-aux-row';

  if (Array.isArray(auxPanels) && auxPanels.length > 0) {
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
  } else {
    const queueBox = document.createElement('div');
    queueBox.className = 'graph-aux-box';
    queueBox.innerHTML = `
      <div class="graph-aux-title">Очередь (queue)</div>
      <div style="color: var(--info);">[${queue.length ? queue.join(', ') : 'пусто'}]</div>
    `;

    const distEntries = nodes.map((n) => {
      const d = dist[n.id];
      return `${n.id}:${d === Infinity || d === undefined ? '∞' : d}`;
    });
    const distBox = document.createElement('div');
    distBox.className = 'graph-aux-box';
    distBox.innerHTML = `
      <div class="graph-aux-title">Массив расстояний (dist)</div>
      <div style="color: var(--accent-light);">${distEntries.join('  ')}</div>
    `;

    auxRow.appendChild(queueBox);
    auxRow.appendChild(distBox);
  }

  wrapper.appendChild(auxRow);
  container.innerHTML = '';
  container.appendChild(wrapper);
}
