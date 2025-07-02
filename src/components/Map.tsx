   import React from 'react';
   import './Map.css';

   const Map: React.FC = () => {
     return (
       <div className="map-container">
         <img src="/maps/concealed_hill.png" alt="Concealed Hill" className="map-image" />
         <div className="circle" style={{ top: '440px', left: '185px' }}></div>
         <div className="circle" style={{ top: '30px', left: '191px' }}></div>
        <div className="circle" style={{ top: '85px', left: '20px' }}></div>
         <div className="circle" style={{ top: '390px', left: '365px' }}></div>
         {/* This is where mroe circles go */}
       </div>
     );
   };

   export default Map;