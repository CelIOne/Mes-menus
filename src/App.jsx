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

const P = {
  bg:'#F5F0FF', surface:'#FFFFFF', surface2:'#EDE6FF', accent:'#7C5CBF', accentLight:'#B79FE6', 
  accentBg:'#EDE6FF', accentText:'#4A2D8C', border:'#DDD4F5', text:'#2D1F5E', textSec:'#7B6FA0', 
  textTert:'#B0A3CC', remove:'#C9506E', redBg:'#FAEAEA', handle:'#D4C8F0',
};

const DEFAULT_RECIPES = [
  {id:1, name:'Salade de quinoa + œufs durs', protein:'🥚', meal:'dejeuner', time:15, ing:'oeufs, quinoa'},
  {id:4, name:'Poulet rôti + légumes', protein:'🍗', meal:'dejeuner', time:35, ing:'poulet, brocoli'},
  {id:9, name:'Steak + salade verte', protein:'🥩', meal:'diner', time:15, ing:'steak, salade'},
  {id:11,name:'Dos de cabillaud + haricots', protein:'🐟', meal:'dejeuner', time:20, ing:'cabillaud, haricots'},
];

// --- COMPOSANTS UI ---
function Toast({ msg }) {
  return msg ? (
    <div style={{position:'absolute',top:62,left:'50%',transform:'translateX(-50%)',background:P.accent,color:'white',fontSize:13,fontWeight:500,padding:'7px 18px',borderRadius:20,zIndex:300}}>{msg}</div>
  ) : null;
}

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(45,31,94,0.35)',zIndex:200}} />
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:P.surface,borderRadius:'24px 24px 0 0',padding:'0 0 36px',zIndex:201}}>
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

export default function App() {
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [planner, setPlanner] = useState({});
  const [tab, setTab] = useState('planner');
  const [selectedDay, setSelectedDay] = useState(0);
  const [toast, setToast] = useState('');
  const [sheet, setSheet] = useState(null);
  const [addMeal, setAddMeal] = useState('dejeuner');
  const [newRecipe, setNewRecipe] = useState({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
  
  // Nouveaux états pour les courses
  const [manualItems, setManualItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');

  const showToast = useCallback((msg) => { setToast(msg); setTimeout(()=>setToast(''),2000); }, []);

  const selectAndAddMeal = (recipeId) => {
    setPlanner(prev => ({...prev, [`${selectedDay}-${addMeal}`]: recipeId}));
    setSheet(null);
    showToast('Plat planifié ✓');
  };

  const saveNewRecipe = () => {
    if (!newRecipe.name.trim()) return;
    setRecipes(prev => [...prev, { ...newRecipe, id: Date.now() }]);
    setSheet(null);
    setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
    showToast('Plat ajouté ✓');
  };

  // Ajouter un ingrédient manuel
  const addManualItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setManualItems([...manualItems, { id: Date.now(), name: newItemName.trim(), checked: false }]);
    setNewItemName('');
  };

  const toggleItem = (id) => {
    setManualItems(manualItems.map(it => it.id === id ? { ...it, checked: !it.checked } : it));
  };

  const deleteItem = (id) => {
    setManualItems(manualItems.filter(it => it.id !== id));
  };

  const filteredForSlot = recipes.filter(r => r.protein === PROTEIN_EMOJI[`${selectedDay}-${addMeal}`]);

  // Générer la liste auto à partir du planning
  const autoIngredients = Object.values(planner)
    .map(id => recipes.find(r => r.id === id))
    .filter(Boolean)
    .flatMap(r => r.ing.split(',').map(i => i.trim()))
    .filter((v, i, a) => v && a.indexOf(v) === i);

  return (
    <div style={{maxWidth:400, margin:'0 auto', background:P.bg, minHeight:'100vh', position:'relative', fontFamily:'sans-serif', paddingBottom:100}}>
      <Toast msg={toast} />

      {/* --- ONGLET PLANNING --- */}
      {tab === 'planner' && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, color: P.text, margin: 0 }}>Mes menus</h1>
            <button onClick={() => setPlanner({})} style={{ background: P.redBg, color: P.remove, border: 'none', padding: '8px 12px', borderRadius: 12, fontWeight: 600 }}>Vider</button>
          </div>
          <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:20}}>
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
                  <button onClick={()=>{setAddMeal(m); setSheet('addMeal');}} style={{background:'none', border:'none', color:P.accent, fontWeight:600}}>{recipe?'Changer':'+ Ajouter'}</button>
                </div>
                {recipe ? <div style={{fontWeight:600}}>{recipe.name}</div> : <div style={{color:P.textTert}}>Rien de prévu</div>}
              </div>
            );
          })}
        </div>
      )}

      {/* --- ONGLET COURSES --- */}
      {tab === 'courses' && (
        <div style={{padding:20}}>
          <h1 style={{fontSize:24, color:P.text, marginBottom:20}}>Liste de courses</h1>
          
          {/* Formulaire ajout manuel */}
          <form onSubmit={addManualItem} style={{display:'flex', gap:8, marginBottom:24}}>
            <input 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Ajouter un article..."
              style={{flex:1, padding:12, borderRadius:12, border:`1px solid ${P.border}`, outline:'none'}}
            />
            <button type="submit" style={{background:P.accent, color:'white', border:'none', borderRadius:12, padding:'0 15px', fontWeight:700}}>+</button>
          </form>

          {/* Liste manuelle */}
          <VLabel>À acheter</VLabel>
          <div style={{background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, overflow:'hidden', marginBottom:20}}>
            {manualItems.length === 0 && <div style={{padding:16, color:P.textTert, fontSize:14}}>Aucun article manuel</div>}
            {manualItems.map(it => (
              <div key={it.id} style={{padding:14, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${P.bg}`}}>
                <div onClick={() => toggleItem(it.id)} style={{display:'flex', alignItems:'center', gap:10, cursor:'pointer', flex:1}}>
                  <div style={{width:20, height:20, borderRadius:6, border:`2px solid ${P.accent}`, background: it.checked ? P.accent : 'none', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {it.checked && <span style={{color:'white', fontSize:12}}>✓</span>}
                  </div>
                  <span style={{textDecoration: it.checked ? 'line-through' : 'none', color: it.checked ? P.textTert : P.text}}>{it.name}</span>
                </div>
                <button onClick={() => deleteItem(it.id)} style={{background:'none', border:'none', color:P.remove, fontSize:16}}>✕</button>
              </div>
            ))}
          </div>

          {/* Ingrédients du planning */}
          <VLabel>Ingrédients du planning</VLabel>
          <div style={{background:P.surface, borderRadius:16, border:`1px solid ${P.border}`, padding:16}}>
            {autoIngredients.length === 0 ? <div style={{color:P.textTert, fontSize:14}}>Planifiez des repas pour voir les ingrédients</div> : (
              <div style={{display:'flex', flexWrap:'wrap', gap:8}}>
                {autoIngredients.map(ing => (
                  <span key={ing} style={{background:P.surface2, color:P.accentText, padding:'6px 12px', borderRadius:8, fontSize:13}}>{ing}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- BARRE DE NAVIGATION --- */}
      <div style={{position:'fixed', bottom:0, left:0, right:0, height:70, background:'white', borderTop:`1px solid ${P.border}`, display:'flex', justifyContent:'space-around', alignItems:'center', zIndex:100}}>
          {['planner', 'courses'].map(t => (
              <button key={t} onClick={()=>setTab(t)} style={{background:'none', border:'none', color:tab===t?P.accent:P.textTert, fontWeight:600}}>
                  {t === 'planner' ? '📅 Plan' : '🛒 Courses'}
              </button>
          ))}
      </div>

      {/* --- TIROIR AJOUT REPAS --- */}
      {sheet === 'addMeal' && (
        <Sheet open={true} onClose={() => setSheet(null)} title="Choisir un plat">
          {filteredForSlot.map(r => (
            <div key={r.id} onClick={() => selectAndAddMeal(r.id)} style={{padding:16, borderRadius:12, background:P.surface2, marginBottom:8, cursor:'pointer'}}>
              <div style={{fontWeight:600}}>{r.name}</div>
            </div>
          ))}
          <GhostBtn onClick={() => setSheet(null)}>Annuler</GhostBtn>
        </Sheet>
      )}
    </div>
  );
}
