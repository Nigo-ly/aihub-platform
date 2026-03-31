export class WebSocketRelay implements DurableObject {
  private connections: Map<string, WebSocket> = new Map();
  private sessionId: string;

  constructor(state: DurableObjectState, env: any) {
    this.sessionId = state.id.toString();
  }

  // 处理WebSocket连接
  async handleConnection(agentId: string, webSocket: WebSocket) {
    // 保存连接
    this.connections.set(agentId, webSocket);

    // 监听消息
    webSocket.onmessage = (event) => {
      this.handleMessage(agentId, event.data);
    };

    // 监听关闭
    webSocket.onclose = () => {
      this.connections.delete(agentId);
    };

    // 监听错误
    webSocket.onerror = (error) => {
      console.error('WebSocket错误:', error);
      this.connections.delete(agentId);
    };

    // 发送连接成功消息
    webSocket.send(JSON.stringify({
      type: 'connected',
      agentId,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    }));
  }

  // 处理消息
  private handleMessage(agentId: string, data: string) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'message':
          this.sendMessage(agentId, message);
          break;
        case 'ping':
          this.sendPong(agentId);
          break;
        default:
          console.log('未知消息类型:', message.type);
      }
    } catch (error) {
      console.error('处理消息失败:', error);
    }
  }

  // 发送消息到指定Agent
  private sendMessage(fromAgentId: string, message: any) {
    const { to, content } = message;
    const toConnection = this.connections.get(to);

    if (toConnection) {
      toConnection.send(JSON.stringify({
        type: 'message',
        from: fromAgentId,
        to,
        content,
        timestamp: new Date().toISOString()
      }));
    } else {
      // Agent不在线，发送离线消息
      console.log(`Agent ${to} 不在线`);
    }
  }

  // 发送Pong响应
  private sendPong(agentId: string) {
    const connection = this.connections.get(agentId);
    if (connection) {
      connection.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
    }
  }

  // 从外部发送消息到Agent
  async sendToAgent(agentId: string, message: any) {
    const connection = this.connections.get(agentId);
    if (connection) {
      connection.send(JSON.stringify(message));
      return { success: true };
    } else {
      return { success: false, error: 'Agent不在线' };
    }
  }

  // 处理HTTP请求（用于外部调用）
  async fetch(request: Request) {
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    if (action === 'send') {
      const body = await request.json();
      const { agentId, message } = body;
      return new Response(JSON.stringify(await this.sendToAgent(agentId, message)), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
