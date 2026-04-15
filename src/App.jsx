import { useState, useEffect, useCallback } from "react";

const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const FULL_DAYS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
const MEALS = ['dejeuner','diner'];
const ML = { dejeuner:'Déjeuner', diner:'Dîner' };
// Fonction pour récupérer les numéros de jour de la semaine actuelle (Lundi à Dimanche)
const getWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Dimanche) à 6 (Samedi)
  
  // Ajustement pour que la semaine commence le Lundi (index 0 dans votre tableau DAYS)
  // Si c'est dimanche (0), on recule de 6 jours, sinon on recule jusqu'au lundi (1)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
};

const DATES = getWeekDates(); // Génère les dates dynamiquement


const PROTEIN_EMOJI = {
  '0-dejeuner':'🥚','0-diner':'🥩',
  '1-dejeuner':'🍗','1-diner':'🍗',
  '2-dejeuner':'🥚','2-diner':'🍗',
  '3-dejeuner':'🐟','3-diner':'🥩',
  '4-dejeuner':'🍗','4-diner':'🥚',
  '5-dejeuner':'🍗','5-diner':'🍗',
  '6-dejeuner':'🥩','6-diner':'🐟',
};

const EMOJI_LABEL = { '🥚':'Œuf', '🥩':'Bœuf', '🍗':'Poulet', '🐟':'Poisson' };

const P = {
  bg:'#F5F0FF', surface:'#FFFFFF', surface2:'#EDE6FF', surface3:'#F9F6FF',
  accent:'#7C5CBF', accentLight:'#B79FE6', accentBg:'#EDE6FF', accentText:'#4A2D8C',
  border:'#DDD4F5', border2:'#C9BAEE',
  text:'#2D1F5E', textSec:'#7B6FA0', textTert:'#B0A3CC',
  remove:'#C9506E', redBg:'#FAEAEA', tabBar:'#FFFFFF', handle:'#D4C8F0',
};

const STORAGE_KEY = 'menus_app_v4';

const DEFAULT_RECIPES = [
  {id:1, name:'Salade de quinoa + œufs durs',      protein:'🥚', meal:'dejeuner', time:15, ing:'oeufs, quinoa, tomates, salade'},
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
];

// --- Composants Internes ---
function Toast({ msg }) {
  return msg ? (
    <div style={{position:'absolute',top:62,left:'50%',transform:'translateX(-50%)',background:P.accent,color:'white',fontSize:13,fontWeight:500,padding:'7px 18px',borderRadius:20,zIndex:300,whiteSpace:'nowrap',animation:'fadeInOut 2s ease forwards',pointerEvents:'none',boxShadow:`0 4px 16px ${P.accentLight}88`}}>{msg}</div>
  ) : null;
}

function Sheet({ open, onClose, title, children }) {
  return (
    <>
      {open && <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(45,31,94,0.35)',zIndex:50}} />}
      <div style={{position:'absolute',bottom:0,left:0,right:0,background:P.surface,borderRadius:'24px 24px 0 0',padding:'0 0 36px',zIndex:51,transform:open?'translateY(0)':'translateY(100%)',transition:'transform 0.32s cubic-bezier(0.32,0.72,0,1)',boxShadow:`0 -8px 32px ${P.accentLight}44`}}>
        <div style={{width:40,height:4,background:P.handle,borderRadius:2,margin:'12px auto 0'}} />
        <div style={{fontSize:17,fontWeight:700,textAlign:'center',padding:'14px 20px 4px',color:P.text,letterSpacing:-0.3}}>{title}</div>
        <div style={{maxHeight:540,overflowY:'auto',padding:'4px 16px'}}>{children}</div>
      </div>
    </>
  );
}
// --- Application Principale ---
export default function App() {
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [planner, setPlanner] = useState({});
  const [groceryChecked, setGroceryChecked] = useState({});
  const [manualItems, setManualItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [nextRid, setNextRid] = useState(15);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('planner');
  const [selectedDay, setSelectedDay] = useState(0);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState(null);
  const [addMeal, setAddMeal] = useState('dejeuner');
  const [addRecipeId, setAddRecipeId] = useState(null);
  const [newRecipe, setNewRecipe] = useState({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
  const [antiRep, setAntiRep] = useState(true);

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(()=>setToast(''),2200); }, []);

  // --- Persistance ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.recipes) setRecipes(d.recipes);
        if (d.planner) setPlanner(d.planner);
        if (d.groceryChecked) setGroceryChecked(d.groceryChecked);
        if (d.manualItems) setManualItems(d.manualItems);
        if (d.nextRid) setNextRid(d.nextRid);
      } catch(e) { console.error("Erreur de chargement", e); }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({recipes, planner, groceryChecked, manualItems, nextRid}));
  }, [recipes, planner, groceryChecked, manualItems, nextRid, loaded]);

  // --- Actions ---
  
  // FONCTION CORRIGÉE POUR L'AJOUT AUTOMATIQUE
  const selectAndAddMeal = (recipeId) => {
    setPlanner(prev => ({
      ...prev, 
      [`${selectedDay}-${addMeal}`]: recipeId
    }));
    setSheet(null);
    showToast('Plat planifié ✓');
  };

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

  function doRandom() {
    const np = {};
    DAYS.forEach((_,i) => {
      MEALS.forEach(m => {
        const emoji = PROTEIN_EMOJI[`${i}-${m}`];
        let pool = recipes.filter(r => r.protein===emoji);
        if (!pool.length) pool = recipes;
        if (antiRep) { 
            const used = Object.values(np); 
            const fresh = pool.filter(r => !used.includes(r.id)); 
            if (fresh.length) pool = fresh; 
        }
        np[`${i}-${m}`] = pool[Math.floor(Math.random()*pool.length)].id;
      });
    });
    setPlanner(np);
    setSheet(null);
    showToast('Semaine générée !');
  }

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
    if (!newItem.trim()) return;
    setManualItems(prev => [...prev, {id: Date.now(), name:newItem.trim(), checked:false}]);
    setNewItem('');
  }

  const PROTEIN_ORDER = ['🥚','🍗','🥩','🐟'];
  const recipesByProtein = PROTEIN_ORDER.reduce((acc,e) => { acc[e] = recipes.filter(r=>r.protein===e); return acc; }, {});
  const slotEmoji = PROTEIN_EMOJI[`${selectedDay}-${addMeal}`] || '🍗';
  const filteredForSlot = recipes.filter(r => r.protein === slotEmoji);

  return (
    <div style={{maxWidth:400, margin:'0 auto', background:P.bg, minHeight:'100vh', position:'relative', fontFamily:'sans-serif', paddingBottom: 100}}>
      <style>{`
        @keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(4px)}10%{opacity:1;transform:translateX(-50%) translateY(0)}80%{opacity:1}100%{opacity:0}}
        .scroll::-webkit-scrollbar{display:none}
      `}</style>

      <Toast msg={toast} />

      {tab==='planner' && (
        <div style={{padding:'20px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <div>
                  <h1 style={{fontSize:24, color:P.text, margin:0}}>Mes menus</h1>
                  <div style={{ fontSize: 13, color: P.textSec, marginTop: 2, textTransform: 'capitalize' }}>
                    Semaine de {new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())}
                  </div>
                </div>
                <button onClick={()=>setSheet('random')} style={{background:P.accentBg, color:P.accentText, border:'none', padding:'8px 12px', borderRadius:12, fontWeight:600}}>Aléatoire</button>
            </div>
            
            <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:20}} className="scroll">
                {DAYS.map((d, i) => (
                    <div key={i} onClick={()=>setSelectedDay(i)} style={{textAlign:'center', cursor:'pointer', minWidth:45}}>
                        <div style={{width:40, height:40, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', background:selectedDay===i?P.accent:P.surface, color:selectedDay===i?'white':P.text, border:`1px solid ${P.border}`}}>
                            {DATES[i]}
                        </div>
                        <div style={{fontSize:10, marginTop:4, color:P.textSec}}>{d}</div>
                    </div>
                ))}
            </div>

            {MEALS.map(m => {
                const rid = planner[`${selectedDay}-${m}`];
                const recipe = recipes.find(r=>r.id===rid);
                const emoji = PROTEIN_EMOJI[`${selectedDay}-${m}`];
                return (
                    <div key={m} style={{background:P.surface, padding:16, borderRadius:16, marginBottom:12, border:`1px solid ${P.border}`}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                            <span style={{fontSize:12, fontWeight:700, color:P.accentLight}}>{ML[m]} {emoji}</span>
                            <button onClick={()=>openAddMealSheet(m)} style={{background:'none', border:'none', color:P.accent, fontWeight:600}}>{recipe?'Changer':'+ Ajouter'}</button>
                        </div>
                        {recipe ? (
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <div style={{fontWeight:600}}>{recipe.name}</div>
                                    <div style={{fontSize:12, color:P.textSec}}>{recipe.time} min</div>
                                </div>
                                <button onClick={()=>removeMeal(selectedDay, m)} style={{color:P.remove, background:P.redBg, border:'none', padding:'4px 8px', borderRadius:8}}>Retirer</button>
                            </div>
                        ) : <div style={{color:P.textTert, fontSize:14, fontStyle:'italic'}}>Rien de prévu</div>}
                    </div>
                )
            })}
        </div>
      )}

      {tab==='menutypes' && (
          <div style={{padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h1 style={{fontSize:24, color:P.text, margin:0}}>Mes Plats</h1>
                <button onClick={()=>setSheet('newRecipe')} style={{background:P.accent, color:'white', border:'none', padding:'8px 16px', borderRadius:12, fontWeight:600}}>+ Nouveau</button>
              </div>
              {PROTEIN_ORDER.map(emoji => (
                  <div key={emoji} style={{marginBottom:20}}>
                      <div style={{fontSize:12, fontWeight:700, color:P.textTert, marginBottom:8}}>{EMOJI_LABEL[emoji]} {emoji}</div>
                      <div style={{background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, overflow:'hidden'}}>
                        {recipesByProtein[emoji]?.map((r, idx) => (
                            <div key={r.id} style={{padding:12, borderBottom: idx===recipesByProtein[emoji].length-1?'none':`1px solid ${P.border}`, display:'flex', justifyContent:'space-between'}}>
                                <span>{r.name}</span>
                                <button onClick={()=>setRecipes(prev=>prev.filter(x=>x.id!==r.id))} style={{color:P.remove, border:'none', background:'none'}}>✕</button>
                            </div>
                        ))}
                      </div>
                  </div>
              ))}
          </div>
      )}

      {tab==='courses' && (
          <div style={{padding:20}}>
              <h1 style={{fontSize:24, color:P.text, marginBottom:20}}>Courses</h1>
              {Object.entries(groceryCats).map(([cat, items]) => items.length > 0 && (
                  <div key={cat} style={{marginBottom:20}}>
                      <div style={{fontSize:12, fontWeight:700, color:P.accent, marginBottom:8}}>{cat}</div>
                      <div style={{background:P.surface, borderRadius:16, border:`1px solid ${P.border}`}}>
                        {items.map((it, idx) => (
                            <div key={it} onClick={()=>setGroceryChecked(p=>({...p, [it]:!p[it]}))} style={{padding:14, borderBottom: idx===items.length-1?'none':`1px solid ${P.border}`, display:'flex', alignItems:'center', gap:10}}>
                                <div style={{width:20, height:20, borderRadius:6, border:`2px solid ${P.accent}`, background: groceryChecked[it]?P.accent:'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                    {groceryChecked[it] && <span style={{color:'white', fontSize:12}}>✓</span>}
                                </div>
                                <span style={{textDecoration: groceryChecked[it]?'line-through':'none', color: groceryChecked[it]?P.textTert:P.text}}>{it}</span>
                            </div>
                        ))}
                      </div>
                  </div>
              ))}
              <div style={{marginTop:20}}>
                  <input value={newItem} onChange={e=>setNewItem(e.target.value)} placeholder="Ajouter un article..." style={{width:'70%', padding:12, borderRadius:12, border:`1px solid ${P.border}`}} />
                  <button onClick={addManualItem} style={{width:'25%', marginLeft:'5%', padding:12, background:P.accent, color:'white', border:'none', borderRadius:12}}>OK</button>
              </div>
          </div>
      )}

      <div style={{position:'fixed', bottom:0, left:0, right:0, height:70, background:'white', borderTop:`1px solid ${P.border}`, display:'flex', justifyContent:'space-around', alignItems:'center', zIndex:10}}>
          {['planner', 'menutypes', 'courses'].map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{background:'none', border:'none', color:tab===t?P.accent:P.textTert, fontWeight:600, fontSize:12}}>
                  {t === 'planner' ? '📅 Plan' : t === 'menutypes' ? '🍳 Plats' : '🛒 Courses'}
              </button>
          ))}
      </div>

      {/* SHEET AJOUT AUTOMATIQUE CORRIGÉ */}
      <Sheet open={sheet==='addMeal'} onClose={()=>setSheet(null)} title="Choisir un plat">
          {filteredForSlot.length > 0 ? filteredForSlot.map(r => (
              <div 
                key={r.id} 
                onClick={() => selectAndAddMeal(r.id)} 
                style={{
                  padding:16, 
                  borderRadius:12, 
                  background: P.surface2, 
                  marginBottom:8, 
                  border:`1px solid ${P.border}`,
                  cursor: 'pointer'
                }}
              >
                  <div style={{fontWeight: 600, color: P.text}}>{r.name}</div>
                  <div style={{fontSize: 12, color: P.textSec}}>{r.time} min</div>
              </div>
          )) : (
            <div style={{padding:20, textAlign:'center', color:P.textSec}}>Aucun plat trouvé pour cette protéine.</div>
          )}
          <GhostBtn onClick={() => setSheet(null)}>Annuler</GhostBtn>
      </Sheet>

      <Sheet open={sheet==='newRecipe'} onClose={()=>setSheet(null)} title="Nouveau Plat">
            <VLabel>Nom</VLabel>
            <VInput value={newRecipe.name} onChange={e=>setNewRecipe({...newRecipe, name:e.target.value})} />
            <VLabel>Ingrédients (virgules)</VLabel>
            <VInput value={newRecipe.ing} onChange={e=>setNewRecipe({...newRecipe, ing:e.target.value})} />
            <PrimaryBtn onClick={saveNewRecipe}>Enregistrer</PrimaryBtn>
      </Sheet>

      <Sheet open={sheet==='random'} onClose={()=>setSheet(null)} title="Générer la semaine">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:10}}>
                <span>Anti-répétition</span>
                <Toggle value={antiRep} onChange={()=>setAntiRep(!antiRep)} />
            </div>
            <PrimaryBtn onClick={doRandom}>Lancer le tirage</PrimaryBtn>
      </Sheet>
    </div>
  );
}
