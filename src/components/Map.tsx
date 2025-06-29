   import React from 'react';
   import './Map.css';

   const Map: React.FC = () => {
     return (
       <div className="map-container">
         <img src="/maps/concealed_hill.png" alt="Concealed Hill" className="map-image" />
         <div className="circle" style={{ top: '520px', left: '275px' }}></div>
         <div className="circle" style={{ top: '20px', left: '275px' }}></div>
         {/* This is where mroe circles go */}
       </div>
     );
   };

   export default Map;