// 内存存储服务
class MemoryStorage {
  constructor() {
    this.agents = new Map();
    this.sessions = new Map();
    this.messages = new Map();
    this.counter = 1;
  }

  // 生成唯一ID
  generateId() {
    return this.counter++;
  }

  // Agent相关操作
  createAgent(agentData) {
    const id = this.generateId();
    const agent = {
      _id: id.toString(),
      ...agentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.agents.set(id.toString(), agent);
    return agent;
  }

  getAgent(id) {
    return this.agents.get(id);
  }

  getAgents() {
    return Array.from(this.agents.values());
  }

  updateAgent(id, data) {
    const agent = this.agents.get(id);
    if (agent) {
      const updatedAgent = {
        ...agent,
        ...data,
        updatedAt: new Date()
      };
      this.agents.set(id, updatedAgent);
      return updatedAgent;
    }
    return null;
  }

  deleteAgent(id) {
    return this.agents.delete(id);
  }

  // Session相关操作
  createSession(sessionData) {
    const id = this.generateId();
    const session = {
      _id: id.toString(),
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sessions.set(id.toString(), session);
    return session;
  }

  getSession(id) {
    return this.sessions.get(id);
  }

  getSessions() {
    return Array.from(this.sessions.values());
  }

  updateSession(id, data) {
    const session = this.sessions.get(id);
    if (session) {
      const updatedSession = {
        ...session,
        ...data,
        updatedAt: new Date()
      };
      this.sessions.set(id, updatedSession);
      return updatedSession;
    }
    return null;
  }

  deleteSession(id) {
    return this.sessions.delete(id);
  }

  // Message相关操作
  createMessage(messageData) {
    const id = this.generateId();
    const message = {
      _id: id.toString(),
      ...messageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.messages.set(id.toString(), message);
    return message;
  }

  getMessage(id) {
    return this.messages.get(id);
  }

  getMessagesBySessionId(sessionId) {
    return Array.from(this.messages.values()).filter(msg => msg.sessionId === sessionId);
  }

  updateMessage(id, data) {
    const message = this.messages.get(id);
    if (message) {
      const updatedMessage = {
        ...message,
        ...data,
        updatedAt: new Date()
      };
      this.messages.set(id, updatedMessage);
      return updatedMessage;
    }
    return null;
  }

  deleteMessage(id) {
    return this.messages.delete(id);
  }
}

// 导出单例
module.exports = new MemoryStorage();