import { generateApiKey } from '../utils/crypto';

export interface Agent {
  id: string;
  name: string;
  type: string;
  userId: string;
  apiKey: string;
  status: string;
  lastSeen: string | null;
  createdAt: string;
}

export default {
  // 注册Agent
  async register(request: Request, env: any) {
    try {
      const body = await request.json();
      const { name, type = 'openclaw', userId } = body;

      if (!name || !userId) {
        return new Response(JSON.stringify({ error: '缺少必要字段' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 生成API密钥
      const apiKey = generateApiKey();

      // 创建Agent
      const result = await env.DB.prepare(
        'INSERT INTO agents (name, type, userId, apiKey, status, lastSeen, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(name, type, userId, apiKey, 'offline', null, new Date().toISOString()).run();

      return new Response(JSON.stringify({
        success: true,
        agent: {
          id: result.meta.lastInsertRowid,
          name,
          type,
          apiKey,
          status: 'offline',
          createdAt: new Date().toISOString()
        }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('注册Agent失败:', error);
      return new Response(JSON.stringify({ error: '注册Agent失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // 获取Agent列表
  async list(request: Request, env: any) {
    try {
      const agents = await env.DB.prepare('SELECT * FROM agents').all();
      return new Response(JSON.stringify({
        success: true,
        agents: agents.results.map((agent: any) => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          lastSeen: agent.lastSeen,
          createdAt: agent.createdAt
        }))
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('获取Agent列表失败:', error);
      return new Response(JSON.stringify({ error: '获取Agent列表失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // 获取单个Agent详情
  async get(request: Request, env: any) {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      const agent = await env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(id).first();
      if (!agent) {
        return new Response(JSON.stringify({ error: 'Agent不存在' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        agent: {
          id: agent.id,
          name: agent.name,
          type: agent.type,
          status: agent.status,
          lastSeen: agent.lastSeen,
          createdAt: agent.createdAt
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('获取Agent详情失败:', error);
      return new Response(JSON.stringify({ error: '获取Agent详情失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
