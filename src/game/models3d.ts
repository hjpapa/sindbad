import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const materials = new Map<string, T.MeshStandardMaterial>();
export function mat(color: string, metalness = 0) {
  const key = color + metalness;
  if (!materials.has(key)) materials.set(key, new T.MeshStandardMaterial({ color, roughness: .68, metalness }));
  return materials.get(key)!;
}
export function mesh(parent: T.Object3D, geometry: T.BufferGeometry, color: string, x=0, y=0, z=0) {
  const m = new T.Mesh(geometry, mat(color)); m.position.set(x,y,z); parent.add(m); return m;
}
export const ball = (p:T.Object3D,c:string,x:number,y:number,z:number,sx:number,sy=sx,sz=sx) => {
  const m=mesh(p,new T.SphereGeometry(1,16,12),c,x,y,z); m.scale.set(sx,sy,sz); return m;
};
export const box = (p:T.Object3D,c:string,x:number,y:number,z:number,w:number,h:number,d:number) => mesh(p,new T.BoxGeometry(w,h,d),c,x,y,z);
export function bake(group:T.Group) {
  group.updateMatrixWorld(true);
  const inverse=group.matrixWorld.clone().invert();
  const bins=new Map<T.Material,T.BufferGeometry[]>(); const old:T.Mesh[]=[];
  group.traverse(o=>{if(o instanceof T.Mesh && !Array.isArray(o.material)) {
    const g=o.geometry.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld));
    const list=bins.get(o.material)??[]; list.push(g); bins.set(o.material,list); old.push(o);
  }});
  for(const m of old){m.removeFromParent();m.geometry.dispose();}
  for(const [material,geometries] of bins){const merged=mergeGeometries(geometries);if(merged)group.add(new T.Mesh(merged,material));geometries.forEach(g=>g.dispose());}
  return group;
}
export function sailor(kind='player') {
  const g=new T.Group(); const bone=['skeleton','captain','archer'].includes(kind), siren=kind==='siren';
  const skin=bone?'#fff1d1':siren?'#b9e3de':'#e9ae7e', hair=bone?'#756378':siren?'#605c99':'#263b49';
  const coat=bone?'#6c607c':siren?'#8baed5':kind==='npc'?'#e1aa64':'#258d91';
  const core=new T.Group();g.add(core);
  ball(core,coat,0,57,0,24,27,17);box(core,'#ffdb8e',0,41,16,39,7,5);
  ball(core,skin,0,97,0,29,29,24);
  ball(core,hair,0,113,-4,30,19,24);
  for(const x of [-22,-9,7,21]) ball(core,hair,x,117,12,11,10,10);
  if(!bone){ball(core,skin,-28,96,0,6,8,5);ball(core,skin,28,96,0,6,8,5);}
  for(const x of [-11,11]){
    ball(core,'#23343e',x,98,22,3.6,5.4,2.4); ball(core,'#ffffff',x-1,100,24,1.2);
    if(!bone)ball(core,'#e98b7b',x*1.5,88,21,5,2.5,1);
  }
  ball(core,skin,0,90,24,4,3,4);ball(core,bone?'#574d5c':'#975b50',0,83,22,5,1.5,1.5);
  if(bone){for(const x of [-8,0,8])box(core,'#fff1d1',x,81,22,5,5,3);}
  else {
    ball(core,'#fff2d1',0,126,-1,28,10,23);box(core,'#f3c16f',0,121,22,48,6,5);
    ball(core,'#24a4a5',0,124,26,6,7,3);
    const scarf=box(core,'#f7be76',-17,62,-17,13,41,4);scarf.rotation.z=-.22;
    box(core,'#fff1cf',0,65,17,11,35,4);
  }
  if(kind==='captain'){box(core,'#ba865a',0,123,0,76,10,30);ball(core,'#ba865a',0,133,0,24,15,15);}
  bake(core);
  const legs:T.Group[]=[];const arms:T.Group[]=[];
  for(const side of [-1,1]){
    const leg=new T.Group();leg.position.set(side*12,36,0);g.add(leg);
    ball(leg,bone?'#e5d7bd':'#f2e2ba',0,-13,0,10,17,10);ball(leg,'#72534b',0,-31,5,12,8,16);bake(leg);legs.push(leg);
    const arm=new T.Group();arm.position.set(side*24,73,0);g.add(arm);
    ball(arm,coat,side*3,-10,0,10,16,10);ball(arm,skin,side*4,-26,2,8,9,8);
    if(side===1 && !siren){box(arm,'#e9bb63',6,-26,13,25,5,6);const blade=box(arm,'#daeeee',6,-5,13,7,40,3);blade.rotation.z=-.15;}
    bake(arm);arms.push(arm);
  }
  g.userData={legs,arms};return g;
}
export function prop(kind:string) {
  const g=new T.Group();
  if(kind==='heart'){
    ball(g,'#fb7e95',-10,9,0,15);ball(g,'#fb7e95',10,9,0,15);
    const tip=mesh(g,new T.ConeGeometry(24,32,4),'#fb7e95',0,-7,0);tip.rotation.z=Math.PI;tip.rotation.y=Math.PI/4;
    ball(g,'#ffd7dd',-13,15,11,5,3,2);
  }else if(kind==='chest'){
    box(g,'#956949',0,0,0,72,36,43);ball(g,'#ba8a54',0,19,0,36,19,21);
    for(const x of [-26,26]){box(g,'#f3cd7b',x,0,23,7,37,4);box(g,'#f3cd7b',x,20,0,7,5,44);}
    box(g,'#ffe3a0',0,6,24,17,20,5);box(g,'#59483e',0,5,27,4,8,2);
  }else if(kind==='crab'){
    ball(g,'#e59483',0,0,0,29,18,23);
    for(const s of [-1,1]){ball(g,'#f1b5a2',s*37,8,0,13,17,12);ball(g,'#35434c',s*12,19,12,4);for(let i=0;i<3;i++){const l=box(g,'#d87d75',s*28,-10,-12+i*12,28,6,6);l.rotation.z=s*.3;}}
  }else if(kind==='spirit'){
    ball(g,'#adacf5',0,0,0,25,34,21);for(const s of [-1,1]){ball(g,'#e1e6ff',s*9,8,20,5,7,2);ball(g,'#4d5690',s*9,8,22,2);}
    mesh(g,new T.OctahedronGeometry(10),'#fff1c1',0,42,0);
  }else if(['rod','crisis'].includes(kind)){
    box(g,'#577382',0,-8,0,8,75,8);box(g,'#d4b875',0,-44,0,38,9,27);mesh(g,new T.OctahedronGeometry(20),'#91deef',0,40,0);
    const r=mesh(g,new T.TorusGeometry(25,3,6,20),'#f4d78f',0,25,0);r.rotation.x=.6;
  }else if(['shell','remote'].includes(kind)){
    for(let i=0;i<7;i++){const l=ball(g,i%2?'#e8adba':'#f6d8c5',0,0,0,6,30,8);l.rotation.z=(i-3)*.22; l.position.x=(i-3)*5;}
    ball(g,'#fff2da',0,-20,5,12,8,8);
  }else {
    box(g,'#e2c799',0,-25,0,55,10,40);box(g,'#7a8076',-22,10,0,6,65,6);box(g,'#7a8076',22,10,0,6,65,6);box(g,'#7a8076',0,42,0,54,6,6);
    mesh(g,new T.CylinderGeometry(12,22,25,16),'#f1c668',0,14,0);ball(g,'#9a763e',0,-1,0,5);
  }
  return bake(g);
}
export function disposeTree(group:T.Object3D) {group.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});}
