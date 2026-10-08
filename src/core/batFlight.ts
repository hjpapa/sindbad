export interface BatFlightPath {radiusX:number;radiusY:number;period:number}
export interface FlightPoint {x:number;y:number}
export function batFlightBounds(home:FlightPoint,path:BatFlightPath){
    return {left:home.x-path.radiusX,right:home.x+path.radiusX,top:home.y-path.radiusY,bottom:home.y+path.radiusY};
}
export function batPatrol(home:FlightPoint,path:BatFlightPath,elapsed:number):FlightPoint{
    const phase=elapsed/path.period*Math.PI*2;
    return {x:home.x+Math.sin(phase)*path.radiusX,y:home.y+Math.sin(phase*2)*path.radiusY};
}
export function batFlightTarget(home:FlightPoint,path:BatFlightPath,player:FlightPoint):FlightPoint{
    const b=batFlightBounds(home,path);
    return {x:Math.max(b.left,Math.min(b.right,player.x)),y:Math.max(b.top,Math.min(b.bottom,player.y))};
}
// The attack goes out and back, wholly inside its locked segment. Even a
// delayed frame cannot overshoot or chase a player who left the warning.
export function batSwoop(origin:FlightPoint,target:FlightPoint,progress:number):FlightPoint{
    const t=Math.sin(Math.max(0,Math.min(1,progress))*Math.PI);
    return {x:origin.x+(target.x-origin.x)*t,y:origin.y+(target.y-origin.y)*t};
}
