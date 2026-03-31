export interface Message {
  id: string;
  sessionId: string;
  from: string;
  to: string;
  content: string;
  type: string;
  status: string;
  createdAt: string;
}

export default {
  // 发送消息
  async send(request: Request, env: any) {
    try {
      const body = await request.json();
      const { sessionId, from, to, content, type = 'text' } = body;

      if (!sessionId || !from || !to || !content) {
        return new Response(JSON.stringify({ error: '缺少必要字段' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 验证会话是否存在
      const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(sessionId).first();
      if (!session) {
        return new Response(JSON.stringify({ error: '会话不存在' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 验证发送方和接收方是否在会话中
      const sessionAgents = await env.DB.prepare('SELECT agentId FROM session_agents WHERE sessionId = ?').bind(sessionId).all();
      const agentIds = sessionAgents.results.map((item: any) => item.agentId);
      if (!agentIds.includes(from) || !agentIds.includes(to)) {
        return new Response(JSON.stringify({ error: '发送方或接收方不在会话中' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 创建消息
      const result = await env.DB.prepare(
        'INSERT INTO messages (sessionId, fromAgent, toAgent, content, type, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(sessionId, from, to, content, type, 'sent', new Date().toISOString()).run();

      // 更新会话最后消息时间
      await env.DB.prepare('UPDATE sessions SET lastMessageAt = ? WHERE id = ?').bind(new Date().toISOString(), sessionId).run();

      // 通过WebSocket发送消息
      const relayId = env.WEBSOCKET_RELAY.idFromName(sessionId);
      const relay = env.WEBSOCKET_RELAY.get(relayId);
      await relay.sendToAgent(to, {
        type: 'message',
        from,
        to,
        content,
        timestamp: new Date().toISOString()
      });

      return new Response(JSON.stringify({
        success: true,
        message: {
          id: result.meta.lastInsertRowid,
          sessionId,
          from,
          to,
          content,
          type,
          status: 'sent',
          timestamp: new Date().toISOString()
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      return new Response(JSON.stringify({ error: '发送消息失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // 获取消息历史
  async history(request: Request, env: any) {
    try {
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('sessionId');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      if (!sessionId) {
        return new Response(JSON.stringify({ error: '缺少会话ID' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const messages = await env.DB.prepare(
        'SELECT * FROM messages WHERE sessionId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?'
      ).bind(sessionId, limit, offset).all();

      return new Response(JSON.stringify({
        success: true,
        messages: messages.results.map((message: any) => ({
          id: message.id,
          from: message.fromAgent,
          to: message.toAgent,
          content: message.content,
          type: message.type,
          status: message.status,
          timestamp: message.createdAt
        }))
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('获取消息历史失败:', error);
      return new Response(JSON.stringify({ error: '获取消息历史失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
