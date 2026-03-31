import { Router } from 'itty-router';
import { WebSocketRelay } from '../durabilities/relay';
import userHandler from './user';
import agentHandler from './agent';
import messageHandler from './message';
import websocketHandler from './websocket';

export { WebSocketRelay };

const router = Router();

// 健康检查
router.get('/health', () => {
  return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// API路由
router.post('/api/users/register', userHandler.register);
router.post('/api/users/login', userHandler.login);
router.post('/api/agents/register', agentHandler.register);
router.get('/api/agents', agentHandler.list);
router.get('/api/agents/:id', agentHandler.get);
router.post('/api/messages/send', messageHandler.send);
router.get('/api/messages/history', messageHandler.history);

// WebSocket路由
router.get('/ws', websocketHandler);

// 404处理
router.all('*', () => {
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
});

// 导出处理函数
export default { fetch: router.handle };
