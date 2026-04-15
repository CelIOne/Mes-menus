import { useState, useEffect, useCallback } from "react";

// --- CONSTANTES ET CONFIGURATION ---
const DAYS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const DATES = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + i;
  return new Date(d.setDate(diff)).getDate();
});
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
  bg:'#F5F0FF', surface:'#FFFFFF', surface2:'#EDE6FF', accent:'#7C5CBF', accentLight:'#B79FE6', 
  accentBg:'#EDE6FF', accentText:'#4A2D8C', border:'#DDD4F5', text:'#2D1F5E', textSec:'#7B6FA0', 
  textTert:'#B0A3CC', remove:'#C9506E', redBg:'#FAEAEA', handle:'#D4C8F0',
};

const STORAGE_KEY = 'menus_app_v4';

const DEFAULT_RECIPES = [
  {id:1, name:'Salade de quinoa + œufs durs', protein:'🥚', meal:'dejeuner', time:15, ing:'oeufs, quinoa'},
  {id:4, name:'Poulet rôti + légumes', protein:'🍗', meal:'dejeuner', time:35, ing:'poulet, brocoli'},
  {id:9, name:'Steak + salade verte', protein:'🥩', meal:'diner', time:15, ing:'steak, salade'},
  {id:11,name:'Dos de cabillaud + haricots', protein:'🐟', meal:'dejeuner', time:20, ing:'cabillaud, haricots'},
];

// --- COMPOSANTS UI ---
function Toast({ msg }) {
  return msg ? (
    <div style={{position:'absolute',top:62,left:'50%',transform:'translateX(-50%)',background:P.accent,color:'white',fontSize:13,fontWeight:500,padding:'7px 18px',borderRadius:20,zIndex:300,boxShadow:`0 4px 12px rgba(0,0,0,0.1)`}}>{msg}</div>
  ) : null;
}

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(45,31,94,0.35)',zIndex:200}} />
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:P.surface,borderRadius:'24px 24px 0 0',padding:'0 0 36px',zIndex:201,boxShadow:`0 -8px 32px rgba(0,0,0,0.1)`}}>
        <div style={{width:40,height:4,background:P.handle,borderRadius:2,margin:'12px auto 0'}} />
        <div style={{fontSize:17,fontWeight:700,textAlign:'center',padding:'14px 20px 4px',color:P.text}}>{title}</div>
        <div style={{maxHeight:540,overflowY:'auto',padding:'4px 16px'}}>{children}</div>
      </div>
    </>
  );
}

const VLabel = ({children}) => <div style={{fontSize:11,fontWeight:700,color:P.textTert,textTransform:'uppercase',padding:'14px 2px 5px'}}>{children}</div>;
const VInput = (props) => <input {...props} style={{width:'100%',background:P.surface2,border:`0.5px solid ${P.border}`,borderRadius:12,padding:13,fontSize:16,outline:'none',boxSizing:'border-box'}} />;
const PrimaryBtn = ({children,...props}) => <button {...props} style={{width:'100%',background:P.accent,color:'white',border:'none',borderRadius:14,padding:16,fontSize:16,fontWeight:700,marginTop:10,cursor:'pointer'}}>{children}</button>;
const GhostBtn = ({children,...props}) => <button {...props} style={{width:'100%',background:P.surface2,color:P.textSec,border:`0.5px solid ${P.border}`,borderRadius:14,padding:14,fontSize:15,marginTop:6,cursor:'pointer'}}>{children}</button>;

// --- APPLICATION PRINCIPALE ---
export default function App() {
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [planner, setPlanner] = useState({});
  const [manualItems, setManualItems] = useState([]); // Liste manuelle
  const [newItemName, setNewItemName] = useState(''); // Nom du nouvel ingrédient
  const [tab, setTab] = useState('planner');
  const [selectedDay, setSelectedDay] = useState(0);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState(null);
  const [addMeal, setAddMeal] = useState('dejeuner');
  const [newRecipe, setNewRecipe] = useState({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(()=>setToast(''),2000); }, []);

  const selectAndAddMeal = (recipeId) => {
    setPlanner(prev => ({...prev, [`${selectedDay}-${addMeal}`]: recipeId}));
    setSheet(null);
    showToast('Plat planifié ✓');
  };

  const doRandom = () => {
    const np = {};
    DAYS.forEach((_,i) => {
      MEALS.forEach(m => {
        const emoji = PROTEIN_EMOJI[`${i}-${m}`];
        let pool = recipes.filter(r => r.protein===emoji);
        if (!pool.length) pool = recipes;
        np[`${i}-${m}`] = pool[Math.floor(Math.random()*pool.length)].id;
      });
    });
    setPlanner(np);
    showToast('Semaine générée ! 🎲');
  };

  const saveNewRecipe = () => {
    if (!newRecipe.name.trim()) return;
    setRecipes(prev => [...prev, { ...newRecipe, id: Date.now() }]);
    setSheet(null);
    setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
    showToast('Nouveau plat ajouté ✓');
  };

  // Ajout manuel d'un ingrédient
  const addManualItem = () => {
    if (!newItemName.trim()) return;
    setManualItems(prev => [...prev, newItemName.trim()]);
    setNewItemName('');
    setSheet(null);
    showToast('Ajouté aux courses ✓');
  };

  // Calcul des ingrédients automatiques + manuels
  const getGroceryList = () => {
    const autoItems = [];
    Object.values(planner).forEach(rid => {
      const r = recipes.find(x => x.id === rid);
      if (r && r.ing) {
        r.ing.split(',').forEach(i => {
          const item = i.trim();
          if (item && !autoItems.includes(item)) autoItems.push(item);
        });
      }
    });
    return [...autoItems, ...manualItems];
  };

  const filteredForSlot = recipes.filter(r => r.protein === PROTEIN_EMOJI[`${selectedDay}-${addMeal}`]);

  return (
    <div style={{maxWidth:400, margin:'0 auto', background:P.bg, minHeight:'100vh', position:'relative', fontFamily:'sans-serif', paddingBottom:100, overflowX:'hidden'}}>
      <Toast msg={toast} />

      {/* --- ONGLET PLANNING --- */}
      {tab === 'planner' && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, color: P.text, margin: 0 }}>Mes menus</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setPlanner({}); showToast('Planning vidé'); }} style={{ background: P.redBg, color: P.remove, border: 'none', padding: '8px 12px', borderRadius: 12, fontWeight: 600, cursor:'pointer' }}>Vider</button>
              <button onClick={doRandom} style={{ background: P.accentBg, color: P.accentText, border: 'none', padding: '8px 12px', borderRadius: 12, fontWeight: 600, cursor:'pointer' }}>Aléatoire</button>
            </div>
          </div>

          <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:20, paddingBottom:5}}>
            {DAYS.map((d, i) => (
              <div key={i} onClick={()=>setSelectedDay(i)} style={{textAlign:'center', cursor:'pointer', minWidth:45}}>
                <div style={{width:40, height:40, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', background:selectedDay===i?P.accent:P.surface, color:selectedDay===i?'white':P.text, border:`1px solid ${P.border}`}}>{DATES[i]}</div>
                <div style={{fontSize:10, marginTop:4, color:P.textSec}}>{d}</div>
              </div>
            ))}
          </div>

          {MEALS.map(m => {
            const rid = planner[`${selectedDay}-${m}`];
            const recipe = recipes.find(r=>r.id===rid);
            return (
              <div key={m} style={{background:P.surface, padding:16, borderRadius:16, marginBottom:12, border:`1px solid ${P.border}`}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <span style={{fontSize:12, fontWeight:700, color:P.accentLight}}>{ML[m]} {PROTEIN_EMOJI[`${selectedDay}-${m}`]}</span>
                  <button onClick={()=>{setAddMeal(m); setSheet('addMeal');}} style={{background:'none', border:'none', color:P.accent, fontWeight:600, cursor:'pointer'}}>{recipe?'Changer':'+ Ajouter'}</button>
                </div>
                {recipe ? <div style={{fontWeight:600, color:P.text}}>{recipe.name}</div> : <div style={{color:P.textTert}}>Rien de prévu</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* --- ONGLET MES PLATS --- */}
      {tab === 'menutypes' && (
        <div style={{padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h1 style={{fontSize:24, color:P.text, margin:0}}>Mes Plats</h1>
            <button onClick={()=>setSheet('newRecipe')} style={{background:P.accent, color:'white', border:'none', padding:'8px 16px', borderRadius:12, fontWeight:600, cursor:'pointer'}}>+ Nouveau</button>
          </div>
          {recipes.map(r => (
            <div key={r.id} style={{padding:12, background:P.surface, borderRadius:12, marginBottom:8, border:`1px solid ${P.border}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{color:P.text}}>{r.protein} {r.name}</span>
              <button onClick={()=>setRecipes(prev=>prev.filter(x=>x.id!==r.id))} style={{color:P.remove, border:'none', background:'none', cursor:'pointer', fontSize:16}}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* --- ONGLET COURSES --- */}
      {tab === 'courses' && (
        <div style={{padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <h1 style={{fontSize:24, color:P.text, margin:0}}>Courses</h1>
            <button onClick={()=>setSheet('addItem')} style={{background:P.accent, color:'white', border:'none', padding:'8px 16px', borderRadius:12, fontWeight:600, cursor:'pointer'}}>+ Ajouter</button>
          </div>
          <div style={{background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, overflow:'hidden'}}>
            {getGroceryList().length > 0 ? getGroceryList().map((item, idx) => (
              <div key={idx} style={{padding:16, borderBottom:idx === getGroceryList().length - 1 ? 'none' : `1px solid ${P.border}`, display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:20, height:20, borderRadius:6, border:`2px solid ${P.accentLight}`}} />
                <span style={{color:P.text}}>{item}</span>
              </div>
            )) : <div style={{padding:30, textAlign:'center', color:P.textTert}}>Aucun ingrédient</div>}
          </div>
          {manualItems.length > 0 && (
            <GhostBtn onClick={() => setManualItems([])} style={{marginTop:20, color:P.remove}}>Vider les ajouts manuels</GhostBtn>
          )}
        </div>
      )}

      {/* --- BARRE DE NAVIGATION FIXE --- */}
      <div style={{position:'fixed', bottom:0, left:0, right:0, height:70, background:'white', borderTop:`1px solid ${P.border}`, display:'flex', justifyContent:'space-around', alignItems:'center', zIndex:100}}>
          {['planner', 'menutypes', 'courses'].map(t => (
              <button key={t} onClick={()=>{setTab(t); setSheet(null);}} style={{background:'none', border:'none', color:tab===t?P.accent:P.textTert, fontWeight:600, fontSize:12, cursor:'pointer'}}>
                  {t === 'planner' ? '📅 Plan' : t === 'menutypes' ? '🍳 Plats' : '🛒 Courses'}
              </button>
          ))}
      </div>

      {/* --- TIROIRS (SHEETS) --- */}

      {/* 1. Choisir un plat */}
      {sheet === 'addMeal' && (
        <Sheet open={true} onClose={() => setSheet(null)} title="Choisir un plat">
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {filteredForSlot.map(r => (
              <div key={r.id} onClick={() => selectAndAddMeal(r.id)} style={{padding:16, borderRadius:12, background:P.surface2, cursor:'pointer'}}>
                <div style={{fontWeight:600, color:P.text}}>{r.name}</div>
              </div>
            ))}
            <GhostBtn onClick={() => setSheet(null)}>Annuler</GhostBtn>
          </div>
        </Sheet>
      )}

      {/* 2. Créer un nouveau plat */}
      {sheet === 'newRecipe' && (
        <Sheet open={true} onClose={() => setSheet(null)} title="Nouveau Plat">
          <VLabel>Nom du plat</VLabel>
          <VInput value={newRecipe.name} onChange={e => setNewRecipe({ ...newRecipe, name: e.target.value })} placeholder="Ex: Gratin" />
          <VLabel>Protéine</VLabel>
          <div style={{display:'flex', gap:10, marginBottom:10}}>
            {['🥚','🍗','🥩','🐟'].map(emoji => (
              <button key={emoji} onClick={()=>setNewRecipe({...newRecipe, protein:emoji})} style={{flex:1, padding:10, borderRadius:10, border:newRecipe.protein===emoji?`2px solid ${P.accent}`:`1px solid ${P.border}`, background:newRecipe.protein===emoji?P.accentBg:'white', fontSize:20}}>{emoji}</button>
            ))}
          </div>
          <PrimaryBtn onClick={saveNewRecipe}>Enregistrer</PrimaryBtn>
          <GhostBtn onClick={() => setSheet(null)}>Annuler</GhostBtn>
        </Sheet>
      )}

      {/* 3. Ajouter manuellement aux courses */}
      {sheet === 'addItem' && (
        <Sheet open={true} onClose={() => setSheet(null)} title="Ajouter un article">
          <VLabel>Nom de l'article</VLabel>
          <VInput 
            autoFocus 
            value={newItemName} 
            onChange={e => setNewItemName(e.target.value)} 
            placeholder="Ex: Lait, Pain, Papier..." 
            onKeyDown={(e) => e.key === 'Enter' && addManualItem()}
          />
          <PrimaryBtn onClick={addManualItem}>Ajouter à la liste</PrimaryBtn>
          <GhostBtn onClick={() => setSheet(null)}>Annuler</GhostBtn>
        </Sheet>
      )}

    </div>
  );
}
