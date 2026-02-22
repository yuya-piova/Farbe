// ==========================================
// Page Note Module (Background)
// ==========================================

// インストール・更新時に右クリックメニューを追加
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'open-page-note',
    title: '📝 メモを書く- Page Note',
    contexts: ['action'], // 拡張機能アイコンの右クリックメニューに表示
  });
});

// メニューがクリックされた時の処理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'open-page-note') {
    // クリックされたウィンドウのサイドパネルを開く
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((err) => {
      console.error('サイドパネルの起動エラー:', err);
    });
  }
});
