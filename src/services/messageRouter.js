// 消息路由服务
class MessageRouter {
  constructor() {
    this.agentConnections = new Map(); // 存储Agent连接
    this.sessions = new Map(); // 存储会话
  }

  // 注册Agent连接
  registerAgent(agentId, connection) {
    this.agentConnections.set(agentId, connection);
    console.log(`Agent ${agentId} 已注册`);
  }

  // 注销Agent连接
  unregisterAgent(agentId) {
    this.agentConnections.delete(agentId);
    console.log(`Agent ${agentId} 已注销`);
  }

  // 发送消息到指定Agent
  async sendMessage(fromAgentId, toAgentId, message) {
    const toConnection = this.agentConnections.get(toAgentId);
    
    if (!toConnection) {
      return { success: false, error: '目标Agent未连接' };
    }

    try {
      // 构建消息格式
      const formattedMessage = {
        type: 'message',
        from: fromAgentId,
        to: toAgentId,
        content: message,
        timestamp: new Date().toISOString()
      };

      // 发送消息
      if (toConnection.send) {
        toConnection.send(JSON.stringify(formattedMessage));
      }

      return { success: true, messageId: Date.now().toString() };
    } catch (error) {
      console.error('发送消息失败:', error);
      return { success: false, error: '发送消息失败' };
    }
  }

  // 创建会话
  createSession(sessionId, agentIds) {
    this.sessions.set(sessionId, {
      id: sessionId,
      agents: agentIds,
      createdAt: new Date(),
      messages: []
    });
    return this.sessions.get(sessionId);
  }

  // 添加消息到会话
  addMessageToSession(sessionId, message) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push({
        ...message,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  }

  // 获取会话
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  // 广播消息到会话中的所有Agent
  broadcastToSession(sessionId, message, excludeAgentId = null) {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: '会话不存在' };

    session.agents.forEach(agentId => {
      if (agentId !== excludeAgentId) {
        this.sendMessage(message.from, agentId, message.content);
      }
    });

    return { success: true };
  }
}

// 导出单例
module.exports = new MessageRouter();