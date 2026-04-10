import { useState}  from "react";
import { createRoot } from "react-dom/client";

export function MyForm(){
    const[name, setName] = useState(""); //here name is a variable and setName is the only function that can change that name 

    function handleChange(e){ //e is the react event object created when onChange event fires
        setName(e.target.value.toUpperCase()); //e.target.value gives the current value of the input field, as in form onChange = {handleChange}
    }
    function handleSubmit(e){
        e.preventDefault();
        alert(name);
    }

    return (
        <form onSubmit = {handleSubmit}>
            <label>
                Enter your Name:
                <input type="text" value={name} onChange={handleChange} />
            </label>
            <input type="submit" />
        </form>
    );
}
export function MyForm2() {
  const [myCar, setMyCar] = useState("Volvo");

  const handleChange = (event) => {
    setMyCar(event.target.value)
  }

  return (
    <form>
      <select value={myCar} onChange={handleChange}>
        <option value="Ford">Ford</option>
        <option value="Volvo">Volvo</option>
        <option value="Fiat">Fiat</option>
      </select>
    </form>
  )
}
export function MyForm3() {
  const [inputs, setInputs] = useState({});

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setInputs(values => ({...values, [name]: value}))
  }

  return (
    <form>
      <label>First name:
      <input 
        type="text" 
        name="firstname" 
        value={inputs.firstname} 
        onChange={handleChange}
      />
      </label>
      <label>Last name:
        <input 
          type="text" 
          name="lastname" 
          value={inputs.lastname} 
          onChange={handleChange}
        />
      </label>
      <p>Current values: {inputs.firstname} {inputs.lastname}</p>
    </form>
  )
}
export function MyForm4() {
  const [inputs, setInputs] = useState({});
  const handleChange = (e) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    setInputs(values => ({...values, [name]: value}))
  }
  const handleSubmit = (event) => {
    let fillings = '';
    if (inputs.tomato) fillings +='tomato';
    if (inputs.onion){
      if (inputs.tomato) fillings += 'and';
      fillings += 'onion';

    }
    if (fillings =='') fillings = 'no fillings';
    alert(`${inputs.firstname} wants a burger with ${fillings}`);
    event.preventDefault();
  };
  return(
    <form onSubmit={handleSubmit}>
      <label>My name is:
        <input 
          type="text" 
          name="firstname"
          value = {inputs.firstname}
          onChange={handleChange}
        />
      </label>

      <p>I want a burger with:</p>
      <label>Tomato:
        <input
          type="checkbox"
          name="tomato"
          checked={inputs.tomato}
          onChange={handleChange}
        />
      </label>
      <label>Onion:
        <input
          type="checkbox"
          name="onion"
          checked={inputs.onion}
          onChange={handleChange}
        />
      </label>
      <button type = "submit">Submit</button>
    </form>
  )
}
export function MyForm5() {
  const [selectedFruit, setSelectedFruit] = useState('banana');

  const handleChange = (event) => {
    setSelectedFruit(event.target.value); //this updates the state when user selects a different radio button
  };

  const handleSubmit = (event) => {
    alert(`Your favorite fruit is: ${selectedFruit}`);
    event.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>Select your favorite fruit:</p>
      <label>
        <input 
          type="radio" 
          name="fruit" 
          value="apple" 
          checked={selectedFruit === 'apple'} //this checks if the current selectedFruit state is 'apple',
          //  if yes then this radio button will be selected, other will be unselected
          onChange={handleChange} /> Apple
      </label>
      <br />
      <label>
        <input 
          type="radio" 
          name="fruit" 
          value="banana" 
          checked={selectedFruit === 'banana'} 
          onChange={handleChange} /> Banana
      </label>
      <br />
      <label>
        <input 
          type="radio" 
          name="fruit" 
          value="cherry" 
          checked={selectedFruit === 'cherry'} 
          onChange={handleChange} /> Cherry
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  );
}