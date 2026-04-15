import { useState, useEffect, useCallback } from "react";


const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const FULL_DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i;
  const nd = new Date(d); nd.setDate(diff); return nd.getDate();
});
const MEALS = ['dejeuner','diner'];
const ML = { dejeuner:'Déjeuner', diner:'Dîner' };

// Emoji protéine par slot (jour 0-6, repas dejeuner/diner)
const PROTEIN_EMOJI = {
  '0-dejeuner':'🥚','0-diner':'🥩',
  '1-dejeuner':'🍗','1-diner':'🍗',
  '2-dejeuner':'🥚','2-diner':'🍗',
  '3-dejeuner':'🐟','3-diner':'🥩',
  '4-dejeuner':'🍗','4-diner':'🥚',
  '5-dejeuner':'🍗','5-diner':'🍗',
  '6-dejeuner':'🥩','6-diner':'🐟',
};

// Catégorie protéine par emoji
const EMOJI_LABEL = { '🥚':'Œuf', '🥩':'Bœuf', '🍗':'Poulet', '🐟':'Poisson' };

const P = {
  bg:'#FAF7F2',
  surface:'#FEFCF8',
  surface2:'#F2EDE3',
  surface3:'#F7F3EC',
  accent:'#6B8C6B',
  accentLight:'#9DB89D',
  accentBg:'#EBF0EB',
  accentText:'#3D5C3D',
  border:'#E4DAC8',
  border2:'#D4C6B0',
  text:'#2C2416',
  textSec:'#7A6A52',
  textTert:'#AFA08A',
  remove:'#B85C3A',
  redBg:'#F7EDE8',
  tabBar:'#FEFCF8',
  handle:'#D4C6B0',
};

const STORAGE_KEY = 'menus_app_v4';

// Recettes avec tag protéine
const DEFAULT_RECIPES = [
  {id:1, name:'Salade de quinoa + œufs durs',      protein:'🥚', meal:'dejeuner', time:15, ing:'oeufs, quinoa, tomates'},
  {id:2, name:'Omelette aux champignons',           protein:'🥚', meal:'dejeuner', time:10, ing:'oeufs, champignons, herbes'},
  {id:3, name:'Œufs brouillés + salade verte',     protein:'🥚', meal:'diner',    time:10, ing:'oeufs, salade, huile de noix'},
  {id:4, name:'Poulet rôti + légumes',              protein:'🍗', meal:'dejeuner', time:35, ing:'poulet, brocoli, carottes'},
  {id:5, name:'Escalope de poulet + courgettes',   protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, courgettes, huile olive'},
  {id:6, name:'Poulet sauté + riz basmati',        protein:'🍗', meal:'diner',    time:25, ing:'poulet, riz basmati, poivron'},
  {id:7, name:'Filet de poulet + haricots verts',  protein:'🍗', meal:'diner',    time:20, ing:'poulet, haricots verts, citron'},
  {id:8, name:'Bœuf haché + légumes rôtis',        protein:'🥩', meal:'dejeuner', time:25, ing:'boeuf haché, courgette, tomate'},
  {id:9, name:'Steak + salade verte',              protein:'🥩', meal:'diner',    time:15, ing:'steak, salade, vinaigrette noix'},
  {id:10,name:'Tartare de bœuf + avocats',         protein:'🥩', meal:'diner',    time:15, ing:'boeuf, avocat, citron, câpres'},
  {id:11,name:'Dos de cabillaud + haricots verts', protein:'🐟', meal:'dejeuner', time:20, ing:'cabillaud, haricots verts, citron'},
  {id:12,name:'Sardines + lentilles',              protein:'🐟', meal:'dejeuner', time:15, ing:'sardines, lentilles, épinards'},
  {id:13,name:'Maquereau + riz basmati',           protein:'🐟', meal:'diner',    time:25, ing:'maquereau, riz basmati, poireau'},
  {id:14,name:'Poisson blanc + patate douce',      protein:'🐟', meal:'diner',    time:30, ing:'poisson blanc, patate douce, citron'},
  {id:15, name:'Steak pomme de terre crispy four haricots verts vapeur', protein:'🥩', meal:'dejeuner', time:20, ing:'steak, pommes de terre, haricots verts'},
  {id:16, name:'Chakchouka', protein:'🥚', meal:'diner', time:20, ing:'oeufs, tomates, poivrons, oignons, épices'},
  {id:17, name:'Fatjias hauts de cuisse poulet + poivron + gruyere + salade', protein:'🍗', meal:'dejeuner', time:20, ing:'hauts de cuisse de poulet, poivron, gruyère, salade'},
  {id:18, name:'Tajine poisson poivron pdt carotte', protein:'🐟', meal:'dejeuner', time:20, ing:'poisson, poivrons, pommes de terre, carottes, épices'},
  {id:19, name:'Canelloni viande hachée au four tomate carotte salade', protein:'🥩', meal:'dejeuner', time:20, ing:'viande hachée, tomates, carottes, salade, pâtes'},
  {id:20, name:'Pad Thaï hauts de cuisse + pousse soja + cébette + poireau + oeuf', protein:'🍗', meal:'dejeuner', time:20, ing:'hauts de cuisse de poulet, pousses de soja, cébette, poireau, oeuf, nouilles'},
  {id:21, name:'Poulet pané riz tasty', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet pané, riz, épices'},
  {id:22, name:'Steak courgette grillée purée de patate douce', protein:'🥩', meal:'dejeuner', time:20, ing:'steak, courgettes grillées, patate douce'},
  {id:23, name:'Tartine avocat œuf salade oignons frits', protein:'🥚', meal:'dejeuner', time:20, ing:'pain, avocat, oeuf, salade, oignons frits'},
  {id:24, name:'Cuisse poulet (tajine +grill) + basquaise + quinoa', protein:'🍗', meal:'dejeuner', time:20, ing:'cuisses de poulet, poivrons, quinoa, épices'},
  {id:25, name:'Roulé Saumon four pdt epinards', protein:'🐟', meal:'dejeuner', time:20, ing:'saumon, pommes de terre, épinards'},
  {id:26, name:'Enchiladas boeuf émietté + salade', protein:'🥩', meal:'dejeuner', time:20, ing:'boeuf émietté, tortillas, salade, épices'},
  {id:27, name:'Poulet citron confit olives frites', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, citron confit, olives, frites'},
  {id:28, name:'Poulet gratin chou fleur brocolis', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, chou-fleur, brocolis, béchamel'},
  {id:29, name:'Bolognaise carottes poireau', protein:'🥩', meal:'dejeuner', time:20, ing:'viande hachée, carottes, poireau, pâtes, tomates'},
  {id:30, name:'Pad Thaï crevettes + pousse soja + cébette + poireau + oeuf', protein:'🐟', meal:'dejeuner', time:20, ing:'crevettes, pousses de soja, cébette, poireau, oeuf, nouilles'},
  {id:31, name:'Hauts de cuisse rôtis + légumes rôtis + semoule', protein:'🍗', meal:'dejeuner', time:20, ing:'hauts de cuisse de poulet, légumes variés, semoule'},
  {id:32, name:'Wok boeuf + légumes + vermicelles', protein:'🥩', meal:'dejeuner', time:20, ing:'boeuf, légumes variés, vermicelles, sauce soja'},
  {id:33, name:'Enchiladas poulet + poivrons + fromage', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, poivrons, fromage, tortillas'},
  {id:34, name:'Poisson vapeur + haricots verts + riz', protein:'🐟', meal:'dejeuner', time:20, ing:'poisson, haricots verts, riz'},
  {id:35, name:'Poulet tandoori + salade pois chiches', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, épices tandoori, pois chiches, salade'},
  {id:36, name:'Biryani légumes + dinde effilochée', protein:'🍗', meal:'dejeuner', time:20, ing:'dinde effilochée, légumes, riz basmati, épices'},
  {id:37, name:'Tajine agneau + courgette + pois chiches', protein:'🥩', meal:'dejeuner', time:20, ing:'agneau, courgettes, pois chiches, épices'},
  {id:38, name:'Riz sauté aux œufs + légumes + épices', protein:'🥚', meal:'dejeuner', time:20, ing:'riz, oeufs, légumes variés, épices'},
  {id:39, name:'Brochettes kefta + semoule + sauce yaourt', protein:'🥩', meal:'dejeuner', time:20, ing:'viande hachée, semoule, sauce yaourt, épices'},
  {id:40, name:'Nouilles soba + saumon grillé + légumes', protein:'🐟', meal:'dejeuner', time:20, ing:'saumon, nouilles soba, légumes variés'},
  {id:41, name:'Dhal lentilles corail + riz basmati', protein:'🍗', meal:'dejeuner', time:20, ing:'lentilles corail, riz basmati, épices, lait de coco, poulet'},
  {id:42, name:"Sandwich pain orge, poulet, crudités", protein:'🍗', meal:'dejeuner', time:20, ing:"pain d'orge, poulet, crudités"},
  {id:43, name:'Boeuf braisé + polenta crémeuse', protein:'🥩', meal:'dejeuner', time:20, ing:'boeuf, polenta, épices'},
  {id:44, name:'Poulet citron confit + pommes de terre', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, citron confit, pommes de terre'},
  {id:45, name:'Pilons de poulet + poêlée courgette + orge', protein:'🍗', meal:'dejeuner', time:20, ing:'pilons de poulet, courgettes, orge'},
  {id:46, name:'Nouilles udon + dinde teriyaki + légumes', protein:'🍗', meal:'dejeuner', time:20, ing:'dinde, nouilles udon, légumes, sauce teriyaki'},
  {id:47, name:'Boulettes viande + riz + sauce tomate', protein:'🥩', meal:'dejeuner', time:20, ing:'viande hachée, riz, tomates, épices'},
  {id:48, name:'Pad thaï aux crevettes + légumes', protein:'🐟', meal:'dejeuner', time:20, ing:'crevettes, nouilles, légumes variés, épices'},
  {id:49, name:'Tajine poisson + légumes + orge', protein:'🐟', meal:'dejeuner', time:20, ing:'poisson, légumes variés, orge, épices'},
  {id:50, name:'Rôti agneau + légumes braisés + semoule', protein:'🥩', meal:'dejeuner', time:20, ing:'agneau, légumes braisés, semoule'},
  {id:51, name:'Riz sauté légumes + œuf + coriandre', protein:'🥚', meal:'dejeuner', time:20, ing:'riz, oeufs, légumes variés, coriandre'},
  {id:52, name:'Poisson grillé chermoula + salade quinoa', protein:'🐟', meal:'dejeuner', time:20, ing:'poisson, chermoula, quinoa, salade'},
  {id:53, name:'Gnocchis + courgettes + dinde + crème', protein:'🍗', meal:'dejeuner', time:20, ing:'gnocchis, courgettes, dinde, crème'},
  {id:54, name:'Pilons poulet épicés + tagliatelles + légumes', protein:'🍗', meal:'dejeuner', time:20, ing:'pilons de poulet, tagliatelles, légumes, épices'},
  {id:55, name:'Poivrons farcis quinoa / viande', protein:'🥩', meal:'dejeuner', time:20, ing:'poivrons, quinoa, viande hachée, épices'},
  {id:56, name:'Biryani ou couscous maison', protein:'🍗', meal:'dejeuner', time:20, ing:'légumes, semoule ou riz, épices, poulet'},
  {id:57, name:'Tajine poulet pruneaux + pain ou semoule', protein:'🍗', meal:'dejeuner', time:20, ing:'poulet, pruneaux, pain ou semoule, épices'},
  {id:58, name:'Salade tiède lentilles / feta / pickles', protein:'🥚', meal:'diner', time:20, ing:'lentilles, feta, pickles, vinaigrette, oeuf'},
  {id:59, name:'Zaalouk + pain maïs + yaourt cumin', protein:'🥚', meal:'diner', time:20, ing:'aubergines, tomates, ail, épices, pain de maïs, yaourt, oeuf'},
  {id:60, name:'Omelette épices + salade + cornichons', protein:'🥚', meal:'diner', time:20, ing:'oeufs, épices, salade, cornichons'},
  {id:61, name:'Bouillon asiatique léger', protein:'🐟', meal:'diner', time:20, ing:'bouillon, légumes, épices asiatiques, crevettes'},
  {id:62, name:'Poêlée courgette / tomate / feta', protein:'🍗', meal:'diner', time:20, ing:'courgettes, tomates, feta, poulet'},
  {id:63, name:'Tarte fine tomate / moutarde / origan', protein:'🥚', meal:'diner', time:20, ing:'pâte fine, tomates, moutarde, origan, oeuf'},
  {id:64, name:'Légumes grillés + œufs durs + pickles', protein:'🥚', meal:'diner', time:20, ing:'légumes variés, oeufs durs, pickles'},
  {id:65, name:'Salade lentilles / tomates / thon / œuf', protein:'🐟', meal:'diner', time:20, ing:'lentilles, tomates, thon, oeuf'},
  {id:66, name:'Bouillon asiatique + tofu ou crevettes', protein:'🐟', meal:'diner', time:20, ing:'bouillon, tofu ou crevettes, épices asiatiques'},
];

const STORAGE_RECIPES_KEY = 'menus_recipes_v4';

// ─── helpers ──────────────────────────────────────────────────────────────────
function Toast({ msg, bottom }) {
  if (!msg) return null;
  const pos = bottom ? { bottom: 90 } : { top: 62 };
  return (
    <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',background:P.accent,color:'white',fontSize:13,fontWeight:500,padding:'7px 18px',borderRadius:20,zIndex:300,whiteSpace:'nowrap',animation:'fadeInOut 2s ease forwards',pointerEvents:'none',boxShadow:`0 4px 16px ${P.accentLight}88`,...pos}}>{msg}</div>
  );
}

function Sheet({ open, onClose, title, children }) {
  return (
    <>
      {open && <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(45,31,94,0.35)',zIndex:50,borderRadius:44}} />}
      <div style={{position:'absolute',bottom:0,left:0,right:0,background:P.surface,borderRadius:'24px 24px 0 0',padding:'0 0 36px',zIndex:51,transform:open?'translateY(0)':'translateY(100%)',transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',boxShadow:`0 -8px 32px ${P.accentLight}44`}}>
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

// ─── main ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [recipes, setRecipes]             = useState(DEFAULT_RECIPES);
  const [planner, setPlanner]             = useState({});
  const [groceryChecked, setGroceryChecked] = useState({});
  const [manualItems, setManualItems]     = useState([]);
  const [newItem, setNewItem]             = useState('');
  const [nextRid, setNextRid]             = useState(15);
  const [loaded, setLoaded]               = useState(false);

  const [tab, setTab]               = useState('planner');
  const [selectedDay, setSelectedDay] = useState(0);
  const [toast, setToast]           = useState('');
  const [toastBottom, setToastBottom] = useState(false);
  const [sheet, setSheet]           = useState(null);

  // tiroir ajouter repas
  const [addMeal, setAddMeal]         = useState('dejeuner');
  const [addRecipeId, setAddRecipeId] = useState(null);

  // tiroir nouvelle recette (page Menus)
  const [newRecipe, setNewRecipe] = useState({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});

  const [antiRep, setAntiRep] = useState(true);
  const [searchPlat, setSearchPlat] = useState('');

  const showToast = useCallback((msg, bottom = false) => {
    setToast(msg); setToastBottom(bottom);
    setTimeout(() => setToast(''), 2200);
  }, []);

  // ── persistence ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          if (d.recipes)        setRecipes(d.recipes);
          if (d.planner)        setPlanner(d.planner);
          if (d.groceryChecked) setGroceryChecked(d.groceryChecked);
          if (d.manualItems)    setManualItems(d.manualItems);
          if (d.nextRid)        setNextRid(d.nextRid);
        }
      } catch(e) {}
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try { await window.storage.set(STORAGE_KEY, JSON.stringify({recipes,planner,groceryChecked,manualItems,nextRid})); showToast('Sauvegardé ✓'); } catch(e) {}
    }, 500);
    return () => clearTimeout(t);
  }, [recipes, planner, groceryChecked, manualItems, nextRid, loaded]);

  // ── actions planificateur ──────────────────────────────────────
  function doAddMeal() {
    if (!addRecipeId) return;
    setPlanner(p => ({...p, [`${selectedDay}-${addMeal}`]: addRecipeId}));
    setSheet(null);
  }
  function removeMeal(day, meal) {
    setPlanner(p => { const n={...p}; delete n[`${day}-${meal}`]; return n; });
  }
  function openAddMealSheet(meal) {
    setAddMeal(meal);
    const slotEmoji = PROTEIN_EMOJI[`${selectedDay}-${meal}`];
    const pool = recipes.filter(r => r.protein === slotEmoji);
    setAddRecipeId(planner[`${selectedDay}-${meal}`] || pool[0]?.id || null);
    setSheet('addMeal');
  }

  // random
  function doRandom() {
    const np = {};
    DAYS.forEach((_,i) => {
      MEALS.forEach(m => {
        const emoji = PROTEIN_EMOJI[`${i}-${m}`];
        let pool = recipes.filter(r => r.protein===emoji);
        if (!pool.length) pool = recipes;
        if (antiRep) { const used=Object.values(np); const fresh=pool.filter(r=>!used.includes(r.id)); if (fresh.length) pool=fresh; }
        np[`${i}-${m}`] = pool[Math.floor(Math.random()*pool.length)].id;
      });
    });
    setPlanner(np);
    setSheet(null);
    showToast('Semaine générée !', true);
  }

  // ── actions recettes ───────────────────────────────────────────
  function saveNewRecipe() {
    if (!newRecipe.name.trim()) return;
    setRecipes(prev => [...prev, {
      id: nextRid, name: newRecipe.name.trim(),
      protein: newRecipe.protein, meal: newRecipe.meal,
      time: parseInt(newRecipe.time)||20, ing: newRecipe.ing.trim()
    }]);
    setNextRid(n => n+1);
    setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
    setSheet(null);
    showToast('Plat ajouté ✓');
  }

  // ── grocery ────────────────────────────────────────────────────
  const groceryCats = (() => {
    const rids = [...new Set(Object.values(planner))];
    const recs = rids.map(id=>recipes.find(r=>r.id===id)).filter(Boolean);
    const cats = {'Féculents & légumineuses':[],'Protéines':[],'Légumes & fruits':[],'Produits laitiers':[],'Épicerie':[]};
    const kws = {
      'Féculents & légumineuses':['quinoa','riz','lentilles','haricot','pois','farine','patate douce'],
      'Protéines':['cabillaud','poulet','sardine','maquereau','oeuf','oeufs','poisson','thon','boeuf','steak','tartare','feta','avocat'],
      'Légumes & fruits':['courgette','tomate','haricot vert','brocoli','carotte','épinard','salade','poireau','citron','poire','pomme','champignon','poivron'],
      'Produits laitiers':['fromage','yaourt','brebis','chèvre','faisselle'],
    };
    const added = new Set();
    recs.forEach(r => r.ing.split(',').map(s=>s.trim()).filter(Boolean).forEach(ing => {
      if (added.has(ing)) return; added.add(ing);
      let placed=false;
      for (const [cat,ks] of Object.entries(kws)) { if (ks.some(k=>ing.toLowerCase().includes(k))) { cats[cat].push(ing); placed=true; break; } }
      if (!placed) cats['Épicerie'].push(ing);
    }));
    return cats;
  })();

  function addManualItem() {
    const v = newItem.trim();
    if (!v) return;
    setManualItems(prev => [...prev, {id: Date.now(), name:v, checked:false}]);
    setNewItem('');
  }
  function toggleManual(id) {
    setManualItems(prev => prev.map(i => i.id===id ? {...i,checked:!i.checked} : i));
  }
  function removeManual(id) {
    setManualItems(prev => prev.filter(i => i.id!==id));
  }

  // recettes groupées par protéine
  const PROTEIN_ORDER = ['🥚','🍗','🥩','🐟'];
  const recipesByProtein = PROTEIN_ORDER.reduce((acc,e) => {
    acc[e] = recipes.filter(r=>r.protein===e);
    return acc;
  }, {});

  // tiroir ajouter repas : liste filtrée par emoji du slot
  const slotEmoji = PROTEIN_EMOJI[`${selectedDay}-${addMeal}`] || '🍗';
  const filteredForSlot = recipes.filter(r => r.protein === slotEmoji);

  const tabCfg = [
    {name:'planner',   label:'Planifier'},
    {name:'menutypes', label:'Plats'},
    {name:'courses',   label:'Courses'},
  ];

  return (
    <div style={{maxWidth:390,margin:'0 auto',background:P.bg,minHeight:780,position:'relative',overflow:'hidden',borderRadius:44,fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif'}}>
      <style>{`
        @keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(4px)}10%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0}}
        .scroll::-webkit-scrollbar{display:none}
      `}</style>


      <Toast msg={toast} bottom={toastBottom} />

      {/* ══ PLANIFIER ═════════════════════════════════════════════ */}
      {tab==='planner' && (
        <div style={{display:'flex',flexDirection:'column',height:700}}>
          <div style={{padding:'6px 20px 4px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.8,color:P.text}}>Mes menus</div>
                <div style={{fontSize:13,color:P.textSec,marginTop:2}}>
{new Date().toLocaleDateString('fr-FR',{month:'long',year:'numeric'}).replace(/^./, c => c.toUpperCase())}
                </div>
              </div>
              <div style={{display:'flex',gap:8,marginTop:6}}>
                <button onClick={()=>{ if(window.confirm('Vider le planning ?')){ setPlanner({}); showToast('Planning vidé', true); }}} style={{background:P.redBg,color:P.remove,border:'none',borderRadius:20,padding:'7px 12px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Vider</button>
                <button onClick={doRandom} style={{background:P.accentBg,color:P.accentText,border:`1px solid ${P.accentLight}`,borderRadius:20,padding:'7px 14px',fontSize:13,fontWeight:700,cursor:'pointer'}}>Aléatoire</button>
              </div>
            </div>
          </div>
          <div className="scroll" style={{flex:1,overflowY:'auto',padding:'0 16px 16px'}}>
            {/* Day strip */}
            <div className="scroll" style={{display:'flex',gap:6,padding:'10px 0 6px',overflowX:'auto'}}>
              {DAYS.map((d,i)=>(
                <div key={i} onClick={()=>setSelectedDay(i)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3,cursor:'pointer'}}>
                  <div style={{width:38,height:38,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,background:i===selectedDay?P.accent:P.surface,color:i===selectedDay?'white':P.text,border:`1.5px solid ${i===selectedDay?P.accent:P.border}`,boxShadow:i===selectedDay?`0 4px 14px ${P.accentLight}66`:'none',transition:'all 0.18s'}}>{DATES[i]}</div>
                  <span style={{fontSize:10,fontWeight:600,color:i===selectedDay?P.accent:P.textTert,letterSpacing:'0.02em'}}>{d}</span>
                  <div style={{width:4,height:4,borderRadius:'50%',background:MEALS.some(m=>planner[`${i}-${m}`])?P.accentLight:'transparent'}}/>
                </div>
              ))}
            </div>

            {/* Meal slots */}
            {MEALS.map(m => {
              const rid = planner[`${selectedDay}-${m}`];
              const recipe = rid ? recipes.find(r=>r.id===rid) : null;
              const emoji = PROTEIN_EMOJI[`${selectedDay}-${m}`] || '';
              const hasPlanned = !!recipe;
              return (
                <div key={m} onClick={()=>openAddMealSheet(m)}
                  style={{background:P.surface,borderRadius:16,padding:'14px 16px',marginBottom:10,border:`0.5px solid ${P.border}`,cursor:'pointer',transition:'opacity 0.15s'}}
                  onMouseDown={e=>e.currentTarget.style.opacity='0.75'}
                  onMouseUp={e=>e.currentTarget.style.opacity='1'}
                  onTouchStart={e=>e.currentTarget.style.opacity='0.75'}
                  onTouchEnd={e=>e.currentTarget.style.opacity='1'}
                >
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:11,fontWeight:800,color:P.accentLight,textTransform:'uppercase',letterSpacing:'0.1em'}}>{ML[m]}</span>
                      <span style={{fontSize:17}}>{emoji}</span>
                    </div>
                    <span style={{fontSize:12,fontWeight:600,color:hasPlanned?P.textSec:P.accent}}>{hasPlanned?'Modifier ›':'+ Ajouter'}</span>
                  </div>
                  {recipe ? (
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:15,fontWeight:600,color:P.text}}>{recipe.name}</div>
                        <div style={{fontSize:12,color:P.textSec,marginTop:2}}>{recipe.time} min</div>
                      </div>
                      <span onClick={e=>{e.stopPropagation();removeMeal(selectedDay,m);}} style={{color:P.remove,fontSize:12,fontWeight:600,cursor:'pointer',padding:'4px 10px',background:P.redBg,borderRadius:20,flexShrink:0}}>Retirer</span>
                    </div>
                  ) : (
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'12px 0',borderRadius:12,border:`1.5px dashed ${P.border}`,color:P.textTert,fontSize:13}}>
                      Appuyer pour planifier
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ PLATS (ex-menutypes) ══════════════════════════════════ */}
      {tab==='menutypes' && (
        <div style={{display:'flex',flexDirection:'column',height:700}}>
          <div style={{padding:'6px 20px 4px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.8,color:P.text}}>Mes plats</div>
              </div>
              <button onClick={()=>setSheet('newRecipe')} style={{background:P.accent,color:'white',border:'none',borderRadius:20,padding:'7px 14px',fontSize:13,fontWeight:700,cursor:'pointer',marginTop:6,boxShadow:`0 4px 12px ${P.accentLight}55`}}>+ Nouveau</button>
            </div>
          </div>
          <div className="scroll" style={{flex:1,overflowY:'auto',padding:'0 16px 16px'}}>
            <div style={{background:P.surface2,borderRadius:12,padding:'9px 14px',display:'flex',alignItems:'center',gap:8,margin:'8px 0 6px',border:`0.5px solid ${P.border}`}}>
  <svg viewBox="0 0 20 20" style={{width:14,height:14,fill:P.textTert,flexShrink:0}}><path d="M13.3 11.9l4.8 4.8-1.4 1.4-4.8-4.8A7 7 0 1 1 13.3 11.9zM8 13A5 5 0 1 0 8 3a5 5 0 0 0 0 10z"/></svg>
  <input value={searchPlat} onChange={e=>setSearchPlat(e.target.value)} placeholder="Rechercher un plat…" style={{background:'none',border:'none',outline:'none',fontSize:15,color:P.text,flex:1,fontFamily:'inherit'}}/>
</div>
            {PROTEIN_ORDER.map(emoji => {
const list = (recipesByProtein[emoji] || []).filter(r =>
  r.name.toLowerCase().includes(searchPlat.toLowerCase())
);
if (!list.length) return null;
              return (
                <div key={emoji}>
                  <div style={{display:'flex',alignItems:'center',gap:8,padding:'14px 2px 6px'}}>
                    <span style={{fontSize:20}}>{emoji}</span>
                    <span style={{fontSize:13,fontWeight:700,color:P.textTert,textTransform:'uppercase',letterSpacing:'0.08em'}}>{EMOJI_LABEL[emoji]}</span>
                    <div style={{flex:1,height:'0.5px',background:P.border,marginLeft:4}}/>
                  </div>
                  <div style={{background:P.surface,borderRadius:14,overflow:'hidden',border:`0.5px solid ${P.border}`}}>
                    {list.map((r,idx) => (
                      <div key={r.id} style={{display:'flex',alignItems:'center',padding:'12px 14px',borderBottom:idx<list.length-1?`0.5px solid ${P.border}`:'none',gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:600,color:P.text}}>{r.name}</div>
                          <div style={{fontSize:12,color:P.textSec,marginTop:2}}>{ML[r.meal]} · {r.time} min</div>
                        </div>
                        <button onClick={()=>setRecipes(prev=>prev.filter(x=>x.id!==r.id))} style={{background:'none',border:'none',color:P.remove,fontSize:12,fontWeight:600,cursor:'pointer',padding:'3px 6px',flexShrink:0}}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ COURSES ═══════════════════════════════════════════════ */}
      {tab==='courses' && (
        <div style={{display:'flex',flexDirection:'column',height:700}}>
          <div style={{padding:'6px 20px 4px'}}>
            <div style={{fontSize:28,fontWeight:800,letterSpacing:-0.8,color:P.text}}>Courses</div>
            <div style={{fontSize:13,color:P.textSec,marginTop:1}}>Générées depuis la semaine</div>
          </div>
          <div className="scroll" style={{flex:1,overflowY:'auto',padding:'0 16px 90px'}}>
            {/* Ingrédients automatiques */}
            {Object.values(Object.values(groceryCats)).flat().length > 0
              ? Object.entries(groceryCats).map(([cat,items]) => items.length > 0 ? (
                <div key={cat}>
                  <div style={{fontSize:11,fontWeight:700,color:P.accentLight,textTransform:'uppercase',letterSpacing:'0.08em',padding:'14px 4px 6px'}}>{cat}</div>
                  <div style={{background:P.surface,borderRadius:14,overflow:'hidden',marginBottom:4,border:`0.5px solid ${P.border}`}}>
                    {items.map((item,idx) => {
                      const key='g_'+item.replace(/[\s,]/g,'_');
                      const chk = groceryChecked[key]||false;
                      return (
                        <div key={item} style={{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:idx<items.length-1?`0.5px solid ${P.border}`:'none',gap:12,background:chk?P.surface3:'transparent',transition:'background 0.15s'}}>
                          <div onClick={()=>setGroceryChecked(p=>({...p,[key]:!chk}))} style={{width:22,height:22,borderRadius:8,flexShrink:0,cursor:'pointer',background:chk?P.accent:P.surface2,border:`1.5px solid ${chk?P.accent:P.border}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                            {chk&&<svg viewBox="0 0 12 10" style={{width:10,height:10}}><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span style={{fontSize:15,color:chk?P.textTert:P.text,textDecoration:chk?'line-through':'none',flex:1,transition:'all 0.15s'}}>{item.charAt(0).toUpperCase() + item.slice(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null)
              : <div style={{color:P.textTert,fontSize:14,textAlign:'center',padding:'2rem 1rem',lineHeight:2}}>Planifiez votre semaine<br/>pour voir la liste.</div>
            }

            {/* Ajouts manuels */}
            {manualItems.length > 0 && (
              <div>
                <div style={{fontSize:11,fontWeight:700,color:P.accentLight,textTransform:'uppercase',letterSpacing:'0.08em',padding:'14px 4px 6px'}}>Ajouts manuels</div>
                <div style={{background:P.surface,borderRadius:14,overflow:'hidden',marginBottom:4,border:`0.5px solid ${P.border}`}}>
                  {manualItems.map((item,idx)=>(
                    <div key={item.id} style={{display:'flex',alignItems:'center',padding:'13px 16px',borderBottom:idx<manualItems.length-1?`0.5px solid ${P.border}`:'none',gap:12,background:item.checked?P.surface3:'transparent'}}>
                      <div onClick={()=>toggleManual(item.id)} style={{width:22,height:22,borderRadius:8,flexShrink:0,cursor:'pointer',background:item.checked?P.accent:P.surface2,border:`1.5px solid ${item.checked?P.accent:P.border}`,display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
                        {item.checked&&<svg viewBox="0 0 12 10" style={{width:10,height:10}}><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{fontSize:15,color:item.checked?P.textTert:P.text,textDecoration:item.checked?'line-through':'none',flex:1}}>{item.name}</span>
                      <span onClick={()=>removeManual(item.id)} style={{color:P.remove,fontSize:12,cursor:'pointer',padding:'2px 6px'}}>✕</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Barre d'ajout manuel fixée en bas */}
          <div style={{position:'absolute',bottom:82,left:0,right:0,background:P.surface,borderTop:`0.5px solid ${P.border}`,padding:'10px 16px',display:'flex',gap:10,alignItems:'center'}}>
            <input
              value={newItem}
              onChange={e=>setNewItem(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&addManualItem()}
              placeholder="Ajouter un ingrédient…"
              style={{flex:1,background:P.surface2,border:`0.5px solid ${P.border}`,borderRadius:12,padding:'10px 14px',fontSize:15,color:P.text,outline:'none',fontFamily:'inherit'}}
            />
            <button onClick={addManualItem} style={{background:P.accent,color:'white',border:'none',borderRadius:12,padding:'10px 16px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>+</button>
          </div>
        </div>
      )}

      {/* TAB BAR */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:82,background:P.tabBar,borderTop:`0.5px solid ${P.border}`,display:'flex',alignItems:'flex-start',paddingTop:10}}>
        {tabCfg.map(({name,label})=>(
          <div key={name} onClick={()=>setTab(name)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,cursor:'pointer',padding:'4px 0'}}>
            <svg viewBox="0 0 24 24" style={{width:22,height:22}} fill="none" stroke={tab===name?P.accent:P.textTert} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {name==='planner'   && <><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></>}
              {name==='menutypes' && <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"/></>}
              {name==='courses'   && <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></>}
            </svg>
            <span style={{fontSize:10,fontWeight:600,color:tab===name?P.accent:P.textTert,letterSpacing:'0.01em'}}>{label}</span>
          </div>
        ))}
      </div>

      {/* ══ SHEETS ════════════════════════════════════════════════ */}

      {/* Ajouter / Modifier un repas */}
      <Sheet open={sheet==='addMeal'} onClose={()=>setSheet(null)} title={`${planner[`${selectedDay}-${addMeal}`]?'Modifier':'Ajouter'} · ${ML[addMeal]} ${PROTEIN_EMOJI[`${selectedDay}-${addMeal}`]||''}`}>
        <VLabel>Jour</VLabel>
        <VSelect value={selectedDay} onChange={e=>setSelectedDay(Number(e.target.value))}>
          {FULL_DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
        </VSelect>
        <VLabel>
          Plats disponibles · {EMOJI_LABEL[slotEmoji]} {slotEmoji}
        </VLabel>
        {filteredForSlot.length === 0
          ? <div style={{color:P.textTert,fontSize:14,padding:'12px 0',textAlign:'center'}}>Aucun plat pour cette protéine.<br/>Ajoutez-en dans "Plats".</div>
          : filteredForSlot.map(r => (
            <div key={r.id} onClick={()=>setAddRecipeId(r.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',borderRadius:14,marginBottom:6,cursor:'pointer',background:addRecipeId===r.id?P.accentBg:P.surface3,border:`1px solid ${addRecipeId===r.id?P.accentLight:P.border}`,transition:'all 0.15s'}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:addRecipeId===r.id?600:500,color:addRecipeId===r.id?P.accentText:P.text}}>{r.name}</div>
                <div style={{fontSize:12,color:P.textSec,marginTop:2}}>{ML[r.meal]} · {r.time} min</div>
              </div>
              {addRecipeId===r.id && (
                <div style={{width:20,height:20,borderRadius:'50%',background:P.accent,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg viewBox="0 0 12 10" style={{width:10,height:10}}><path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>
          ))
        }
        <PrimaryBtn onClick={doAddMeal} style={{marginTop:14}}>Confirmer</PrimaryBtn>
        <GhostBtn onClick={()=>setSheet(null)}>Annuler</GhostBtn>
      </Sheet>


    {/* Nouveau plat */}
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
