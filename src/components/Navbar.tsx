import { useState } from 'react';
import {  Group, Burger, Avatar, Menu, Text, Divider } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import { IconUser, IconRoute, IconSettings, IconLogout, IconLogin } from '@tabler/icons-react';

export function Navbar() {
  const [opened, { toggle }] = useDisclosure();
  const [isSignedIn, setIsSignedIn] = useState(false); // This would come from your auth context/state

  const handleSignIn = () => {
    // Implement sign in logic here
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    // Implement sign out logic here
    setIsSignedIn(false);
  };

  return (
    <Group justify='space-between' align="center" style={{ height: '100%', padding: '0px 40px' }}>
      <Text size="lg" fw={600}>W3Atlas</Text>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Avatar 
              alt="User Avatar"
              radius="xl"
              style={{ marginLeft: 'auto', cursor: 'pointer' }} 
            />
          </Menu.Target>

          <Menu.Dropdown>
            {isSignedIn ? (
              <>
                <Menu.Item leftSection={<IconUser size={16} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconRoute size={16} />}>
                  My Routes
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />}>
                  Settings
                </Menu.Item>
                <Divider />
                <Menu.Item 
                  leftSection={<IconLogout size={16} />}
                  onClick={handleSignOut}
                  color="red"
                >
                  Sign Out
                </Menu.Item>
              </>
            ) : (
              <Menu.Item 
                leftSection={<IconLogin size={16} />}
                onClick={handleSignIn}
              >
                Sign In
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </Group>
  );
}
