import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
  }

  connect(token) {
    return new Promise((resolve, reject) => {
      const wsUrl = import.meta.env.PROD 
        ? `${window.location.protocol}//${window.location.host}/ws`
        : 'http://localhost:8080/ws';
      
      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => console.log(str),
        onConnect: () => {
          this.connected = true;
          console.log('WebSocket Connected');
          resolve();
        },
        onDisconnect: () => {
          this.connected = false;
          console.log('WebSocket Disconnected');
        },
        onStompError: (frame) => {
          console.error('Broker error: ' + frame.headers['message']);
          reject(new Error('WebSocket connection error'));
        },
      });

      this.client.activate();
    });
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.connected = false;
    }
  }

  subscribe(destination, callback) {
    if (!this.connected || !this.client) {
      console.error('WebSocket is not connected');
      return null;
    }

    const subscription = this.client.subscribe(destination, callback);
    this.subscriptions.set(destination, subscription);
    return subscription;
  }

  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  send(destination, body, headers = {}) {
    if (!this.connected || !this.client) {
      console.error('WebSocket is not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers,
    });
  }

  sendChatMessage(message) {
    this.send('/app/chat.send', {
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    });
  }

  clearChatHistory() {
    this.send('/app/chat.clear', {});
  }

  isConnected() {
    return this.connected;
  }
}

const wsService = new WebSocketService();
export default wsService;
