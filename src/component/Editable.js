import React, { useState, useEffect } from "react"
var myModule = require('./const');
const USMap = (props) => {
  const { statesData } = props;
  console.log(props);
  return (
    <svg viewBox="0 0 960 600" height = {400} width = {400}>
      {statesData.map((stateData, index) =>
        <path
          className="someCSSClass"
          style={{cursor: "pointer",fill: "orange"}}
          key={index}
          stroke="#fff"
          strokeWidth="6px"
          d={stateData.shape}
          onMouseOver={(event) => {
            event.target.style.fill = 'red';
            console.log(stateData.name);
           // alert(stateData.name)
          }}
          
          onMouseOut={(event) => {
            event.target.style.fill = 'orange';
          }}
          onClick = {(event) => {
            console.log(stateData.name);
            var name = myModule.city;
            console.log(name);
            module.city = stateData.name;
            console.log(module.city);
          }}
        >
        </path>
      )}
    </svg>
  )
}
const Editable = () => {
  const [statesData, setStatesData] = useState(null);
  useEffect(() => {
    (async () => {
      const res = await fetch('https://willhaley.com/assets/united-states-map-react/states.json');
      const statesData = await res.json();
      setTimeout(()=>{
        console.log(res);
      },1000);
      
      setStatesData(statesData);
    })();
  }, []);
  if (!statesData) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <USMap  statesData={statesData} />
  );
};
export default Editable;