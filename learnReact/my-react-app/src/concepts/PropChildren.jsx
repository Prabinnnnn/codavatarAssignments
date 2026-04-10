export function Son(props) {
  return (
    <div>
      <h2>Reactt</h2>
      <div>{props.children}</div>
    </div>
  );
}

export function Daughter(props) {
  const {brand, model} = props;
  return (
    <div>
      <h2>fastapi</h2>
      <div>{props.children}</div>
    </div>
  );
}

export function Parent() {
  return (
    <div>
      <h1>My two projects</h1>
      <Son>
        <p>
          This was written in the Parent component,
          but displayed as a part of the reactt component
        </p>
      </Son>
      <Daughter>
        <p>
          This was written in the Parent component,
          but displayed as a part of the fastapi component
        </p>
      </Daughter>
    </div>
  );
}
