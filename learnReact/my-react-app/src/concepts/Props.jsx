export function Car({ color }) {
  return <h2>My car is {color}!</h2>;
}

export function Car2(props) {
  const { brand, model } = props;
  return <h2>My car is a {brand} {model}!</h2>;
}

export function Car3({color, brand, ...rest}) {
  return (
    <h2>My brother's {brand} {rest.model} is {color}!</h2>
  );
}