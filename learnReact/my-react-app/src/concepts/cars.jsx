function MyCars(){
    const cars = ['volvo', 'bmw', 'ford', 'mazda'];
    return(
        <>
        <h2>MY favourite cars</h2>
        <ul>
            {cars.map((car,index)=>(
                <li key={index}>{car}</li>
            ))}
        </ul>
        
        </>
    );
}
export default MyCars;