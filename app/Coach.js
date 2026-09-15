"use client";
import{useMemo,useState}from"react";

const txt={
en:{
title:"AI Coach",sub:"Quick guidance based on today's food and targets.",temporary:"Coach questions and answers are temporary and are not saved.",
next:"What should I eat next?",nextSub:"Get a practical suggestion for your next meal.",
dinner:"How much can I eat for dinner?",dinnerSub:"Choose ingredients and get suggested portions.",
can:"Can I eat this today?",canSub:"Check whether a saved food still fits today.",
avoid:"What should I avoid today?",avoidSub:"See what to limit based on today's intake.",
missing:"What am I missing today?",missingSub:"See your remaining calories and macros instantly.",
build:"Build my next meal",buildSub:"Choose ingredients and a goal, then let Coach build it.",
share:"Share Today's Data",shareSub:"Copy today's nutrition data for ChatGPT, Gemini or another AI.",
compact:"Copy Compact JSON",compactSub:"Targets, totals and remaining macros.",full:"Copy Full JSON",fullSub:"Includes every logged food item and portion.",
back:"Back",ask:"Ask AI Coach",check:"Check with AI",buildBtn:"Build My Meal",thinking:"Thinking…",loading1:"Analyzing today's intake…",loading2:"Checking remaining calories and macros…",loading3:"Preparing a practical answer…",
ingredients:"Choose ingredients",chooseOne:"Choose one saved food",goal:"Goal",meal:"Meal",highProtein:"High Protein",lowerCalorie:"Lower Calorie",balanced:"Balanced",dinnerMeal:"Dinner",snackMeal:"Snack",
noPresets:"No Saved Foods yet. Add foods in Settings → Saved Foods first.",chooseIngredient:"Choose at least one ingredient.",chooseFood:"Choose one saved food.",
result:"Coach suggestion",recommended:"Recommended",estimatedMeal:"Estimated meal",afterMeal:"After this meal",reason:"Why",done:"Done",askAgain:"Ask Again",retry:"Try Again",
unavailable:"AI Coach is temporarily unavailable.",unchanged:"Your food data has not been changed.",copied:"Copied",copyFailed:"Could not copy. Try again.",
remaining:"remaining",calories:"Calories",protein:"Protein",carbs:"Carbs",fat:"Fat",priority:"Priority",none:"None",todayStatus:"Today",kcalLeft:"kcal left",proteinLeft:"protein left",
fits:"Fits well",limit:"Limit it",avoidStatus:"Better avoid today",mealType:"Meal type"
},
zh:{
title:"AI Coach",sub:"根据今天的饮食和目标，快速给你实用建议。",temporary:"Coach 的问题与回答都是临时的，不会保存。",
next:"我下一餐该吃什么？",nextSub:"根据今天已吃的内容，给下一餐建议。",
dinner:"我晚餐可以吃多少？",dinnerSub:"选择你有的食材，建议每样吃多少。",
can:"我今天还能吃这个吗？",canSub:"检查已保存食物今天是否还适合吃。",
avoid:"我今天应该少吃什么？",avoidSub:"根据今天摄取，看看哪些东西应该控制。",
missing:"我今天还缺什么？",missingSub:"立即查看剩余热量和宏量营养。",
build:"帮我配下一餐",buildSub:"选择食材和目标，让 Coach 帮你组合。",
share:"分享今日数据",shareSub:"复制今日营养数据到 ChatGPT、Gemini 或其他 AI。",
compact:"复制精简 JSON",compactSub:"目标、已摄取和剩余营养。",full:"复制完整 JSON",fullSub:"包含每一项食物和份量。",
back:"返回",ask:"询问 AI Coach",check:"让 AI 检查",buildBtn:"帮我配餐",thinking:"正在分析…",loading1:"正在分析今天的摄取…",loading2:"正在检查剩余热量和宏量营养…",loading3:"正在整理实用建议…",
ingredients:"选择食材",chooseOne:"选择一个已保存食物",goal:"目标",meal:"餐别",highProtein:"高蛋白",lowerCalorie:"较低热量",balanced:"均衡",dinnerMeal:"晚餐",snackMeal:"加餐",
noPresets:"还没有 Saved Foods，请先到 Settings → Saved Foods 添加。",chooseIngredient:"请至少选择一种食材。",chooseFood:"请选择一个已保存食物。",
result:"Coach 建议",recommended:"建议",estimatedMeal:"预计这一餐",afterMeal:"吃完后今日预计",reason:"原因",done:"完成",askAgain:"再问一次",retry:"重试",
unavailable:"AI Coach 暂时无法使用。",unchanged:"你的饮食记录没有被更改。",copied:"已复制",copyFailed:"复制失败，请再试一次。",
remaining:"剩余",calories:"热量",protein:"蛋白质",carbs:"碳水",fat:"脂肪",priority:"优先补充",none:"无",todayStatus:"今天",kcalLeft:"kcal 剩余",proteinLeft:"g 蛋白质剩余",
fits:"适合",limit:"控制份量",avoidStatus:"今天不太建议",mealType:"餐别"
}};

const round=n=>Math.round((Number(n)||0)*100)/100;
function buildContext(items,date,target,weights){
  const xs=(items||[]).filter(x=>x.date===date);
  const totals=xs.reduce((a,x)=>({calories:a.calories+(+x.kcal||0),protein:a.protein+(+x.p||0),carbs:a.carbs+(+x.c||0),fat:a.fat+(+x.f||0)}),{calories:0,protein:0,carbs:0,fat:0});
  Object.keys(totals).forEach(k=>totals[k]=round(totals[k]));
  const targets={calories:+target.kcal||0,protein:+target.protein||0,carbs:+target.carbs||0,fat:+target.fat||0};
  const remaining={calories:round(Math.max(0,targets.calories-totals.calories)),protein:round(Math.max(0,targets.protein-totals.protein)),carbs:round(Math.max(0,targets.carbs-totals.carbs)),fat:round(Math.max(0,targets.fat-totals.fat))};
  const meals={};["Breakfast","Lunch","Dinner","Snack"].forEach(m=>{meals[m]=xs.filter(x=>x.meal===m).map(x=>({name:x.name,amount:x.amount,calories:round(x.kcal),protein:round(x.p),carbs:round(x.c),fat:round(x.f)}))});
  const ws=[...(weights||[])].sort((a,b)=>a.date.localeCompare(b.date)),weight=ws.filter(x=>x.date<=date).at(-1)?.value||null;
  return{date,targets,totals,remaining,meals,weight};
}
function nutrientPriority(c){const pairs=[["Protein",c.targets.protein?c.remaining.protein/c.targets.protein:0],["Carbs",c.targets.carbs?c.remaining.carbs/c.targets.carbs:0],["Fat",c.targets.fat?c.remaining.fat/c.targets.fat:0]];return pairs.sort((a,b)=>b[1]-a[1])[0]?.[0]||"None"}
function Modal({children,onClose}){return <div className="coach-modal-backdrop" onClick={onClose}><div className="coach-modal" onClick={e=>e.stopPropagation()}><div className="coach-modal-handle"/>{children}</div></div>}
function Spinner({label}){return <div className="coach-loading"><div className="coach-spinner"/><b>{label}</b><span>•••</span></div>}
function Stats({c,l}){return <div className="coach-mini-status"><div><span>{l.calories}</span><b>{Math.round(c.remaining.calories)}</b></div><div><span>{l.protein}</span><b>{round(c.remaining.protein)}g</b></div><div><span>{l.carbs}</span><b>{round(c.remaining.carbs)}g</b></div><div><span>{l.fat}</span><b>{round(c.remaining.fat)}g</b></div></div>}
export default function Coach({items,presets,weights,target,selectedDate,language="en",aiLanguage="en"}){
  const l=txt[language]||txt.en,c=useMemo(()=>buildContext(items,selectedDate,target,weights),[items,selectedDate,target,weights]);
  const[view,setView]=useState("home"),[selected,setSelected]=useState([]),[single,setSingle]=useState(null),[goal,setGoal]=useState("balanced"),[meal,setMeal]=useState("Dinner"),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState(""),[modal,setModal]=useState(null),[copied,setCopied]=useState("");
  const reset=()=>{setView("home");setSelected([]);setSingle(null);setGoal("balanced");setMeal("Dinner");setBusy(false);setResult(null);setError("");setModal(null)};
  const ingredients=selected.map(id=>(presets||[]).find(x=>x.id===id)).filter(Boolean).map(x=>({name:x.name,basisAmount:+x.basisAmount||1,unit:x.unit,kcal:+x.kcal||0,protein:+x.p||0,carbs:+x.c||0,fat:+x.f||0}));
  async function ask(question,extra={}){
    if(busy)return;setBusy(true);setError("");setResult(null);setModal("result");
    try{
      const r=await fetch("/api/coach",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question,context:c,ingredients:extra.ingredients??ingredients,goal:extra.goal??goal,meal:extra.meal??meal,language:aiLanguage,presetNames:(presets||[]).map(x=>x.name).slice(0,30)})});
      const j=await r.json();if(!r.ok)throw new Error(j.error||l.unavailable);setResult(j);
    }catch(e){setError(e.message||l.unavailable)}finally{setBusy(false)}
  }
  function selectQ(q){
    setError("");setResult(null);setSelected([]);setSingle(null);setGoal("balanced");setMeal("Dinner");
    if(q==="missing"){setModal("missing");return}
    if(q==="next"||q==="avoid"){ask(q);return}
    setView(q);
  }
  function toggle(id){setSelected(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id])}
  async function copy(kind){
    const compact={date:c.date,targets:c.targets,totals:c.totals,remaining:c.remaining,weight:c.weight};
    const full={...compact,meals:c.meals};
    try{await navigator.clipboard.writeText(JSON.stringify(kind==="full"?full:compact,null,2));setCopied(kind);setTimeout(()=>{setCopied("");setModal(null)},900)}catch{setError(l.copyFailed)}
  }
  const qs=[
    ["next","🍽️",l.next,l.nextSub],["dinner","⚖️",l.dinner,l.dinnerSub],["can","✅",l.can,l.canSub],
    ["avoid","🚫",l.avoid,l.avoidSub],["missing","🎯",l.missing,l.missingSub],["build","✨",l.build,l.buildSub]
  ];
  if(view==="home")return <section className="coach-wrap"><div className="coach-head"><div><div className="title">{l.title}</div><div className="muted">{l.sub}</div></div></div><div className="coach-status-line"><b>{Math.round(c.remaining.calories)} {l.kcalLeft}</b><span>·</span><b>{round(c.remaining.protein)}{l.proteinLeft}</b></div><div className="coach-question-list">{qs.map(([id,icon,title,sub])=><button className="coach-question" key={id} onClick={()=>selectQ(id)}><span className="coach-q-icon">{icon}</span><span className="coach-q-copy"><b>{title}</b><small>{sub}</small></span><span className="coach-chevron">›</span></button>)}</div><button className="coach-share-row" onClick={()=>{setError("");setModal("share")}}><span><b>{l.share}</b><small>{l.shareSub}</small></span><span>›</span></button><div className="coach-privacy">{l.temporary}</div>{modal==="missing"&&<Modal onClose={()=>setModal(null)}><div className="sheet-title">{l.missing}</div><Stats c={c} l={l}/><div className="coach-priority"><span>{l.priority}</span><b>{nutrientPriority(c)}</b></div><button className="btn full form-submit" onClick={()=>setModal(null)}>{l.done}</button></Modal>}{modal==="share"&&<Modal onClose={()=>setModal(null)}><div className="sheet-title">{l.share}</div><div className="muted">{l.shareSub}</div><button className="coach-copy-option" onClick={()=>copy("compact")}><span><b>{copied==="compact"?"✓ "+l.copied:l.compact}</b><small>{l.compactSub}</small></span></button><button className="coach-copy-option" onClick={()=>copy("full")}><span><b>{copied==="full"?"✓ "+l.copied:l.full}</b><small>{l.fullSub}</small></span></button>{error&&<div className="coach-error">{error}</div>}</Modal>}{modal==="result"&&<Modal onClose={()=>!busy&&setModal(null)}>{busy?<Spinner label={l.thinking}/>:error?<><div className="sheet-title">{l.unavailable}</div><div className="muted">{l.unchanged}</div><div className="coach-error">{error}</div><button className="btn full form-submit" onClick={()=>setModal(null)}>{l.done}</button></>:<Result data={result} l={l}/>}</Modal>}</section>;

  const title=view==="dinner"?l.dinner:view==="can"?l.can:l.build;
  const sub=view==="dinner"?l.dinnerSub:view==="can"?l.canSub:l.buildSub;
  const selectedPresets=(presets||[]);
  return <section className="coach-wrap"><button className="coach-back" onClick={reset}>← {l.back}</button><div className="title">{title}</div><div className="muted">{sub}</div>{view==="build"&&<><div className="coach-section-label">{l.mealType}</div><div className="coach-segment"><button className={meal==="Dinner"?"active":""} onClick={()=>setMeal("Dinner")}>{l.dinnerMeal}</button><button className={meal==="Snack"?"active":""} onClick={()=>setMeal("Snack")}>{l.snackMeal}</button></div><div className="coach-section-label">{l.goal}</div><div className="coach-chip-row">{[["high_protein",l.highProtein],["lower_calorie",l.lowerCalorie],["balanced",l.balanced]].map(([v,n])=><button key={v} className={"coach-chip "+(goal===v?"active":"")} onClick={()=>setGoal(v)}>{n}</button>)}</div></>}<div className="coach-section-label">{view==="can"?l.chooseOne:l.ingredients}</div>{!selectedPresets.length?<div className="coach-empty">{l.noPresets}</div>:<div className="coach-ingredient-list">{selectedPresets.map(x=>{const on=view==="can"?single===x.id:selected.includes(x.id);return <button className={"coach-ingredient "+(on?"selected":"")} key={x.id} onClick={()=>view==="can"?setSingle(x.id):toggle(x.id)}><span className="coach-select-dot">{on?"✓":""}</span><span><b>{x.name}</b><small>{x.basisAmount}{x.unit} · {Math.round(x.kcal)} kcal · P {round(x.p)} · C {round(x.c)} · F {round(x.f)}</small></span></button>})}</div>} {error&&<div className="coach-error">{error}</div>}<div className="coach-sticky-action"><button className="btn full primary-large" disabled={busy||!selectedPresets.length} onClick={()=>{if(view==="can"){const x=selectedPresets.find(p=>p.id===single);if(!x)return setError(l.chooseFood);ask("can",{ingredients:[{name:x.name,basisAmount:+x.basisAmount||1,unit:x.unit,kcal:+x.kcal||0,protein:+x.p||0,carbs:+x.c||0,fat:+x.f||0}]})}else{if(!selected.length)return setError(l.chooseIngredient);ask(view)}}}>{busy?l.thinking:view==="can"?l.check:view==="build"?l.buildBtn:l.ask}</button></div>{modal==="result"&&<Modal onClose={()=>!busy&&setModal(null)}>{busy?<Spinner label={l.thinking}/>:error?<><div className="sheet-title">{l.unavailable}</div><div className="muted">{l.unchanged}</div><div className="coach-error">{error}</div><button className="btn full form-submit" onClick={()=>setModal(null)}>{l.done}</button></>:<Result data={result} l={l}/>}</Modal>}</section>
}
function Result({data,l}){if(!data)return null;const status=data.status==="fits"?l.fits:data.status==="limit"?l.limit:data.status==="avoid"?l.avoidStatus:null;return <><div className="sheet-title">{data.title||status||l.result}</div>{data.summary&&<div className="coach-result-summary">{data.summary}</div>}{Array.isArray(data.items)&&data.items.length>0&&<div className="coach-result-list">{data.items.map((x,i)=><div className="coach-result-item" key={i}><div><b>{x.name}</b>{x.reason&&<small>{x.reason}</small>}</div><div className="coach-result-amount">{x.amount!=null?round(x.amount)+" "+(x.unit||""):""}{x.calories!=null&&<small>{Math.round(x.calories)} kcal</small>}</div></div>)}</div>}{data.estimatedMeal&&<div className="coach-result-metrics"><span>{l.estimatedMeal}</span><b>{Math.round(data.estimatedMeal.calories||0)} kcal</b><small>P {round(data.estimatedMeal.protein)} · C {round(data.estimatedMeal.carbs)} · F {round(data.estimatedMeal.fat)}</small></div>}{data.estimatedDayTotal&&<div className="coach-result-metrics"><span>{l.afterMeal}</span><b>{Math.round(data.estimatedDayTotal.calories||0)} kcal</b><small>P {round(data.estimatedDayTotal.protein)} · C {round(data.estimatedDayTotal.carbs)} · F {round(data.estimatedDayTotal.fat)}</small></div>}{Array.isArray(data.notes)&&data.notes.length>0&&<div className="coach-notes">{data.notes.map((n,i)=><div key={i}>• {n}</div>)}</div>}<button className="btn full form-submit" onClick={()=>location.reload()} style={{display:"none"}}>{l.done}</button><button className="btn full form-submit" onClick={e=>e.currentTarget.closest(".coach-modal-backdrop")?.click()}>{l.done}</button></>}
