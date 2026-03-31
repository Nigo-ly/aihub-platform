import React, { useState, useEffect } from 'react';
import { Box, Heading, Select, Table, Thead, Tbody, Tr, Th, Td, Badge, Flex, Text, Input, Button, Icon } from '@chakra-ui/react';
import { Search, Send } from 'lucide-react';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedSession, setSelectedSession] = useState('1');
  const [newMessage, setNewMessage] = useState('');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // 模拟数据获取
    setTimeout(() => {
      setSessions([
        { value: '1', label: '会话 1' },
        { value: '2', label: '会话 2' },
        { value: '3', label: '会话 3' },
        { value: '4', label: '会话 4' },
      ]);
      setMessages([
        { id: 1, from: 'Agent 1', to: 'Agent 2', content: '你好，我是Agent 1', timestamp: '2026-04-01 10:00', status: 'read' },
        { id: 2, from: 'Agent 2', to: 'Agent 1', content: '你好，我是Agent 2', timestamp: '2026-04-01 10:01', status: 'read' },
        { id: 3, from: 'Agent 1', to: 'Agent 2', content: '我们可以开始工作了', timestamp: '2026-04-01 10:02', status: 'delivered' },
        { id: 4, from: 'Agent 3', to: 'Agent 1', content: '我也加入讨论', timestamp: '2026-04-01 10:03', status: 'sent' },
      ]);
    }, 500);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // 模拟发送消息
      const newMsg = {
        id: messages.length + 1,
        from: 'Agent 1',
        to: 'Agent 2',
        content: newMessage,
        timestamp: new Date().toLocaleString(),
        status: 'sent'
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <Box>
      <Heading size="lg" mb="6">
        消息记录
      </Heading>
      <Flex mb="6">
        <Box flex="1">
          <Text mb="2">选择会话</Text>
          <Select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            {sessions.map((session) => (
              <option key={session.value} value={session.value}>
                {session.label}
              </option>
            ))}
          </Select>
        </Box>
        <Box ml="4" flex="1">
          <Text mb="2">搜索消息</Text>
          <Flex>
            <Input placeholder="搜索消息内容" />
            <Button ml="2" colorScheme="blue">
              <Icon as={Search} size={16} />
            </Button>
          </Flex>
        </Box>
      </Flex>
      <Box borderWidth="1px" rounded="lg" overflow="hidden">
        <Box bg="gray.50" p="4" borderBottomWidth="1px">
          <Text fontWeight="medium">会话 1 - Agent 1, Agent 2, Agent 3</Text>
        </Box>
        <Box height="400px" overflowY="auto" p="4">
          {messages.map((message) => (
            <Flex key={message.id} mb="4" justifyContent={message.from === 'Agent 1' ? 'flex-end' : 'flex-start'}>
              <Box maxW="70%">
                <Flex alignItems="center" mb="1">
                  <Text fontSize="sm" fontWeight="medium">
                    {message.from}
                  </Text>
                  <Badge ml="2" size="sm" colorScheme={message.status === 'read' ? 'green' : message.status === 'delivered' ? 'blue' : 'gray'}>
                    {message.status}
                  </Badge>
                </Flex>
                <Box
                  bg={message.from === 'Agent 1' ? 'blue.100' : 'gray.100'}
                  p="3"
                  rounded="lg"
                >
                  <Text>{message.content}</Text>
                </Box>
                <Text fontSize="xs" color="gray.500" mt="1">
                  {message.timestamp}
                </Text>
              </Box>
            </Flex>
          ))}
        </Box>
        <Box borderTopWidth="1px" p="4">
          <Flex>
            <Input
              flex="1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button ml="2" colorScheme="blue" onClick={handleSendMessage}>
              <Icon as={Send} size={16} />
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Messages;
