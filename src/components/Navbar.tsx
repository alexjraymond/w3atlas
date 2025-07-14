import {  Group, Burger, Avatar } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export function Navbar() {

          const [opened, { toggle }] = useDisclosure();
  return (
        <Group justify='space-between' align="center" style={{ height: '100%', padding: '0px 40px' }}>
            <p>W3Atlas</p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
        <Burger
          opened={opened}
          onClick={toggle}
          hiddenFrom="sm"
          size="sm"
        />
        
        <Avatar 
            alt="User Avatar"
            radius="xl"
            style={{ marginLeft: 'auto' }} />
        </div>
        </Group>


  );
}
