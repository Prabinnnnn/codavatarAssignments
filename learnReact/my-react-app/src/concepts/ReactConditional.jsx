function MadeGoal() {
  return <h4>Goal scored!</h4>;
}

function MissedGoal() {
  return <h4>Missed the goal.</h4>;
}

export function Goal(props) {
  const isGoal = props.isGoal;
  if (isGoal) {
    return <MadeGoal/>;
  }
  return <MissedGoal/>;
}