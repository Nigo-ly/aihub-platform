import React from 'react';
import { Box, VStack, Text, Icon, Link, Button } from '@chakra-ui/react';
import { Home, Users, MessageSquare, Settings, LogOut } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: '仪表盘', icon: Home, path: '/' },
    { name: 'Agent管理', icon: Users, path: '/agents' },
    { name: '会话管理', icon: MessageSquare, path: '/sessions' },
    { name: '消息记录', icon: MessageSquare, path: '/messages' },
    { name: '设置', icon: Settings, path: '/settings' },
  ];

  return (
    <Box
      w="64"
      bg="white"
      borderRightWidth="1px"
      h="calc(100vh - 4rem)"
      overflow="auto"
    >
      <VStack align="stretch" spacing="0" p="4">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            as={RouterLink}
            to={item.path}
            p="4"
            borderLeftWidth="4"
            borderLeftColor={item.path === '/' ? 'blue.500' : 'transparent'}
            _hover={{ bg: 'gray.50' }}
          >
            <Box display="flex" alignItems="center" spaceX="3">
              <Icon as={item.icon} size={20} color="gray.600" />
              <Text fontSize="sm" fontWeight="medium">
                {item.name}
              </Text>
            </Box>
          </Link>
        ))}
        <Box mt="auto" pt="4" borderTopWidth="1px" borderTopColor="gray.100">
          <Button leftIcon={<LogOut size={16} />} variant="ghost" w="full">
            退出登录
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
