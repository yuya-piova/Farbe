// ==========================================
// Diverse Observer Module
// ==========================================

class NotificationManager {
  async handleNotification(data) {
    try {
      const settings = await this.getSettings();
      await this.sendBrowserNotification(data);

      if (
        settings.lineEnabled &&
        settings.lineAccessToken &&
        settings.lineUserId
      ) {
        await this.sendLineNotification(data, settings);
      }
    } catch (error) {
      console.error('通知送信エラー:', error);
    }
  }

  async sendBrowserNotification(data) {
    const notificationId = `lms_evaluation_${Date.now()}`;

    await chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: '/icon.png',
      title: data.title,
      message: data.message,
      contextMessage: data.url,
      priority: 2,
    });

    chrome.notifications.onClicked.addListener((clickedNotificationId) => {
      if (clickedNotificationId === notificationId) {
        chrome.tabs.query({ url: data.url }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { active: true });
            chrome.windows.update(tabs[0].windowId, { focused: true });
          } else {
            chrome.tabs.create({ url: data.url });
          }
        });
        chrome.notifications.clear(clickedNotificationId);
      }
    });

    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 10000);
  }

  async sendLineNotification(data, settings) {
    try {
      const response = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.lineAccessToken}`,
        },
        body: JSON.stringify({
          to: settings.lineUserId,
          messages: [
            {
              type: 'text',
              text: `🔔 ${data.title}\n\n${data.message}\n\n📍 ${data.url}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error(`LINE API Error: ${response.status}`);
      console.log('LINE通知送信成功');
    } catch (error) {
      console.error('LINE通知送信エラー:', error);
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      // Farbe標準の local ストレージを使用
      chrome.storage.local.get(
        {
          lineEnabled: false,
          lineAccessToken: '',
          lineUserId: '',
        },
        (result) => resolve(result),
      );
    });
  }
}

const notificationManager = new NotificationManager();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEND_NOTIFICATION') {
    notificationManager
      .handleNotification(message.data)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
