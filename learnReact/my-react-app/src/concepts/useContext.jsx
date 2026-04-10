import { useState, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';

const UserContext = createContext();

export function Component1() { //this the parent component, or provider, where the data lives
  const [user, setUser] = useState("Linus"); //defines user as linus

  return (
    <UserContext.Provider value={user}> //wrapping in context, passing  user as value, broadcasting to all children
      <h1>{`Hello ${user}!`}</h1>
      <Component2 />
    </UserContext.Provider>
  );
}

function Component2() { //this is middleman, does not use the user data,
//  in normal react app, we would have to pass user as prop to component 2
  return (
    <>
      <h1>Component 2</h1>
      <Component3 />
    </>
  );
}

function Component3() {
  const user = useContext(UserContext); //tunes in into the frequency we created at the top
// this hook tells react to look up the component tree for the nearest UserContext.Provider 
// and get the value from it, which is "Linus" in this case.
  return (
    <>
      <h1>Component 3</h1>
      <h2>{`Hello ${user} again!`}</h2>
    </>
  );
}
