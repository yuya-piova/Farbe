// ==========================================
// Make Piece Module
// ==========================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'makepiece' && request.data) {
    handleMakePiece(request.data);
  } else if (request.createtab) {
    chrome.tabs.create({ url: request.createtab.url });
  }
  return true;
});

async function handleMakePiece(data) {
  // 1. Storageから設定されたエンドポイントURLを取得
  const storage = await chrome.storage.local.get(['makePieceEndpoint']);
  const endpoint = storage.makePieceEndpoint;

  if (!endpoint) {
    console.error(
      'MakePiece Error: Webhook endpoint is not configured in Settings.',
    );
    return;
  }

  // 2. 送信データの組み立て
  const fetchData = {
    _Area: 'Work',
    _Type: 'Task',
    State: data.state,
    title: data.taskname || 'TASK FROM MAKEPIECE',
    start: data.duedate || formatDate(new Date()),
    childrenText: data.childrenText || '',
    icon: '☑️',
  };

  if (data.url) fetchData.url = data.url;

  // 3. Webhookの実行
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fetchData),
    });

    if (!response.ok) {
      console.error('MakePiece Webhook failed:', response.statusText);
    } else {
      console.log('MakePiece Webhook success!');
    }
  } catch (error) {
    console.error('MakePiece Fetch error:', error);
  }
}

const formatDate = (date) => date.toISOString().split('T')[0];
