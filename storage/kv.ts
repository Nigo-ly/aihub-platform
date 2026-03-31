export class KVStorage {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  // 存储会话数据
  async setSession(sessionId: string, data: any): Promise<void> {
    await this.kv.put(`session:${sessionId}`, JSON.stringify(data), {
      expirationTtl: 86400 // 24小时
    });
  }

  // 获取会话数据
  async getSession(sessionId: string): Promise<any | null> {
    const data = await this.kv.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  // 删除会话数据
  async deleteSession(sessionId: string): Promise<void> {
    await this.kv.delete(`session:${sessionId}`);
  }

  // 存储Agent临时数据
  async setAgentData(agentId: string, data: any): Promise<void> {
    await this.kv.put(`agent:${agentId}`, JSON.stringify(data), {
      expirationTtl: 86400 // 24小时
    });
  }

  // 获取Agent临时数据
  async getAgentData(agentId: string): Promise<any | null> {
    const data = await this.kv.get(`agent:${agentId}`);
    return data ? JSON.parse(data) : null;
  }

  // 存储WebSocket连接信息
  async setWebSocketConnection(sessionId: string, agentId: string, connectionInfo: any): Promise<void> {
    await this.kv.put(`ws:${sessionId}:${agentId}`, JSON.stringify(connectionInfo), {
      expirationTtl: 3600 // 1小时
    });
  }

  // 获取WebSocket连接信息
  async getWebSocketConnection(sessionId: string, agentId: string): Promise<any | null> {
    const data = await this.kv.get(`ws:${sessionId}:${agentId}`);
    return data ? JSON.parse(data) : null;
  }

  // 删除WebSocket连接信息
  async deleteWebSocketConnection(sessionId: string, agentId: string): Promise<void> {
    await this.kv.delete(`ws:${sessionId}:${agentId}`);
  }
}
