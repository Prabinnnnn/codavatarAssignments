export function Football() {
  const shoot = () => {
    alert("Great Shot!");
  }

  return (
    <button onClick={shoot}>Take the shot!</button> //onClick is written in camelCase, and value is inside {}, not "" as in HTML
  );
}

export function Cricket(){
    const bowl = (b) => {
        alert(b);
    }
    return(
        <button onClick={()=> bowl("sixxxxxxxxx")}>Bowl a ball</button>
    )
}