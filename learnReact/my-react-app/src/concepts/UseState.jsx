import {useState} from 'react';
import {createRoot} from 'react-dom/client';

export function MyCar() {
  const [brand, setBrand] = useState("Ford");
  const [model, setModel] = useState("Mustang");
  const [year, setYear] = useState("1964");
  const [color, setColor] = useState("red");
  const [car, setCar] = useState({ //we can also store object in state
    brand: "Ford",
    model: "Mustang",
    year: "1964",
    color: "red"
  });


  return (
    <>
      <h1>My {brand}</h1>
      <p>
        It is a {color} {model} from {year}.
        <br />
        Brand: {car.brand}
        <br />
        Model: {car.model}
        <br />
        Year: {car.year}
        <br />
        Color: {car.color}

      </p>
    </>
  )
}
