/**
 * cppEngine.js
 * Изолированный модуль исполнения C++ кода на базе JSCPP.
 * Не содержит никаких обращений к DOM.
 * Обеспечивает:
 *  - Препроцессинг современных конструкций C++ (ссылки &, struct, class, std::string) для JSCPP
 *  - Проброс игрового Bridge API через заголовок <dungeon>
 *  - Сбор вызовов игровых действий (attack, pierceAttack, heal, castShield, critHit, move, unlockDoor)
 *  - Форматирование ошибок компиляции и выполнения ("Магические сбои")
 */

const DEFAULT_MAX_STEPS = 25000;

/**
 * Препроцессор C++ кода:
 * - Заменяет std::string / string на const char* (с сохранением числа строк)
 * - Транслирует передачу по ссылке (int& x) в указатели для совместимости с JSCPP
 * - Транслирует простые struct и class с полями, конструкторами и методами в C-совместимые функции и переменные,
 *   сохраняя номера строк для точных сообщений об ошибках.
 */
export function preprocessCpp(source) {
  let code = source.replace(/\r\n/g, '\n');

  // 1. Поддержка #include <string> (удаляем директиву, сохраняя строку)
  code = code.replace(/^\s*#\s*include\s*<string>\s*$/gm, '// [string built-in]');

  // 2. std::string -> const char*
  code = code.replace(/\bstd::string\b/g, 'const char*');
  code = code.replace(/\bstring\b(?=\s+[a-zA-Z_]\w*\s*[=;,\)])/g, 'const char*');

  // 3. Поддержка ссылочных параметров вида `type& name` в объявлениях функций
  code = transformReferences(code);

  // 4. Поддержка struct и class для 6-го этажа (Цитадель Архитектора)
  code = transformStructsAndClasses(code);

  return code;
}

/**
 * Преобразует параметры по ссылке `int& x` в указатели `int* __ref_x`,
 * заменяя обращения к `x` внутри тела функции на `(*__ref_x)` и вызовы `fn(var)` на `fn(&var)`.
 */
function transformReferences(code) {
  const fnRegex = /\b(void|int|double|bool|char)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/g;
  const refFunctions = new Map();

  let match;
  const replacements = [];

  while ((match = fnRegex.exec(code)) !== null) {
    const returnType = match[1];
    const fnName = match[2];
    const paramsStr = match[3];
    if (!paramsStr.includes('&')) continue;

    const params = paramsStr.split(',').map(p => p.trim());
    const refFlags = [];
    const refVarNames = [];
    const newParams = params.map(p => {
      const m = p.match(/^((?:const\s+)?(?:int|double|bool|char))\s*&\s*([a-zA-Z_]\w*)$/);
      if (m) {
        refFlags.push(true);
        refVarNames.push(m[2]);
        return `${m[1]}* __ref_${m[2]}`;
      }
      refFlags.push(false);
      return p;
    });

    if (refVarNames.length === 0) continue;
    refFunctions.set(fnName, refFlags);

    const bodyStart = match.index + match[0].length;
    const bodyEnd = findMatchingBrace(code, bodyStart - 1);
    if (bodyEnd === -1) continue;

    let body = code.slice(bodyStart, bodyEnd);
    for (const v of refVarNames) {
      const varRe = new RegExp(`\\b${v}\\b`, 'g');
      body = body.replace(varRe, `(*__ref_${v})`);
    }

    const header = `${returnType} ${fnName}(${newParams.join(', ')}) {`;
    replacements.push({
      start: match.index,
      end: bodyEnd + 1,
      text: `${header}${body}}`
    });
  }

  let result = code;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    result = result.slice(0, r.start) + r.text + result.slice(r.end);
  }

  for (const [fnName, flags] of refFunctions.entries()) {
    const callRe = new RegExp(`\\b${fnName}\\s*\\(([^;{}()]*)\\)`, 'g');
    result = result.replace(callRe, (full, argsStr) => {
      if (argsStr.includes('__ref_')) return full;
      const args = argsStr.split(',').map(a => a.trim());
      if (args.length !== flags.length) return full;
      const mapped = args.map((arg, idx) => {
        if (!flags[idx]) return arg;
        return arg.startsWith('&') ? arg : `&${arg}`;
      });
      return `${fnName}(${mapped.join(', ')})`;
    });
  }

  return result;
}

/**
 * Транслирует простые объявления `struct Name { ... };` и `class Name { ... };`
 * в набор C-переменных и функций, чтобы JSCPP мог исполнять ООП-код 6-го этажа.
 * Сохраняет количество переносов строк.
 */
function transformStructsAndClasses(code) {
  const typeDefRe = /\b(struct|class)\s+([A-Z_a-z]\w*)\s*\{/g;
  const classes = new Map();
  let match;
  const removals = [];

  while ((match = typeDefRe.exec(code)) !== null) {
    const className = match[2];
    const openIdx = match.index + match[0].length - 1;
    const closeIdx = findMatchingBrace(code, openIdx);
    if (closeIdx === -1) continue;

    let endIdx = closeIdx + 1;
    while (endIdx < code.length && /\s/.test(code[endIdx])) endIdx++;
    if (code[endIdx] === ';') endIdx++;

    const body = code.slice(openIdx + 1, closeIdx);
    const parsed = parseClassBody(className, body);
    classes.set(className, parsed);

    const originalBlock = code.slice(match.index, endIdx);
    const lineCount = (originalBlock.match(/\n/g) || []).length;
    const generated = generateClassHelpers(className, parsed);
    const genLines = (generated.match(/\n/g) || []).length;
    const pad = '\n'.repeat(Math.max(0, lineCount - genLines));

    removals.push({
      start: match.index,
      end: endIdx,
      text: generated + pad
    });
  }

  if (classes.size === 0) return code;

  let result = code;
  for (let i = removals.length - 1; i >= 0; i--) {
    const r = removals[i];
    result = result.slice(0, r.start) + r.text + result.slice(r.end);
  }

  for (const [className, info] of classes.entries()) {
    const instances = new Set();

    const ctorInstRe = new RegExp(`\\b${className}\\s+([a-zA-Z_]\\w*)\\s*\\(([^)]*)\\)\\s*;`, 'g');
    result = result.replace(ctorInstRe, (_, varName, argsStr) => {
      instances.add(varName);
      const decls = info.fields.map(f => `${f.type} __${varName}_${f.name} = 0;`).join(' ');
      const ctorCall = info.ctor
        ? `__${className}_ctor(${info.fields.map(f => `&__${varName}_${f.name}`).join(', ')}${argsStr.trim() ? ', ' + argsStr : ''});`
        : '';
      return `${decls} ${ctorCall}`;
    });

    const plainInstRe = new RegExp(`\\b${className}\\s+([a-zA-Z_]\\w*)\\s*;`, 'g');
    result = result.replace(plainInstRe, (_, varName) => {
      instances.add(varName);
      return info.fields.map(f => `${f.type} __${varName}_${f.name} = 0;`).join(' ');
    });

    for (const varName of instances) {
      for (const m of info.methods) {
        const methodCallRe = new RegExp(`\\b${varName}\\.${m.name}\\s*\\(([^)]*)\\)`, 'g');
        result = result.replace(methodCallRe, (_, argsStr) => {
          const fieldPtrs = info.fields.map(f => `&__${varName}_${f.name}`).join(', ');
          const extra = argsStr.trim() ? `, ${argsStr}` : '';
          return `__${className}_${m.name}(${fieldPtrs}${extra})`;
        });
      }
      for (const f of info.fields) {
        const fieldRe = new RegExp(`\\b${varName}\\.${f.name}\\b`, 'g');
        result = result.replace(fieldRe, `__${varName}_${f.name}`);
      }
    }
  }

  return result;
}

function parseClassBody(className, body) {
  const cleaned = body.replace(/\b(public|private|protected)\s*:/g, '');
  const fields = [];
  const methods = [];
  let ctor = null;

  let i = 0;
  while (i < cleaned.length) {
    while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
    if (i >= cleaned.length) break;

    const rest = cleaned.slice(i);
    const ctorMatch = rest.match(new RegExp(`^${className}\\s*\\(([^)]*)\\)\\s*\\{`));
    if (ctorMatch) {
      const openIdx = i + ctorMatch[0].length - 1;
      const closeIdx = findMatchingBrace(cleaned, openIdx);
      ctor = {
        params: ctorMatch[1].trim(),
        body: cleaned.slice(openIdx + 1, closeIdx)
      };
      i = closeIdx + 1;
      continue;
    }

    const methodMatch = rest.match(/^(void|int|double|bool|char)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{/);
    if (methodMatch) {
      const openIdx = i + methodMatch[0].length - 1;
      const closeIdx = findMatchingBrace(cleaned, openIdx);
      methods.push({
        ret: methodMatch[1],
        name: methodMatch[2],
        params: methodMatch[3].trim(),
        body: cleaned.slice(openIdx + 1, closeIdx)
      });
      i = closeIdx + 1;
      continue;
    }

    const fieldMatch = rest.match(/^(int|double|bool|char)\s+([a-zA-Z_]\w*)(?:\s*=\s*[^;]+)?\s*;/);
    if (fieldMatch) {
      fields.push({ type: fieldMatch[1], name: fieldMatch[2] });
      i += fieldMatch[0].length;
      continue;
    }

    i++;
  }

  return { fields, methods, ctor };
}

function generateClassHelpers(className, info) {
  const fieldParams = info.fields.map(f => `${f.type}* __f_${f.name}`);
  const rewriteFields = (body) => {
    let b = body;
    for (const f of info.fields) {
      b = b.replace(new RegExp(`\\bthis->${f.name}\\b`, 'g'), `(*__f_${f.name})`);
      b = b.replace(new RegExp(`\\b${f.name}\\b`, 'g'), `(*__f_${f.name})`);
    }
    return b.replace(/\n/g, ' ');
  };

  const parts = [];
  if (info.ctor) {
    const allParams = [...fieldParams, ...(info.ctor.params ? [info.ctor.params] : [])].join(', ');
    parts.push(`void __${className}_ctor(${allParams}) { ${rewriteFields(info.ctor.body)} }`);
  }
  for (const m of info.methods) {
    const allParams = [...fieldParams, ...(m.params ? [m.params] : [])].join(', ');
    parts.push(`${m.ret} __${className}_${m.name}(${allParams}) { ${rewriteFields(m.body)} }`);
  }
  return parts.join(' ');
}

function findMatchingBrace(str, openIdx) {
  let depth = 0;
  let inString = false;
  let inChar = false;
  for (let i = openIdx; i < str.length; i++) {
    const ch = str[i];
    const prev = i > 0 ? str[i - 1] : '';
    if (ch === '"' && prev !== '\\' && !inChar) inString = !inString;
    else if (ch === "'" && prev !== '\\' && !inString) inChar = !inChar;
    else if (!inString && !inChar) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return -1;
}

/**
 * Форматирует ошибки JSCPP в понятный игроку лог «Магических сбоев»
 */
export function formatCppError(err) {
  const raw = err?.message || String(err);
  const lineMatch = raw.match(/line\s+(\d+)\s*\(column\s+(\d+)\)/i) || raw.match(/^(\d+):(\d+)\s+/);
  const line = lineMatch ? parseInt(lineMatch[1], 10) : null;
  const col = lineMatch ? parseInt(lineMatch[2], 10) : null;

  let hint = 'Проверь синтаксис C++: точки с запятой (;), скобки и типы данных.';
  if (/expected.*";"/i.test(raw) || /but.*found/i.test(raw)) {
    hint = 'Вероятно, пропущена точка с запятой (;) или лишний символ в конце строки.';
  } else if (/is not defined|undeclared/i.test(raw)) {
    hint = 'Переменная или функция не объявлена. Проверь имя или #include <dungeon>.';
  } else if (/cannot find library/i.test(raw)) {
    hint = 'Неизвестная библиотека. Используй <iostream>, <cmath>, <cstring> или <dungeon>.';
  } else if (/maximum execution steps/i.test(raw) || /infinite/i.test(raw)) {
    hint = 'Бесконечный цикл! Заклинание зациклилось и было остановлено защитой башни.';
  } else if (/type/i.test(raw)) {
    hint = 'Несовместимые типы данных. Проверь, что передаёшь правильный тип (int, double, bool).';
  }

  return {
    raw,
    line,
    col,
    hint,
    formatted: line
      ? `Строка ${line}${col ? `, позиция ${col}` : ''}: ${hint}\n[Детали: ${raw.split('\n')[0]}]`
      : `${hint}\n[Детали: ${raw}]`
  };
}

/**
 * Запускает C++ код игрока через JSCPP с подключенным Bridge API <dungeon>.
 */
export function runCppCode(sourceCode, context = {}, jscppInstance = null) {
  const jscpp = jscppInstance || (typeof globalThis !== 'undefined' ? globalThis.JSCPP : null);
  if (!jscpp || typeof jscpp.run !== 'function') {
    return {
      ok: false,
      stdout: '',
      actions: [],
      error: {
        line: null,
        col: null,
        hint: 'Интерпретатор JSCPP не загружен.',
        formatted: 'Ошибка среды: библиотека JSCPP не найдена.'
      },
      stats: {}
    };
  }

  let stdout = '';
  const actions = [];
  const bonuses = context.bonuses || {};
  const enemies = Array.isArray(context.enemies) ? context.enemies : [context.enemy || { hp: 30, armor: 0 }];
  const primaryEnemy = enemies[0] || { hp: 30, armor: 0 };

  const heroHp = context.heroHp ?? 100;
  const heroMana = context.heroMana ?? 100;
  const runeCode = context.runeCode ?? 1;
  const doorPassword = context.doorPassword ?? 'OPEN';

  const config = {
    stdio: {
      write(s) {
        stdout += s;
      }
    },
    maxExecutionSteps: context.maxSteps || DEFAULT_MAX_STEPS,
    includes: {
      dungeon: {
        load(rt) {
          rt.regFunc((rt, _this, dmg) => {
            const rawDmg = Math.max(0, Math.round(dmg.v));
            const bonus = (bonuses.flatDamage || 0) + (bonuses.loopBonus || 0);
            actions.push({ type: 'attack', value: rawDmg + bonus, raw: rawDmg });
          }, 'global', 'attack', [rt.intTypeLiteral], rt.voidTypeLiteral);

          rt.regFunc((rt, _this, dmg) => {
            const rawDmg = Math.max(0, Math.round(dmg.v));
            actions.push({ type: 'pierceAttack', value: rawDmg + (bonuses.flatDamage || 0), raw: rawDmg });
          }, 'global', 'pierceAttack', [rt.intTypeLiteral], rt.voidTypeLiteral);

          rt.regFunc((rt, _this, dmg) => {
            const rawDmg = Math.max(0, Math.round(dmg.v));
            actions.push({ type: 'critHit', value: rawDmg * 2 + (bonuses.flatDamage || 0), raw: rawDmg });
          }, 'global', 'critHit', [rt.intTypeLiteral], rt.voidTypeLiteral);

          rt.regFunc((rt, _this, hp) => {
            const amount = Math.max(0, Math.round(hp.v));
            actions.push({ type: 'heal', value: amount + (bonuses.healBonus || 0) });
          }, 'global', 'heal', [rt.intTypeLiteral], rt.voidTypeLiteral);

          rt.regFunc(() => {
            actions.push({ type: 'castShield', value: 15 + (bonuses.shieldBonus || 0) });
          }, 'global', 'castShield', [], rt.voidTypeLiteral);

          rt.regFunc((rt, _this, x, y) => {
            actions.push({ type: 'move', x: x.v, y: y.v });
          }, 'global', 'move', [rt.intTypeLiteral, rt.intTypeLiteral], rt.voidTypeLiteral);

          rt.regFunc((rt, _this, keyVal) => {
            let str = '';
            try {
              str = rt.getStringFromCharArray(keyVal);
            } catch {
              str = String(keyVal?.v ?? '');
            }
            actions.push({ type: 'unlockDoor', value: str });
          }, 'global', 'unlockDoor', [rt.normalPointerType(rt.charTypeLiteral)], rt.voidTypeLiteral);

          rt.regFunc((rt) => rt.val(rt.intTypeLiteral, primaryEnemy.hp ?? 30), 'global', 'getEnemyHp', [], rt.intTypeLiteral);
          rt.regFunc((rt) => rt.val(rt.intTypeLiteral, primaryEnemy.armor ?? 0), 'global', 'getEnemyArmor', [], rt.intTypeLiteral);
          rt.regFunc((rt) => rt.val(rt.intTypeLiteral, enemies.length), 'global', 'getEnemyCount', [], rt.intTypeLiteral);
          rt.regFunc((rt, _this, idx) => {
            const e = enemies[idx.v];
            return rt.val(rt.intTypeLiteral, e ? e.hp : 0);
          }, 'global', 'getEnemyHpAt', [rt.intTypeLiteral], rt.intTypeLiteral);
          rt.regFunc((rt) => rt.val(rt.intTypeLiteral, heroHp), 'global', 'getHeroHp', [], rt.intTypeLiteral);
          rt.regFunc((rt) => rt.val(rt.intTypeLiteral, heroMana), 'global', 'getHeroMana', [], rt.intTypeLiteral);
          rt.regFunc((rt) => rt.val(rt.intTypeLiteral, runeCode), 'global', 'getRuneCode', [], rt.intTypeLiteral);

          rt.regFunc((rt, _this, idx) => {
            actions.push({ type: 'target', index: idx.v });
          }, 'global', 'targetEnemy', [rt.intTypeLiteral], rt.voidTypeLiteral);
        }
      }
    }
  };

  try {
    const processed = preprocessCpp(sourceCode);
    const exitCode = jscpp.run(processed, context.stdin || '', config);
    const stats = summarizeActions(actions, primaryEnemy, enemies, doorPassword);
    return {
      ok: true,
      exitCode,
      stdout,
      actions,
      error: null,
      stats
    };
  } catch (err) {
    return {
      ok: false,
      stdout,
      actions,
      error: formatCppError(err),
      stats: summarizeActions(actions, primaryEnemy, enemies, doorPassword)
    };
  }
}

function summarizeActions(actions, primaryEnemy, enemies, doorPassword) {
  let totalDamage = 0;
  let totalHeal = 0;
  let shieldActive = false;
  let attackCount = 0;
  let pierceCount = 0;
  let targetIndex = 0;
  let doorUnlocked = false;
  let moved = false;

  const armor = primaryEnemy.armor ?? 0;

  for (const act of actions) {
    if (act.type === 'target') {
      targetIndex = act.index;
    } else if (act.type === 'attack') {
      attackCount++;
      totalDamage += Math.max(0, act.value - armor);
    } else if (act.type === 'pierceAttack') {
      pierceCount++;
      totalDamage += act.value;
    } else if (act.type === 'critHit') {
      attackCount++;
      totalDamage += Math.max(0, act.value - Math.floor(armor / 2));
    } else if (act.type === 'heal') {
      totalHeal += act.value;
    } else if (act.type === 'castShield') {
      shieldActive = true;
    } else if (act.type === 'move') {
      moved = true;
    } else if (act.type === 'unlockDoor') {
      if (String(act.value).trim().toUpperCase() === String(doorPassword).toUpperCase()) {
        doorUnlocked = true;
      }
    }
  }

  return {
    totalDamage,
    totalHeal,
    shieldActive,
    attackCount,
    pierceCount,
    targetIndex,
    doorUnlocked,
    moved
  };
}
