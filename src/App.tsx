import '@mantine/core/styles.css';

import { createTheme, MantineProvider,
 } from '@mantine/core';
 


import './App.css'


import { CreateRoutePage } from './pages/CreateRoute';



function App() {

  return (
    <MantineProvider 
    forceColorScheme='dark'
    >
          <CreateRoutePage />
    </MantineProvider>
  )
}

export default App
