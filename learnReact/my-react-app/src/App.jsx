import { Car, Car2, Car3 } from './concepts/Props'
import { Son,Daughter, Parent } from './concepts/PropChildren';
import { Football,Cricket  } from './concepts/ReactEvents';
import {Goal} from './concepts/ReactConditional';
import {MyForm} from './concepts/ReactForms';
import {MyForm2} from './concepts/ReactForms';
import {MyForm3} from './concepts/ReactForms';
import { MyForm4 } from './concepts/ReactForms';
import { MyForm5 } from './concepts/ReactForms';
import { MyApp } from './concepts/reactPortal';
import {SusCar} from './concepts/Suspense';
import './concepts/MyStylesheet.css';
import {Routing} from './concepts/routing';
import {MyCar} from './concepts/UseState';
import {Component1} from './concepts/useContext';



function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Projets</h1>
      <hr />
      <section>
        <h3>Destructuring in Parameters:</h3>
        <Parent />
      </section>
      <section>
        <h3>React Events:</h3>
        <Football />
      </section>
      <section>
        <h3>React Events with Parameters:</h3>
        <Cricket />
      </section>
      <section>
        <h3>Conditional Rendering:</h3>
        <Goal isGoal={false} />
      </section>
      <section>
        <h3>React Forms:</h3>
        <MyForm />
      </section>
      <section>
        <h3>React Forms with Multiple Inputs:</h3>
        <MyForm2 />
      </section>
      <section>
        <h3>React Forms with Multiple Inputs and Object State:</h3>
        <MyForm3 />
      </section>
      <section>
        <h3>React Forms with Multiple Inputs and Object State with Checkbox:</h3>
        <MyForm4 />
      </section>
      <section>
        <h3>React Forms with Radio Buttons:</h3>
        <MyForm5 />
      </section>
      <section>
        <h3>React Portals:</h3>
        <MyApp />
      </section>
      <section>
        <h3>Suspense:</h3>
        <SusCar />
      </section>
      <section>
        <h3>Routing:</h3>
        <Routing />
      </section>
      <section>
        <h3>UseState Hook:</h3>
        <MyCar />
      </section>
      <section>
        <h3>UseContext Hook:</h3>
        <Component1 />
      </section>
    </div>
  );
}

export default App;