import { createJWT, verifyJWT } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

export default {
  // 用户注册
  async register(request: Request, env: any) {
    try {
      const body = await request.json();
      const { username, email, password } = body;

      if (!username || !email || !password) {
        return new Response(JSON.stringify({ error: '缺少必要字段' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 检查用户是否已存在
      const existingUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
      if (existingUser) {
        return new Response(JSON.stringify({ error: '用户已存在' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 哈希密码
      const hashedPassword = await hashPassword(password);

      // 创建用户
      const result = await env.DB.prepare(
        'INSERT INTO users (username, email, password, createdAt) VALUES (?, ?, ?, ?)'
      ).bind(username, email, hashedPassword, new Date().toISOString()).run();

      // 生成JWT令牌
      const token = createJWT({ id: result.meta.lastInsertRowid, username, email }, env.JWT_SECRET);

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: result.meta.lastInsertRowid,
          username,
          email
        },
        token
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('注册失败:', error);
      return new Response(JSON.stringify({ error: '注册失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // 用户登录
  async login(request: Request, env: any) {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(JSON.stringify({ error: '缺少必要字段' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 查找用户
      const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
      if (!user) {
        return new Response(JSON.stringify({ error: '用户不存在' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 验证密码
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return new Response(JSON.stringify({ error: '密码错误' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 生成JWT令牌
      const token = createJWT({ id: user.id, username: user.username, email: user.email }, env.JWT_SECRET);

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('登录失败:', error);
      return new Response(JSON.stringify({ error: '登录失败' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
