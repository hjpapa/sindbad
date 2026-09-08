import * as T from 'three';
import { ball, box, mesh, bake, sailor, prop, disposeTree } from './models3d';
import type { MapDef } from '../content/maps';
export interface VisualSource {x:number;y:number;active:boolean;alpha:number;flipX?:boolean;scaleX:number;scaleY:number;}
interface Actor {source:VisualSource;model:T.Group;kind:string;shadow:T.Mesh|null;lastX:number;}
const tilt=.22, cosine=Math.cos(tilt);
export class World3D {
  private scene=new T.Scene();
  private camera=new T.OrthographicCamera(-640,640,360,-360,1,6000);
  private renderer:T.WebGLRenderer;
  private actors:Actor[]=[];
  private environment=new T.Group();
  private waves:T.Mesh[]=[];
  private resize:ResizeObserver;
  private time=0;
  private cameraX=0;
  private materialSet=new Set<T.Material>();
  constructor(private map:MapDef, parent:HTMLElement) {
    this.renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(1280,720);
    this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.18;
    const canvas=this.renderer.domElement;canvas.className='world-3d';canvas.setAttribute('aria-label','입체 바닷길');canvas.setAttribute('aria-hidden','true');parent.prepend(canvas);
    this.resize=new ResizeObserver(()=>{const scale=Math.min(parent.clientWidth/1280,parent.clientHeight/720);canvas.style.width=`${1280*scale}px`;canvas.style.height=`${720*scale}px`;});this.resize.observe(parent);
    const storm=map.theme==='storm';
    this.scene.background=new T.Color(storm?'#798dba':'#d2ebec');this.scene.fog=new T.Fog(storm?'#798dba':'#d2ebec',1800,4200);
    this.scene.add(new T.HemisphereLight('#fff8e7',storm?'#405175':'#728eae',2.8));
    const sun=new T.DirectionalLight('#fff0d0',3.3);sun.position.set(-450,900,700);this.scene.add(sun);
    const rim=new T.DirectionalLight('#a3ddeb',1.5);rim.position.set(600,150,-700);this.scene.add(rim);
    this.scene.add(this.environment);this.buildEnvironment();this.render(0,0,true);
    canvas.addEventListener('webglcontextlost',this.contextLost);
  }
  private contextLost=(event:Event)=>{event.preventDefault();window.dispatchEvent(new Event('sinbad-renderer-lost'));};
  private place(g:T.Object3D,x:number,y:number,z=0){g.position.set(x-640,(360-y)/cosine,z);}
  private buildEnvironment(){
    const storm=this.map.theme==='storm',reef=this.map.theme==='reef';const env=this.environment;
    box(env,storm?'#577ba6':'#80c7d1',this.map.width/2-640,-310,-1600,this.map.width+6000,35,5000);
    for(let i=0;i<65;i++){
      const line=box(env,storm?'#8faed0':'#d0e8df',i*137-1200,-287,-150-(i%11)*190,38+(i%4)*19,1,4);this.waves.push(line);
    }
    for(let i=0;i<8;i++){
      const cloud=new T.Group();for(let j=0;j<4;j++)ball(cloud,storm?'#a1acc4':'#fff6e6',j*35,Math.sin(j)*12,0,38,15,19);
      cloud.position.set(i*720-600,220+(i%3)*55,-1100-(i%2)*250);bake(cloud);env.add(cloud);
    }
    for(let i=0;i<Math.ceil(this.map.width/420)+3;i++){
      const x=i*420-700;
      if(reef){
        mesh(env,new T.ConeGeometry(145,250+(i%3)*65,5),i%2?'#92bbb7':'#78aaa9',x,-95,-800);
        for(let j=0;j<3;j++)ball(env,'#a1cdc0',x+j*38,-100,-600,60,28,65);
      }else if(storm){
        box(env,'#5b6178',x,20,-350,14,490,14);
        const sail=mesh(env,new T.ConeGeometry(120,250,3),'#aaaac0',x+75,80,-370);sail.rotation.y=.6;
        box(env,'#797c92',x,-200,-350,350,13,15);
      }else{
        const house=new T.Group();box(house,i%2?'#efdcc6':'#e1d8c9',0,0,0,145,160,105);
        const roof=mesh(house,new T.ConeGeometry(113,63,4),i%2?'#66999c':'#d8a187',0,112,0);roof.rotation.y=Math.PI/4;
        for(const wx of [-43,5,48]){box(house,'#739795',wx,25,54,20,33,4);box(house,'#f6ebd3',wx,25,57,3,34,2);}
        box(house,'#9b9e89',0,-54,54,28,50,5);house.position.set(x,-60,-700);house.rotation.y=.25;bake(house);env.add(house);
        const boat=new T.Group();ball(boat,'#b88f72',0,-20,0,75,20,29);box(boat,'#f5e2bb',0,42,0,5,126,5);
        const sail=mesh(boat,new T.ConeGeometry(51,94,3),'#fff0d4',29,50,0);sail.rotation.y=.4;boat.position.set(x+195,-150,-490);bake(boat);env.add(boat);
      }
    }
    for(const p of this.map.platforms){
      const chunk=new T.Group();const height=Math.min(p.h,180)/cosine,depth=p.h>100?175:95;
      box(chunk,reef?'#75a8a3':storm?'#7c7b8d':'#ccad87',0,-height/2,-depth/2,p.w,height,depth);
      box(chunk,reef?'#b4d9c2':storm?'#b3a7a6':'#f0d6a5',0,-5,-depth/2,p.w,10,depth);
      box(chunk,reef?'#91c3b3':'#ead0a6',0,-13,2,p.w,5,5);
      for(let x=-p.w/2+20;x<p.w/2;x+=54){
        if(!reef)box(chunk,storm?'#8d8591':'#dbbd93',x,1,-depth/2,2,1,depth-4);
        if(p.h>100){box(chunk,reef?'#64918e':storm?'#666c80':'#b79577',x,-65,1,37,29,3);}
      }
      if(p.w>350 && !reef){for(let x=-p.w/2+35;x<p.w/2;x+=230){box(chunk,'#baa07c',x,28,-depth+6,11,58,11);ball(chunk,'#fff0d5',x,57,-depth+6,8,4,8);}}
      this.place(chunk,p.x+p.w/2,p.y);bake(chunk);env.add(chunk);
      if(reef && p.w>200){for(let j=0;j<3;j++){const coral=new T.Group();for(let k=0;k<4;k++)ball(coral,j%2?'#e3acaa':'#b1b5d5',k*8,15+k*7,0,6,20,6);this.place(coral,p.x+45+j*60,p.y,-75);bake(coral);env.add(coral);}}
    }
    // Merge only fixed scenery. Water highlights keep independent geometry for subtle motion.
    for(const wave of this.waves)wave.removeFromParent();bake(env);for(const wave of this.waves)env.add(wave);
  }
  add(source:VisualSource,kind:string){
    const humanoid=['player','npc','skeleton','captain','archer','siren'].includes(kind);
    const model=humanoid?sailor(kind):prop(kind);this.scene.add(model);
    let shadow:T.Mesh|null=null;
    if(humanoid || kind==='crab'){
      shadow=new T.Mesh(new T.CircleGeometry(1,24),new T.MeshBasicMaterial({color:'#304955',transparent:true,opacity:.16,depthWrite:false}));
      shadow.rotation.x=-Math.PI/2;this.scene.add(shadow);this.materialSet.add(shadow.material as T.Material);
    }
    this.actors.push({source,model,kind,shadow,lastX:source.x});
    if(source.active)this.syncActor(this.actors[this.actors.length-1],true);
  }
  private syncActor(a:Actor,reduced:boolean,attacking=false){
    const s=a.source;a.model.visible=s.active;
    if(a.shadow)a.shadow.visible=s.active;
    if(!s.active)return;
    const humanoid=!!a.model.userData.legs;
    const scale=Math.abs(s.scaleX);let feet=humanoid?s.y+62*scale:s.y;
    if(humanoid && a.kind!=='player'){const ground=this.map.platforms.find(p=>s.x>=p.x&&s.x<=p.x+p.w&&Math.abs(p.y-feet)<65);if(ground)feet=ground.y;}
    this.place(a.model,s.x,feet,humanoid?7:8);
    a.model.scale.set(scale,Math.abs(s.scaleY)/cosine,scale);if(a.kind==='heart')a.model.scale.multiplyScalar(1.8);
    if(humanoid){
      a.model.rotation.y=s.flipX?-.48:.48;
      const moving=Math.abs(s.x-a.lastX)>.1;
      const swing=moving?Math.sin(this.time*.014)*.55:0;
      const legs=a.model.userData.legs as T.Group[],arms=a.model.userData.arms as T.Group[];
      legs[0].rotation.x=swing;legs[1].rotation.x=-swing;
      arms[0].rotation.x=-swing*.6;arms[1].rotation.z=attacking?-1.3:0;arms[1].rotation.x=attacking?-1:swing*.6;
      if(!moving&&!reduced)a.model.position.y+=Math.sin(this.time*.002)*1.3;
    }else if(!reduced && ['heart','spirit'].includes(a.kind)){a.model.position.y+=Math.sin(this.time*.003+s.x)*4;a.model.rotation.y=Math.sin(this.time*.001)*.25;}
    // Defeated or already-collected actors remain as small peaceful reminders.
    if(s.alpha<.5)a.model.scale.multiplyScalar(.6);
    if(a.shadow){
      const p=this.map.platforms.filter(p=>s.x>=p.x&&s.x<=p.x+p.w&&p.y>=feet-12).sort((a,b)=>a.y-b.y)[0];
      a.shadow.visible=!!p;if(p){this.place(a.shadow,s.x,p.y-1,-13);const fade=Math.max(.3,1-(p.y-feet)/250);a.shadow.scale.set(30*scale*fade,20*scale*fade,1);}
    }
    a.lastX=s.x;
  }
  render(scrollX:number,time:number,reduced=false,attacking=false){
    this.time=time;this.cameraX=scrollX;
    this.camera.position.set(scrollX,Math.sin(tilt)*1500,Math.cos(tilt)*1500);this.camera.lookAt(scrollX,0,0);this.camera.updateMatrixWorld();
    for(const a of this.actors)this.syncActor(a,reduced,a.kind==='player'&&attacking);
    if(!reduced)for(let i=0;i<this.waves.length;i++)this.waves[i].position.x+=Math.sin(time*.001+i)*.06;
    this.renderer.render(this.scene,this.camera);
  }
  get stats(){return {mode:'3d',drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,cameraX:this.cameraX};}
  dispose(){this.resize.disconnect();this.renderer.domElement.removeEventListener('webglcontextlost',this.contextLost);disposeTree(this.scene);this.materialSet.forEach(m=>m.dispose());this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();}
}


