import { useState, useEffect, useCallback, useRef } from "react";
const AT_URL = '/api/airtable';
const AT_HEADERS = {'Content-Type':'application/json'};
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const FULL_DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

const MEALS = ['dejeuner','diner'];
const ML = { dejeuner:'Déjeuner', diner:'Dîner' };
const PROTEIN_EMOJI = {
  '0-dejeuner':'🥚','0-diner':'🥩','1-dejeuner':'🍗','1-diner':'🍗',
  '2-dejeuner':'🥚','2-diner':'🍗','3-dejeuner':'🐟','3-diner':'🥩',
  '4-dejeuner':'🍗','4-diner':'🥚','5-dejeuner':'🍗','5-diner':'🍗',
  '6-dejeuner':'🥩','6-diner':'🐟',
};
const EMOJI_LABEL = { '🥚':'Œuf', '🥩':'Bœuf', '🍗':'Poulet', '🐟':'Poisson' };
const P = {
  bg:'#FEFEFE', surface:'#ffffff', surface2:'#F2EDE3', surface3:'#F7F3EC',
  accent:'#6B8C6B', accentLight:'#9DB89D', accentBg:'#EBF0EB', accentText:'#3D5C3D',
  border:'#E4DAC8', border2:'#D4C6B0', text:'#2C2416', textSec:'#7A6A52',
  textTert:'#AFA08A', remove:'#B85C3A', redBg:'#F7EDE8', tabBar:'#FEFEFE', handle:'#D4C6B0',
};
const STORAGE_KEY = 'menus_app_v4';
const DEFAULT_RECIPES = [
  {id:1, name:'Salade de quinoa + œufs durs', protein:'🥚', meal:'dejeuner', ing:'oeufs, quinoa, tomates'},
  {id:2, name:'Omelette aux champignons', protein:'🥚', meal:'dejeuner', ing:'oeufs, champignons, herbes'},
  {id:3, name:'Œufs brouillés + salade verte', protein:'🥚', meal:'diner', ing:'oeufs, salade, huile de noix'},
  {id:4, name:'Poulet rôti + légumes', protein:'🍗', meal:'dejeuner', ing:'poulet, brocoli, carottes'},
  {id:5, name:'Escalope de poulet + courgettes', protein:'🍗', meal:'dejeuner', ing:'poulet, courgettes, huile olive'},
  {id:6, name:'Poulet sauté + riz basmati', protein:'🍗', meal:'diner', ing:'poulet, riz basmati, poivron'},
  {id:7, name:'Filet de poulet + haricots verts', protein:'🍗', meal:'diner', ing:'poulet, haricots verts, citron'},
  {id:8, name:'Bœuf haché + légumes rôtis', protein:'🥩', meal:'dejeuner', ing:'boeuf haché, courgette, tomate'},
  {id:9, name:'Steak + salade verte', protein:'🥩', meal:'diner', ing:'steak, salade, vinaigrette noix'},
  {id:10, name:'Tartare de bœuf + avocats', protein:'🥩', meal:'diner', ing:'boeuf, avocat, citron, câpres'},
  {id:11, name:'Dos de cabillaud + haricots verts', protein:'🐟', meal:'dejeuner', ing:'cabillaud, haricots verts, citron'},
  {id:12, name:'Sardines + lentilles', protein:'🐟', meal:'dejeuner', ing:'sardines, lentilles, épinards'},
  {id:13, name:'Maquereau + riz basmati', protein:'🐟', meal:'diner', ing:'maquereau, riz basmati, poireau'},
  {id:14, name:'Poisson blanc + patate douce', protein:'🐟', meal:'diner', ing:'poisson blanc, patate douce, citron'},
  {id:15, name:'Steak pomme de terre crispy four haricots verts vapeur', protein:'🥩', meal:'dejeuner', ing:'steak, pommes de terre, haricots verts'},
  {id:16, name:'Chakchouka', protein:'🥚', meal:'diner', ing:'oeufs, tomates, poivrons, oignons, épices'},
  {id:17, name:'Fatjias hauts de cuisse poulet + poivron + gruyere + salade', protein:'🍗', meal:'dejeuner', ing:'hauts de cuisse de poulet, poivron, gruyère, salade'},
  {id:18, name:'Tajine poisson poivron pdt carotte', protein:'🐟', meal:'dejeuner', ing:'poisson, poivrons, pommes de terre, carottes, épices'},
  {id:19, name:'Canelloni viande hachée au four tomate carotte salade', protein:'🥩', meal:'dejeuner', ing:'viande hachée, tomates, carottes, salade, pâtes'},
  {id:20, name:'Pad Thaï hauts de cuisse + pousse soja + cébette + poireau + oeuf', protein:'🍗', meal:'dejeuner', ing:'hauts de cuisse de poulet, pousses de soja, cébette, poireau, oeuf, nouilles'},
  {id:21, name:'Poulet pané riz tasty', protein:'🍗', meal:'dejeuner', ing:'poulet pané, riz, épices'},
  {id:22, name:'Steak courgette grillée purée de patate douce', protein:'🥩', meal:'dejeuner', ing:'steak, courgettes grillées, patate douce'},
  {id:23, name:'Tartine avocat œuf salade oignons frits', protein:'🥚', meal:'dejeuner', ing:'pain, avocat, oeuf, salade, oignons frits'},
  {id:24, name:'Cuisse poulet (tajine +grill) + basquaise + quinoa', protein:'🍗', meal:'dejeuner', ing:'cuisses de poulet, poivrons, quinoa, épices'},
  {id:25, name:'Roulé Saumon four pdt epinards', protein:'🐟', meal:'dejeuner', ing:'saumon, pommes de terre, épinards'},
  {id:26, name:'Enchiladas boeuf émietté + salade', protein:'🥩', meal:'dejeuner', ing:'boeuf émietté, tortillas, salade, épices'},
  {id:27, name:'Poulet citron confit olives frites', protein:'🍗', meal:'dejeuner', ing:'poulet, citron confit, olives, frites'},
  {id:28, name:'Poulet gratin chou fleur brocolis', protein:'🍗', meal:'dejeuner', ing:'poulet, chou-fleur, brocolis, béchamel'},
  {id:29, name:'Bolognaise carottes poireau', protein:'🥩', meal:'dejeuner', ing:'viande hachée, carottes, poireau, pâtes, tomates'},
  {id:30, name:'Pad Thaï crevettes + pousse soja + cébette + poireau + oeuf', protein:'🐟', meal:'dejeuner', ing:'crevettes, pousses de soja, cébette, poireau, oeuf, nouilles'},
  {id:31, name:'Hauts de cuisse rôtis + légumes rôtis + semoule', protein:'🍗', meal:'dejeuner', ing:'hauts de cuisse de poulet, légumes variés, semoule'},
  {id:32, name:'Wok boeuf + légumes + vermicelles', protein:'🥩', meal:'dejeuner', ing:'boeuf, légumes variés, vermicelles, sauce soja'},
  {id:33, name:'Enchiladas poulet + poivrons + fromage', protein:'🍗', meal:'dejeuner', ing:'poulet, poivrons, fromage, tortillas'},
  {id:34, name:'Poisson vapeur + haricots verts + riz', protein:'🐟', meal:'dejeuner', ing:'poisson, haricots verts, riz'},
  {id:35, name:'Poulet tandoori + salade pois chiches', protein:'🍗', meal:'dejeuner', ing:'poulet, épices tandoori, pois chiches, salade'},
  {id:36, name:'Biryani légumes + dinde effilochée', protein:'🍗', meal:'dejeuner', ing:'dinde effilochée, légumes, riz basmati, épices'},
  {id:37, name:'Tajine agneau + courgette + pois chiches', protein:'🥩', meal:'dejeuner', ing:'agneau, courgettes, pois chiches, épices'},
  {id:38, name:'Riz sauté aux œufs + légumes + épices', protein:'🥚', meal:'dejeuner', ing:'riz, oeufs, légumes variés, épices'},
  {id:39, name:'Brochettes kefta + semoule + sauce yaourt', protein:'🥩', meal:'dejeuner', ing:'viande hachée, semoule, sauce yaourt, épices'},
  {id:40, name:'Nouilles soba + saumon grillé + légumes', protein:'🐟', meal:'dejeuner', ing:'saumon, nouilles soba, légumes variés'},
  {id:41, name:'Dhal lentilles corail + riz basmati', protein:'🍗', meal:'dejeuner', ing:'lentilles corail, riz basmati, épices, lait de coco, poulet'},
  {id:42, name:"Sandwich pain orge, poulet, crudités", protein:'🍗', meal:'dejeuner', ing:"pain d'orge, poulet, crudités"},
  {id:43, name:'Boeuf braisé + polenta crémeuse', protein:'🥩', meal:'dejeuner', ing:'boeuf, polenta, épices'},
  {id:44, name:'Poulet citron confit + pommes de terre', protein:'🍗', meal:'dejeuner', ing:'poulet, citron confit, pommes de terre'},
  {id:45, name:'Pilons de poulet + poêlée courgette + orge', protein:'🍗', meal:'dejeuner', ing:'pilons de poulet, courgettes, orge'},
  {id:46, name:'Nouilles udon + dinde teriyaki + légumes', protein:'🍗', meal:'dejeuner', ing:'dinde, nouilles udon, légumes, sauce teriyaki'},
  {id:47, name:'Boulettes viande + riz + sauce tomate', protein:'🥩', meal:'dejeuner', ing:'viande hachée, riz, tomates, épices'},
  {id:48, name:'Pad thaï aux crevettes + légumes', protein:'🐟', meal:'dejeuner', ing:'crevettes, nouilles, légumes variés, épices'},
  {id:49, name:'Tajine poisson + légumes + orge', protein:'🐟', meal:'dejeuner', ing:'poisson, légumes variés, orge, épices'},
  {id:50, name:'Rôti agneau + légumes braisés + semoule', protein:'🥩', meal:'dejeuner', ing:'agneau, légumes braisés, semoule'},
  {id:51, name:'Riz sauté légumes + œuf + coriandre', protein:'🥚', meal:'dejeuner', ing:'riz, oeufs, légumes variés, coriandre'},
  {id:52, name:'Poisson grillé chermoula + salade quinoa', protein:'🐟', meal:'dejeuner', ing:'poisson, chermoula, quinoa, salade'},
  {id:53, name:'Gnocchis + courgettes + dinde + crème', protein:'🍗', meal:'dejeuner', ing:'gnocchis, courgettes, dinde, crème'},
  {id:54, name:'Pilons poulet épicés + tagliatelles + légumes', protein:'🍗', meal:'dejeuner', ing:'pilons de poulet, tagliatelles, légumes, épices'},
  {id:55, name:'Poivrons farcis quinoa / viande', protein:'🥩', meal:'dejeuner', ing:'poivrons, quinoa, viande hachée, épices'},
  {id:56, name:'Biryani ou couscous maison', protein:'🍗', meal:'dejeuner', ing:'légumes, semoule ou riz, épices, poulet'},
  {id:57, name:'Tajine poulet pruneaux + pain ou semoule', protein:'🍗', meal:'dejeuner', ing:'poulet, pruneaux, pain ou semoule, épices'},
  {id:58, name:'Salade tiède lentilles / feta / pickles', protein:'🥚', meal:'diner', ing:'lentilles, feta, pickles, vinaigrette, oeuf'},
  {id:59, name:'Zaalouk + pain maïs + yaourt cumin', protein:'🥚', meal:'diner', ing:'aubergines, tomates, ail, épices, pain de maïs, yaourt, oeuf'},
  {id:60, name:'Omelette épices + salade + cornichons', protein:'🥚', meal:'diner', ing:'oeufs, épices, salade, cornichons'},
  {id:61, name:'Bouillon asiatique léger', protein:'🐟', meal:'diner', ing:'bouillon, légumes, épices asiatiques, crevettes'},
  {id:62, name:'Poêlée courgette / tomate / feta', protein:'🍗', meal:'diner', ing:'courgettes, tomates, feta, poulet'},
  {id:63, name:'Tarte fine tomate / moutarde / origan', protein:'🥚', meal:'diner', ing:'pâte fine, tomates, moutarde, origan, oeuf'},
  {id:64, name:'Légumes grillés + œufs durs + pickles', protein:'🥚', meal:'diner', ing:'légumes variés, oeufs durs, pickles'},
  {id:65, name:'Salade lentilles / tomates / thon / œuf', protein:'🐟', meal:'diner', ing:'lentilles, tomates, thon, oeuf'},
  {id:66, name:'Bouillon asiatique + tofu ou crevettes', protein:'🐟', meal:'diner', ing:'bouillon, tofu ou crevettes, épices asiatiques'},
];


function Toast({ msg, bottom }) {
  if (!msg) return null;
  const pos = bottom ? { bottom: 90 } : { top: 62 };
  return <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',background:P.accent,color:'white',fontSize:13,fontWeight:500,padding:'7px 18px',borderRadius:20,zIndex:300,whiteSpace:'nowrap',animation:'fadeInOut 2s ease forwards',pointerEvents:'none',boxShadow:`0 4px 16px ${P.accentLight}88`,...pos}}>{msg}</div>;
}
function Sheet({ open, onClose, title, children }) {
  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const isDragging = dragY > 0;

  return (
    <>
      {open && <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(45,31,94,0.35)',zIndex:50}} />}
      <div
        style={{position:'absolute',bottom:0,left:0,right:0,background:P.surface,borderRadius:'24px 24px 0 0',padding:'0 0 36px',zIndex:51,transform:open?`translateY(${dragY}px)`:'translateY(100%)',transition:isDragging?'none':'transform 0.32s cubic-bezier(0.32,0.72,0,1)',boxShadow:`0 -8px 32px ${P.accentLight}44`}}
        onTouchStart={e=>setStartY(e.touches[0].clientY)}
        onTouchMove={e=>{const delta=e.touches[0].clientY-startY; if(delta>0) setDragY(delta);}}
        onTouchEnd={()=>{if(dragY>200) onClose(); setDragY(0);}}
      >
        <div style={{width:40,height:4,background:P.handle,borderRadius:2,margin:'12px auto 0'}} />
        <div style={{fontSize:17,fontWeight:700,textAlign:'center',padding:'14px 20px 4px',color:P.text,letterSpacing:-0.3}}>{title}</div>
        <div style={{maxHeight:540,overflowY:'auto',padding:'4px 16px'}}>{children}</div>
      </div>
    </>
  );
}
const VLabel = ({children}) => <div style={{fontSize:11,fontWeight:700,color:P.textTert,textTransform:'uppercase',letterSpacing:'0.08em',padding:'14px 2px 5px'}}>{children}</div>;
const VInput = (props) => <input {...props} style={{width:'100%',background:P.surface2,border:`0.5px solid ${P.border}`,borderRadius:12,padding:'13px 14px',fontSize:16,color:P.text,outline:'none',fontFamily:'inherit',...(props.style||{})}} />;
const VSelect = ({children,...props}) => <select {...props} style={{width:'100%',background:P.surface2,border:`0.5px solid ${P.border}`,borderRadius:12,padding:'13px 14px',fontSize:16,color:P.text,outline:'none',fontFamily:'inherit',WebkitAppearance:'none',appearance:'none',...(props.style||{})}}>{children}</select>;
const PrimaryBtn = ({children,...props}) => <button {...props} style={{width:'100%',background:P.accent,color:'white',border:'none',borderRadius:14,padding:16,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',marginTop:10,boxShadow:`0 4px 16px ${P.accentLight}66`,...(props.style||{})}}>{children}</button>;
const GhostBtn = ({children,...props}) => <button {...props} style={{width:'100%',background:P.surface2,color:P.textSec,border:`0.5px solid ${P.border}`,borderRadius:14,padding:14,fontSize:15,fontWeight:500,cursor:'pointer',fontFamily:'inherit',marginTop:6,...(props.style||{})}}>{children}</button>;
function Toggle({ value, onChange }) {
  return (
    <div onClick={onChange} style={{position:'relative',width:51,height:31,flexShrink:0,cursor:'pointer'}}>
      <div style={{position:'absolute',inset:0,borderRadius:16,background:value?P.accent:P.border,transition:'background 0.2s',display:'flex',alignItems:'center'}}>
        <div style={{width:27,height:27,background:'white',borderRadius:'50%',margin:'0 2px',transition:'transform 0.2s',transform:value?'translateX(20px)':'translateX(0)',boxShadow:'0 1px 4px rgba(0,0,0,0.18)'}} />
      </div>
    </div>
  );
}

export default function App() {
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [planner, setPlanner] = useState({});
  const [nextRid, setNextRid] = useState(67);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('planner');
const [selectedDay, setSelectedDay] = useState(() => {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
});
  const [toast, setToast] = useState('');
  const [filterProtein, setFilterProtein] = useState('Tous');
  const [toastBottom, setToastBottom] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [addMeal, setAddMeal] = useState('dejeuner');
  const [addRecipeId, setAddRecipeId] = useState(null);
  const [newRecipe, setNewRecipe] = useState({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
  const [antiRep, setAntiRep] = useState(true);
  const [searchPlat, setSearchPlat] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
   const [refreshing, setRefreshing] = useState(false);
const [pullY, setPullY] = useState(0);
const pullStart = useRef(0);

  const DATES = Array.from({length:7}, (_,i) => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day===0?-6:1) + i + (weekOffset*7);
    const nd = new Date(d); nd.setDate(diff); return nd.getDate();
  });
  const weekLabel = weekOffset===0?'Cette semaine':weekOffset===1?'Semaine prochaine':weekOffset===-1?'Semaine dernière':`Semaine ${weekOffset>0?'+':''}${weekOffset}`;

  const showToast = useCallback((msg, bottom = false) => {
    setToast(msg); setToastBottom(bottom);
    setTimeout(() => setToast(''), 2200);
  }, []);
  async function doRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch(`${AT_URL}`, {headers: AT_HEADERS});
      const data = await res.json();
      if (data.records?.length) {
        setRecipes(data.records.map(r => ({
          id: r.fields.id||r.id, airtableId: r.id,
          name: r.fields.name||'', protein: r.fields.protein||'🍗',
          meal: r.fields.meal||'dejeuner', ing: r.fields.ing||''
        })));
      }
      const res2 = await fetch('/api/planner', {headers: AT_HEADERS});
      const data2 = await res2.json();
      if (data2.records?.length) {
        const p = {};
        data2.records.forEach(r => {
          if (r.fields.Slot && r.fields.recipeID)
            p[r.fields.Slot] = {recipeId: r.fields.recipeID, airtableId: r.id};
        });
        setPlanner(p);
      }
    } catch(e) {}
    setRefreshing(false);
    showToast('Actualisé ✓');
  }

  useEffect(() => {
    async function load() {
      // Charger recettes depuis Airtable
      try {
        const res = await fetch(`${AT_URL}`, {headers: AT_HEADERS});
        const data = await res.json();
        if (data.records?.length) {
          setRecipes(data.records.map(r => ({
            r.id: r.fields.id || r.id, airtableId: r.id,
            name: r.fields.name||'', protein: r.fields.protein||'🍗',
            meal: r.fields.meal||'dejeuner', ing: r.fields.ing||''
          })));
        }
      } catch(e) {}

      // Charger planning depuis Airtable
      try {
        const res = await fetch('/api/planner', {headers: AT_HEADERS});
        const data = await res.json();
        if (data.records?.length) {
          const p = {};
          data.records.forEach(r => {
            if (r.fields.Slot && r.fields.recipeID) {
              p[r.fields.Slot] = { recipeId: r.fields.recipeID, airtableId: r.id };
            }
          });
          setPlanner(p);
        }
      } catch(e) {}

      // Charger courses depuis window.storage
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.nextRid) setNextRid(d.nextRid);
        }
      } catch(e) {}

      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try { await window.storage.set(STORAGE_KEY, JSON.stringify({nextRid})); } catch(e) {}
    }, 500);
    return () => clearTimeout(t);
  }, [nextRid, loaded]);

  async function doAddMeal() {
    if (!addRecipeId) return;
    const slot = `${weekOffset}_${selectedDay}_${addMeal}`;
    // Si le slot existe déjà, supprimer l'ancien enregistrement Airtable
    if (planner[slot]?.airtableId) {
      try { await fetch(`/api/planner?id=${planner[slot].airtableId}`, {method:'DELETE', headers:AT_HEADERS}); } catch(e) {}
    }
    // Créer le nouveau
    let airtableId = null;
    try {
      const res = await fetch('/api/planner', {method:'POST', headers:AT_HEADERS,
        body: JSON.stringify({fields:{Slot:slot, recipeID:addRecipeId}})});
      const data = await res.json();
      airtableId = data.id;
    } catch(e) {}
    setPlanner(p => ({...p, [slot]: {recipeId: addRecipeId, airtableId}}));
    setSheet(null);
    showToast('Repas planifié ✓');
  }

  async function removeMeal(day, meal) {
    const slot = `${weekOffset}_${day}_${meal}`;
    if (planner[slot]?.airtableId) {
      try { await fetch(`/api/planner?id=${planner[slot].airtableId}`, {method:'DELETE', headers:AT_HEADERS}); } catch(e) {}
    }
    setPlanner(p => { const n={...p}; delete n[slot]; return n; });
  }
  function openAddMealSheet(meal) {
    setAddMeal(meal);
    const slotEmoji = PROTEIN_EMOJI[`${selectedDay}-${meal}`];
    const pool = recipes.filter(r => r.protein === slotEmoji);
    setAddRecipeId(planner[`${weekOffset}_${selectedDay}_${meal}`]?.recipeId || pool[0]?.id || null);
    setSheet('addMeal');
  }
  async function doRandom() {
    const np = {};
    // Supprimer tous les slots existants dans Airtable
    await Promise.all(Object.values(planner).map(async v => {
      if (v?.airtableId) {
        try { await fetch(`/api/planner?id=${v.airtableId}`, {method:'DELETE', headers:AT_HEADERS}); } catch(e) {}
      }
    }));
    // Générer et sauvegarder les nouveaux
    for (let i=0; i<DAYS.length; i++) {
      for (const m of MEALS) {
        const emoji = PROTEIN_EMOJI[`${i}-${m}`];
        let pool = recipes.filter(r => r.protein===emoji);
        if (!pool.length) pool = recipes;
        if (antiRep) { const used=Object.values(np).map(v=>v.recipeId); const fresh=pool.filter(r=>!used.includes(r.id)); if (fresh.length) pool=fresh; }
        const picked = pool[Math.floor(Math.random()*pool.length)];
        const slot = `${weekOffset}_${i}_${m}`;
        let airtableId = null;
        try {
          const res = await fetch('/api/planner', {method:'POST', headers:AT_HEADERS,
            body: JSON.stringify({fields:{Slot:slot, recipeID:picked.id}})});
          const data = await res.json();
          airtableId = data.id;
        } catch(e) {}
        np[slot] = {recipeId: picked.id, airtableId};
      }
    }
    setPlanner(np);
    setSheet(null);
    showToast('Semaine générée !', true);
  }
  async function saveNewRecipe() {
  if (!newRecipe.name.trim()) return;
  const newR = {id:nextRid, name:newRecipe.name.trim(), protein:newRecipe.protein, meal:newRecipe.meal, ing:newRecipe.ing.trim()};
  try {
    const res = await fetch(`${AT_URL}`, {method:'POST', headers:AT_HEADERS,
body:JSON.stringify({fields:{name:newR.name, protein:newR.protein, meal:newR.meal, ing:newR.ing}})
    const data = await res.json();
    newR.airtableId = data.id;
  } catch(e) {}
  setRecipes(prev=>[...prev,newR]);
  setNextRid(n=>n+1);
  setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',ing:''});
  setSheet(null);
  showToast('Plat ajouté ✓');
}



  const PROTEIN_ORDER = ['🥚','🍗','🥩','🐟'];
  const recipesByProtein = PROTEIN_ORDER.reduce((acc,e) => { acc[e]=recipes.filter(r=>r.protein===e); return acc; }, {});
  const slotEmoji = PROTEIN_EMOJI[`${selectedDay}-${addMeal}`] || '🍗';
  const filteredForSlot = recipes.filter(r => r.protein === slotEmoji);
const tabCfg = [{name:'planner',label:'Planifier'},{name:'menutypes',label:'Plats'}];
  const TAB_EMOJI = {planner:'📆', menutypes:'🥗'};

  return (
    <div style={{maxWidth:390,margin:'0 auto',background:P.bg,minHeight:780,position:'relative',overflow:'hidden',fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'}}>
      <style>{`
        @keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(4px)}10%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0}}
        .scroll::-webkit-scrollbar{display:none}
        html,body{background:#fffefb;margin:0;padding:0;}
        #root{background:#fffefb;}
          body{overscroll-behavior:none;overflow:hidden;}
      `}</style>

    <div style={{
  position:'absolute', inset:0, zIndex:0, pointerEvents:'none',
  backgroundImage:'url(/fon-ecran.png)',
  backgroundRepeat:'repeat',
  backgroundSize:'300px',
  opacity:0.07
}} />

      <Toast msg={toast} bottom={toastBottom} />
      {pullY > 10 && (
  <div style={{position:'absolute',top:pullY-20,left:'50%',transform:'translateX(-50%)',fontSize:20,zIndex:200,transition:'top 0.1s'}}>
    {refreshing ? '⏳' : '↓'}
  </div>
)}

      {/* ══ PLANIFIER ══ */}
      {tab==='planner' && (
        <div style={{display:'flex',flexDirection:'column',height:700}}>
          <div style={{padding:'22px 20px 10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:30,fontWeight:800,letterSpacing:-0.8,color:P.text}}>Mes menus</div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginTop:5}}>
                  <button onClick={()=>setWeekOffset(w=>w-1)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:P.accent,padding:0,lineHeight:1}}>‹</button>
                  <div style={{fontSize:13,color:P.textSec}}>{weekLabel}</div>
                  <button onClick={()=>setWeekOffset(w=>w+1)} style={{background:'none',border:'none',fontSize:18,cursor:'pointer',color:P.accent,padding:0,lineHeight:1}}>›</button>
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:6}}>
                <button onClick={()=>{ if(window.confirm('Vider le planning ?')){ setPlanner({}); showToast('Planning vidé', true); }}} style={{background:P.redBg,color:P.remove,border:'none',borderRadius:20,padding:'7px 12px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Vider</button>
                <button onClick={doRandom} style={{background:P.accentBg,color:P.accentText,border:`1px solid ${P.accentLight}`,borderRadius:20,padding:'7px 14px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Aléatoire</button>
              </div>
            </div>
          </div>
<div className="scroll" style={{flex:1,overflowY:'auto',padding:'0 20px 20px'}}
  onTouchStart={e=>{ pullStart.current = e.touches[0].clientY; }}
  onTouchMove={e=>{ const delta = e.touches[0].clientY - pullStart.current; if(delta>0 && delta<80) setPullY(delta); }}
  onTouchEnd={()=>{ if(pullY>60) doRefresh(); setPullY(0); }}
>
            <div className="scroll" style={{display:'flex',gap:8,padding:'14px 0 10px',overflowX:'auto'}}>
              {DAYS.map((d,i)=>(
                <div key={i} onClick={()=>setSelectedDay(i)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer'}}>
                  <div style={{width:42,height:42,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,background:i===selectedDay?P.accent:P.surface,color:i===selectedDay?'white':P.text,border:`1.5px solid ${i===selectedDay?P.accent:P.border}`,boxShadow:i===selectedDay?`0 4px 14px ${P.accentLight}66`:'none',transition:'all 0.18s'}}>{DATES[i]}</div>
                  <span style={{fontSize:10,fontWeight:600,color:i===selectedDay?P.accent:P.textTert,letterSpacing:'0.02em'}}>{d}</span>
                  <div style={{width:4,height:4,borderRadius:'50%',background:MEALS.some(m=>planner[`${weekOffset}_${i}_${m}`]?.recipeId)?P.accentLight:'transparent'}}/>
                </div>
              ))}
            </div>
            {MEALS.map(m => {
              const rid = planner[`${weekOffset}_${selectedDay}_${m}`]?.recipeId;
              const recipe = rid ? recipes.find(r=>r.id===rid) : null;
              const emoji = PROTEIN_EMOJI[`${selectedDay}-${m}`] || '';
              const hasPlanned = !!recipe;
              return (
                <div key={m} onClick={()=>openAddMealSheet(m)}
                  style={{background:P.surface,borderRadius:20,padding:'18px 20px',marginBottom:14,border:`0.5px solid ${P.border}`,cursor:'pointer',transition:'opacity 0.15s'}}
                  onMouseDown={e=>e.currentTarget.style.opacity='0.75'}
                  onMouseUp={e=>e.currentTarget.style.opacity='1'}
                  onTouchStart={e=>e.currentTarget.style.opacity='0.75'}
                  onTouchEnd={e=>e.currentTarget.style.opacity='1'}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:12,fontWeight:800,color:P.accentLight,textTransform:'uppercase',letterSpacing:'0.1em'}}>{ML[m]}</span>
                      <span style={{fontSize:18}}>{emoji}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:hasPlanned?P.textSec:P.accent}}>{hasPlanned?'Modifier ›':'+ Ajouter'}</span>
                  </div>
                  {recipe ? (
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:16,fontWeight:600,color:P.text,lineHeight:1.4}}>{recipe.name}</div>
                      </div>
                      <span onClick={e=>{e.stopPropagation();removeMeal(selectedDay,m);}} style={{color:P.remove,fontSize:12,fontWeight:600,cursor:'pointer',padding:'5px 12px',background:P.redBg,borderRadius:20,flexShrink:0}}>Retirer</span>
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'16px 0',borderRadius:14,border:`1.5px dashed ${P.border}`,color:P.textTert,fontSize:13}}>Appuyer pour planifier</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ PLATS ══ */}
      {tab==='menutypes' && (
        <div style={{display:'flex',flexDirection:'column',height:700}}>
          <div style={{padding:'6px 20px 4px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div><div style={{fontSize:28,fontWeight:800,letterSpacing:-0.8,color:P.text}}>Mes plats</div></div>
              <button onClick={()=>setSheet('newRecipe')} style={{background:P.accent,color:'white',border:'none',borderRadius:20,padding:'7px 14px',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:6,boxShadow:`0 4px 12px ${P.accentLight}55`}}>+ Nouveau</button>
            </div>
          </div>
          <div className="scroll" style={{flex:1,overflowY:'auto',padding:'0 16px 16px'}}>
            <div style={{background:P.surface2,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:8,margin:'8px 0 6px',border:`0.5px solid ${P.border}`}}>
              <svg viewBox="0 0 20 20" style={{width:14,height:14,fill:P.textTert,flexShrink:0}}><path d="M13.3 11.9l4.8 4.8-1.4 1.4-4.8-4.8A7 7 0 1 1 13.3 11.9zM8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10z"/></svg>
              <input value={searchPlat} onChange={e=>setSearchPlat(e.target.value)} placeholder="Rechercher un plat…" style={{background:'none',border:'none',outline:'none',fontSize:15,color:P.text,flex:1,fontFamily:'inherit'}}/>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
  {['Tous','🥚','🍗','🥩','🐟'].map(e=>(
    <button key={e} onClick={()=>setFilterProtein(e)} style={{padding:'6px 14px',borderRadius:20,fontSize:e==='Tous'?13:18,fontWeight:600,cursor:'pointer',border:`1.5px solid ${filterProtein===e?P.accent:P.border}`,background:filterProtein===e?P.accentBg:'transparent',color:filterProtein===e?P.accentText:P.text,transition:'all 0.15s'}}>
      {e}
    </button>
  ))}
</div>
           {PROTEIN_ORDER.filter(emoji => filterProtein==='Tous' || filterProtein===emoji).map(emoji => {
              const list = (recipesByProtein[emoji]||[]).filter(r=>r.name.toLowerCase().includes(searchPlat.toLowerCase()));
              if (!list.length) return null;
              return (
                <div key={emoji}>
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 2px 6px'}}>
                    <span style={{fontSize:20}}>{emoji}</span>
                    <span style={{fontSize:13,fontWeight:700,color:P.textTert,textTransform:'uppercase',letterSpacing:'0.08em'}}>{EMOJI_LABEL[emoji]}</span>
                    <div style={{flex:1,height:'0.5px',background:P.border,marginLeft:4}}/>
                  </div>
                  <div style={{background:P.surface,borderRadius:14,overflow:'hidden',border:`0.5px solid ${P.border}`}}>
                    {list.map((r,idx)=>(
                      <div key={r.id} style={{display:'flex',alignItems:'center',padding:'12px 14px',borderBottom:idx<list.length-1?`0.5px solid ${P.border}`:'none',gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:600,color:P.text}}>{r.name}</div>
                          <div style={{fontSize:12,color:P.textSec,marginTop:2}}>{ML[r.meal]}</div>
                        </div>
                        <button onClick={async()=>{if(r.airtableId){try{await fetch(`${AT_URL}?id=${r.airtableId}`,{method:'DELETE',headers:AT_HEADERS});}catch(e){}}setRecipes(prev=>prev.filter(x=>x.id!==r.id));}} style={{background:'none',border:'none',color:P.remove,fontSize:12,fontWeight:600,cursor:'pointer',padding:'3px 6px',flexShrink:0}}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

     
      {/* TAB BAR */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:82,background:P.tabBar,borderTop:`0.5px solid ${P.border}`,display:'flex',alignItems:'flex-start',paddingTop:10}}>
        {tabCfg.map(({name,label})=>(
          <div key={name} onClick={()=>setTab(name)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',padding:'4px 0'}}>
            <span style={{fontSize:24}}>{TAB_EMOJI[name]}</span>
            <span style={{fontSize:10,fontWeight:600,color:tab===name?P.accent:P.textTert,letterSpacing:'0.01em'}}>{label}</span>
          </div>
        ))}
      </div>

<Sheet open={sheet==='addMeal'} onClose={()=>setSheet(null)} title={`${planner[`${weekOffset}_${selectedDay}_${addMeal}`]?.recipeId?'Modifier':'Ajouter'} · ${ML[addMeal]} ${PROTEIN_EMOJI[selectedDay+'-'+addMeal]||''}`}>
  <VLabel>Rechercher ou créer un plat</VLabel>
  <div style={{background:P.surface2,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:8,marginBottom:8,border:`0.5px solid ${P.border}`}}>
    <svg viewBox="0 0 20 20" style={{width:14,height:14,fill:P.textTert,flexShrink:0}}><path d="M13.3 11.9l4.8 4.8-1.4 1.4-4.8-4.8A7 7 0 1 1 13.3 11.9zM8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10z"/></svg>
    <input value={newRecipe.name} onChange={e=>setNewRecipe(f=>({...f,name:e.target.value}))} placeholder="Rechercher un plat…" style={{background:'none',border:'none',outline:'none',fontSize:15,color:P.text,flex:1,fontFamily:'inherit'}}/>
  </div>
  {filteredForSlot.filter(r=>r.name.toLowerCase().includes(newRecipe.name.toLowerCase())).map(r=>(
    <div key={r.id} onClick={async()=>{
      const slot = `${weekOffset}_${selectedDay}_${addMeal}`;
      if (planner[slot]?.airtableId) {
        try { await fetch(`/api/planner?id=${planner[slot].airtableId}`,{method:'DELETE',headers:AT_HEADERS}); } catch(e) {}
      }
      let airtableId = null;
      try {
        const res = await fetch('/api/planner',{method:'POST',headers:AT_HEADERS,
          body:JSON.stringify({fields:{Slot:slot,recipeID:r.id}})});
        const data = await res.json();
        airtableId = data.id;
      } catch(e) {}
      setPlanner(p=>({...p,[slot]:{recipeId:r.id,airtableId}}));
      setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',ing:''});
      setSheet(null);
      showToast('Repas planifié ✓');
    }} style={{display:'flex',alignItems:'center',padding:'13px 14px',borderRadius:14,marginBottom:6,cursor:'pointer',background:P.surface3,border:`1px solid ${P.border}`}}>
      <div style={{flex:1}}>
        <div style={{fontSize:15,fontWeight:500,color:P.text}}>{r.name}</div>
      </div>
    </div>
  ))}
  {newRecipe.name.trim().length > 2 && !filteredForSlot.some(r=>r.name.toLowerCase()===newRecipe.name.toLowerCase()) && (
    <div>
      <div style={{fontSize:12,color:P.textTert,padding:'8px 2px'}}>Plat non trouvé — créer :</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
        {PROTEIN_ORDER.map(e=>(
          <button key={e} onClick={()=>setNewRecipe(f=>({...f,protein:e}))} style={{padding:'6px 14px',borderRadius:20,fontSize:18,cursor:'pointer',border:`1.5px solid ${newRecipe.protein===e?P.accent:P.border}`,background:newRecipe.protein===e?P.accentBg:'transparent'}}>
            {e}
          </button>
        ))}
      </div>
      <VInput value={newRecipe.ing} onChange={e=>setNewRecipe(f=>({...f,ing:e.target.value}))} placeholder="Ingrédients…" style={{marginBottom:8}}/>
      <PrimaryBtn onClick={async()=>{
        if(!newRecipe.name.trim()) return;
        const newR = {id:nextRid, name:newRecipe.name.trim(), protein:newRecipe.protein, meal:addMeal, ing:newRecipe.ing.trim()};
        try {
          const res = await fetch(`${AT_URL}`,{method:'POST',headers:AT_HEADERS,
            body:JSON.stringify({fields:{id:nextRid,name:newR.name,protein:newR.protein,meal:newR.meal,ing:newR.ing}})});
          const data = await res.json();
          newR.airtableId = data.id;
        } catch(e) {}
        setRecipes(prev=>[...prev,newR]);
        setNextRid(n=>n+1);
        setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',ing:''});
        showToast('Plat créé ✓');
      }} style={{marginTop:4}}>Créer et ajouter</PrimaryBtn>
    </div>
  )}
  <GhostBtn onClick={()=>setSheet(null)}>Annuler</GhostBtn>
</Sheet>

      <Sheet open={sheet==='newRecipe'} onClose={()=>setSheet(null)} title="Nouveau plat">
        <VLabel>Nom du plat</VLabel>
        <VInput value={newRecipe.name} onChange={e=>setNewRecipe(f=>({...f,name:e.target.value}))} placeholder="Ex. : Filet de bœuf + haricots"/>
        <VLabel>Protéine</VLabel>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:4}}>
          {PROTEIN_ORDER.map(e=>(
            <button key={e} onClick={()=>setNewRecipe(f=>({...f,protein:e}))} style={{padding:'8px 16px',borderRadius:20,fontSize:18,cursor:'pointer',border:`1.5px solid ${newRecipe.protein===e?P.accent:P.border}`,background:newRecipe.protein===e?P.accentBg:'transparent',transition:'all 0.15s'}}>
              {e}
            </button>
          ))}
        </div>
        <VLabel>Ingrédients principaux</VLabel>
        <VInput value={newRecipe.ing} onChange={e=>setNewRecipe(f=>({...f,ing:e.target.value}))} placeholder="séparés par des virgules"/>
        <PrimaryBtn onClick={saveNewRecipe}>Enregistrer</PrimaryBtn>
        <GhostBtn onClick={()=>setSheet(null)}>Annuler</GhostBtn>
      </Sheet>
    </div>
  );
}
