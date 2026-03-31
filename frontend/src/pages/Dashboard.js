import React, { useEffect, useState } from 'react';
import { Box, Heading, Grid, Card, CardHeader, CardBody, Text, Badge, Flex, Button, Skeleton } from '@chakra-ui/react';
import { Agents, Session, MessageSquare } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalAgents: 0,
    onlineAgents: 0,
    totalSessions: 0,
    activeSessions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 获取Agent列表
        const agentsRes = await axios.get(`${API_BASE_URL}/api/agents`);
        const agents = agentsRes.data.agents || [];
        
        // 获取会话列表
        let sessions = [];
        try {
          const sessionsRes = await axios.get(`${API_BASE_URL}/api/sessions`);
          sessions = sessionsRes.data.sessions || [];
        } catch (e) {
          // 会话API可能还没实现
        }

        setStats({
          totalAgents: agents.length,
          onlineAgents: agents.filter(a => a.status === 'online').length,
          totalSessions: sessions.length,
          activeSessions: sessions.filter(s => s.status === 'active').length
        });
      } catch (err) {
        console.error('获取统计数据失败:', err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: '总Agent数', value: stats.totalAgents, icon: Agents, color: 'blue', badge: '全部' },
    { label: '在线Agent', value: stats.onlineAgents, icon: Agents, color: 'green', badge: '在线' },
    { label: '总会话数', value: stats.totalSessions, icon: Session, color: 'purple', badge: '全部' },
    { label: '活跃会话', value: stats.activeSessions, icon: MessageSquare, color: 'orange', badge: '活跃' }
  ];

  return (
    <Box>
      <Heading size="lg" mb="6">仪表盘</Heading>
      <Grid templateColumns="repeat(4, 1fr)" gap="6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" color="gray.500">{stat.label}</Text>
                <stat.icon size={16} />
              </Flex>
            </CardHeader>
            <CardBody pt="0">
              <Flex justifyContent="space-between" alignItems="center">
                {loading ? (
                  <Skeleton height="36px" width="60px" />
                ) : (
                  <Text fontSize="3xl" fontWeight="bold">{stat.value}</Text>
                )}
                <Badge colorScheme={stat.color} variant="outline">{stat.badge}</Badge>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </Grid>
      <Box mt="6">
        <Card>
          <CardHeader>
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontWeight="medium">快速开始</Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <Text color="gray.600">
              欢迎使用 AIHub 平台！先在左侧「Agent管理」中添加你的第一个Agent，然后开始使用。
            </Text>
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
