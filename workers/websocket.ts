export default async function websocketHandler(request: Request, env: any) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const agentId = url.searchParams.get('agentId');

    if (!sessionId || !agentId) {
      return new Response(JSON.stringify({ error: '缺少会话ID或Agent ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证Agent是否存在
    const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(agentId).first();
    if (!agent) {
      return new Response(JSON.stringify({ error: 'Agent不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 验证Agent是否在会话中
    const sessionAgent = await env.DB.prepare('SELECT * FROM session_agents WHERE sessionId = ? AND agentId = ?').bind(sessionId, agentId).first();
    if (!sessionAgent) {
      return new Response(JSON.stringify({ error: 'Agent不在该会话中' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 获取WebSocket中继
    const relayId = env.WEBSOCKET_RELAY.idFromName(sessionId);
    const relay = env.WEBSOCKET_RELAY.get(relayId);

    // 升级为WebSocket连接
    const [client, server] = Object.values(new WebSocketPair());
    await relay.handleConnection(agentId, server);

    // 更新Agent状态为在线
    await env.DB.prepare('UPDATE agents SET status = ?, lastSeen = ? WHERE id = ?').bind('online', new Date().toISOString(), agentId).run();

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  } catch (error) {
    console.error('WebSocket连接失败:', error);
    return new Response(JSON.stringify({ error: 'WebSocket连接失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
