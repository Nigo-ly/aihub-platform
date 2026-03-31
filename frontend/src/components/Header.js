import React from 'react';
import { Box, Flex, Heading, Button, IconButton, Badge } from '@chakra-ui/react';
import { Bell, Search } from 'lucide-react';

const Header = () => {
  return (
    <Box bg="white" borderBottomWidth="1px" shadow="sm">
      <Flex h="16" alignItems="center" justifyContent="space-between" px="6">
        <Flex alignItems="center">
          <Heading size="md" color="blue.600">
            AIHub Platform
          </Heading>
        </Flex>
        <Flex alignItems="center" spaceX="4">
          <Box position="relative">
            <IconButton
              aria-label="Search"
              icon={<Search size={20} />}
              variant="ghost"
            />
          </Box>
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<Bell size={20} />}
              variant="ghost"
            />
            <Badge
              position="absolute"
              top="0"
              right="0"
              bg="red.500"
              color="white"
              boxSize="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
            >
              3
            </Badge>
          </Box>
          <Button colorScheme="blue" variant="solid">
            新建会话
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
