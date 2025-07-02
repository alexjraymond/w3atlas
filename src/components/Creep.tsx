import React from "react";

interface CreepProps {
  name: string;
  level: number;
  experience: number;
  items: string[];
}

const Creep: React.FC<CreepProps> = ({ name, level, experience, items }) => {
    return (  
    <div>
        <h2>{name}</h2>
        <p>Level: {level}</p>
        <p>Experience: {experience}</p>
        <p>Items: {items.join(', ')}</p>
    </div>
    );
}

export default Creep;