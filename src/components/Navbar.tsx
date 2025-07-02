import { AppShell, Group, Burger, Avatar } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';

export function Navbar() {

          const [opened, { toggle }] = useDisclosure();
  return (
      <AppShell.Header>
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
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            radius="xl"
            style={{ marginLeft: 'auto' }} />
        </div>
        </Group>
      </AppShell.Header>


  );
}
