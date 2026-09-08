import * as T from 'three';
import { sailor, ball, mesh, disposeTree } from './models3d';
const cache=new Map<string,string>();
export function portrait3d(kind='player') {
  if(cache.has(kind))return cache.get(kind)!;
  let renderer:T.WebGLRenderer|undefined;
  const scene=new T.Scene();
  try{
    renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(560,620);renderer.setPixelRatio(1);
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
    const camera=new T.PerspectiveCamera(30,560/620,1,1000);camera.position.set(170,147,335);camera.lookAt(0,65,0);
    scene.add(new T.HemisphereLight('#fff7df','#82afb3',3));const light=new T.DirectionalLight('#fff2d4',3.5);light.position.set(-120,230,250);scene.add(light);
    const hero=sailor(kind);hero.rotation.y=-.1;scene.add(hero);
    mesh(scene,new T.CylinderGeometry(68,59,15,64),'#8abeb3',0,-11,0);
    mesh(scene,new T.CylinderGeometry(69,69,4,64),'#eae6cd',0,-2,0);
    for(let i=0;i<5;i++){const gem=mesh(scene,new T.OctahedronGeometry(i%2?6:4),'#e7ba68',Math.cos(i*1.5)*75,40+i*20,Math.sin(i)*25);gem.rotation.z=i;}
    ball(scene,'#cee0cb',-48,2,-25,18,8,16);
    renderer.render(scene,camera);const url=renderer.domElement.toDataURL();cache.set(kind,url);return url;
  }catch{return `/assets/draft/${kind==='siren'?'siren':'player'}.svg`;}
  finally{disposeTree(scene);renderer?.dispose();renderer?.forceContextLoss();}
}
