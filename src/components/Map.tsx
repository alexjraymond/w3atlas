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
        <div className="circle" style={{ top: '280px', left: '245px' }}></div>
        <div className="circle" style={{ top: '205px', left: '125px' }}></div>
        <div className="circle_orange" style={{ top: '365px', left: '55px' }}></div>
        <div className="circle_orange" style={{ top: '115px', left: '335px' }}></div>
        <div className="circle_orange" style={{ top: '305px', left: '45px' }}></div>
        <div className="circle_orange" style={{ top: '180px', left: '340px' }}></div>
        <div className="circle_orange" style={{ top: '350px', left: '230px' }}></div>
        <div className="circle_orange" style={{ top: '140px', left: '155px' }}></div>
        <div className="circle_orange" style={{ top: '450px', left: '290px' }}></div>
        <div className="circle_orange" style={{ top: '30px', left: '90px' }}></div>
                <div className="circle_red" style={{ top: '320px', left: '360px' }}></div>
        <div className="circle_red" style={{ top: '165px', left: '25px' }}></div>
            <div className="circle_red" style={{ top: '225px', left: '180px' }}></div>
         {/* This is where mroe circles go */}
       </div>
     );
   };

   export default Map;