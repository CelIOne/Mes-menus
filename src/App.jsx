import { useState, useEffect, useCallback } from "react";

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

function Toast({ msg }) {
  return msg ? (
    <div style={{position:'absolute',top:62,left:'50%',transform:'translateX(-50%)',background:P.accent,color:'white',fontSize:13,fontWeight:500,padding:'7px 18px',borderRadius:20,zIndex:300}}>{msg}</div>
  ) : null;
}

function Sheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(45,31,94,0.35)',zIndex:50}} />
      <div style={{position:'absolute',bottom:0,left:0,right:0,background:P.surface,borderRadius:'24px 24px 0 0',padding:'0 0 36px',zIndex:51,boxShadow:`0 -8px 32px ${P.accentLight}44`}}>
        <div style={{width:40,height:4,background:P.handle,borderRadius:2,margin:'12px auto 0'}} />
        <div style={{fontSize:17,fontWeight:700,textAlign:'center',padding:'14px 20px 4px',color:P.text}}>{title}</div>
        <div style={{maxHeight:540,overflowY:'auto',padding:'4px 16px'}}>{children}</div>
      </div>
    </>
  );
}

const VLabel = ({children}) => <div style={{fontSize:11,fontWeight:700,color:P.textTert,textTransform:'uppercase',padding:'14px 2px 5px'}}>{children}</div>;
const VInput = (props) => <input {...props} style={{width:'100%',background:P.surface2,border:`0.5px solid ${P.border}`,borderRadius:12,padding:13,fontSize:16,outline:'none',boxSizing:'border-box'}} />;
const PrimaryBtn = ({children,...props}) => <button {...props} style={{width:'100%',background:P.accent,color:'white',border:'none',borderRadius:14,padding:16,fontSize:16,fontWeight:700,marginTop:10}}>{children}</button>;
const GhostBtn = ({children,...props}) => <button {...props} style={{width:'100%',background:P.surface2,color:P.textSec,border:`0.5px solid ${P.border}`,borderRadius:14,padding:14,fontSize:15,marginTop:6}}>{children}</button>;

export default function App() {
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [planner, setPlanner] = useState({});
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
    showToast('Semaine générée !');
  };

  const saveNewRecipe = () => {
    if (!newRecipe.name.trim()) return;
    setRecipes(prev => [...prev, { ...newRecipe, id: Date.now() }]);
    setSheet(null);
    setNewRecipe({name:'',protein:'🍗',meal:'dejeuner',time:'',ing:''});
    showToast('Plat ajouté ✓');
  };

  const filteredForSlot = recipes.filter(r => r.protein === PROTEIN_EMOJI[`${selectedDay}-${addMeal}`]);

  return (
    <div style={{maxWidth:400, margin:'0 auto', background:P.bg, minHeight:'100vh', position:'relative', fontFamily:'sans-serif', paddingBottom:100}}>
      <Toast msg={toast} />

      {tab === 'planner' && (
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h1 style={{ fontSize: 24, color: P.text, margin: 0 }}>Mes menus</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { if(window.confirm("Vider?")) setPlanner({}); }} style={{ background: P.redBg, color: P.remove, border: 'none', padding: '8px 12px', borderRadius: 12, fontWeight: 600 }}>Vider</button>
              <button onClick={doRandom} style={{ background: P.accentBg, color: P.accentText, border: 'none', padding: '8px 12px', borderRadius: 12, fontWeight: 600 }}>Aléatoire</button>
            </div>
          </div>

          <div style={{display:'flex', gap:8, overflowX:'auto', marginBottom:20}}>
            {DAYS.map((d, i) => (
              <div key={i} onClick={()=>setSelectedDay(i)} style={{textAlign:'center', cursor:'pointer', minWidth:45}}>
                <div style={{width:40, height:40, borderRadius:20, display:'flex', alignItems:'center', justifyContent:'center', background:selectedDay===i?P.accent:P.surface
