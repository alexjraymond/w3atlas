import '@mantine/core/styles.css';

import { MantineProvider,
 } from '@mantine/core';
 


import './App.css'
// import Map from './components/Map'

import { CreateRoutePage } from './pages/CreateRoute';

function App() {

  return (
    <MantineProvider forceColorScheme='dark' >
        <div className="App">
          <CreateRoutePage />
          {/* Uncomment the following lines to include the map and button */}
         {/* <Map />
         <Button variant="outline" color="blue" size="md" className="add-circle-button" /> */}
       </div>
    </MantineProvider>
  )
}

export default App
