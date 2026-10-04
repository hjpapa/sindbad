import type {MapDef,ObjectDef} from './maps';

export const worldPropDefinitions:readonly {key:string;legacy:string;targets?:readonly string[]}[]=[
    {key:'prop-flight-ring',legacy:'flightRing'},
    {key:'prop-gust-cloud',legacy:'stormCloud'},
    {key:'prop-falling-debris',legacy:'debris'},
    {
        "key": "prop-chest",
        "legacy": "chest"
    },
    {
        "key": "prop-heart",
        "legacy": "heart"
    },
    {
        "key": "prop-shell",
        "legacy": "shell"
    },
    {
        "key": "prop-bell",
        "legacy": "bell",
        "targets": [
            "S01.exit"
        ]
    },
    {
        "key": "prop-golden",
        "legacy": "golden"
    },
    {
        "key": "prop-key",
        "legacy": "key"
    },
    {
        "key": "prop-lifevest",
        "legacy": "gear",
        "targets": [
            "S04.gear.1"
        ]
    },
    {
        "key": "prop-rescue-rope",
        "legacy": "gear",
        "targets": [
            "S04.gear.2"
        ]
    },
    {
        "key": "prop-lifering",
        "legacy": "gear",
        "targets": [
            "S04.gear.3"
        ]
    },
    {
        "key": "prop-lightning-rod",
        "legacy": "rod",
        "targets": [
            "S03.rod.1",
            "S03.rod.2"
        ]
    },
    {
        "key": "prop-damaged-mast",
        "legacy": "rod",
        "targets": [
            "S03.crisis"
        ]
    },
    {
        "key": "prop-coral-gate",
        "legacy": "gate"
    },
    {
        "key": "prop-vine",
        "legacy": "vine"
    },
    {
        "key": "prop-torch",
        "legacy": "torch"
    },
    {
        "key": "prop-furnace",
        "legacy": "furnace"
    },
    {
        "key": "prop-wave-rope",
        "legacy": "rope"
    },
    {
        "key": "prop-mirror",
        "legacy": "mirror"
    },
    {
        "key": "prop-journal",
        "legacy": "journal"
    },
    {
        "key": "prop-star-map",
        "legacy": "starMap"
    },
    {
        "key": "prop-lantern",
        "legacy": "lantern"
    },
    {
        "key": "prop-star-device",
        "legacy": "starDevice"
    },
    {
        "key": "prop-cargo",
        "legacy": "cargo"
    },
    {
        "key": "prop-gift",
        "legacy": "gift"
    },
    {
        "key": "prop-treasure-altar",
        "legacy": "treasureAltar"
    },
    {
        "key": "prop-moon-rock",
        "legacy": "moonRock"
    },
    {
        "key": "prop-lotus-shrine",
        "legacy": "lotusShrine"
    },
    {
        "key": "prop-ending",
        "legacy": "ending"
    }
];
export const worldPropKeys=worldPropDefinitions.map(prop=>prop.key);
export function objectTexture(def:ObjectDef,mapId:string):string {
    if(def.flightRing)return 'flightRing';
    if(def.texture)return def.texture;
    if(def.kind==='truthGift')return 'genie';
    if(def.kind==='vision')return 'starMap';
    if(def.kind==='flameGift')return 'rah';
    if(['mirror','journal','torch','furnace','vine','rope','quest','gift','bridge','ending','gear','key','gate','golden','chest'].includes(def.kind))return def.kind;
    if(def.kind==='rescue')return 'naira';
    if(def.kind==='npc')return mapId==='S08'?'genie':mapId==='S06'?'rah':mapId==='S05'||mapId==='S07'?'naira':mapId==='S02'?'siren':'player';
    if(def.kind==='shell'||def.kind==='remote')return 'shell';
    if(def.kind==='rod'||def.kind==='crisis')return 'rod';
    return 'bell';
}
export function illustratedWorldProp(texture:string,id?:string):string|undefined {
    return worldPropDefinitions.find(prop=>prop.legacy===texture&&(!prop.targets||(id!==undefined&&prop.targets.includes(id))))?.key;
}
export function worldPropTexture(texture:string,exists:(key:string)=>boolean,id?:string):string {
    const illustrated=illustratedWorldProp(texture,id);
    return illustrated&&exists(illustrated)?illustrated:texture;
}
export function sceneWorldPropKeys(map:MapDef):string[] {
    const used=map.objects.flatMap(object=>{
        const key=illustratedWorldProp(objectTexture(object,map.id),object.id);
        return key?[key]:[];
    });
    if(map.hearts.length)used.push('prop-heart');
    for(const hazard of map.flightHazards??[]){
        const key=illustratedWorldProp(hazard.kind==='gust'?'stormCloud':'debris');
        if(key)used.push(key);
    }
    return [...new Set(used)];
}
