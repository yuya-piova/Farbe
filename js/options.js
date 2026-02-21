const colors = [
  'grey',
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
  'orange',
];

// === 画面描画処理 ===
function renderTabRules(rules) {
  const container = document.getElementById('tab-rules-container');
  container.innerHTML = '';
  rules.forEach((rule, index) => {
    const div = document.createElement('div');
    div.className = 'rule-card';
    div.innerHTML = `
      <div class="rule-header">
        <div class="input-group">
          <label>名前:</label><input type="text" class="tab-title" value="${rule.title}">
          <label>色:</label>
          <select class="tab-color">
            ${colors.map((c) => `<option value="${c}" ${c === rule.color ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="controls">
          <button class="btn-up" data-type="tab" data-index="${index}">↑</button>
          <button class="btn-down" data-type="tab" data-index="${index}">↓</button>
          <button class="btn-delete" data-type="tab" data-index="${index}">削除</button>
        </div>
      </div>
      <label>対象URL (改行区切り):</label>
      <textarea class="tab-urls">${rule.urls}</textarea>
    `;
    container.appendChild(div);
  });
}

function renderBlockRules(rules) {
  const container = document.getElementById('block-rules-container');
  container.innerHTML = '';
  rules.forEach((rule, index) => {
    const div = document.createElement('div');
    div.className = 'rule-card';
    div.innerHTML = `
      <div class="rule-header">
        <div class="controls" style="margin-left: auto;">
          <button class="btn-up" data-type="block" data-index="${index}">↑</button>
          <button class="btn-down" data-type="block" data-index="${index}">↓</button>
          <button class="btn-delete" data-type="block" data-index="${index}">削除</button>
        </div>
      </div>
      <div style="display: flex; gap: 15px; margin-bottom: 5px;">
        <div style="flex: 1;">
          <label>親URL (空白可):</label>
          <input type="text" class="block-opener" value="${rule.openerUrl || ''}" placeholder="例: *twitter.com*">
        </div>
        <div style="flex: 1;">
          <label>閉じるURL (必須):</label>
          <input type="text" class="block-target" value="${rule.targetUrl || ''}" placeholder="例: *spam.com*">
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderPinRules(rules) {
  const container = document.getElementById('pin-rules-container');
  container.innerHTML = '';
  rules.forEach((rule, index) => {
    const div = document.createElement('div');
    div.className = 'rule-card';
    div.innerHTML = `
      <div class="rule-header">
        <div class="input-group">
          <label>メモ:</label><input type="text" class="pin-memo" value="${rule.memo || ''}" placeholder="例: X (Twitter) 用など">
        </div>
        <div class="controls">
          <button class="btn-up" data-type="pin" data-index="${index}">↑</button>
          <button class="btn-down" data-type="pin" data-index="${index}">↓</button>
          <button class="btn-delete" data-type="pin" data-index="${index}">削除</button>
        </div>
      </div>
      <label>対象URL (改行区切り):</label>
      <textarea class="pin-urls">${rule.urls || ''}</textarea>
    `;
    container.appendChild(div);
  });
}

// === データ取得処理 ===
function getTabRules() {
  return Array.from(
    document.querySelectorAll('#tab-rules-container .rule-card'),
  ).map((card) => ({
    title: card.querySelector('.tab-title').value,
    color: card.querySelector('.tab-color').value,
    urls: card.querySelector('.tab-urls').value,
  }));
}

function getBlockRules() {
  return Array.from(
    document.querySelectorAll('#block-rules-container .rule-card'),
  ).map((card) => ({
    openerUrl: card.querySelector('.block-opener').value.trim(),
    targetUrl: card.querySelector('.block-target').value.trim(),
  }));
}

function getPinRules() {
  return Array.from(
    document.querySelectorAll('#pin-rules-container .rule-card'),
  ).map((card) => ({
    memo: card.querySelector('.pin-memo').value,
    urls: card.querySelector('.pin-urls').value,
  }));
}

// === イベント管理 (追加・削除・並び替え) ===
document.addEventListener('click', (e) => {
  const btn = e.target;
  if (!btn.dataset.type) return;

  const type = btn.dataset.type;
  const index = parseInt(btn.dataset.index);

  let rules, render;
  if (type === 'tab') {
    rules = getTabRules();
    render = renderTabRules;
  } else if (type === 'block') {
    rules = getBlockRules();
    render = renderBlockRules;
  } else if (type === 'pin') {
    rules = getPinRules();
    render = renderPinRules;
  }

  if (btn.classList.contains('btn-up') && index > 0) {
    [rules[index - 1], rules[index]] = [rules[index], rules[index - 1]];
    render(rules);
  } else if (btn.classList.contains('btn-down') && index < rules.length - 1) {
    [rules[index + 1], rules[index]] = [rules[index], rules[index + 1]];
    render(rules);
  } else if (btn.classList.contains('btn-delete')) {
    rules.splice(index, 1);
    render(rules);
  }
});

document.getElementById('add-tab-rule').onclick = () => {
  const rules = getTabRules();
  rules.push({ title: '新規グループ', color: 'grey', urls: '' });
  renderTabRules(rules);
};

document.getElementById('add-block-rule').onclick = () => {
  const rules = getBlockRules();
  rules.push({ openerUrl: '', targetUrl: '' });
  renderBlockRules(rules);
};

document.getElementById('add-pin-rule').onclick = () => {
  const rules = getPinRules();
  rules.push({ memo: '', urls: '' });
  renderPinRules(rules);
};

// === 保存処理 ===
document.getElementById('save-rules').onclick = () => {
  const tabRules = getTabRules();
  const blockRules = getBlockRules();
  const pinRules = getPinRules();
  const autoSort = document.getElementById('auto-sort-toggle').checked;

  chrome.storage.local.set({ tabRules, blockRules, pinRules, autoSort }, () => {
    const msg = document.getElementById('message');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 2000);
  });
};

document.getElementById('btn-sort').onclick = () => {
  chrome.runtime.sendMessage({ action: 'sortTabs' }, (response) => {
    const msg = document.getElementById('message');

    if (chrome.runtime.lastError || !response || !response.success) {
      msg.textContent = 'エラーが発生しました';
      msg.style.color = '#ef4444';
    } else {
      msg.textContent = 'タブを整理しました！';
      msg.style.color = '#10b981';
    }
    msg.classList.add('show');
    setTimeout(() => {
      msg.classList.remove('show');
      setTimeout(() => {
        msg.textContent = '保存しました！';
        msg.style.color = '#10b981';
      }, 300);
    }, 2000);
  });
};

// === 初期化 ===
chrome.storage.local.get(
  ['tabRules', 'blockRules', 'pinRules', 'autoSort'],
  (result) => {
    renderTabRules(result.tabRules || []);
    renderBlockRules(result.blockRules || []);
    renderPinRules(result.pinRules || []);

    document.getElementById('auto-sort-toggle').checked =
      result.autoSort || false;
    setTimeout(updateScrollSpy, 50);
  },
);

const navLinks = document.querySelectorAll('.nav-link');
const appContainers = document.querySelectorAll('.app-container');
const scrollArea = document.getElementById('scroll-area');
const btnSort = document.getElementById('btn-sort');

// 1. メニュークリック時の挙動（アプリ切り替え＆スクロール）
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetAppId = link.getAttribute('data-app');
    const targetSectionId = link.getAttribute('data-target');

    // 全てのアプリを非表示にして、対象のアプリだけ表示
    appContainers.forEach((app) => {
      if (app.id === `app-${targetAppId}`) {
        app.classList.add('active');
      } else {
        app.classList.remove('active');
      }
    });

    // TaxiTabsを見ている時だけ「Sort Tabs」ボタンを表示
    if (targetAppId === 'taxitabs') {
      btnSort.classList.remove('hidden');
    } else {
      btnSort.classList.add('hidden');
    }

    // 対象のセクションへスムーススクロール
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// 2. スクロールスパイ（現在表示中のアプリ内でのみ作動）
function updateScrollSpy() {
  const activeApp = document.querySelector('.app-container.active');
  if (!activeApp) return;

  const sections = activeApp.querySelectorAll('.section');
  if (sections.length === 0) return;

  let currentSectionId = '';
  // main-content のスクロール量で計算する
  const triggerPoint = scrollArea.scrollTop + 150;

  sections.forEach((section) => {
    // セクションの位置も scrollArea 内での相対位置 (offsetTop) になる
    if (triggerPoint >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  // 一番下までスクロールした時の判定
  const isAtBottom =
    scrollArea.clientHeight + scrollArea.scrollTop >=
    scrollArea.scrollHeight - 10;
  if (isAtBottom && sections.length > 0) {
    currentSectionId = sections[sections.length - 1].id;
  }

  // デフォルト
  if (!currentSectionId && sections.length > 0) {
    currentSectionId = sections[0].id;
  }

  // ナビゲーションの active を更新
  navLinks.forEach((link) => {
    link.classList.remove('active');
    // 現在表示されているアプリに属し、かつターゲットIDが一致するリンクを光らせる
    if (
      link.getAttribute('data-app') === activeApp.id.replace('app-', '') &&
      link.getAttribute('data-target') === currentSectionId
    ) {
      link.classList.add('active');
    }
  });
}

// 右側のメインエリアがスクロールされた時にスパイを実行
scrollArea.addEventListener('scroll', updateScrollSpy);
