// OpenClaw ACP协议集成服务
class ACPService {
  constructor() {
    this.agentConnections = new Map();
  }

  // 解析ACP协议消息
  parseACPMessage(message) {
    try {
      return JSON.parse(message);
    } catch (error) {
      console.error('解析ACP消息失败:', error);
      return null;
    }
  }

  // 构建ACP协议消息
  buildACPMessage(type, data) {
    return JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // 处理OpenClaw Agent连接
  handleAgentConnection(agentId, connection) {
    this.agentConnections.set(agentId, connection);

    // 监听消息
    connection.on('message', (message) => {
      this.handleIncomingMessage(agentId, message);
    });

    // 监听连接关闭
    connection.on('close', () => {
      this.agentConnections.delete(agentId);
      console.log(`OpenClaw Agent ${agentId} 连接已关闭`);
    });

    // 监听错误
    connection.on('error', (error) => {
      console.error(`OpenClaw Agent ${agentId} 连接错误:`, error);
    });
  }

  // 处理 incoming消息
  handleIncomingMessage(agentId, message) {
    const acpMessage = this.parseACPMessage(message);
    if (!acpMessage) return;

    switch (acpMessage.type) {
      case 'message':
        this.handleMessage(agentId, acpMessage.data);
        break;
      case 'status':
        this.handleStatusUpdate(agentId, acpMessage.data);
        break;
      case 'ping':
        this.handlePing(agentId);
        break;
      default:
        console.log(`未知的ACP消息类型: ${acpMessage.type}`);
    }
  }

  // 处理消息
  handleMessage(agentId, data) {
    console.log(`收到来自Agent ${agentId} 的消息:`, data);
    // 这里可以调用messageRouter来转发消息
  }

  // 处理状态更新
  handleStatusUpdate(agentId, data) {
    console.log(`Agent ${agentId} 状态更新:`, data);
    // 这里可以更新Agent的状态
  }

  // 处理ping
  handlePing(agentId) {
    const connection = this.agentConnections.get(agentId);
    if (connection && connection.send) {
      connection.send(this.buildACPMessage('pong', {}));
    }
  }

  // 发送消息到OpenClaw Agent
  sendToAgent(agentId, message) {
    const connection = this.agentConnections.get(agentId);
    if (!connection) {
      return { success: false, error: 'Agent未连接' };
    }

    try {
      const acpMessage = this.buildACPMessage('message', message);
      connection.send(acpMessage);
      return { success: true };
    } catch (error) {
      console.error('发送消息到Agent失败:', error);
      return { success: false, error: '发送消息失败' };
    }
  }

  // 关闭Agent连接
  closeAgentConnection(agentId) {
    const connection = this.agentConnections.get(agentId);
    if (connection) {
      connection.close();
      this.agentConnections.delete(agentId);
    }
  }

  // 获取Agent连接状态
  getAgentStatus(agentId) {
    return this.agentConnections.has(agentId);
  }
}

// 导出单例
module.exports = new ACPService();