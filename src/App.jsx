import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════
const BASE_USERS = [
  {id:"u2", name:"Frantisek Kabilka",        role:"management", pin:"38516", nfc:"NFC-MGT-002"},
  {id:"u3", name:"Camila Dalcin",            role:"management", pin:"92047", nfc:"NFC-MGT-003"},
  {id:"u4", name:"Munish Soni",              role:"reception",  pin:"61385", nfc:"NFC-REC-001"},
  {id:"u5", name:"Ramneek Kaur",             role:"reception",  pin:"29734", nfc:"NFC-REC-002"},
  {id:"u6", name:"Sajin Abraham",            role:"reception",  pin:"85162", nfc:"NFC-REC-003"},
  {id:"u7", name:"Simbarashe Manyati",       role:"porter",     pin:"43809", nfc:"NFC-PRT-001"},
  {id:"u8", name:"Cristiano Melo",           role:"porter",     pin:"17653", nfc:"NFC-PRT-002"},
  {id:"u9", name:"Joanna Rejak",             role:"cleaner",    pin:"56420", nfc:"NFC-CLN-001"},
  {id:"u10",name:"Hilario Ximenes",          role:"cleaner",    pin:"30978", nfc:"NFC-CLN-002"},
  {id:"u11",name:"Antonio Felisbino",        role:"cleaner",    pin:"84215", nfc:"NFC-CLN-003"},
  {id:"u12",name:"Danielli Sanches Magrini", role:"cleaner",    pin:"67043", nfc:"NFC-CLN-004"},
  {id:"u13",name:"Leandro Morilla",          role:"cleaner",    pin:"19862", nfc:"NFC-CLN-005"},
  {id:"u14",name:"Khrystyna Kolodii",        role:"cleaner",    pin:"52307", nfc:"NFC-CLN-006"},
  {id:"u15",name:"Amandeep Singh",           role:"cleaner",    pin:"73614", nfc:"NFC-CLN-007"},
];
const FRANTISEK_ID = "u2";

const CLEANER_LOCATIONS = [
  "Workshop","Flowers","Soho Home","Gym","Sauna & Steam Room",
  "Boathouse","Pen Yen","Hay Barn","Barwell","Canteen",
  "Main Barn","Mill + Toilets","Glasshouse","Cinema",
  "Canteen Office","Check-out House","Gate House",
  "Club Reception + Office","Berenjak","Blake's",
];

// Role-based location menus with pre-filled task templates
const ROLE_LOCATIONS = {
  cleaner: CLEANER_LOCATIONS.map(l=>({name:l, tasks:[]})),
  porter: [
    {name:"Barwell",             tasks:["Guest Transport"]},
    {name:"Glasshouse",          tasks:["Guest Transport"]},
    {name:"Check-in House",      tasks:["Restock Firewood","Restock Water Bottles","Clean Fireplace","Park Guest Cars","Sweep Entrance","Salt the Pathway"]},
    {name:"Check-out House",     tasks:["Restock Firewood","Restock Water Bottles","Clean Fireplace","Sweep Entrance","Salt the Pathway"]},
    {name:"Club Reception",      tasks:["Guest Transport","Restock Water Bottles","Sweep Entrance","Salt the Reception Area"]},
    {name:"Car Park",            tasks:["Litter Pick","Sweep Gravel Back into Bays"]},
    {name:"Bikes — Cabins",          tasks:["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"]},
    {name:"Bikes — Huts",            tasks:["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"]},
    {name:"Bikes — Piglets",         tasks:["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"]},
    {name:"Bikes — Gym & Boathouse", tasks:["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"]},
    {name:"Bikes — Spa Area",        tasks:["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"]},
    {name:"Bikes — Club Reception",  tasks:["Collect Bike Truck", "Complete Truck Safety Checks", "Collect Bikes from Around Site", "Quick Visual Safety Check of Bikes", "Replenish Bikes at Location", "Clean & Sanitise Bike Truck", "Return Truck to Warehouse & Connect to Charging", "Log Any Repairs on Bulb Things & Place by Bike Shed"]},
    {name:"Stables",             tasks:["Sweep","Empty Bins","Full Clean"]},
    {name:"Newspapers",          tasks:["Deliver to Room Service Station"]},
    {name:"Floats",              tasks:["Clean & Store Floats","Restock Water Bottles","Restock Umbrellas","Connect to Charging"]},
    {name:"General — Other",   tasks:["Sweep Under Bike Racks","Restock Umbrellas","Restock Maps","Restock Napkins for Main Barn"]},
  ],
  reception: [
    {name:"Club Reception", tasks:["DM Brief Done","A5s Done","Daily Opera Reports Saved","Gym Classes & Events added on GH Daily Brief","Batch Deposit Done","Night Audit","Restock Maps","Restock Umbrellas"], autoAssign:true},
    {name:"Gate House",     tasks:["Review Tags for next day","Tags for day after tomorrow","KC picture","Restock Maps","Restock Umbrellas","A5's rules"], autoAssign:true},
    {name:"General",        tasks:[]},
  ],
};

const ALL_LOCATIONS = [...new Set([
  ...CLEANER_LOCATIONS,
  ...ROLE_LOCATIONS.porter.map(l=>l.name),
  ...ROLE_LOCATIONS.reception.map(l=>l.name),
])];

const ALL_TEMPLATES = {
  "Float Check":["Is the Float charged?","Is the float clean?","Brakes & Handbrake","Mirrors","Tires","Lights","Step Function","Check For Damage","Photo uploaded"],
  "Gatehouse Duties":["Refill Log Baskets","Clean Fireplace (GH + CO)","Check Stables","Refill Water Stations","Are there Cars to be parked?","Are there any scheduled pickups?","Clear excessive bikes"],
  "Club Reception / Main Area":["Sweeping stones","Clear area of obstacles","Clear litter / Glasses","Check bike Racks","Sweep Club entry way","Refill Water Stations"],
  "Car Park Duties":["Litter Pick","Check bins not overflowing","Clearing Bikes to Club racks","Sweep stones back into bays","Check Car Wash area","Sweep Murray's Path"],
  "Bikes":["Collect Bike truck","Complete truck safety Checks","Collect bikes from around site","Quick visual bike safety check","Replenish cabin, Huts, Piglets, GR","Clean & Sanitise bike truck","Place on charge at Warehouse","Log repairs on Bulb Things"],
  "End of Shift":["Take Newspapers to Room Service","Floats back on charge","Ensure floats clean","New Damage Checks","Hand Over to Early Shift","Photo uploaded"],
  "Daily Clean":["Vacuum all areas","Mop hard floors","Empty bins","Clean & sanitise toilets","Restock soap & paper towels","Wipe down all surfaces","Polish mirrors & glass"],
  "Deep Clean":["Move furniture and clean underneath","Clean light fixtures","Wash windows interior","Scrub grout and tile","Clean vents and filters","Polish all fixtures","Sanitise high-touch surfaces"],
  "Club Reception — Daily Checklist":["DM Brief Done","A5s Done","Daily Opera Reports Saved","Gym Classes & Events added on GH Daily Brief","Batch Deposit Done","Night Audit","Restock Maps","Restock Umbrellas"],
  "Gate House — Daily Checklist":["Review Tags for next day","Tags for day after tomorrow","KC picture","Restock Maps","Restock Umbrellas","A5's rules"],
  "Stables":["Sweep","Empty Bins","Full Clean"],
  "Floats":["Clean & Store Floats","Restock Water Bottles","Restock Umbrellas","Connect to Charging"],
  "Newspapers":["Deliver to Room Service Station"],
  "Porter — General Duties":["Sweep Under Bike Racks","Restock Umbrellas","Restock Maps","Restock Napkins for Main Barn"],
};

// ═══════════════════════════════════════════════════════════
// PREDEFINED ROUNDS
// ═══════════════════════════════════════════════════════════
const DEFAULT_ROUNDS = [
  // ── CLEANERS ──────────────────────────────────────────
  {
    id:"C-R1-P1", dept:"cleaner", name:"Round 1 — Cleaner 1", position:"Cleaner 1",
    areas:["Boathouse","Sauna & Steam Room","Gym","Pen Yen","Check-out House","Gate House","Hay Barn","Glasshouse"],
    focus:"Vacuuming & Mopping — all floor surfaces",
    tasks:["Vacuum all floor surfaces","Mop all hard floors","Move chairs/furniture and vacuum underneath","Check vacuum bags and replace if needed"],
    colour:"#4ade80",
  },
  {
    id:"C-R1-P2", dept:"cleaner", name:"Round 1 — Cleaner 2", position:"Cleaner 2",
    areas:["Boathouse","Sauna & Steam Room","Gym","Pen Yen","Check-out House","Gate House","Hay Barn","Glasshouse"],
    focus:"Toilets · Thresholds · Surfaces · Dusting · Windows · Mirrors",
    tasks:["Clean & sanitise all toilets","Clean thresholds and doorframes","Wipe down all surfaces","Dust shelves, ledges and fixtures","Clean windows and glass panels","Polish all mirrors","Restock soap and paper towels","Empty bins"],
    colour:"#4ade80",
  },
  {
    id:"C-R2-P1", dept:"cleaner", name:"Round 2 — Cleaner 1", position:"Cleaner 1",
    areas:["Canteen","Canteen Office","Club Reception + Office","Berenjak","Main Barn","Mill + Toilets","Barwell","Cinema"],
    focus:"Vacuuming & Mopping — all floor surfaces",
    tasks:["Vacuum all floor surfaces","Mop all hard floors","Move chairs/furniture and vacuum underneath","Check vacuum bags and replace if needed"],
    colour:"#4ade80",
  },
  {
    id:"C-R2-P2", dept:"cleaner", name:"Round 2 — Cleaner 2", position:"Cleaner 2",
    areas:["Canteen","Canteen Office","Club Reception + Office","Berenjak","Main Barn","Mill + Toilets","Barwell","Cinema"],
    focus:"Toilets · Thresholds · Surfaces · Dusting · Windows · Mirrors",
    tasks:["Clean & sanitise all toilets","Clean thresholds and doorframes","Wipe down all surfaces","Dust shelves, ledges and fixtures","Clean windows and glass panels","Polish all mirrors","Restock soap and paper towels","Empty bins"],
    colour:"#4ade80",
  },
  // ── PORTERS ──────────────────────────────────────────
  {
    id:"P-R1-P1", dept:"porter", name:"Round 1 — Porter 1", position:"Porter 1",
    areas:["Gate House","Check-out House","Bikes — Cabins","Bikes — Huts","Bikes — Piglets","Bikes — Gym & Boathouse","Bikes — Spa Area","Bikes — Club Reception"],
    focus:"Gate House duties · Check-out House duties · Full Bike round",
    tasks:["Gate House — complete daily checklist","Check-out House — complete daily checklist","Collect Bike Truck","Complete Truck Safety Checks","Collect Bikes from Around Site","Quick Visual Safety Check of Bikes","Replenish Bikes at all Locations","Clean & Sanitise Bike Truck","Return Truck to Warehouse & Connect to Charging","Log Any Repairs on Bulb Things & Place by Bike Shed"],
    colour:"#fb923c",
  },
  {
    id:"P-R1-P2", dept:"porter", name:"Round 1 — Porter 2", position:"Porter 2",
    areas:["Club Reception","Car Park","Stables","Barwell","Glasshouse"],
    focus:"Club Reception area · Guest Transport & Parking · Car Park · Stables",
    tasks:["Club Reception — Guest Transport","Club Reception — Restock Water Bottles","Club Reception — Sweep Entrance","Club Reception — Salt the Reception Area","Guest Transport — Barwell","Guest Transport — Glasshouse","Car Park — Litter Pick","Car Park — Sweep Gravel Back into Bays","Stables — Sweep","Stables — Empty Bins","Stables — Full Clean"],
    colour:"#fb923c",
  },
];

const SK_ROUNDS = "sh5_rounds";



// ═══════════════════════════════════════════════════════════
// SUPABASE — hardcoded, no changes needed
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL = "https://kqfhbccydaltebpnfqzv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmhiY2N5ZGFsdGVicG5mcXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzAyOTIsImV4cCI6MjA5MzUwNjI5Mn0.uY4dwnTFqs1F43SMc9JChEta5PfQu4202LZ5owQ6Prc";

const _h = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

const stor = {
  get: async (k) => {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/sfh_data?key=eq.${encodeURIComponent(k)}&select=value`, {headers:_h});
      const d = await r.json();
      if (!Array.isArray(d) || !d.length) return null;
      return d[0].value;
    } catch { return null; }
  },
  set: async (k, v) => {
    if (v === null || v === undefined) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/sfh_data`, {
        method:"POST",
        headers:{..._h,"Prefer":"resolution=merge-duplicates"},
        body:JSON.stringify({key:k, value:v}),
      });
    } catch {}
  },
  del: async (k) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/sfh_data?key=eq.${encodeURIComponent(k)}`, {method:"DELETE",headers:_h});
    } catch {}
  },
};

// ═══════════════════════════════════════════════════════════
// STORAGE KEYS
// ═══════════════════════════════════════════════════════════
const SK = {
  tasks:"sh5_tasks", repairs:"sh5_repairs", orders:"sh5_orders",
  inspections:"sh5_inspections", profiles:"sh5_profiles",
  checkouts:"sh5_checkouts", locPrefix:"sh5_loc:",
  adminSess:"sh5_admin_session", pins:"sh5_pins",
  rounds:"sh5_rounds", weekly:"sh5_weekly_plans",
};

// ─── Push notification helper ────────────────────────────────────────────────
const EDGE_URL = "https://kqfhbccydaltebpnfqzv.supabase.co/functions/v1/sfh-push";

const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmhiY2N5ZGFsdGVicG5mcXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzAyOTIsImV4cCI6MjA5MzUwNjI5Mn0.uY4dwnTFqs1F43SMc9JChEta5PfQu4202LZ5owQ6Prc';

const sendPush = async (userIds, notification) => {
  try {
    const subs = (await Promise.all(
      userIds.map(id => stor.get('sh5_push_' + id))
    )).filter(Boolean);
    if (!subs.length) { console.log('No push subs for', userIds); return {sent:0,info:'no subscriptions'}; }
    console.log('Sending push to', userIds, 'subs:', subs.length, 'notification:', JSON.stringify(notification));
    const res = await fetch(EDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ subscriptions: subs, notification }),
    });
    const text = await res.text();
    console.log('Push HTTP status:', res.status, 'body:', text.slice(0,300));
    let data;
    try { data = JSON.parse(text); } catch { data = {raw: text.slice(0,200), status: res.status}; }
    return data;
  } catch(e) { console.log('Push failed:', e.name, e.message); return {error:String(e)}; }
};



const uid=()=>"_"+Date.now()+Math.random().toString(36).slice(2,5);

// PIN hashing via Web Crypto API (SHA-256)
const hashPin=async(pin)=>{
  const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode("sfh_salt_"+pin));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
};
const tod=()=>new Date().toISOString().slice(0,10);
const df=d=>d?new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—";
const dfShort=d=>d?new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short"}):"—";

const RC={management:"#d4a843",reception:"#38bdf8",porter:"#fb923c",cleaner:"#4ade80"};
const PC={urgent:"#ef4444",high:"#f97316",medium:"#eab308",low:"#6b7280"};
const SC={pending:"#6b7280",in_progress:"#3b82f6",done:"#22c55e"};
const RL={management:"Management",reception:"Reception",porter:"Porter",cleaner:"Cleaner"};
const ROLES=["management","reception","porter","cleaner"];

// ═══════════════════════════════════════════════════════════
// UI HELPERS
// ═══════════════════════════════════════════════════════════
const Av=({name,size=32,color="#d4a843"})=>
  <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,background:`${color}22`,border:`2px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.3,fontWeight:900,color,fontFamily:"Georgia,serif"}}>{name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>;

const Badge=({label,color,sm})=>
  <span style={{display:"inline-block",padding:sm?"2px 7px":"3px 11px",borderRadius:20,fontSize:sm?10:11,fontWeight:700,letterSpacing:.5,background:`${color}20`,color,border:`1px solid ${color}40`,textTransform:"uppercase",whiteSpace:"nowrap"}}>{label}</span>;

const I={background:"#0d0d1e",border:"1px solid #252540",borderRadius:10,padding:"10px 13px",color:"#fff",fontSize:13,fontFamily:"'DM Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"};
const L={fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:1.2,marginBottom:6,display:"block",fontWeight:700};

function Modal({title,onClose,children,wide=false}){
  return(
    <div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"#111128",border:"1px solid #252540",borderRadius:20,width:"100%",maxWidth:wide?820:620,maxHeight:"92vh",overflow:"auto",padding:"28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>{title}</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#666",cursor:"pointer",fontSize:22}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════════════════════════
function AdminLogin({onLogin,allUsers,pins}){
  const [selected,setSelected]=useState(null);
  const [pin,setPin]=useState("");
  const [error,setError]=useState("");
  const mgmt=allUsers.filter(u=>u.role==="management");
  const accent="#d4a843";

  const getPin=(u)=>pins[u.id]||u.pin;

  const pick=u=>{setSelected(u);setPin("");setError("");};
  const handleKey=k=>{
    if(k==="del"){setPin(p=>p.slice(0,-1));setError("");return;}
    if(pin.length>=5)return;
    const next=pin+k;setPin(next);
    if(next.length===5){
      setTimeout(()=>{
        if(next===getPin(selected))onLogin(selected);
        else{setError("Incorrect PIN. Try again.");setPin("");}
      },120);
    }
  };

  // Keyboard support — digits + Backspace
  useEffect(()=>{
    if(!selected)return;
    const onKey=e=>{
      if(e.key==="Backspace"){handleKey("del");return;}
      if(/^[0-9]$/.test(e.key)){handleKey(e.key);}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[selected,pin]);

  if(selected)return(
    <div style={{minHeight:"100vh",background:"#070714",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif"}}>
      <button onClick={()=>{setSelected(null);setPin("");setError("");}} style={{position:"absolute",top:24,left:24,background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
      <div style={{width:72,height:72,borderRadius:"50%",background:`${accent}25`,border:`3px solid ${accent}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:900,color:accent,fontFamily:"Georgia,serif",marginBottom:16}}>
        {selected.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
      </div>
      <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>{selected.name}</div>
      <div style={{marginTop:6,fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:2}}>Management</div>
      <div style={{display:"flex",gap:14,marginTop:32}}>
        {[0,1,2,3,4].map(i=><div key={i} style={{width:14,height:14,borderRadius:"50%",background:pin.length>i?accent:"transparent",border:`2px solid ${pin.length>i?accent:"#333"}`,transition:"all .15s"}}/>)}
      </div>
      <div style={{fontSize:11,color:"#555",marginTop:10}}>Enter 5-digit PIN — use numpad or keyboard</div>
      {error&&<div style={{color:"#ef4444",fontSize:12,marginTop:6,fontWeight:600}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:24,width:240}}>
        {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
          <button key={i} onClick={()=>k&&handleKey(k)} style={{height:58,borderRadius:14,background:k==="del"?"transparent":k?`${accent}12`:"transparent",border:k==="del"?`1px solid #333`:k?`1px solid ${accent}30`:"none",color:k==="del"?"#888":k?accent:"transparent",fontSize:k==="del"?20:22,fontWeight:700,cursor:k?"pointer":"default",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {k==="del"?"⌫":k}
          </button>
        ))}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#070714",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <div style={{fontSize:10,letterSpacing:6,color:"#444",textTransform:"uppercase",marginBottom:10}}>Soho House</div>
        <div style={{fontSize:30,fontWeight:900,color:accent,fontFamily:"Georgia,serif"}}>Management Portal</div>
        <div style={{width:40,height:2,background:`${accent}44`,margin:"12px auto 0"}}/>
        <div style={{fontSize:12,color:"#444",marginTop:12}}>Access restricted to management only</div>
      </div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:10}}>
        {mgmt.map(u=>(
          <button key={u.id} onClick={()=>pick(u)} style={{display:"flex",alignItems:"center",gap:14,background:"#0d0d1e",border:`1px solid ${accent}22`,borderRadius:14,padding:"14px 18px",cursor:"pointer",textAlign:"left",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${accent}12`;e.currentTarget.style.borderColor=`${accent}66`;}}
            onMouseLeave={e=>{e.currentTarget.style.background="#0d0d1e";e.currentTarget.style.borderColor=`${accent}22`;}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:`${accent}25`,border:`2px solid ${accent}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:accent,fontFamily:"Georgia,serif",flexShrink:0}}>
              {u.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{color:"#fff",fontSize:15,fontWeight:700}}>{u.name}</div>
              <div style={{color:"#555",fontSize:11,marginTop:2}}>
                {u.id===FRANTISEK_ID?"Admin Manager":"Manager"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TASK MODAL — with Round selector replacing Recurring
// ═══════════════════════════════════════════════════════════
function TaskModal({task:existing,users,rounds=[],onSave,onSaveMultiple,onClose}){
  const blank={title:"",type:"general",priority:"medium",location:"",assigneeId:"",notes:"",checklist:[]};
  const [form,setForm]=useState(existing?{...existing}:blank);
  const [ci,setCi]=useState("");
  const [tmpl,setTmpl]=useState("");
  const [selectedRound,setSelectedRound]=useState("");
  const [roundMode,setRoundMode]=useState(false); // true = filled from round

  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  const assigneeRole=users.find(u=>u.id===form.assigneeId)?.role||"";

  const availableLocations=assigneeRole==="porter"
    ?ROLE_LOCATIONS.porter
    :assigneeRole==="reception"
    ?ROLE_LOCATIONS.reception
    :assigneeRole==="cleaner"
    ?ROLE_LOCATIONS.cleaner
    :CLEANER_LOCATIONS.map(l=>({name:l,tasks:[]}));

  const handleLocationChange=(locName)=>{
    if(roundMode)return; // round controls location
    set("location",locName);
    const locDef=availableLocations.find(l=>(l.name||l)===locName);
    if(locDef&&locDef.tasks&&locDef.tasks.length>0){
      setForm(f=>({...f,location:locName,checklist:locDef.tasks.map(t=>({label:t,done:false}))}));
    }
  };

  // Apply a predefined round — fills title, locations summary, checklist
  const applyRound=(roundId)=>{
    setSelectedRound(roundId);
    if(!roundId){setRoundMode(false);return;}
    const r=rounds.find(r=>r.id===roundId);
    if(!r)return;
    setRoundMode(true);
    setForm(f=>({
      ...f,
      title: r.name,
      type: r.dept==="porter"?"porter":"checklist",
      // location = first area (staff work through all areas in the round)
      location: r.areas[0]||f.location,
      notes: `Round: ${r.name}
Position: ${r.position}
Focus: ${r.focus}
All areas: ${r.areas.join(", ")}`,
      checklist: r.tasks.map(t=>({label:t,done:false})),
    }));
  };

  const clearRound=()=>{
    setSelectedRound("");setRoundMode(false);
    setForm(f=>({...f,title:"",notes:"",checklist:[],location:""}));
  };

  const applyTmpl=name=>{
    if(!name)return;
    setForm(f=>({...f,checklist:ALL_TEMPLATES[name].map(l=>({label:l,done:false}))}));
    setTmpl(name);
  };
  const addCI=()=>{if(!ci.trim())return;setForm(f=>({...f,checklist:[...f.checklist,{label:ci.trim(),done:false}]}));setCi("");};
  const removeCI=i=>setForm(f=>({...f,checklist:f.checklist.filter((_,idx)=>idx!==i)}));

  const save=()=>{
    if(!form.title||!form.assigneeId){alert("Fill: title and assignee");return;}
    if(!roundMode&&!form.location){alert("Select a location");return;}

    if(roundMode&&selectedRound&&!existing){
      // Round mode — create ONE task per area, each with full checklist
      const round=rounds.find(r=>r.id===selectedRound);
      if(round&&round.areas.length>0){
        const now=new Date().toISOString();
        const tasksToCreate=round.areas.map((area,idx)=>({
          id:uid(),
          title:`${round.name} — ${area}`,
          type:form.type,
          priority:form.priority,
          location:area,
          assigneeId:form.assigneeId,
          notes:`Round: ${round.name} | Position: ${round.position} | Focus: ${round.focus}`,
          checklist:round.tasks.map(t=>({label:t,done:false})),
          status:"pending",
          photos:[],
          createdAt:now,
          roundId:round.id,
          roundArea:idx+1,
          roundTotal:round.areas.length,
        }));
        // Save ALL tasks at once — not one by one (which caused overwrites)
        onSaveMultiple(tasksToCreate);
        onClose();
        return;
      }
    }

    // Single task (no round, or editing)
    onSave(existing?{...form}:{...form,id:uid(),status:"pending",photos:[],createdAt:new Date().toISOString(),roundId:selectedRound||null});
    onClose();
  };

  // Filter rounds by assignee role
  const relevantRounds=rounds.filter(r=>!form.assigneeId||r.dept===assigneeRole||assigneeRole==="management");

  return(
    <Modal title={existing?"Edit Task":"Create New Task"} onClose={onClose} wide={true}>
      <div style={{display:"grid",gap:14}}>

        {/* ── ROUND SELECTOR ── */}
        {!existing&&(
          <div style={{background:"#0a0a1a",border:"1px solid #d4a84333",borderRadius:12,padding:"14px 16px"}}>
            <label style={{...L,color:"#d4a843",marginBottom:8}}>🔄 Load from Predefined Round</label>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select style={{...I,flex:1}} value={selectedRound} onChange={e=>applyRound(e.target.value)}>
                <option value="">— Select a round (optional) —</option>
                {Object.entries(
                  relevantRounds.reduce((acc,r)=>{
                    if(!acc[r.dept])acc[r.dept]=[];
                    acc[r.dept].push(r);
                    return acc;
                  },{})
                ).map(([dept,deptRounds])=>(
                  <optgroup key={dept} label={RL[dept]?.toUpperCase()||dept.toUpperCase()}>
                    {deptRounds.map(r=><option key={r.id} value={r.id}>{r.name} — {r.position}</option>)}
                  </optgroup>
                ))}
              </select>
              {roundMode&&<button onClick={clearRound} style={{padding:"8px 12px",background:"transparent",border:"1px solid #ef444433",borderRadius:8,color:"#ef4444",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>✕ Clear</button>}
            </div>
            {roundMode&&selectedRound&&(()=>{
              const r=rounds.find(r=>r.id===selectedRound);
              return r?(
                <div style={{marginTop:10,padding:"10px 12px",background:"#d4a84312",border:"1px solid #d4a84333",borderRadius:8}}>
                  <div style={{fontSize:11,color:"#d4a843",fontWeight:700,marginBottom:4}}>✓ Round loaded: {r.name}</div>
                  <div style={{fontSize:10,color:"#888"}}>{r.areas.length} areas · {r.tasks.length} tasks · {r.focus}</div>
                  <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:4}}>
                    {r.areas.map((a,i)=><span key={i} style={{fontSize:9,background:"#d4a84322",color:"#d4a843",border:"1px solid #d4a84333",borderRadius:4,padding:"1px 6px"}}>{a}</span>)}
                  </div>
                </div>
              ):null;
            })()}
            {!roundMode&&<div style={{fontSize:10,color:"#555",marginTop:6}}>Or fill in manually below ↓</div>}
          </div>
        )}

        <div><label style={L}>Title *</label><input style={I} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Round 1 — Cleaner 1"/></div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label style={L}>Type</label><select style={I} value={form.type} onChange={e=>set("type",e.target.value)}>
            {["general","checklist","porter","repair","emergency","reception","inspection"].map(t=><option key={t} value={t}>{t.replace("_"," ")}</option>)}
          </select></div>
          <div><label style={L}>Priority</label><select style={I} value={form.priority} onChange={e=>set("priority",e.target.value)}>
            {["urgent","high","medium","low"].map(p=><option key={p}>{p}</option>)}
          </select></div>
        </div>

        {/* Assign To */}
        <div><label style={L}>Assign To * <span style={{color:"#d4a843",fontWeight:400}}>(select first — location list adapts to role)</span></label>
          <select style={I} value={form.assigneeId} onChange={e=>{set("assigneeId",e.target.value);if(!roundMode){set("location","");set("checklist",[]);}}}>
            <option value="">Select staff member…</option>
            {ROLES.map(role=><optgroup key={role} label={RL[role].toUpperCase()}>
              {users.filter(u=>u.role===role).map(u=><option key={u.id} value={u.id}>{u.name}</option>)}
            </optgroup>)}
          </select>
        </div>

        {/* Location — shows round areas if round mode, otherwise normal dropdown */}
        {roundMode?(
          <div>
            <label style={L}>Areas covered by this round</label>
            <div style={{background:"#0a0a1a",border:"1px solid #252540",borderRadius:10,padding:"10px 13px",display:"flex",flexWrap:"wrap",gap:6}}>
              {(rounds.find(r=>r.id===selectedRound)?.areas||[]).map((a,i)=>(
                <span key={i} style={{fontSize:11,background:"#d4a84322",color:"#d4a843",border:"1px solid #d4a84333",borderRadius:6,padding:"3px 10px"}}>{a}</span>
              ))}
            </div>
            <div style={{fontSize:10,color:"#555",marginTop:4}}>Staff will work through all areas listed above during this round</div>
          </div>
        ):(
          <div>
            <label style={L}>Location *
              {assigneeRole&&<span style={{color:RC[assigneeRole]||"#666",marginLeft:6,fontWeight:400,textTransform:"none"}}>({RL[assigneeRole]} locations)</span>}
            </label>
            <select style={I} value={form.location} onChange={e=>handleLocationChange(e.target.value)}>
              <option value="">Select location…</option>
              {availableLocations.map(l=>{
                const name=l.name||l;
                return <option key={name} value={name}>{name}{l.tasks&&l.tasks.length>0?" ✓":""}</option>;
              })}
            </select>
            {form.checklist.length>0&&form.location&&<div style={{fontSize:10,color:"#22c55e",marginTop:4}}>✓ {form.checklist.length} tasks auto-loaded</div>}
          </div>
        )}

        <div><label style={L}>Notes</label><textarea style={{...I,height:60,resize:"none"}} value={form.notes||""} onChange={e=>set("notes",e.target.value)} placeholder="Any additional instructions…"/></div>

        {/* Checklist */}
        <div>
          <label style={L}>Checklist Items {form.checklist.length>0&&<span style={{color:"#22c55e",fontWeight:400}}>({form.checklist.length} items{roundMode?" from round":""})</span>}</label>
          {!roundMode&&<select style={{...I,marginBottom:8}} value={tmpl} onChange={e=>applyTmpl(e.target.value)}>
            <option value="">Load template…</option>
            {Object.keys(ALL_TEMPLATES).map(t=><option key={t} value={t}>{t}</option>)}
          </select>}
          {form.checklist.map((c,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:5}}>
              <div style={{flex:1,background:"#0a0a1a",border:"1px solid #252540",borderRadius:8,padding:"7px 12px",color:"#ccc",fontSize:12}}>{c.label}</div>
              <button onClick={()=>removeCI(i)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,flexShrink:0}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <input style={{...I,flex:1}} value={ci} onChange={e=>setCi(e.target.value)} placeholder="Add checklist item…" onKeyDown={e=>e.key==="Enter"&&addCI()}/>
            <button onClick={addCI} style={{padding:"10px 16px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:10,color:"#d4a843",cursor:"pointer",fontWeight:700,fontSize:14}}>+</button>
          </div>
        </div>

        <button onClick={save} style={{padding:"14px",background:"#d4a843",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
          {existing?"Save Changes":"Create Task"}
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// CREATE PROFILE MODAL — Frantisek only
// ═══════════════════════════════════════════════════════════
function CreateProfileModal({onSave,onClose,existingProfiles}){
  const [form,setForm]=useState({name:"",role:"cleaner",pin:""});
  const [genPin,setGenPin]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const generatePin=()=>{const p=String(Math.floor(10000+Math.random()*90000));setGenPin(p);setForm(f=>({...f,pin:p}));};
  const save=()=>{
    if(!form.name.trim()||!form.pin||form.pin.length!==5){alert("Name required + 5-digit PIN");return;}
    const id="ux_"+Date.now();
    const nfc=`NFC-${form.role.slice(0,3).toUpperCase()}-${String(existingProfiles.length+100)}`;
    onSave({id,name:form.name.trim(),role:form.role,pin:form.pin,nfc,custom:true});
    onClose();
  };
  return(
    <Modal title="Create New Staff Profile" onClose={onClose}>
      <div style={{background:"#d4a84312",border:"1px solid #d4a84333",borderRadius:12,padding:"12px 16px",marginBottom:18,fontSize:12,color:"#d4a843"}}>
        <strong>Frantisek Kabilka exclusive</strong> — New profiles appear in the mobile app immediately.
      </div>
      <div style={{display:"grid",gap:14}}>
        <div><label style={L}>Full Name *</label><input style={I} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. James Smith"/></div>
        <div><label style={L}>Role</label><select style={I} value={form.role} onChange={e=>set("role",e.target.value)}>
          {["management","reception","porter","cleaner"].map(r=><option key={r} value={r}>{RL[r]}</option>)}
        </select></div>
        <div>
          <label style={L}>5-Digit PIN *</label>
          <div style={{display:"flex",gap:8}}>
            <input style={{...I,flex:1,fontFamily:"monospace",letterSpacing:4,fontSize:18}} value={form.pin} onChange={e=>set("pin",e.target.value.slice(0,5).replace(/\D/g,""))} placeholder="•••••" maxLength={5}/>
            <button onClick={generatePin} style={{padding:"10px 14px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:10,color:"#d4a843",cursor:"pointer",fontSize:12,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>Generate</button>
          </div>
          {genPin&&<div style={{marginTop:6,fontSize:11,color:"#555"}}>Generated PIN: <span style={{color:"#d4a843",fontFamily:"monospace",fontWeight:800,letterSpacing:2}}>{genPin}</span> — note this down!</div>}
        </div>
        <button onClick={save} style={{padding:"14px",background:"#d4a843",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Create Profile</button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// PIN RESET MODAL — Frantisek only
// ═══════════════════════════════════════════════════════════
function PinResetModal({users,pins,onSave,onClose}){
  const [selected,setSelected]=useState("");
  const [newPin,setNewPin]=useState("");
  const [genPin,setGenPin]=useState("");
  const generatePin=()=>{const p=String(Math.floor(10000+Math.random()*90000));setGenPin(p);setNewPin(p);};
  const save=()=>{
    if(!selected||!newPin||newPin.length!==5){alert("Select user and enter 5-digit PIN");return;}
    onSave(selected,newPin);
    onClose();
  };
  const currentPin=(uid)=>pins[uid]||users.find(u=>u.id===uid)?.pin||"—";
  return(
    <Modal title="Reset Staff PIN" onClose={onClose}>
      <div style={{background:"#ef444412",border:"1px solid #ef444433",borderRadius:12,padding:"12px 16px",marginBottom:18,fontSize:12,color:"#ef4444"}}>
        <strong>Frantisek Kabilka exclusive</strong> — Reset any staff member's PIN.
      </div>
      <div style={{display:"grid",gap:14}}>
        <div><label style={L}>Select Staff Member</label>
          <select style={I} value={selected} onChange={e=>{setSelected(e.target.value);setNewPin("");setGenPin("");}}>
            <option value="">Select…</option>
            {ROLES.map(role=><optgroup key={role} label={RL[role].toUpperCase()}>
              {users.filter(u=>u.role===role).map(u=><option key={u.id} value={u.id}>{u.name} (current: {currentPin(u.id)})</option>)}
            </optgroup>)}
          </select>
        </div>
        {selected&&<div>
          <label style={L}>New 5-Digit PIN *</label>
          <div style={{display:"flex",gap:8}}>
            <input style={{...I,flex:1,fontFamily:"monospace",letterSpacing:4,fontSize:18}} value={newPin} onChange={e=>setNewPin(e.target.value.slice(0,5).replace(/\D/g,""))} placeholder="•••••" maxLength={5}/>
            <button onClick={generatePin} style={{padding:"10px 14px",background:"#ef444422",border:"1px solid #ef444444",borderRadius:10,color:"#ef4444",cursor:"pointer",fontSize:12,whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>Generate</button>
          </div>
          {genPin&&<div style={{marginTop:6,fontSize:11,color:"#555"}}>Generated PIN: <span style={{color:"#ef4444",fontFamily:"monospace",fontWeight:800,letterSpacing:2}}>{genPin}</span> — note this down!</div>}
        </div>}
        <button onClick={save} disabled={!selected||newPin.length!==5} style={{padding:"14px",background:selected&&newPin.length===5?"#ef4444":"#333",border:"none",borderRadius:12,color:selected&&newPin.length===5?"#fff":"#666",fontWeight:800,fontSize:15,cursor:selected&&newPin.length===5?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif"}}>
          Reset PIN
        </button>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// DAILY REPORT — PDF export
// ═══════════════════════════════════════════════════════════
function DailyReportPanel({tasks,users,checkouts,repairs,inspections}){
  const [date,setDate]=useState(tod());
  const [selLocs,setSelLocs]=useState([]);
  const [includePhotos,setIncludePhotos]=useState(true);
  const [generating,setGenerating]=useState(false);
  const getUser=id=>[...BASE_USERS,...users].find(u=>u.id===id);
  // Match tasks by createdAt, updatedAt, or dueDate — all fall back to today
  const dayTasks=tasks.filter(t=>{
    const created=(t.createdAt||"").slice(0,10);
    const updated=(t.updatedAt||"").slice(0,10);
    const due=(t.dueDate||"").slice(0,10);
    return created===date||updated===date||due===date;
  });
  const dayCheckouts=checkouts.filter(c=>(c.date||"").slice(0,10)===date);
  const dayRepairs=repairs.filter(r=>(r.date||"").slice(0,10)===date);
  const dayInspections=inspections.filter(i=>(i.date||"").slice(0,10)===date);
  // Show all tasks for the day, plus any location that had a checkout photo
  const cleanedLocs=[...new Set([
    ...dayCheckouts.map(c=>c.location).filter(Boolean),
    ...dayTasks.map(t=>t.location).filter(Boolean),
  ])];
  const filteredLocs=selLocs.length>0?cleanedLocs.filter(l=>selLocs.includes(l)):cleanedLocs;
  const toggleLoc=l=>setSelLocs(s=>s.includes(l)?s.filter(x=>x!==l):[...s,l]);

  const buildLocationsHtml=(locs)=>{
    if(!locs.length)return '<div class="section"><div class="section-title">Locations Cleaned</div><div style="color:#aaa;font-size:13px;padding:12px">No cleaning recorded for this date.</div></div>';
    let html='<div class="section"><div class="section-title">Locations Cleaned</div>';
    locs.forEach(loc=>{
      const locTasks=dayTasks.filter(t=>t.location===loc);
      // Also look for tasks with photos regardless of date (in case task was created earlier)
      const locTasksWithPhotos=tasks.filter(t=>t.location===loc&&t.photos&&t.photos.filter(p=>p.type!=="start"&&p.dataUrl).length>0);
      const locCheckouts=dayCheckouts.filter(c=>c.location===loc);
      html+='<div class="loc-block"><div class="loc-name">&#128205; '+loc+'</div>';
      locTasks.forEach(t=>{
        const u=getUser(t.assigneeId);
        const cls=t.status==="done"?"check":"pending-dot";
        const sym=t.status==="done"?"&#10003;":"!";
        html+='<div class="task-row"><span class="'+cls+'">'+sym+'</span><span style="flex:1;margin-left:10px">'+(t.title||"")+'</span>';
        if(u)html+='<span class="staff-tag">'+u.name.split(" ")[0]+'</span>';
        html+='</div>';
        // Task evidence photos
        const evPhotos=(t.photos||[]).filter(p=>p.type!=="start"&&p.dataUrl);
        if(includePhotos&&evPhotos.length>0){
          html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 6px 26px">';
          evPhotos.slice(0,4).forEach(ph=>{
            html+='<img src="'+ph.dataUrl+'" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #e8d99a;" alt="evidence"/>';
          });
          html+='</div>';
        }
      });
      // Additional evidence photos from tasks not in today's filter
      if(includePhotos){
        const extraPhotos=locTasksWithPhotos
          .filter(t=>!locTasks.find(lt=>lt.id===t.id))
          .flatMap(t=>(t.photos||[]).filter(p=>p.type!=="start"&&p.dataUrl).map(p=>({...p,staffName:getUser(t.assigneeId)?.name||""})));
        if(extraPhotos.length>0){
          html+='<div style="margin-top:12px"><div style="font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Task Photos</div>';
          html+='<div style="display:flex;gap:8px;flex-wrap:wrap;">';
          extraPhotos.slice(0,6).forEach(ph=>{
            html+='<div style="text-align:center"><img src="'+ph.dataUrl+'" style="width:80px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #e8d99a;display:block;" alt="evidence"/>';
            if(ph.staffName)html+='<div style="font-size:9px;color:#888;margin-top:2px">'+ph.staffName.split(" ")[0]+'</div>';
            html+='</div>';
          });
          html+='</div></div>';
        }
      }
      if(includePhotos&&locCheckouts.length>0){
        html+='<div style="margin-top:12px"><div style="font-size:11px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Checkout Photos</div>';
        locCheckouts.forEach(c=>{
          html+='<div style="margin-bottom:8px">';
          if(c.photo)html+='<img src="'+c.photo+'" class="checkout-photo" alt="checkout"/>';
          html+='<div style="font-size:11px;color:#888;margin-top:4px">'+(c.userName||"")+' &middot; '+(c.time||"");
          if(c.note)html+=' &middot; '+c.note;
          html+='</div></div>';
        });
        html+='</div>';
      }
      html+='</div>';
    });
    html+='</div>';
    return html;
  };

  const buildRepairsHtml=()=>{
    if(!dayRepairs.length)return "";
    let html='<div class="section"><div class="section-title">Repairs Reported</div>';
    dayRepairs.forEach(r=>{
      const u=getUser(r.reportedBy);
      const uc=PC[r.urgency]||"#6b7280";
      html+='<div class="repair-row"><strong>&#128295; '+(r.title||"")+"</strong> &mdash; "+(r.location||"");
      html+=' <span class="badge" style="background:'+uc+'22;color:'+uc+';border:1px solid '+uc+'44;margin-left:8px">'+(r.urgency||"")+"</span>";
      html+='<div style="font-size:11px;color:#888;margin-top:3px">Reported by '+((u&&u.name)||"Unknown");
      if(r.description)html+=" &middot; "+r.description;
      html+="</div></div>";
    });
    html+="</div>";return html;
  };

  const buildInspectionsHtml=()=>{
    if(!dayInspections.length)return "";
    let html='<div class="section"><div class="section-title">Inspection Scores</div>';
    dayInspections.forEach(ins=>{
      const sc=ins.score>=90?"#22c55e":ins.score>=70?"#f59e0b":"#ef4444";
      html+='<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #ece8d9">';
      html+='<div style="font-size:24px;font-weight:900;color:'+sc+';min-width:48px">'+ins.score+"</div>";
      const areaStr=(ins.areas||[]).filter(a=>a.rating!==null).map(a=>a.area+": "+a.rating+"/5").join(" &middot; ");
      html+='<div><div style="font-weight:700">'+ins.location+'</div><div style="font-size:11px;color:#888">'+areaStr+"</div></div></div>";
    });
    html+="</div>";return html;
  };

  const generatePdf=()=>{
    setGenerating(true);
    setTimeout(()=>{
      const w=window.open("","_blank");
      if(!w){setGenerating(false);alert("Please allow popups");return;}
      const dateLabel=new Date(date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
      const css=['*{margin:0;padding:0;box-sizing:border-box;}','body{font-family:Helvetica Neue,Arial,sans-serif;color:#111;background:#fff;padding:40px;}','.header{border-bottom:3px solid #c9a227;padding-bottom:20px;margin-bottom:30px;display:flex;justify-content:space-between;align-items:flex-start;}','.logo{font-size:28px;font-weight:900;letter-spacing:-1px;}','.logo span{color:#c9a227;}','.date-badge{background:#c9a227;color:#fff;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;}','.section{margin-bottom:28px;}','.section-title{font-size:15px;font-weight:800;color:#c9a227;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e8d99a;}','.loc-block{background:#f9f7f0;border:1px solid #e8d99a;border-radius:10px;padding:16px 20px;margin-bottom:12px;}','.loc-name{font-size:16px;font-weight:800;color:#111;margin-bottom:10px;}','.task-row{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #ece8d9;font-size:13px;}','.task-row:last-child{border-bottom:none;}','.check{width:16px;height:16px;border-radius:4px;background:#22c55e;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;}','.pending-dot{width:16px;height:16px;border-radius:4px;background:#f97316;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;}','.staff-tag{background:#111;color:#fff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;margin-left:auto;}','.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;}','.stat{background:#f9f7f0;border:1px solid #e8d99a;border-radius:10px;padding:14px;text-align:center;}','.stat-val{font-size:32px;font-weight:900;color:#c9a227;}','.stat-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-top:4px;}','.checkout-photo{max-width:280px;border-radius:10px;margin-top:10px;border:2px solid #e8d99a;display:block;}','.repair-row{padding:8px 0;border-bottom:1px solid #ece8d9;font-size:13px;}','.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;text-transform:uppercase;}','.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8d99a;display:flex;justify-content:space-between;font-size:10px;color:#aaa;}','@media print{body{padding:20px;}@page{margin:10mm;}}'].join("");
      let html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SFH Daily Report</title><style>'+css+"</style></head><body>";
      html+='<div class="header"><div><div class="logo">Soho <span>House</span></div><div style="font-size:13px;color:#888;margin-top:4px">Operations Daily Report</div></div>';
      html+='<div><div class="date-badge">'+dateLabel+"</div><div style=\"font-size:11px;color:#aaa;text-align:right;margin-top:6px\">Generated "+new Date().toLocaleString("en-GB")+"</div></div></div>";
      const totalPhotos=dayCheckouts.length+tasks.filter(t=>filteredLocs.includes(t.location)&&(t.photos||[]).some(p=>p.type!=="start"&&p.dataUrl)).length;
      html+='<div class="stats"><div class="stat"><div class="stat-val">'+filteredLocs.length+'</div><div class="stat-label">Locations Cleaned</div></div><div class="stat"><div class="stat-val">'+dayTasks.filter(t=>t.status==="done").length+'</div><div class="stat-label">Tasks Completed</div></div><div class="stat"><div class="stat-val">'+totalPhotos+'</div><div class="stat-label">Evidence Photos</div></div><div class="stat"><div class="stat-val">'+dayRepairs.length+"</div><div class=\"stat-label\">Repairs Reported</div></div></div>";
      html+=buildLocationsHtml(filteredLocs);
      html+=buildRepairsHtml();
      html+=buildInspectionsHtml();
      html+='<div class="footer"><span>Soho House Operations Platform</span><span>Confidential &mdash; Management use only</span></div></body></html>';
      w.document.write(html);w.document.close();
      setTimeout(()=>{w.print();setGenerating(false);},500);
    },100);
  };

  return(
    <div>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",marginBottom:4}}>Daily Report</div>
      <div style={{fontSize:13,color:"#555",marginBottom:20}}>Generate a PDF report of cleaning activity for any date</div>
      <div style={{background:"#111128",border:"1px solid #252540",borderRadius:16,padding:"20px",marginBottom:20}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <div><label style={L}>Report Date</label><input type="date" style={I} value={date} onChange={e=>setDate(e.target.value)}/></div>
          <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
            <label style={L}>Options</label>
            <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <input type="checkbox" checked={includePhotos} onChange={e=>setIncludePhotos(e.target.checked)} style={{width:16,height:16,accentColor:"#d4a843"}}/>
              <span style={{fontSize:13,color:"#aaa"}}>Include checkout photos in PDF</span>
            </label>
          </div>
        </div>
        {cleanedLocs.length>0&&<div>
          <label style={{...L,marginBottom:8}}>Filter Locations (leave empty for all)</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {cleanedLocs.map(l=>(
              <button key={l} onClick={()=>toggleLoc(l)} style={{padding:"5px 12px",borderRadius:20,background:selLocs.includes(l)?"#d4a84322":"transparent",border:`1px solid ${selLocs.includes(l)?"#d4a843":"#252540"}`,color:selLocs.includes(l)?"#d4a843":"#555",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            ))}
          </div>
        </div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[{l:"Locations",v:filteredLocs.length,c:"#d4a843"},{l:"Tasks Done",v:dayTasks.filter(t=>t.status==="done").length,c:"#22c55e"},{l:"Photos",v:dayCheckouts.length+tasks.filter(t=>filteredLocs.includes(t.location)&&(t.photos||[]).some(p=>p.type!=="start"&&p.dataUrl)).length,c:"#38bdf8"},{l:"Repairs",v:dayRepairs.length,c:"#f97316"}].map(s=>(
          <div key={s.l} style={{background:"#111128",border:`1px solid ${s.c}22`,borderRadius:14,padding:"16px",textAlign:"center"}}>
            <div style={{fontSize:30,fontWeight:900,color:s.c,fontFamily:"Georgia,serif"}}>{s.v}</div>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{s.l}</div>
          </div>
        ))}
      </div>
      {filteredLocs.length>0?(
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"20px",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:14}}>Locations to include</div>
          {filteredLocs.map(loc=>{
            const locTasks=dayTasks.filter(t=>t.location===loc);
            const locCheckouts=dayCheckouts.filter(c=>c.location===loc);
            const done=locTasks.filter(t=>t.status==="done").length;
            return(
              <div key={loc} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #1e1e38"}}>
                <div style={{fontSize:16}}>📍</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:"#fff",fontWeight:600}}>{loc}</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>{done}/{locTasks.length} tasks done · {locCheckouts.length} photos</div>
                </div>
                {locCheckouts.length>0&&includePhotos&&<div style={{display:"flex",gap:4}}>
                  {locCheckouts.slice(0,2).map((c,i)=>c.photo&&<img key={i} src={c.photo} alt="" style={{width:36,height:36,borderRadius:6,objectFit:"cover",border:"1px solid #333"}}/>)}
                </div>}
              </div>
            );
          })}
        </div>
      ):(
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"32px",textAlign:"center",marginBottom:20,color:"#555"}}>
          No cleaning activity recorded for {new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}.
        </div>
      )}
      <button onClick={generatePdf} disabled={generating} style={{width:"100%",padding:"16px",background:generating?"#333":"#d4a843",border:"none",borderRadius:14,color:generating?"#666":"#000",fontWeight:800,fontSize:16,cursor:generating?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        {generating?"⏳ Generating PDF…":"📄 Export PDF Report"}
      </button>
      <div style={{fontSize:11,color:"#444",textAlign:"center",marginTop:8}}>Opens print dialog — Save as PDF or print directly</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════
function Overview({tasks,repairs,orders,inspections,liveLocations,allUsers,onNav}){
  const tot=tasks.length,pend=tasks.filter(t=>t.status==="pending").length;
  const inp=tasks.filter(t=>t.status==="in_progress").length,done=tasks.filter(t=>t.status==="done").length;
  const urg=tasks.filter(t=>t.priority==="urgent"&&t.status!=="done").length;
  const openRep=repairs.filter(r=>r.status==="open").length,pendOrd=orders.filter(o=>o.status==="pending").length;
  const byRole=ROLES.map(role=>{const ru=allUsers.filter(u=>u.role===role);const ids=ru.map(u=>u.id);const rt=tasks.filter(t=>ids.includes(t.assigneeId));return{role,count:rt.length,done:rt.filter(t=>t.status==="done").length,color:RC[role]};});
  const recent=[...tasks].filter(t=>t.createdAt).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
  const activeCount=Object.keys(liveLocations).length;
  return(
    <div>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",marginBottom:20}}>Dashboard Overview</div>
      <div style={{background:"#111128",border:"1px solid #252540",borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:11,color:"#555",display:"flex",gap:8,alignItems:"center"}}>
        <span>🔒</span><span>Data retention: completed tasks deleted after 12 months · checkout photos after 90 days · runs automatically every Sunday</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:24}}>
        {[
          {l:"Total Tasks",   v:tot,        c:"#d4a843", tab:"tasks",          filter:{status:"all"}},
          {l:"Pending",       v:pend,       c:"#f97316", tab:"tasks",          filter:{status:"pending"}},
          {l:"In Progress",   v:inp,        c:"#3b82f6", tab:"tasks",          filter:{status:"in_progress"}},
          {l:"Completed",     v:done,       c:"#22c55e", tab:"tasks",          filter:{status:"done"}},
          {l:"Active Staff",  v:activeCount,c:"#a78bfa", tab:"locations_live", filter:null},
        ].map(s=>(
          <div key={s.l} onClick={()=>onNav(s.tab,s.filter)} style={{background:"#111128",border:`1px solid ${s.c}22`,borderRadius:16,padding:"18px 12px",textAlign:"center",cursor:"pointer",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${s.c}12`;e.currentTarget.style.borderColor=`${s.c}55`;}}
            onMouseLeave={e=>{e.currentTarget.style.background="#111128";e.currentTarget.style.borderColor=`${s.c}22`;}}>
            <div style={{fontSize:34,fontWeight:900,color:s.c,fontFamily:"Georgia,serif"}}>{s.v}</div>
            <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginTop:4}}>{s.l}</div>
            <div style={{fontSize:9,color:s.c,opacity:.6,marginTop:3}}>click to view →</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
        {urg>0&&<div onClick={()=>onNav("tasks",{priority:"urgent"})} style={{background:"#ef444412",border:"1px solid #ef444444",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flex:1,minWidth:180,cursor:"pointer"}}><span style={{fontSize:22}}>⚡</span><div><div style={{color:"#ef4444",fontWeight:800,fontSize:14}}>{urg} Urgent Tasks</div><div style={{color:"#ef444488",fontSize:11}}>Click to view →</div></div></div>}
        {openRep>0&&<div onClick={()=>onNav("repairs")} style={{background:"#f9731612",border:"1px solid #f9731644",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flex:1,minWidth:180,cursor:"pointer"}}><span style={{fontSize:22}}>🔧</span><div><div style={{color:"#f97316",fontWeight:800,fontSize:14}}>{openRep} Open Repairs</div><div style={{color:"#f9731488",fontSize:11}}>Click to view →</div></div></div>}
        {pendOrd>0&&<div onClick={()=>onNav("orders")} style={{background:"#38bdf812",border:"1px solid #38bdf844",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flex:1,minWidth:180,cursor:"pointer"}}><span style={{fontSize:22}}>🛒</span><div><div style={{color:"#38bdf8",fontWeight:800,fontSize:14}}>{pendOrd} Supply Orders</div><div style={{color:"#38bdf888",fontSize:11}}>Click to view →</div></div></div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Tasks by Team</div>
            <button onClick={()=>onNav("tasks")} style={{fontSize:10,color:"#d4a843",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
          </div>
          {byRole.map(r=>(
            <div key={r.role} onClick={()=>onNav("tasks",{role:r.role})} style={{marginBottom:14,cursor:"pointer",padding:"4px 0"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".8"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:r.color,textTransform:"capitalize"}}>{RL[r.role]}</span><span style={{fontSize:11,color:"#555"}}>{r.done}/{r.count}</span></div>
              <div style={{height:5,background:"#1e1e38",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:r.count?`${r.done/r.count*100}%`:"0",background:r.color,borderRadius:5}}/></div>
            </div>
          ))}
        </div>
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Recent Tasks</div>
            <button onClick={()=>onNav("tasks")} style={{fontSize:10,color:"#d4a843",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
          </div>
          {recent.map(t=>(
            <div key={t.id} onClick={()=>onNav("tasks")} style={{marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1e1e38",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <div style={{fontSize:12,color:"#ddd",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</div>
              <div style={{fontSize:10,color:"#555",marginTop:2}}>{t.location} · <span style={{color:SC[t.status]||"#666"}}>{t.status}</span></div>
            </div>
          ))}
          {!recent.length&&<div style={{color:"#555",fontSize:13}}>No tasks yet.</div>}
        </div>
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Recent Inspections</div>
            <button onClick={()=>onNav("inspections")} style={{fontSize:10,color:"#d4a843",background:"transparent",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>View all →</button>
          </div>
          {inspections.slice(0,5).map(ins=>{const sc=ins.score>=90?"#22c55e":ins.score>=70?"#eab308":"#ef4444";return(
            <div key={ins.id} onClick={()=>onNav("inspections")} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
              <div style={{fontSize:22,fontWeight:900,color:sc,minWidth:40,fontFamily:"Georgia,serif"}}>{ins.score}</div>
              <div><div style={{fontSize:12,color:"#ddd"}}>{ins.location}</div><div style={{fontSize:10,color:"#555"}}>{dfShort(ins.date)}</div></div>
            </div>
          );})}
          {!inspections.length&&<div style={{color:"#555",fontSize:13}}>No inspections yet.</div>}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// TASK DETAIL DRAWER — slide-in from right, live progress
// ═══════════════════════════════════════════════════════════
function TaskDetailDrawer({task,allUsers,onClose,onUpdate,onDelete,onSendBack}){
  const u=allUsers.find(x=>x.id===task.assigneeId);
  const rc=RC[u?.role]||"#666";
  const pc=PC[task.priority]||"#6b7280";
  const sc=SC[task.status]||"#6b7280";
  const done=task.checklist?.filter(c=>c.done).length||0;
  const total=task.checklist?.length||0;
  const prog=total?Math.round(done/total*100):null;
  const typeEm={general:"📋",checklist:"✓",porter:"🚗",repair:"🔧",emergency:"⚡",reception:"📞",inspection:"⭐"};
  // Inspection state — per-item OK / Issue flags + comment
  const [inspState,setInspState]=useState({}); // {itemIdx: "ok"|"issue"}
  const [inspComment,setInspComment]=useState("");
  const [showInspComment,setShowInspComment]=useState(false);
  const hasIssues=Object.values(inspState).some(v=>v==="issue");
  const allInspected=total>0&&Object.keys(inspState).length===total;
  const setItemInsp=(i,val)=>setInspState(s=>({...s,[i]:val}));

  return(
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"#00000060",zIndex:500,backdropFilter:"blur(4px)"}}/>
      {/* Drawer */}
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:480,background:"#0d0d1e",borderLeft:"1px solid #252540",zIndex:501,overflowY:"auto",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{padding:"20px 24px 16px",borderBottom:"1px solid #1e1e38",background:"#09091a",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{flex:1,marginRight:12}}>
              <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>{typeEm[task.type]||"📋"} {task.type}</div>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",lineHeight:1.3}}>{task.title}</div>
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:22,lineHeight:1,flexShrink:0}}>✕</button>
          </div>
          {/* Return badge if task was sent back */}
          {(task.inspectionNote||task.inspectionHistory?.length>0)&&(
            <div style={{background:"#ef444415",border:"1px solid #ef444444",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>⚠️</span>
              <div>
                <div style={{fontSize:11,color:"#ef4444",fontWeight:800}}>Returned for correction {task.inspectionHistory?.length>1?`(${task.inspectionHistory.length}x)`:""}</div>
                <div style={{fontSize:10,color:"#ef444488"}}>See history below</div>
              </div>
            </div>
          )}
          {/* Status + Priority row */}
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <Badge label={task.priority} color={pc} sm/>
            <select value={task.status} onChange={e=>onUpdate({...task,status:e.target.value,updatedAt:new Date().toISOString()})}
              style={{background:`${sc}15`,border:`1px solid ${sc}55`,borderRadius:8,padding:"3px 10px",color:sc,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
              {["pending","in_progress","done"].map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
            {task.roundId&&<span style={{fontSize:9,color:"#a78bfa",background:"#a78bfa18",border:"1px solid #a78bfa33",borderRadius:6,padding:"2px 8px"}}>🔄 Area {task.roundArea}/{task.roundTotal}</span>}
          </div>
        </div>

        <div style={{padding:"20px 24px",flex:1}}>
          {/* Assignee + Location */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
            <div style={{background:"#111128",borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Assigned To</div>
              {u?(
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Av name={u.name} size={28} color={rc}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{u.name}</div>
                    <Badge label={RL[u.role]} color={rc} sm/>
                  </div>
                </div>
              ):<div style={{color:"#555",fontSize:12}}>Unassigned</div>}
            </div>
            <div style={{background:"#111128",borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Location</div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>📍 {task.location||"—"}</div>
              {task.dueDate&&<div style={{fontSize:10,color:"#555",marginTop:4}}>Due: {df(task.dueDate)}</div>}
            </div>
          </div>

          {/* Progress */}
          {total>0&&(
            <div style={{background:"#111128",borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Checklist Progress</div>
                <div style={{fontSize:13,fontWeight:900,color:prog===100?"#22c55e":"#d4a843"}}>{prog}%</div>
              </div>
              {/* Big progress bar */}
              <div style={{height:8,background:"#1e1e38",borderRadius:8,overflow:"hidden",marginBottom:14}}>
                <div style={{height:"100%",width:`${prog}%`,background:prog===100?"#22c55e":"#d4a843",borderRadius:8,transition:"width .4s"}}/>
              </div>
              <div style={{fontSize:11,color:"#555",marginBottom:12}}>{done} of {total} tasks completed</div>
              {/* Checklist items with inspection toggle */}
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {task.checklist.map((c,i)=>{
                  const istate=inspState[i];
                  return(
                    <div key={i} style={{borderRadius:8,border:`1px solid ${istate==="issue"?"#ef444444":istate==="ok"?"#22c55e44":"#1e1e38"}`,overflow:"hidden"}}>
                      {/* Task row */}
                      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:istate==="issue"?"#ef444410":istate==="ok"?"#22c55e10":c.done?"#22c55e12":"#0a0a1a"}}>
                        <div style={{width:18,height:18,borderRadius:5,flexShrink:0,background:c.done?"#22c55e":"transparent",border:`2px solid ${c.done?"#22c55e":"#333"}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          {c.done&&<span style={{fontSize:10,color:"#000",fontWeight:900}}>✓</span>}
                        </div>
                        <span style={{fontSize:12,color:c.done?"#22c55e":"#ccc",flex:1}}>{c.label}</span>
                        {/* Inspection buttons */}
                        <div style={{display:"flex",gap:4,flexShrink:0}}>
                          <button onClick={()=>setItemInsp(i,istate==="ok"?undefined:"ok")}
                            style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${istate==="ok"?"#22c55e":"#333"}`,background:istate==="ok"?"#22c55e22":"transparent",color:istate==="ok"?"#22c55e":"#555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                            ✓ OK
                          </button>
                          <button onClick={()=>setItemInsp(i,istate==="issue"?undefined:"issue")}
                            style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${istate==="issue"?"#ef4444":"#333"}`,background:istate==="issue"?"#ef444422":"transparent",color:istate==="issue"?"#ef4444":"#555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                            ✕ Issue
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Inspection summary */}
              {Object.keys(inspState).length>0&&(
                <div style={{marginTop:10,padding:"10px 12px",background:hasIssues?"#ef444412":"#22c55e12",border:`1px solid ${hasIssues?"#ef444433":"#22c55e33"}`,borderRadius:8}}>
                  <div style={{fontSize:11,fontWeight:700,color:hasIssues?"#ef4444":"#22c55e",marginBottom:4}}>
                    {hasIssues
                      ?`⚠️ ${Object.values(inspState).filter(v=>v==="issue").length} issue(s) found`
                      :"✓ All items inspected — no issues"}
                  </div>
                  {hasIssues&&<div style={{fontSize:10,color:"#888"}}>Add a comment below and send back to staff</div>}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {task.notes&&(
            <div style={{background:"#111128",borderRadius:12,padding:"14px",marginBottom:16}}>
              <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Notes</div>
              <div style={{fontSize:12,color:"#aaa",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{task.notes}</div>
            </div>
          )}

          {/* Photos */}
          {task.photos&&task.photos.length>0&&(
            <div style={{background:"#111128",borderRadius:12,padding:"14px",marginBottom:16}}>
              <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>
                Photo Evidence ({task.photos.length})
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                {task.photos.map((ph,i)=>(
                  <div key={i} style={{borderRadius:8,overflow:"hidden",position:"relative",aspectRatio:"1"}}>
                    {ph.dataUrl
                      ?<img src={ph.dataUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      :<div style={{width:"100%",height:"100%",background:"#0a0a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📷</div>
                    }
                    {ph.time&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"#000000aa",fontSize:8,color:"#fff",padding:"2px 4px",textAlign:"center"}}>{ph.time}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspection History */}
          {task.inspectionHistory&&task.inspectionHistory.length>0&&(
            <div style={{background:"#0a0a1a",border:"1px solid #ef444433",borderRadius:12,padding:"14px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"#ef4444",marginBottom:10}}>
                ⚠️ Return History ({task.inspectionHistory.length})
              </div>
              {task.inspectionHistory.map((h,i)=>(
                <div key={i} style={{marginBottom:i<task.inspectionHistory.length-1?12:0,paddingBottom:i<task.inspectionHistory.length-1?12:0,borderBottom:i<task.inspectionHistory.length-1?"1px solid #1e1e38":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{fontSize:10,color:"#ef4444",fontWeight:700}}>Return #{i+1}</span>
                    <span style={{fontSize:10,color:"#555"}}>{h.date}</span>
                  </div>
                  <div style={{fontSize:12,color:"#ccc",whiteSpace:"pre-wrap",lineHeight:1.5}}>{h.note}</div>
                  {h.resolved&&(
                    <div style={{marginTop:8,background:"#22c55e12",border:"1px solid #22c55e33",borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:10,color:"#22c55e",fontWeight:700,marginBottom:2}}>✓ Resolved by {h.resolvedBy} · {h.resolvedAt}</div>
                      {h.resolvedNote&&<div style={{fontSize:11,color:"#22c55e88"}}>{h.resolvedNote}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Created info */}
          <div style={{fontSize:10,color:"#333",marginBottom:20}}>
            Created: {task.createdAt?new Date(task.createdAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):"—"}
            {task.updatedAt&&<span> · Updated: {new Date(task.updatedAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>}
          </div>

          {/* Send back for correction — only when issues found */}
          {hasIssues&&(
            <div style={{marginBottom:12}}>
              {!showInspComment?(
                <button onClick={()=>setShowInspComment(true)}
                  style={{width:"100%",padding:"11px",background:"#f9731622",border:"1px solid #f9731644",borderRadius:10,color:"#f97316",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  📋 Add Comment & Send Back for Correction
                </button>
              ):(
                <div style={{background:"#0a0a1a",border:"1px solid #f9731633",borderRadius:12,padding:"14px"}}>
                  <div style={{fontSize:11,color:"#f97316",fontWeight:700,marginBottom:8}}>
                    Issues found in: {Object.entries(inspState).filter(([,v])=>v==="issue").map(([i])=>task.checklist[i]?.label).filter(Boolean).join(", ")}
                  </div>
                  <textarea
                    value={inspComment}
                    onChange={e=>setInspComment(e.target.value)}
                    placeholder="Describe what needs to be corrected… (e.g. mirrors not cleaned, bin not emptied)"
                    style={{width:"100%",boxSizing:"border-box",background:"#111128",border:"1px solid #252540",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:12,resize:"none",fontFamily:"'DM Sans',sans-serif",outline:"none",height:80,marginBottom:10}}
                  />
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setShowInspComment(false)}
                      style={{flex:1,padding:"9px",background:"transparent",border:"1px solid #252540",borderRadius:8,color:"#555",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                      Cancel
                    </button>
                    <button
                      onClick={()=>{
                        const issueLabels=Object.entries(inspState).filter(([,v])=>v==="issue").map(([i])=>task.checklist[i]?.label).filter(Boolean);
                        const note="⚠️ Issues found by management:\n"+issueLabels.map(l=>"• "+l).join("\n")+(inspComment?"\n\nComment: "+inspComment:"");
                        const historyEntry={
                          date:new Date().toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),
                          note,
                          by:allUsers.find(x=>x.id===task.assigneeId)?.name||"Staff",
                          type:"sent_back",
                        };
                        const updatedTask={
                          ...task,
                          status:"pending",
                          inspectionNote:note,
                          inspectionHistory:[...(task.inspectionHistory||[]),historyEntry],
                          updatedAt:new Date().toISOString(),
                        };
                        onSendBack(updatedTask);
                        // Push notification to assignee
                        sendPush([task.assigneeId],{
                          title:"⚠️ Task Returned for Correction",
                          body: (task.roundId&&task.location?task.location:task.title) + " — management found issues. Please review and correct.",
                          tag:"return-"+task.id,
                          requireInteraction:true,
                          url:"/",
                          taskId:task.id,
                        });
                        onClose();
                      }}
                      style={{flex:2,padding:"9px",background:"#f97316",border:"none",borderRadius:8,color:"#000",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                      🔄 Send Back to {u?.name?.split(" ")[0]||"Staff"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {(()=>{
            const isApproved = !!task.approvedAt;
            return(
              <div style={{display:"flex",gap:8,flexDirection:"column"}}>
                {/* Approve button — available for any done task not yet approved */}
                {isApproved?(
                  <div style={{background:"#22c55e18",border:"1px solid #22c55e44",borderRadius:10,padding:"11px",textAlign:"center"}}>
                    <div style={{fontSize:13,color:"#22c55e",fontWeight:800}}>✅ Approved</div>
                    <div style={{fontSize:10,color:"#22c55e88",marginTop:2}}>{new Date(task.approvedAt).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
                  </div>
                ):(
                  <button
                    onClick={async()=>{
                      const approved={
                        ...task,
                        status:"done",
                        approvedAt:new Date().toISOString(),
                        approvedBy:allUsers.find(x=>x.id===task.assigneeId)?.name||"Management",
                        updatedAt:new Date().toISOString(),
                      };
                      await onUpdate(approved);
                      onClose();
                    }}
                    style={{width:"100%",padding:"13px",background:"#22c55e",border:"1px solid #22c55e",borderRadius:10,color:"#000",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    ✅ Approve Task
                  </button>
                )}

                <button onClick={()=>onDelete(task.id)} style={{width:"100%",padding:"9px",background:"transparent",border:"1px solid #ef444433",borderRadius:10,color:"#ef4444",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Delete Task
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// TASKS PANEL
// ═══════════════════════════════════════════════════════════
function TasksPanel({tasks,allUsers,checkouts=[],rounds=[],onCreate,onCreateMultiple,onUpdate,onDelete,onDeleteCheckout}){
  const [filter,setFilter]=useState({status:"all",role:"all",priority:"all",search:""});
  const [editing,setEditing]=useState(null);
  const [showCreate,setShowCreate]=useState(false);
  const [viewPhoto,setViewPhoto]=useState(null); // lightbox
  const [viewTask,setViewTask]=useState(null);   // task detail drawer
  const [expandedUsers,setExpandedUsers]=useState({}); // {userId: true/false}
  const toggleUser=id=>setExpandedUsers(s=>({...s,[id]:!s[id]}));
  const getUser=id=>allUsers.find(u=>u.id===id);
  const filt=tasks.filter(t=>{
    if(filter.status!=="all"&&t.status!==filter.status)return false;
    if(filter.priority!=="all"&&t.priority!==filter.priority)return false;
    if(filter.role!=="all"&&getUser(t.assigneeId)?.role!==filter.role)return false;
    if(filter.search&&!t.title.toLowerCase().includes(filter.search.toLowerCase()))return false;
    return true;
  });
  const sel={background:"#0d0d1e",border:"1px solid #252540",borderRadius:8,padding:"7px 12px",color:"#aaa",fontSize:12,outline:"none",fontFamily:"'DM Sans',sans-serif"};
  const typeEm={general:"📋",checklist:"✓",porter:"🚗",repair:"🔧",emergency:"⚡",reception:"📞",inspection:"⭐"};
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Tasks ({filt.length})</div>
        <button onClick={()=>setShowCreate(true)} style={{padding:"10px 20px",background:"#d4a843",border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>+ New Task</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
        <input value={filter.search} onChange={e=>setFilter(f=>({...f,search:e.target.value}))} placeholder="Search…" style={{...sel,flex:1,minWidth:140}}/>
        {[["status",["all","pending","in_progress","done"]],["priority",["all","urgent","high","medium","low"]],["role",["all",...ROLES]]].map(([k,opts])=>(
          <select key={k} style={sel} value={filter[k]} onChange={e=>setFilter(f=>({...f,[k]:e.target.value}))}>
            {opts.map(o=><option key={o} value={o}>{o==="all"?`All ${k.charAt(0).toUpperCase()+k.slice(1)}`:o.replace("_"," ")}</option>)}
          </select>
        ))}
        <button onClick={()=>setFilter({status:"all",role:"all",priority:"all",search:""})} style={{...sel,cursor:"pointer",color:"#d4a843",borderColor:"#d4a84344",background:"transparent"}}>Reset</button>
      </div>
      {filt.length===0
        ?<div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"40px",textAlign:"center",color:"#555"}}>No tasks match filters</div>
        :(()=>{
          // Group filtered tasks by assignee
          const byUser={};
          filt.forEach(t=>{
            const uid=t.assigneeId||"__unassigned__";
            if(!byUser[uid])byUser[uid]=[];
            byUser[uid].push(t);
          });
          // Sort groups: by role order then name
          const roleOrder={management:0,reception:1,porter:2,cleaner:3};
          const groups=Object.entries(byUser).sort(([aId],[bId])=>{
            const au=getUser(aId),bu=getUser(bId);
            const ro=(roleOrder[au?.role]??9)-(roleOrder[bu?.role]??9);
            if(ro!==0)return ro;
            return (au?.name||"").localeCompare(bu?.name||"");
          });

          return(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {groups.map(([uid,userTasks])=>{
                const u=getUser(uid);
                const rc=RC[u?.role]||"#666";
                const isOpen=!!expandedUsers[uid];
                const pending=userTasks.filter(t=>t.status==="pending").length;
                const inprog=userTasks.filter(t=>t.status==="in_progress").length;
                const done=userTasks.filter(t=>t.status==="done").length;
                const allDone=pending===0&&inprog===0;
                return(
                  <div key={uid} style={{background:"#111128",border:`1px solid ${isOpen?rc+"44":"#1e1e38"}`,borderRadius:14,overflow:"hidden",transition:"border-color .15s"}}>
                    {/* Staff row — click to expand */}
                    <div onClick={()=>toggleUser(uid)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",cursor:"pointer",background:isOpen?`${rc}08`:"transparent"}}
                      onMouseEnter={e=>!isOpen&&(e.currentTarget.style.background="#0a0a1a")}
                      onMouseLeave={e=>!isOpen&&(e.currentTarget.style.background="transparent")}>
                      <Av name={u?.name||"?"} size={36} color={rc}/>
                      <div style={{flex:1}}>
                        <div style={{color:"#fff",fontSize:14,fontWeight:700}}>{u?.name||"Unassigned"}</div>
                        <div style={{display:"flex",gap:10,marginTop:3,flexWrap:"wrap"}}>
                          {pending>0&&<span style={{fontSize:10,color:"#f97316"}}>⏳ {pending} pending</span>}
                          {inprog>0&&<span style={{fontSize:10,color:"#3b82f6"}}>▶ {inprog} in progress</span>}
                          {done>0&&<span style={{fontSize:10,color:"#22c55e"}}>✓ {done} done</span>}
                          {allDone&&<span style={{fontSize:10,color:"#22c55e",fontWeight:700}}>✓ All complete</span>}
                          {userTasks.some(t=>t.inspectionNote||t.inspectionHistory?.length>0)&&(
                            <span style={{fontSize:10,color:"#ef4444",fontWeight:700,background:"#ef444415",padding:"1px 6px",borderRadius:4}}>⚠️ {userTasks.filter(t=>t.inspectionNote||t.inspectionHistory?.length>0).length} return(s)</span>
                          )}
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{width:80,marginRight:8}}>
                        <div style={{height:4,background:"#1e1e38",borderRadius:4,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${userTasks.length?done/userTasks.length*100:0}%`,background:allDone?"#22c55e":rc,borderRadius:4,transition:"width .3s"}}/>
                        </div>
                        <div style={{fontSize:9,color:"#555",textAlign:"right",marginTop:2}}>{userTasks.length} tasks</div>
                      </div>
                      <Badge label={RL[u?.role]||"—"} color={rc} sm/>
                      <div style={{fontSize:18,color:isOpen?rc:"#555",transition:"transform .2s",transform:isOpen?"rotate(90deg)":"none",display:"inline-block",marginLeft:4}}>›</div>
                    </div>

                    {/* Task rows — shown when expanded */}
                    {isOpen&&(
                      <div style={{borderTop:`1px solid ${rc}22`}}>
                        {/* Column headers */}
                        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 0.8fr 1fr 110px",padding:"7px 16px",background:"#0a0a1a"}}>
                          {["Task","Location","Priority","Status",""].map(h=>(
                            <div key={h} style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>{h}</div>
                          ))}
                        </div>
                        {userTasks.map(t=>{
                          const pc=PC[t.priority]||"#6b7280",sc=SC[t.status]||"#6b7280";
                          const prog=t.checklist?.length?Math.round(t.checklist.filter(c=>c.done).length/t.checklist.length*100):null;
                          return(
                            <div key={t.id} onClick={()=>setViewTask(t)}
                              style={{display:"grid",gridTemplateColumns:"2fr 1fr 0.8fr 1fr 110px",padding:"10px 16px",borderTop:"1px solid #0a0a1a",alignItems:"center",cursor:"pointer"}}
                              onMouseEnter={e=>e.currentTarget.style.background="#0a0a1a"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <div>
                                <div style={{color:"#fff",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                                  {typeEm[t.type]||"📋"} {t.roundId&&t.location?t.location:t.title}
                                  {t.deepClean&&<span style={{background:"#f97316",color:"#fff",fontSize:8,fontWeight:800,padding:"1px 5px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>DEEP CLEAN</span>}
                                  {t.approvedAt&&<span style={{background:"#22c55e",color:"#fff",fontSize:8,fontWeight:800,padding:"1px 5px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>✅ approved</span>}
                                  {!t.approvedAt&&(t.inspectionNote||t.inspectionHistory?.length>0)&&<span style={{background:"#ef4444",color:"#fff",fontSize:8,fontWeight:800,padding:"1px 5px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>⚠️ return</span>}
                                </div>
                                {t.roundId&&<div style={{fontSize:9,color:"#a78bfa",marginTop:1}}>🔄 Round · Area {t.roundArea}/{t.roundTotal}</div>}
                                {prog!==null&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                                  <div style={{width:50,height:3,background:"#1e1e38",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${prog}%`,background:rc,borderRadius:3}}/></div>
                                  <span style={{fontSize:9,color:"#555"}}>{prog}%</span>
                                </div>}
                              </div>
                              <div style={{color:"#888",fontSize:11}}>{t.location||"—"}</div>
                              <div><Badge label={t.priority||"—"} color={pc} sm/></div>
                              <div onClick={e=>e.stopPropagation()}>
                                <select value={t.status} onChange={e=>onUpdate({...t,status:e.target.value,updatedAt:new Date().toISOString()})} style={{background:"transparent",border:`1px solid ${sc}44`,borderRadius:8,padding:"3px 8px",color:sc,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                                  {["pending","in_progress","done"].map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
                                </select>
                              </div>
                              <div style={{display:"flex",gap:5,alignItems:"center"}} onClick={e=>e.stopPropagation()}>
                                {t.photos&&t.photos.length>0&&<div style={{display:"flex",gap:2,marginRight:2}}>
                                  {t.photos.slice(0,1).map((ph,pi)=>ph.dataUrl&&<img key={pi} src={ph.dataUrl} alt="" style={{width:22,height:22,borderRadius:4,objectFit:"cover",cursor:"pointer"}} onClick={e=>{e.stopPropagation();setViewPhoto(ph.dataUrl);}}/>)}
                                  {t.photos.length>1&&<div style={{width:22,height:22,borderRadius:4,background:"#252540",border:"1px solid #333",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#888"}}>+{t.photos.length-1}</div>}
                                </div>}
                                <button onClick={e=>{e.stopPropagation();setEditing(t);}} style={{background:"transparent",border:"1px solid #252540",borderRadius:7,padding:"3px 8px",color:"#aaa",cursor:"pointer",fontSize:10}}>Edit</button>
                                <button onClick={e=>{e.stopPropagation();onDelete(t.id);}} style={{background:"transparent",border:"1px solid #ef444433",borderRadius:7,padding:"3px 8px",color:"#ef4444",cursor:"pointer",fontSize:10}}>✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()
      }
      {/* Checkout photos section */}
      {checkouts&&checkouts.length>0&&(
        <div style={{marginTop:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>📸 Checkout Photos Today</div>
            <div style={{fontSize:11,color:"#555"}}>{checkouts.filter(c=>(c.date||"").slice(0,10)===tod()).length} photos</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {checkouts.filter(c=>(c.date||"").slice(0,10)===tod()).map((c,i)=>(
              <div key={c.id||i} style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:12,overflow:"hidden",position:"relative"}}>
                <div style={{cursor:"pointer"}} onClick={()=>setViewPhoto(c.photo)}>
                  {c.photo
                    ?<img src={c.photo} alt="" style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/>
                    :<div style={{width:"100%",height:120,background:"#0a0a1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>📷</div>
                  }
                </div>
                {/* Delete button */}
                <button onClick={()=>onDeleteCheckout(c.id||i)} style={{position:"absolute",top:6,right:6,width:24,height:24,borderRadius:"50%",background:"#000000cc",border:"none",color:"#fff",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,zIndex:2}} title="Delete photo">✕</button>
                <div style={{padding:"8px 10px"}}>
                  <div style={{fontSize:11,color:"#fff",fontWeight:600}}>{c.userName||"Unknown"}</div>
                  <div style={{fontSize:10,color:"#555",marginTop:2}}>📍 {c.location} · {c.time}</div>
                  {c.note&&<div style={{fontSize:10,color:"#888",marginTop:2,fontStyle:"italic"}}>"{c.note}"</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showCreate&&<TaskModal users={allUsers} rounds={rounds} onSave={onCreate} onSaveMultiple={onCreateMultiple} onClose={()=>setShowCreate(false)}/>}
      {editing&&<TaskModal task={editing} users={allUsers} rounds={rounds} onSave={onUpdate} onClose={()=>setEditing(null)}/>}
      {viewTask&&<TaskDetailDrawer
        task={tasks.find(t=>t.id===viewTask.id)||viewTask}
        allUsers={allUsers}
        onClose={()=>setViewTask(null)}
        onUpdate={t=>{onUpdate(t);setViewTask(t);}}
        onDelete={id=>{onDelete(id);setViewTask(null);}}
        onSendBack={t=>{onUpdate(t);setViewTask(null);}}
      />}
      {viewPhoto&&(
        <div onClick={()=>setViewPhoto(null)} style={{position:"fixed",inset:0,background:"#000000e0",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(8px)"}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"relative",maxWidth:"90vw",maxHeight:"90vh"}}>
            <img src={viewPhoto} alt="task photo" style={{maxWidth:"90vw",maxHeight:"85vh",borderRadius:12,objectFit:"contain",display:"block"}}/>
            <button onClick={()=>setViewPhoto(null)} style={{position:"absolute",top:-12,right:-12,width:32,height:32,borderRadius:"50%",background:"#ef4444",border:"none",color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// STAFF PANEL — with PIN display and reset
// ═══════════════════════════════════════════════════════════
function StaffPanel({allUsers,tasks,liveLocations,adminUser,onAddProfile,onDeleteProfile,extraProfiles,pins,onResetPin}){
  const [showPins,setShowPins]=useState({});
  const [showCreate,setShowCreate]=useState(false);
  const [showPinReset,setShowPinReset]=useState(false);
  const isFrantisek=adminUser?.id===FRANTISEK_ID;
  const toggle=id=>setShowPins(p=>({...p,[id]:!p[id]}));
  const getPin=u=>pins[u.id]||u.pin;
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Staff ({allUsers.length})</div>
        <div style={{display:"flex",gap:10}}>
          {isFrantisek&&<button onClick={()=>setShowPinReset(true)} style={{padding:"10px 16px",background:"#ef444422",border:"1px solid #ef444444",borderRadius:10,color:"#ef4444",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>🔐 Reset PIN</button>}
          {isFrantisek&&<button onClick={()=>setShowCreate(true)} style={{padding:"10px 20px",background:"#d4a843",border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>+ Create Profile</button>}
        </div>
      </div>
      {!isFrantisek&&<div style={{background:"#111128",border:"1px solid #252540",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#555"}}>
        Profile creation and PIN reset are restricted to Frantisek Kabilka.
      </div>}
      {ROLES.map(role=>{
        const ru=allUsers.filter(u=>u.role===role);if(!ru.length)return null;
        const color=RC[role];
        return(
          <div key={role} style={{marginBottom:28}}>
            <div style={{fontSize:11,color,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:10}}>{RL[role]} ({ru.length})</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10}}>
              {ru.map(u=>{
                const mine=tasks.filter(t=>t.assigneeId===u.id);
                const done=mine.filter(t=>t.status==="done").length;
                const pend=mine.filter(t=>["pending","in_progress"].includes(t.status)).length;
                const rate=mine.length?Math.round(done/mine.length*100):0;
                const loc=liveLocations[u.id];
                const isCustom=u.custom;
                return(
                  <div key={u.id} style={{background:"#111128",border:`1px solid ${color}22`,borderRadius:14,padding:"16px",position:"relative"}}>
                    {isCustom&&<div style={{position:"absolute",top:10,right:10,background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:6,padding:"2px 7px",fontSize:9,color:"#d4a843",fontWeight:700}}>CUSTOM</div>}
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                      <div style={{position:"relative"}}>
                        <Av name={u.name} size={42} color={color}/>
                        {loc&&<div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:"#22c55e",border:"2px solid #111128"}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:"#fff",fontSize:13,fontWeight:700}}>{u.name}</div>
                        <Badge label={RL[role]} color={color} sm/>
                      </div>
                    </div>
                    {loc&&<div style={{background:"#0a1a0a",border:"1px solid #22c55e33",borderRadius:8,padding:"6px 10px",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                      <span>📡</span><span style={{fontSize:11,color:"#22c55e",fontWeight:600}}>{loc.location}</span><span style={{fontSize:9,color:"#555",marginLeft:"auto"}}>{loc.time}</span>
                    </div>}
                    <div style={{background:"#0a0a1a",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>🔐 PIN</div>
                          <div style={{color:showPins[u.id]?color:"#333",fontSize:18,fontWeight:900,letterSpacing:4,fontFamily:"monospace"}}>{showPins[u.id]?getPin(u):"•••••"}</div>
                        </div>
                        <button onClick={()=>toggle(u.id)} style={{background:"transparent",border:`1px solid ${color}44`,borderRadius:8,padding:"5px 10px",color,fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                          {showPins[u.id]?"Hide":"Show"}
                        </button>
                      </div>
                    </div>
                    <div style={{background:"#0a0a1a",borderRadius:10,padding:"8px 12px",marginBottom:10}}>
                      <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>📡 NFC</div>
                      <div style={{color:"#888",fontSize:11,fontFamily:"monospace"}}>{u.nfc}</div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                      {[{l:"Pending",v:pend,c:"#f97316"},{l:"Done",v:done,c:"#22c55e"},{l:"Rate",v:`${rate}%`,c:color}].map(s=>(
                        <div key={s.l} style={{textAlign:"center",background:"#0a0a1a",borderRadius:8,padding:"6px 0"}}>
                          <div style={{fontSize:14,fontWeight:800,color:s.c}}>{s.v}</div>
                          <div style={{fontSize:8,color:"#555",textTransform:"uppercase"}}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{height:3,background:"#1e1e38",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${rate}%`,background:color,borderRadius:3}}/>
                    </div>
                    {isCustom&&isFrantisek&&<button onClick={()=>onDeleteProfile(u.id)} style={{marginTop:10,width:"100%",background:"transparent",border:"1px solid #ef444433",borderRadius:8,padding:"6px",color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Remove Profile</button>}
                    {isFrantisek&&<button onClick={()=>onDeleteStaffData(u.id,u.name)} style={{marginTop:4,width:"100%",background:"transparent",border:"1px solid #ef444433",borderRadius:8,padding:"6px",color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>🗑 Delete All Data</button>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {showCreate&&<CreateProfileModal onSave={onAddProfile} onClose={()=>setShowCreate(false)} existingProfiles={extraProfiles}/>}
      {showPinReset&&<PinResetModal users={allUsers} pins={pins} onSave={onResetPin} onClose={()=>setShowPinReset(false)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LIVE LOCATIONS
// ═══════════════════════════════════════════════════════════
function LiveLocations({liveLocations,allUsers}){
  const active=allUsers.filter(u=>liveLocations[u.id]);
  const byLoc={};
  active.forEach(u=>{const loc=liveLocations[u.id]?.location||liveLocations[u.id]?.name;if(loc){if(!byLoc[loc])byLoc[loc]=[];byLoc[loc].push({...u,...liveLocations[u.id],name:u.name});}});
  const inactive=allUsers.filter(u=>!liveLocations[u.id]);
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Live Locations</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:"#22c55e"}}/>
          <span style={{fontSize:12,color:"#22c55e",fontWeight:600}}>{active.length} staff active</span>
        </div>
      </div>
      <div style={{background:"#0a0a1a",border:"1px solid #22c55e22",borderRadius:14,padding:"12px 18px",marginBottom:20,fontSize:12,color:"#555",display:"flex",gap:10}}>
        <span style={{fontSize:18}}>📡</span><div><span style={{color:"#aaa",fontWeight:600}}>NFC Location Tracking · </span>Staff tap NFC tags at their work area. Checkout requires a live photo.</div>
      </div>
      {Object.keys(byLoc).length>0&&(
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:"#22c55e",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:12}}>Active Now</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
            {Object.entries(byLoc).map(([loc,staff])=>(
              <div key={loc} style={{background:"#111128",border:"1px solid #22c55e22",borderRadius:14,padding:"14px 16px"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#22c55e",marginBottom:10,display:"flex",alignItems:"center",gap:8}}><span>📡</span>{loc}</div>
                {staff.map(s=>{const color=RC[s.role]||"#666";return(
                  <div key={s.id} style={{background:"#0a0a1a",borderRadius:10,marginBottom:8,overflow:"hidden"}}>
                    {/* Photo with name overlay */}
                    {s.photo?(
                      <div style={{position:"relative"}}>
                        <img src={s.photo} alt="location" style={{width:"100%",height:140,objectFit:"cover",display:"block"}}/>
                        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,#000000dd)",padding:"10px 12px"}}>
                          <div style={{fontSize:10,color:"#aaa",marginTop:1}}>{s.taskTitle||""}{s.taskTitle?" · ":""}since {s.time}</div>
                        </div>
                        {/* Name top-right, same colour as location label */}
                        <div style={{position:"absolute",top:8,right:8,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                          <div style={{background:"#000000aa",borderRadius:6,padding:"3px 8px",fontSize:11,color:color,fontWeight:800}}>{s.name}</div>
                          <Badge label={s.role} color={color} sm/>
                        </div>
                      </div>
                    ):(
                      /* No photo — show name prominently */
                      <div style={{padding:"12px",background:`${color}12`,borderBottom:`1px solid ${color}22`,display:"flex",alignItems:"center",gap:10}}>
                        <Av name={s.name} size={36} color={color}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>{s.name}</div>
                          <div style={{fontSize:10,color:color,marginTop:1}}>{s.taskTitle||"Working"}</div>
                        </div>
                        <Badge label={s.role} color={color} sm/>
                      </div>
                    )}
                    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px"}}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>
                      <div style={{fontSize:10,color:"#555"}}>Active since {s.time}</div>
                    </div>
                  </div>
                );})}
              </div>
            ))}
          </div>
        </div>
      )}
      {inactive.length>0&&(
        <div>
          <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:10}}>No Location Set ({inactive.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {inactive.map(u=>{const color=RC[u.role]||"#666";return(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,background:"#111128",border:"1px solid #1e1e38",borderRadius:10,padding:"8px 12px"}}>
                <Av name={u.name} size={26} color={color}/>
                <div><div style={{fontSize:12,fontWeight:600,color:"#666"}}>{u.name}</div><div style={{fontSize:9,color:"#333",textTransform:"uppercase"}}>{u.role}</div></div>
              </div>
            );})}
          </div>
        </div>
      )}
      {active.length===0&&<div style={{textAlign:"center",padding:"60px 0",color:"#555"}}><div style={{fontSize:36,marginBottom:12}}>📡</div>No staff have set their location yet.</div>}
    </div>
  );
}

// Repairs, Orders, Inspections, Locations panels
function RepairsPanel({repairs,allUsers,onUpdate,onDelete}){
  const getUser=id=>allUsers.find(u=>u.id===id);
  return(
    <div>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",marginBottom:20}}>Repair Reports ({repairs.length})</div>
      {repairs.length===0?<div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>No repairs yet</div>
      :[...repairs].sort((a,b)=>b.date>a.date?1:-1).map(r=>{
        const u=getUser(r.reportedBy),uc=PC[r.urgency]||"#6b7280";
        const sc=r.status==="open"?"#f97316":r.status==="in_progress"?"#3b82f6":"#22c55e";
        return(
          <div key={r.id} style={{background:"#111128",border:`1px solid ${uc}22`,borderRadius:14,padding:"16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:10,marginBottom:6}}><span style={{fontSize:20}}>🔧</span><div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{r.title}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:2}}>📍 {r.location} · {df(r.date)} · {u?.name||"Unknown"}</div>
                </div></div>
                {r.description&&<div style={{fontSize:12,color:"#888",marginLeft:30}}>{r.description}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end",marginLeft:12,flexShrink:0}}>
                <Badge label={r.urgency||"medium"} color={uc} sm/>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <select value={r.status} onChange={e=>onUpdate({...r,status:e.target.value})} style={{background:"transparent",border:`1px solid ${sc}44`,borderRadius:8,padding:"3px 8px",color:sc,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif"}}>
                  {["open","in_progress","returned","resolved"].map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
                <button onClick={()=>onDelete(r.id)} style={{background:"transparent",border:"1px solid #ef444433",borderRadius:8,padding:"4px 9px",color:"#ef4444",cursor:"pointer",fontSize:13}}>✕</button>
              </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrdersPanel({orders,allUsers,onUpdate,onDelete,customProducts=[],onAddProduct}){
  const getUser=id=>allUsers.find(u=>u.id===id);
  const [showAdd,setShowAdd]=useState(false);
  const [newProd,setNewProd]=useState({name:"",icon:"🧴"});
  const ICONS=["🫧","🧼","🪣","🚽","🗑️","🧤","🌀","🧹","🧽","🪥","🧴","🧻","📦","🪑","🧺"];
  const generateSuppliesPdf=()=>{
    const pending=orders.filter(o=>o.status==="pending");
    if(!pending.length){alert("No pending supply requests.");return;}
    const w=window.open("","_blank");
    if(!w){alert("Allow popups");return;}
    const dateStr=new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    // Flatten all items across all pending orders
    const allItems={};
    pending.forEach(o=>{
      (o.items||[]).forEach(it=>{
        const k=it.name||it.id;
        if(!allItems[k])allItems[k]={name:it.name,icon:it.icon||"📦",qty:0,locations:[]};
        allItems[k].qty+=it.qty||1;
        if(o.location&&!allItems[k].locations.includes(o.location))allItems[k].locations.push(o.location);
      });
    });
    const items=Object.values(allItems).sort((a,b)=>a.name.localeCompare(b.name));
    const css="*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Helvetica Neue,Arial,sans-serif;color:#111;padding:36px;}.header{border-bottom:3px solid #c9a227;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;}.logo{font-size:22px;font-weight:900;}.logo span{color:#c9a227;}.badge{background:#c9a227;color:#fff;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}.stat{background:#f9f7f0;border:1px solid #e8d99a;border-radius:8px;padding:12px;text-align:center;}.stat-val{font-size:26px;font-weight:900;color:#c9a227;}.stat-label{font-size:10px;text-transform:uppercase;color:#888;margin-top:3px;}.title{font-size:14px;font-weight:800;color:#c9a227;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e8d99a;}table{width:100%;border-collapse:collapse;}th{background:#f0ead5;font-size:9px;text-transform:uppercase;letter-spacing:1px;padding:7px 12px;text-align:left;color:#888;font-weight:700;}td{padding:9px 12px;border-bottom:1px solid #ece8d9;font-size:13px;}tr:last-child td{border-bottom:none;}.qty{font-weight:900;color:#c9a227;font-size:16px;text-align:center;}.loc{font-size:10px;color:#888;}.section{margin-bottom:24px;}.footer{margin-top:32px;padding-top:10px;border-top:1px solid #e8d99a;display:flex;justify-content:space-between;font-size:10px;color:#aaa;}@media print{body{padding:16px;}@page{margin:8mm;}}";
    let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SFH Supply Request</title><style>${css}</style></head><body>`;
    html+=`<div class="header"><div><div class="logo">Soho <span>House</span></div><div style="font-size:11px;color:#888;margin-top:2px">Supplies Request Sheet</div></div><div style="text-align:right"><div class="badge">${dateStr}</div><div style="font-size:10px;color:#aaa;margin-top:4px">Generated ${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div></div></div>`;
    html+=`<div class="summary"><div class="stat"><div class="stat-val">${pending.length}</div><div class="stat-label">Pending Requests</div></div><div class="stat"><div class="stat-val">${items.length}</div><div class="stat-label">Unique Items</div></div><div class="stat"><div class="stat-val">${items.reduce((s,i)=>s+i.qty,0)}</div><div class="stat-label">Total Units</div></div></div>`;
    html+=`<div class="section"><div class="title">Consolidated Shopping List</div><table><tr><th>Item</th><th style="text-align:center">Qty Needed</th><th>Requested For</th></tr>`;
    items.forEach(it=>{
      html+=`<tr><td>${it.icon||"📦"} ${it.name}</td><td class="qty">${it.qty}</td><td class="loc">${it.locations.join(", ")||"—"}</td></tr>`;
    });
    html+=`</table></div>`;
    // Individual requests breakdown
    html+=`<div class="section"><div class="title">Individual Requests (${pending.length})</div><table><tr><th>Location</th><th>Items</th><th>Date</th></tr>`;
    pending.forEach(o=>{
      const itemStr=(o.items||[]).map(it=>`${it.name} ×${it.qty||1}`).join(", ");
      html+=`<tr><td>📍 ${o.location||"—"}</td><td>${itemStr}</td><td>${o.date||"—"}</td></tr>`;
    });
    html+=`</table></div>`;
    html+=`<div class="footer"><span>Soho House Operations</span><span>Print and take to supplies store</span></div></body></html>`;
    w.document.write(html);w.document.close();
    setTimeout(()=>w.print(),500);
  };

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Supply Orders ({orders.length})</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={generateSuppliesPdf} style={{padding:"9px 16px",background:"#22c55e22",border:"1px solid #22c55e44",borderRadius:10,color:"#22c55e",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>📄 PDF Shopping List</button>
          <button onClick={()=>setShowAdd(true)} style={{padding:"9px 16px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:10,color:"#d4a843",fontWeight:700,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>+ Add Product</button>
        </div>
      </div>
      {showAdd&&(
        <div style={{background:"#111128",border:"1px solid #d4a84333",borderRadius:14,padding:"18px",marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:700,color:"#d4a843",marginBottom:12}}>New Supply Product</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,marginBottom:12}}>
            <input style={I} value={newProd.name} onChange={e=>setNewProd(p=>({...p,name:e.target.value}))} placeholder="Product name e.g. Sponges"/>
            <select style={{...I,width:80}} value={newProd.icon} onChange={e=>setNewProd(p=>({...p,icon:e.target.value}))}>
              {ICONS.map(ic=><option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setShowAdd(false)} style={{flex:1,padding:"9px",background:"transparent",border:"1px solid #252540",borderRadius:8,color:"#555",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
            <button onClick={()=>{if(!newProd.name.trim())return;onAddProduct({...newProd,id:"cp_"+Date.now()});setNewProd({name:"",icon:"🧴"});setShowAdd(false);}} style={{flex:2,padding:"9px",background:"#d4a843",border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Add Product</button>
          </div>
        </div>
      )}
      {customProducts.length>0&&(
        <div style={{marginBottom:16,padding:"12px 16px",background:"#111128",border:"1px solid #1e1e38",borderRadius:12}}>
          <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Custom Products (available in mobile app)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {customProducts.map(p=><span key={p.id} style={{fontSize:12,background:"#d4a84322",color:"#d4a843",border:"1px solid #d4a84333",borderRadius:8,padding:"3px 10px"}}>{p.icon} {p.name}</span>)}
          </div>
        </div>
      )}
      {orders.length===0?<div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>No orders yet</div>
      :[...orders].sort((a,b)=>b.date>a.date?1:-1).map(o=>{
        const u=getUser(o.requestedBy),sc=o.status==="pending"?"#f97316":"#22c55e";
        return(
          <div key={o.id} style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:14,padding:"16px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>🛒 {o.location}</div>
                <div style={{fontSize:11,color:"#888",marginBottom:10}}>{dfShort(o.date)} · {u?.name||"Unknown"}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {o.items?.map((it,i)=><span key={i} style={{fontSize:11,color:"#ccc",background:"#0a0a1a",border:"1px solid #252540",borderRadius:8,padding:"3px 10px"}}>{it.icon} {it.name} ×{it.qty}</span>)}
                </div>
              </div>
              <select value={o.status} onChange={e=>onUpdate({...o,status:e.target.value})} style={{background:"transparent",border:`1px solid ${sc}44`,borderRadius:8,padding:"4px 10px",color:sc,fontSize:11,cursor:"pointer",outline:"none",fontFamily:"'DM Sans',sans-serif",marginLeft:12}}>
                {["pending","fulfilled"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InspectionsPanel({inspections,allUsers}){
  const getUser=id=>allUsers.find(u=>u.id===id);
  const sc=s=>s>=90?"#22c55e":s>=70?"#eab308":"#ef4444";
  return(
    <div>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",marginBottom:20}}>Inspections ({inspections.length})</div>
      {inspections.length===0?<div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>No inspections yet</div>
      :[...inspections].sort((a,b)=>b.date>a.date?1:-1).map(ins=>{
        const u=getUser(ins.inspector);
        return(
          <div key={ins.id} style={{background:"#111128",border:`1px solid ${sc(ins.score)}33`,borderRadius:14,padding:"18px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>📍 {ins.location}</div>
                <div style={{fontSize:11,color:"#888",marginBottom:10}}>{dfShort(ins.date)} · {u?.name||"Unknown"}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ins.areas?.filter(a=>a.rating!==null).map((a,i)=>{const c=a.rating>=4?"#22c55e":a.rating>=3?"#eab308":"#ef4444";return <span key={i} style={{fontSize:11,color:c,background:`${c}15`,border:`1px solid ${c}33`,borderRadius:8,padding:"3px 10px"}}>{a.area.split("/")[0].trim()}: {a.rating}/5</span>;})}
                </div>
              </div>
              <div style={{textAlign:"center",minWidth:60}}>
                <div style={{fontSize:36,fontWeight:900,color:sc(ins.score),fontFamily:"Georgia,serif"}}>{ins.score}</div>
                <div style={{fontSize:9,color:"#555",textTransform:"uppercase"}}>Score</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// ROUNDS PANEL — view + edit predefined rounds (Frantisek only)
// ═══════════════════════════════════════════════════════════
function RoundsPanel({rounds,allUsers,adminUser,isFrantisek,onSave}){
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState(null);
  const [showCreate,setShowCreate]=useState(false);
  const [createForm,setCreateForm]=useState({name:"",dept:"cleaner",position:"",focus:"",areas:[],tasks:[],colour:"#4ade80"});
  const RC2={cleaner:"#4ade80",porter:"#fb923c",reception:"#38bdf8"};
  const deptLabel={cleaner:"Cleaner",porter:"Porter",reception:"Reception"};

  const startEdit=r=>{setEditing(r.id);setForm({...r,areas:[...r.areas],tasks:[...r.tasks]});};
  const cancelEdit=()=>{setEditing(null);setForm(null);};
  const saveEdit=()=>{
    const updated=rounds.map(r=>r.id===form.id?{...form}:r);
    onSave(updated);
    setEditing(null);setForm(null);
  };
  const startCreate=()=>{
    setCreateForm({name:"",dept:"cleaner",position:"",focus:"",areas:[""],tasks:[""],colour:"#4ade80"});
    setShowCreate(true);
  };
  const cancelCreate=()=>setShowCreate(false);
  const saveCreate=()=>{
    if(!createForm.name.trim()){alert("Round name required");return;}
    const newRound={
      ...createForm,
      id:"R-"+Date.now(),
      areas:createForm.areas.filter(a=>a.trim()),
      tasks:createForm.tasks.filter(t=>t.trim()),
      colour:RC2[createForm.dept]||"#d4a843",
    };
    onSave([...rounds,newRound]);
    setShowCreate(false);
  };
  const setCF=(k,v)=>setCreateForm(f=>({...f,[k]:v}));
  const setCFArea=(i,v)=>setCreateForm(f=>({...f,areas:f.areas.map((a,ai)=>ai===i?v:a)}));
  const addCFArea=()=>setCreateForm(f=>({...f,areas:[...f.areas,""]}));
  const removeCFArea=i=>setCreateForm(f=>({...f,areas:f.areas.filter((_,ai)=>ai!==i)}));
  const setCFTask=(i,v)=>setCreateForm(f=>({...f,tasks:f.tasks.map((t,ti)=>ti===i?v:t)}));
  const addCFTask=()=>setCreateForm(f=>({...f,tasks:[...f.tasks,""]}));
  const removeCFTask=i=>setCreateForm(f=>({...f,tasks:f.tasks.filter((_,ti)=>ti!==i)}));
  const deleteRound=id=>{if(!confirm("Delete this round?"))return;onSave(rounds.filter(r=>r.id!==id));};
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setArea=(i,v)=>setForm(f=>({...f,areas:f.areas.map((a,ai)=>ai===i?v:a)}));
  const addArea=()=>setForm(f=>({...f,areas:[...f.areas,""]}));
  const removeArea=i=>setForm(f=>({...f,areas:f.areas.filter((_,ai)=>ai!==i)}));
  const setTask=(i,v)=>setForm(f=>({...f,tasks:f.tasks.map((t,ti)=>ti===i?v:t)}));
  const addTask=()=>setForm(f=>({...f,tasks:[...f.tasks,""]}));
  const removeTask=i=>setForm(f=>({...f,tasks:f.tasks.filter((_,ti)=>ti!==i)}));

  // Group by dept
  const byDept={};
  rounds.forEach(r=>{if(!byDept[r.dept])byDept[r.dept]=[];byDept[r.dept].push(r);});

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Predefined Rounds</div>
        {isFrantisek&&<button onClick={startCreate} style={{padding:"10px 20px",background:"#d4a843",border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>+ New Round</button>}
      </div>
      <div style={{fontSize:13,color:"#555",marginBottom:20}}>Pre-configured daily cleaning and porter rounds. Each round can be used to bulk-assign tasks to staff.</div>

      {/* Create modal */}
      {showCreate&&(
        <div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}>
          <div style={{background:"#111128",border:"1px solid #252540",borderRadius:20,width:"100%",maxWidth:680,maxHeight:"92vh",overflow:"auto",padding:"28px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Create New Round</div>
              <button onClick={cancelCreate} style={{background:"transparent",border:"none",color:"#666",cursor:"pointer",fontSize:22}}>✕</button>
            </div>
            <div style={{display:"grid",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div><label style={L}>Round Name *</label><input style={I} value={createForm.name} onChange={e=>setCF("name",e.target.value)} placeholder="e.g. Round 3 — Cleaner 1"/></div>
                <div><label style={L}>Department</label>
                  <select style={I} value={createForm.dept} onChange={e=>setCF("dept",e.target.value)}>
                    {["cleaner","porter","reception","management"].map(d=><option key={d} value={d}>{d.charAt(0).toUpperCase()+d.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={L}>Position Label</label><input style={I} value={createForm.position} onChange={e=>setCF("position",e.target.value)} placeholder="e.g. Cleaner 3"/></div>
              <div><label style={L}>Focus / Description</label><input style={I} value={createForm.focus} onChange={e=>setCF("focus",e.target.value)} placeholder="e.g. Deep clean — toilets & surfaces"/></div>
              <div>
                <label style={L}>Areas ({createForm.areas.filter(a=>a.trim()).length})</label>
                {createForm.areas.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                    <input style={{...I,flex:1}} value={a} onChange={e=>setCFArea(i,e.target.value)} placeholder={`Area ${i+1}…`}/>
                    <button onClick={()=>removeCFArea(i)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,flexShrink:0}}>✕</button>
                  </div>
                ))}
                <button onClick={addCFArea} style={{padding:"7px 14px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>+ Add Area</button>
              </div>
              <div>
                <label style={L}>Task Checklist ({createForm.tasks.filter(t=>t.trim()).length} items)</label>
                {createForm.tasks.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                    <input style={{...I,flex:1}} value={t} onChange={e=>setCFTask(i,e.target.value)} placeholder={`Task ${i+1}…`}/>
                    <button onClick={()=>removeCFTask(i)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,flexShrink:0}}>✕</button>
                  </div>
                ))}
                <button onClick={addCFTask} style={{padding:"7px 14px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>+ Add Task</button>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={cancelCreate} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid #252540",borderRadius:12,color:"#666",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                <button onClick={saveCreate} style={{flex:2,padding:"12px",background:"#d4a843",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Create Round</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing&&form&&(
        <div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}>
          <div style={{background:"#111128",border:"1px solid #252540",borderRadius:20,width:"100%",maxWidth:680,maxHeight:"92vh",overflow:"auto",padding:"28px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>Edit Round</div>
              <button onClick={cancelEdit} style={{background:"transparent",border:"none",color:"#666",cursor:"pointer",fontSize:22}}>✕</button>
            </div>
            <div style={{display:"grid",gap:14}}>
              <div><label style={L}>Round Name</label><input style={I} value={form.name} onChange={e=>setF("name",e.target.value)}/></div>
              <div><label style={L}>Position Label</label><input style={I} value={form.position} onChange={e=>setF("position",e.target.value)} placeholder="e.g. Cleaner 1"/></div>
              <div><label style={L}>Focus / Description</label><input style={I} value={form.focus} onChange={e=>setF("focus",e.target.value)}/></div>
              <div>
                <label style={L}>Areas ({form.areas.length})</label>
                {form.areas.map((a,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                    <input style={{...I,flex:1}} value={a} onChange={e=>setArea(i,e.target.value)} placeholder="Area name…"/>
                    <button onClick={()=>removeArea(i)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,flexShrink:0}}>✕</button>
                  </div>
                ))}
                <button onClick={addArea} style={{padding:"7px 14px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>+ Add Area</button>
              </div>
              <div>
                <label style={L}>Task Checklist ({form.tasks.length} items)</label>
                {form.tasks.map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:6}}>
                    <input style={{...I,flex:1}} value={t} onChange={e=>setTask(i,e.target.value)} placeholder="Task item…"/>
                    <button onClick={()=>removeTask(i)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,flexShrink:0}}>✕</button>
                  </div>
                ))}
                <button onClick={addTask} style={{padding:"7px 14px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",marginTop:4}}>+ Add Task</button>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={cancelEdit} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid #252540",borderRadius:12,color:"#666",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
                <button onClick={saveEdit} style={{flex:2,padding:"12px",background:"#d4a843",border:"none",borderRadius:12,color:"#000",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rounds grid */}
      {Object.entries(byDept).map(([dept,deptRounds])=>{
        const colour=RC2[dept]||"#d4a843";
        return(
          <div key={dept} style={{marginBottom:32}}>
            <div style={{fontSize:11,color:colour,textTransform:"uppercase",letterSpacing:2,fontWeight:700,marginBottom:12}}>
              {deptLabel[dept]||dept} ({deptRounds.length} rounds)
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
              {deptRounds.map(r=>(
                <div key={r.id} style={{background:"#111128",border:`1px solid ${colour}22`,borderRadius:16,padding:"18px",position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div>
                      <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{r.name}</div>
                      <div style={{fontSize:11,color:colour,marginTop:2}}>{r.position}</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{background:`${colour}22`,color:colour,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:10,textTransform:"uppercase"}}>{r.id}</span>
                      {isFrantisek&&<div style={{display:"flex",gap:6}}>
                      <button onClick={()=>startEdit(r)} style={{padding:"5px 12px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>✏️ Edit</button>
                      {r.id.startsWith("R-")&&<button onClick={()=>deleteRound(r.id)} style={{padding:"5px 10px",background:"transparent",border:"1px solid #ef444433",borderRadius:8,color:"#ef4444",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>✕</button>}
                    </div>}
                    </div>
                  </div>
                  <div style={{fontSize:11,color:"#888",fontStyle:"italic",marginBottom:10}}>{r.focus}</div>
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6}}>Areas ({r.areas.length})</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {r.areas.map((a,i)=>(
                        <span key={i} style={{fontSize:10,background:`${colour}15`,color:colour,border:`1px solid ${colour}33`,borderRadius:6,padding:"2px 8px"}}>{a}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:9,color:"#555",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:6}}>Checklist ({r.tasks.length} tasks)</div>
                    {r.tasks.slice(0,4).map((t,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:colour,flexShrink:0}}/>
                        <span style={{fontSize:11,color:"#aaa"}}>{t}</span>
                      </div>
                    ))}
                    {r.tasks.length>4&&<div style={{fontSize:10,color:"#555",marginTop:2}}>+{r.tasks.length-4} more tasks…</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// TIME REPORT PANEL
// ═══════════════════════════════════════════════════════════
function TimeReportPanel({tasks,allUsers}){
  const [date,setDate]=useState(tod());
  const [viewMode,setViewMode]=useState("staff"); // staff | location
  const [expandedKeys,setExpandedKeys]=useState({});
  const [generating,setGenerating]=useState(false);
  const toggleKey=k=>setExpandedKeys(s=>({...s,[k]:!s[k]}));
  const getUser=id=>allUsers.find(u=>u.id===id);

  const toMins=t=>{
    if(!t)return null;
    const p=t.split(":");
    if(p.length<2)return null;
    return parseInt(p[0])*60+parseInt(p[1]);
  };
  const fmtDur=mins=>{
    if(mins===null||isNaN(mins)||mins<0)return "—";
    const h=Math.floor(mins/60),m=mins%60;
    return h>0?`${h}h ${m}m`:`${m}min`;
  };
  const buildTaskTime=t=>{
    const startEntry=(t.photos||[]).find(p=>p.type==="start");
    const startTime=startEntry?.time||t.startTime||null;
    const endTime=t.status==="done"&&t.updatedAt
      ?new Date(t.updatedAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})
      :null;
    const startMins=toMins(startTime);
    const endMins=toMins(endTime);
    const durMins=(startMins!==null&&endMins!==null&&endMins>=startMins)?endMins-startMins:null;
    return{startTime,endTime,durMins};
  };

  const dayTasks=tasks.filter(t=>{
    const created=(t.createdAt||"").slice(0,10);
    const updated=(t.updatedAt||"").slice(0,10);
    return created===date||updated===date;
  });

  const roleOrder={management:0,reception:1,porter:2,cleaner:3};

  // ── By Staff grouping ────────────────────────────────────────────────────
  const byUser={};
  dayTasks.forEach(t=>{const uid=t.assigneeId||"__";if(!byUser[uid])byUser[uid]=[];byUser[uid].push(t);});
  const staffGroups=Object.entries(byUser).sort(([aId],[bId])=>{
    const au=getUser(aId),bu=getUser(bId);
    const ro=(roleOrder[au?.role]??9)-(roleOrder[bu?.role]??9);
    return ro!==0?ro:(au?.name||"").localeCompare(bu?.name||"");
  });

  // ── By Location grouping ─────────────────────────────────────────────────
  const byLoc={};
  dayTasks.forEach(t=>{const l=t.location||"Unknown";if(!byLoc[l])byLoc[l]=[];byLoc[l].push(t);});
  const locGroups=Object.entries(byLoc).sort(([a],[b])=>a.localeCompare(b));

  // ── PDF Generator ────────────────────────────────────────────────────────
  const generatePdf=()=>{
    setGenerating(true);
    setTimeout(()=>{
      const w=window.open("","_blank");
      if(!w){setGenerating(false);alert("Please allow popups");return;}
      const dateLabel=new Date(date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
      const css=[
        "*{margin:0;padding:0;box-sizing:border-box;}",
        "body{font-family:Helvetica Neue,Arial,sans-serif;color:#111;padding:36px;font-size:13px;}",
        ".header{border-bottom:3px solid #c9a227;padding-bottom:18px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;}",
        ".logo{font-size:24px;font-weight:900;} .logo span{color:#c9a227;}",
        ".date-badge{background:#c9a227;color:#fff;padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;}",
        ".summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px;}",
        ".stat{background:#f9f7f0;border:1px solid #e8d99a;border-radius:8px;padding:12px;text-align:center;}",
        ".stat-val{font-size:26px;font-weight:900;color:#c9a227;} .stat-label{font-size:10px;text-transform:uppercase;color:#888;margin-top:3px;}",
        ".section{margin-bottom:24px;}",
        ".section-title{font-size:13px;font-weight:800;color:#c9a227;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #e8d99a;}",
        ".group{background:#f9f7f0;border:1px solid #e8d99a;border-radius:8px;margin-bottom:10px;overflow:hidden;}",
        ".group-header{padding:10px 14px;display:flex;justify-content:space-between;align-items:center;background:#fff;border-bottom:1px solid #e8d99a;}",
        ".group-name{font-size:14px;font-weight:800;} .group-meta{font-size:11px;color:#888;}",
        ".group-total{font-size:14px;font-weight:900;color:#c9a227;}",
        "table{width:100%;border-collapse:collapse;}",
        "th{background:#f0ead5;color:#888;font-size:9px;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;text-align:left;font-weight:700;}",
        "td{padding:8px 14px;border-bottom:1px solid #ece8d9;font-size:12px;}",
        "tr:last-child td{border-bottom:none;}",
        ".dur{font-weight:700;color:#c9a227;font-family:monospace;}",
        ".status-done{color:#22c55e;font-weight:700;} .status-pending{color:#f97316;}",
        ".footer{margin-top:32px;padding-top:12px;border-top:1px solid #e8d99a;display:flex;justify-content:space-between;font-size:10px;color:#aaa;}",
        "@media print{body{padding:16px;}@page{margin:8mm;}}",
      ].join("");

      // Totals
      const totalDone=dayTasks.filter(t=>t.status==="done").length;
      const totalMins=dayTasks.reduce((s,t)=>{const{durMins}=buildTaskTime(t);return s+(durMins||0);},0);
      const uniqueStaff=new Set(dayTasks.map(t=>t.assigneeId)).size;

      let html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>SFH Time Report</title><style>${css}</style></head><body>`;
      html+=`<div class="header"><div><div class="logo">Soho <span>House</span></div><div style="font-size:12px;color:#888;margin-top:3px">Operations Time Report</div></div><div style="text-align:right"><div class="date-badge">${dateLabel}</div><div style="font-size:10px;color:#aaa;margin-top:5px">Generated ${new Date().toLocaleString("en-GB")}</div></div></div>`;
      html+=`<div class="summary"><div class="stat"><div class="stat-val">${totalDone}</div><div class="stat-label">Tasks Completed</div></div><div class="stat"><div class="stat-val">${fmtDur(totalMins)}</div><div class="stat-label">Total Time</div></div><div class="stat"><div class="stat-val">${uniqueStaff}</div><div class="stat-label">Staff Active</div></div></div>`;

      // ── By Staff section ──
      html+=`<div class="section"><div class="section-title">By Staff Member</div>`;
      staffGroups.forEach(([uid,userTasks])=>{
        const u=getUser(uid);
        const uTotal=userTasks.reduce((s,t)=>{const{durMins}=buildTaskTime(t);return s+(durMins||0);},0);
        const uDone=userTasks.filter(t=>t.status==="done").length;
        html+=`<div class="group"><div class="group-header"><div><div class="group-name">${u?.name||"Unassigned"}</div><div class="group-meta">${RL[u?.role]||""} · ${uDone}/${userTasks.length} tasks</div></div><div class="group-total">${fmtDur(uTotal)}</div></div>`;
        html+=`<table><tr><th>Location</th><th>Start</th><th>Finish</th><th>Duration</th><th>Status</th></tr>`;
        userTasks.forEach(t=>{
          const{startTime,endTime,durMins}=buildTaskTime(t);
          const name=t.roundId&&t.location?t.location:t.title;
          const sc=t.status==="done"?"status-done":"status-pending";
          html+=`<tr><td>${name}</td><td style="font-family:monospace">${startTime||"—"}</td><td style="font-family:monospace">${endTime||"—"}</td><td class="dur">${fmtDur(durMins)}</td><td class="${sc}">${t.status.replace("_"," ")}</td></tr>`;
        });
        html+=`</table></div>`;
      });
      html+=`</div>`;

      // ── By Location section ──
      html+=`<div class="section"><div class="section-title">By Location</div>`;
      locGroups.forEach(([loc,locTasks])=>{
        const lTotal=locTasks.reduce((s,t)=>{const{durMins}=buildTaskTime(t);return s+(durMins||0);},0);
        html+=`<div class="group"><div class="group-header"><div><div class="group-name">📍 ${loc}</div><div class="group-meta">${locTasks.length} tasks</div></div><div class="group-total">${fmtDur(lTotal)}</div></div>`;
        html+=`<table><tr><th>Staff</th><th>Task</th><th>Start</th><th>Finish</th><th>Duration</th><th>Status</th></tr>`;
        locTasks.forEach(t=>{
          const u=getUser(t.assigneeId);
          const{startTime,endTime,durMins}=buildTaskTime(t);
          const name=t.roundId&&t.location?t.location:t.title;
          const sc=t.status==="done"?"status-done":"status-pending";
          html+=`<tr><td>${u?.name?.split(" ")[0]||"—"}</td><td>${name}</td><td style="font-family:monospace">${startTime||"—"}</td><td style="font-family:monospace">${endTime||"—"}</td><td class="dur">${fmtDur(durMins)}</td><td class="${sc}">${t.status.replace("_"," ")}</td></tr>`;
        });
        html+=`</table></div>`;
      });
      html+=`</div>`;

      html+=`<div class="footer"><span>Soho House Operations Platform</span><span>Confidential — Management use only</span></div></body></html>`;
      w.document.write(html);w.document.close();
      setTimeout(()=>{w.print();setGenerating(false);},500);
    },100);
  };

  // ── Shared row renderer ──────────────────────────────────────────────────
  const renderRow=(t,showStaff=false)=>{
    const u=showStaff?getUser(t.assigneeId):null;
    const{startTime,endTime,durMins}=buildTaskTime(t);
    const sc=SC[t.status]||"#6b7280";
    const displayName=t.roundId&&t.location?t.location:t.title;
    return(
      <div key={t.id} style={{display:"grid",gridTemplateColumns:showStaff?"1.5fr 1.5fr 0.7fr 0.7fr 0.7fr 0.8fr":"2fr 0.8fr 0.8fr 0.8fr 0.8fr",padding:"10px 18px",borderTop:"1px solid #0a0a1a",alignItems:"center"}}
        onMouseEnter={e=>e.currentTarget.style.background="#0a0a1a"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        {showStaff&&<div style={{fontSize:11,color:"#aaa",display:"flex",alignItems:"center",gap:6}}>
          {u&&<Av name={u.name} size={20} color={RC[u.role]||"#666"}/>}
          <span>{u?.name?.split(" ")[0]||"—"}</span>
        </div>}
        <div>
          <div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{displayName}</div>
          {t.roundId&&<div style={{fontSize:9,color:"#a78bfa"}}>🔄 {t.roundArea}/{t.roundTotal}</div>}
        </div>
        <div style={{fontSize:12,color:startTime?"#aaa":"#2a2a4a",fontFamily:"monospace"}}>{startTime||"—"}</div>
        <div style={{fontSize:12,color:endTime?"#aaa":"#2a2a4a",fontFamily:"monospace"}}>{endTime||"—"}</div>
        <div style={{fontSize:12,color:durMins!==null?"#d4a843":"#2a2a4a",fontWeight:durMins?700:400}}>{fmtDur(durMins)}</div>
        <div><Badge label={t.status.replace("_"," ")} color={sc} sm/></div>
      </div>
    );
  };

  const colHeaders=(showStaff)=>(
    <div style={{display:"grid",gridTemplateColumns:showStaff?"1.5fr 1.5fr 0.7fr 0.7fr 0.7fr 0.8fr":"2fr 0.8fr 0.8fr 0.8fr 0.8fr",padding:"7px 18px",background:"#0a0a1a"}}>
      {(showStaff?["Staff","Location","Start","Finish","Duration","Status"]:["Location","Start","Finish","Duration","Status"]).map(h=>(
        <div key={h} style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:1,fontWeight:700}}>{h}</div>
      ))}
    </div>
  );

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>⏱ Time Report</div>
        <button onClick={generatePdf} disabled={generating||dayTasks.length===0}
          style={{padding:"10px 18px",background:generating||dayTasks.length===0?"#252540":"#d4a843",border:"none",borderRadius:10,color:generating||dayTasks.length===0?"#555":"#000",fontWeight:700,fontSize:12,cursor:generating||dayTasks.length===0?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:8}}>
          {generating?"⏳ Generating…":"📄 Export PDF"}
        </button>
      </div>
      <div style={{fontSize:13,color:"#555",marginBottom:20}}>Time spent per staff member per location</div>

      {/* Controls */}
      <div style={{display:"flex",gap:16,marginBottom:20,alignItems:"flex-end",flexWrap:"wrap"}}>
        <div>
          <label style={L}>Date</label>
          <input type="date" style={{...I,width:180}} value={date} onChange={e=>{setDate(e.target.value);setExpandedKeys({});}}/>
        </div>
        <div>
          <label style={L}>Group by</label>
          <div style={{display:"flex",gap:6}}>
            {[["staff","👤 Staff"],["location","📍 Location"]].map(([v,l])=>(
              <button key={v} onClick={()=>{setViewMode(v);setExpandedKeys({});}}
                style={{padding:"9px 16px",borderRadius:10,background:viewMode===v?"#d4a84322":"transparent",border:`1px solid ${viewMode===v?"#d4a843":"#252540"}`,color:viewMode===v?"#d4a843":"#555",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {dayTasks.length>0&&(()=>{
        const totalDone=dayTasks.filter(t=>t.status==="done").length;
        const totalMins=dayTasks.reduce((s,t)=>{const{durMins}=buildTaskTime(t);return s+(durMins||0);},0);
        return(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
            {[{l:"Tasks Done",v:totalDone+"/"+dayTasks.length,c:"#22c55e"},{l:"Total Time",v:fmtDur(totalMins),c:"#d4a843"},{l:"Staff Active",v:new Set(dayTasks.map(t=>t.assigneeId)).size,c:"#a78bfa"}].map(s=>(
              <div key={s.l} style={{background:"#111128",border:`1px solid ${s.c}22`,borderRadius:12,padding:"14px",textAlign:"center"}}>
                <div style={{fontSize:22,fontWeight:900,color:s.c,fontFamily:"Georgia,serif"}}>{s.v}</div>
                <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginTop:3}}>{s.l}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {dayTasks.length===0&&(
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"48px",textAlign:"center",color:"#555"}}>
          No activity for {new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
        </div>
      )}

      {/* ── By Staff ── */}
      {viewMode==="staff"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {staffGroups.map(([uid,userTasks])=>{
            const u=getUser(uid);
            const color=RC[u?.role]||"#666";
            const isOpen=!!expandedKeys[uid];
            const totalMins=userTasks.reduce((s,t)=>{const{durMins}=buildTaskTime(t);return s+(durMins||0);},0);
            const doneCount=userTasks.filter(t=>t.status==="done").length;
            return(
              <div key={uid} style={{background:"#111128",border:`1px solid ${isOpen?color+"44":"#1e1e38"}`,borderRadius:14,overflow:"hidden"}}>
                <div onClick={()=>toggleKey(uid)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",cursor:"pointer",background:isOpen?`${color}08`:"transparent"}}
                  onMouseEnter={e=>!isOpen&&(e.currentTarget.style.background="#0a0a1a")}
                  onMouseLeave={e=>!isOpen&&(e.currentTarget.style.background="transparent")}>
                  <Av name={u?.name||"?"} size={38} color={color}/>
                  <div style={{flex:1}}>
                    <div style={{color:"#fff",fontSize:14,fontWeight:700}}>{u?.name||"Unassigned"}</div>
                    <div style={{display:"flex",gap:12,marginTop:3}}>
                      <span style={{fontSize:11,color:color}}>{doneCount}/{userTasks.length} tasks</span>
                      {totalMins>0&&<span style={{fontSize:11,color:"#d4a843",fontWeight:700}}>⏱ {fmtDur(totalMins)}</span>}
                    </div>
                  </div>
                  <Badge label={RL[u?.role]||"—"} color={color} sm/>
                  <div style={{fontSize:18,color:isOpen?color:"#555",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s",display:"inline-block",marginLeft:4}}>›</div>
                </div>
                {isOpen&&(<div style={{borderTop:`1px solid ${color}22`}}>
                  {colHeaders(false)}
                  {userTasks.map(t=>renderRow(t,false))}
                  <div style={{display:"grid",gridTemplateColumns:"2fr 0.8fr 0.8fr 0.8fr 0.8fr",padding:"10px 18px",background:`${color}10`,borderTop:`1px solid ${color}33`}}>
                    <div style={{fontSize:11,fontWeight:700,color:color}}>TOTAL</div>
                    <div/><div/>
                    <div style={{fontSize:14,fontWeight:900,color:"#d4a843",fontFamily:"monospace"}}>{fmtDur(totalMins)}</div>
                    <div style={{fontSize:11,color:"#555"}}>{doneCount} done</div>
                  </div>
                </div>)}
              </div>
            );
          })}
        </div>
      )}

      {/* ── By Location ── */}
      {viewMode==="location"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {locGroups.map(([loc,locTasks])=>{
            const isOpen=!!expandedKeys[loc];
            const totalMins=locTasks.reduce((s,t)=>{const{durMins}=buildTaskTime(t);return s+(durMins||0);},0);
            const doneCount=locTasks.filter(t=>t.status==="done").length;
            return(
              <div key={loc} style={{background:"#111128",border:`1px solid ${isOpen?"#38bdf844":"#1e1e38"}`,borderRadius:14,overflow:"hidden"}}>
                <div onClick={()=>toggleKey(loc)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",cursor:"pointer",background:isOpen?"#38bdf808":"transparent"}}
                  onMouseEnter={e=>!isOpen&&(e.currentTarget.style.background="#0a0a1a")}
                  onMouseLeave={e=>!isOpen&&(e.currentTarget.style.background="transparent")}>
                  <div style={{width:38,height:38,borderRadius:10,background:"#38bdf822",border:"1px solid #38bdf844",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>📍</div>
                  <div style={{flex:1}}>
                    <div style={{color:"#fff",fontSize:14,fontWeight:700}}>{loc}</div>
                    <div style={{display:"flex",gap:12,marginTop:3}}>
                      <span style={{fontSize:11,color:"#38bdf8"}}>{doneCount}/{locTasks.length} tasks · {new Set(locTasks.map(t=>t.assigneeId)).size} staff</span>
                      {totalMins>0&&<span style={{fontSize:11,color:"#d4a843",fontWeight:700}}>⏱ {fmtDur(totalMins)}</span>}
                    </div>
                  </div>
                  <div style={{fontSize:18,color:isOpen?"#38bdf8":"#555",transform:isOpen?"rotate(90deg)":"none",transition:"transform .2s",display:"inline-block"}}>›</div>
                </div>
                {isOpen&&(<div style={{borderTop:"1px solid #38bdf822"}}>
                  {colHeaders(true)}
                  {locTasks.map(t=>renderRow(t,true))}
                  <div style={{display:"grid",gridTemplateColumns:"1.5fr 1.5fr 0.7fr 0.7fr 0.7fr 0.8fr",padding:"10px 18px",background:"#38bdf810",borderTop:"1px solid #38bdf833"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#38bdf8"}}>TOTAL</div>
                    <div/><div/><div/>
                    <div style={{fontSize:14,fontWeight:900,color:"#d4a843",fontFamily:"monospace"}}>{fmtDur(totalMins)}</div>
                    <div style={{fontSize:11,color:"#555"}}>{doneCount} done</div>
                  </div>
                </div>)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}



// ── Rota Generator ───────────────────────────────────────────────────────────
// Cleaner 1 tasks (Antonio) = Vacuuming & Mopping (from Round 1 — Cleaner 1)
// Cleaner 2 tasks (Danielli) = Toilets/Surfaces/Dusting (from Round 1 — Cleaner 2)
// Daily clean tasks (standard round)
const TASKS_C1  = ["Vacuum all floor surfaces","Mop all hard floors","Move chairs/furniture and vacuum underneath","Check vacuum bags and replace if needed"];
const TASKS_C2  = ["Clean & sanitise all toilets","Clean thresholds and doorframes","Wipe down all surfaces","Dust shelves, ledges and fixtures","Clean windows and glass panels","Polish all mirrors","Restock soap and paper towels","Empty bins"];
const TASKS_STD = ["Clean & sanitise surfaces","Vacuum/sweep floors","Mop hard floors","Empty bins","Check & restock supplies","Report any damages"];
const TASKS_GRP = ["Clean & sanitise all areas","Vacuum/mop all floors","Empty all bins","Check equipment & supplies","Restock supplies","Report any damages"];

// Deep clean checklist (added ON TOP of daily tasks)
const TASKS_DEEP_EXTRA = ["Move ALL furniture and clean underneath","Scrub grout and tile","Clean light fixtures and vents","Wash windows interior and exterior","Clean walls and skirting boards","Polish all fixtures","Deep clean behind appliances/equipment","Check and reseal any grout if needed"];

// Deep clean for solo worker = daily std + deep extra
const TASKS_DEEP_SOLO = [...TASKS_STD, ...TASKS_DEEP_EXTRA];

// Deep clean for pair — split: C1 gets daily C1 + first half of deep extra, C2 gets daily C2 + second half
const TASKS_DEEP_HALF = Math.ceil(TASKS_DEEP_EXTRA.length / 2);
const TASKS_DEEP_C1 = [...TASKS_C1, ...TASKS_DEEP_EXTRA.slice(0, TASKS_DEEP_HALF)];
const TASKS_DEEP_C2 = [...TASKS_C2, ...TASKS_DEEP_EXTRA.slice(TASKS_DEEP_HALF)];

const ANTONIO_ID  = "u11";
const DANIELLI_ID = "u12";

// 14 slots covering all 20 cleaner locations
const GEN_SLOTS = [
  {label:"Pen Yen",                        locs:["Pen Yen"]},
  {label:"Main Barn",                      locs:["Main Barn"]},
  {label:"Hay Barn",                       locs:["Hay Barn"]},
  {label:"Berenjak",                       locs:["Berenjak"]},
  {label:"Blake's",                        locs:["Blake's"]},
  {label:"Canteen + Canteen Office",       locs:["Canteen","Canteen Office"]},
  {label:"Cinema",                         locs:["Cinema"]},
  {label:"Glasshouse",                     locs:["Glasshouse"]},
  {label:"Barwell",                        locs:["Barwell"]},
  {label:"Boathouse / Gym / Sauna",        locs:["Boathouse","Gym","Sauna & Steam Room"]},
  {label:"Gate House / Check-out",         locs:["Gate House","Check-out House"]},
  {label:"Workshop / Flowers / Soho Home", locs:["Workshop","Flowers","Soho Home"]},
  {label:"Club Reception + Office",        locs:["Club Reception + Office"]},
  {label:"Mill + Toilets",                 locs:["Mill + Toilets"]},
];

function makeTask(loc, assigneeId, taskList, note, isDeep=false){
  return {id:uid(), type:"task", title:loc, location:loc,
    assigneeId, priority:isDeep?"high":"medium", tasks:[...taskList],
    ...(isDeep?{deepClean:true}:{}),
    ...(note?{notes:note}:{})};
}

// pairRotation: { "u11_u12": 0 } — 0 = A is C1, 1 = A is C2 (swapped)
function generateDayRota(staff, deepCleanLocs=[], pairOf={}, pairRotation={}){
  const n=staff.length; if(!n) return [];

  // Build pool from pairOf map (same logic as modal)
  const visited=new Set();
  const pool=[];
  staff.forEach(s=>{
    if(visited.has(s.id))return;
    const partnerId=pairOf[s.id];
    const partner=partnerId&&staff.find(x=>x.id===partnerId);
    if(partner&&!visited.has(partner.id)){
      pool.push({id:`team_\${s.id}_\${partner.id}`,isTeam:true,members:[s,partner]});
      visited.add(s.id);visited.add(partner.id);
    } else {
      pool.push(s);visited.add(s.id);
    }
  });
  const np=pool.length;

  const entries=[];

  GEN_SLOTS.forEach((slot,i)=>{
    const assignee=pool[i%np];
    slot.locs.forEach(loc=>{
      const isDeep=deepCleanLocs.includes(loc);
      // taskList used only for solo workers; pairs use C1/C2 specific lists
      const taskList=slot.locs.length>1?TASKS_GRP:TASKS_STD;

      if(assignee.isTeam){
        const [mA,mB]=assignee.members; // Antonio=C1, Danielli=C2
        const tA=isDeep?TASKS_DEEP_C1:TASKS_C1;
        const tB=isDeep?TASKS_DEEP_C2:TASKS_C2;
        entries.push(makeTask(loc, mA.id, tA, `With ${mB.name.split(" ")[0]} — Vacuum & Mop${isDeep?" (Deep Clean)":""}`, isDeep));
        entries.push(makeTask(loc, mB.id, tB, `With ${mA.name.split(" ")[0]} — Surfaces & Sanitise${isDeep?" (Deep Clean)":""}`, isDeep));
      } else {
        const soloTasks=isDeep?TASKS_DEEP_SOLO:taskList;
        entries.push(makeTask(loc, assignee.id, soloTasks, isDeep?"Daily + Deep Clean":undefined, isDeep));
      }
    });
  });
  return entries;
}


function RotaGeneratorModal({allUsers,onGenerate,onClose,pairRotation={}}){
  const cleaners=allUsers.filter(u=>u.role==="cleaner");
  // Staff selection (who is working)
  const [sel,setSel]=useState(Object.fromEntries(cleaners.map(u=>[u.id,true])));
  // Pairs: pairOf[userId] = partnerId | null
  const [pairOf,setPairOf]=useState({[ANTONIO_ID]:DANIELLI_ID,[DANIELLI_ID]:ANTONIO_ID});
  // Deep clean locations
  const [deepLocs,setDeepLocs]=useState([]);

  const toggleSel=id=>setSel(s=>({...s,[id]:!s[id]}));
  const toggleDeep=loc=>setDeepLocs(d=>d.includes(loc)?d.filter(x=>x!==loc):[...d,loc]);

  const staff=cleaners.filter(u=>sel[u.id]);

  // Set pair: A↔B (bidirectional), or clear if same selected again
  const setPair=(idA,idB)=>{
    setPairOf(p=>{
      const next={...p};
      // Clear existing pairs for A
      Object.keys(next).forEach(k=>{if(next[k]===idA)delete next[k];});
      delete next[idA];
      if(idB){
        // Clear existing pairs for B
        Object.keys(next).forEach(k=>{if(next[k]===idB)delete next[k];});
        delete next[idB];
        next[idA]=idB;
        next[idB]=idA;
      }
      return next;
    });
  };

  // Build pool for generation
  const buildPool=()=>{
    const visited=new Set();
    const pool=[];
    staff.forEach(s=>{
      if(visited.has(s.id))return;
      const partnerId=pairOf[s.id];
      const partner=partnerId&&staff.find(x=>x.id===partnerId);
      if(partner&&!visited.has(partner.id)){
        pool.push({id:`team_${s.id}_${partner.id}`,isTeam:true,members:[s,partner]});
        visited.add(s.id);visited.add(partner.id);
      } else {
        pool.push(s);visited.add(s.id);
      }
    });
    return pool;
  };

  const pool=buildPool();

  // Preview
  const preview=pool.length>0?GEN_SLOTS.map((slot,i)=>({slot,assignee:pool[i%pool.length]})):[];
  const byAssignee={};
  preview.forEach(({slot,assignee})=>{
    const key=assignee.id;
    if(!byAssignee[key])byAssignee[key]={assignee,slots:[]};
    byAssignee[key].slots.push(slot.label);
  });

  const IS2={background:"#0d0d1e",border:"1px solid #252540",borderRadius:8,padding:"6px 10px",color:"#ccc",fontSize:11,fontFamily:"'DM Sans',sans-serif",outline:"none"};

  return(
    <div style={{position:"fixed",inset:0,background:"#000000b0",zIndex:1100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)"}}>
      <div style={{background:"#111128",border:"1px solid #252540",borderRadius:20,width:"100%",maxWidth:620,maxHeight:"92vh",overflow:"auto",padding:"28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:18,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>🔄 Generate Rota</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"#666",cursor:"pointer",fontSize:22}}>✕</button>
        </div>

        {/* Info */}
        <div style={{background:"#38bdf812",border:"1px solid #38bdf833",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#38bdf8",lineHeight:1.6}}>
          All {GEN_SLOTS.length} location slots always assigned. Paired staff share the same locations — Cleaner 1 vacuums & mops, Cleaner 2 cleans surfaces & sanitises.
        </div>

        {/* Who is working */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>
            Who is working? ({staff.length} selected)
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {cleaners.map(u=>(
              <button key={u.id} onClick={()=>toggleSel(u.id)}
                style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,
                  background:sel[u.id]?"#4ade8015":"#0a0a1a",
                  border:`1px solid ${sel[u.id]?"#4ade80":"#252540"}`,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,
                  background:sel[u.id]?"#4ade80":"#1e1e38",
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:800}}>
                  {sel[u.id]?"✓":""}
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:sel[u.id]?"#fff":"#555"}}>{u.name.split(" ")[0]}</div>
                  <div style={{fontSize:9,color:"#444"}}>{u.name.split(" ").slice(1).join(" ")}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Pair assignments */}
        {staff.length>=2&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>
              Working pairs <span style={{color:"#a78bfa",fontSize:10,textTransform:"none",letterSpacing:0,fontWeight:400}}>(pairs share same locations, split C1/C2 tasks)</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {staff.map(u=>{
                const partnerId=pairOf[u.id];
                const partner=staff.find(x=>x.id===partnerId);
                // Only show each pair once (show for member with smaller index)
                const uIdx=staff.findIndex(x=>x.id===u.id);
                const pIdx=partner?staff.findIndex(x=>x.id===partner.id):-1;
                if(partner&&pIdx<uIdx)return null;
                return(
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,background:"#0a0a1a",borderRadius:10,padding:"8px 12px"}}>
                    <span style={{fontSize:12,color:"#fff",fontWeight:600,minWidth:80}}>{u.name.split(" ")[0]}</span>
                    <span style={{fontSize:11,color:"#555"}}>pairs with</span>
                    <select value={pairOf[u.id]||""} onChange={e=>setPair(u.id,e.target.value||null)} style={IS2}>
                      <option value="">— solo —</option>
                      {staff.filter(x=>x.id!==u.id).map(x=>(
                        <option key={x.id} value={x.id}>{x.name.split(" ")[0]} {x.name.split(" ").slice(1).join(" ")}</option>
                      ))}
                    </select>
                    {partner&&(()=>{
                      const rotKey=[u.id,partner.id].sort().join("_");
                      const rot=(pairRotation[rotKey]||0)%2;
                      const c1Name=rot===0?u.name.split(" ")[0]:partner.name.split(" ")[0];
                      const c2Name=rot===0?partner.name.split(" ")[0]:u.name.split(" ")[0];
                      return(
                        <div style={{display:"flex",gap:4,alignItems:"center"}}>
                          <span style={{fontSize:10,color:"#4ade80",background:"#4ade8015",border:"1px solid #4ade8033",borderRadius:6,padding:"2px 8px"}}>C1: {c1Name}</span>
                          <span style={{fontSize:10,color:"#38bdf8",background:"#38bdf815",border:"1px solid #38bdf833",borderRadius:6,padding:"2px 8px"}}>C2: {c2Name}</span>
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deep clean */}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>
            Deep Clean <span style={{color:"#f97316",fontSize:10,textTransform:"none",letterSpacing:0,fontWeight:400}}>(optional — select locations)</span>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {[...CLEANER_LOCATIONS].sort((a,b)=>a.localeCompare(b)).map(loc=>(
              <button key={loc} onClick={()=>toggleDeep(loc)}
                style={{padding:"4px 10px",borderRadius:6,fontSize:10,
                  background:deepLocs.includes(loc)?"#f9731622":"transparent",
                  border:`1px solid ${deepLocs.includes(loc)?"#f97316":"#252540"}`,
                  color:deepLocs.includes(loc)?"#f97316":"#555",
                  cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:deepLocs.includes(loc)?700:400}}>
                {deepLocs.includes(loc)?"🔵 ":""}{loc}
              </button>
            ))}
          </div>
          {deepLocs.length>0&&<div style={{marginTop:6,fontSize:10,color:"#f97316"}}>🔵 {deepLocs.length} location{deepLocs.length>1?"s":""} set for deep clean</div>}
        </div>

        {/* Preview */}
        {staff.length>0&&(
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>
              Preview — {pool.length} slot{pool.length>1?"s":""} for {staff.length} staff
            </div>
            <div style={{background:"#0a0a1a",borderRadius:10,padding:"12px",display:"flex",flexDirection:"column",gap:8}}>
              {Object.values(byAssignee).map(({assignee,slots})=>(
                <div key={assignee.id} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <span style={{color:"#4ade80",fontWeight:700,fontSize:11,minWidth:100,flexShrink:0,paddingTop:2}}>
                    {assignee.isTeam?assignee.members.map(m=>m.name.split(" ")[0]).join(" + "):assignee.name.split(" ")[0]}
                  </span>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {slots.map(s=>(
                      <span key={s} style={{
                        background: deepLocs.some(d=>s.includes(d))?"#f9731622":"#1e1e38",
                        border:`1px solid ${deepLocs.some(d=>s.includes(d))?"#f97316":"#252540"}`,
                        borderRadius:6,padding:"2px 7px",fontSize:10,
                        color: deepLocs.some(d=>s.includes(d))?"#f97316":"#aaa"}}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid #252540",borderRadius:10,color:"#555",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
          <button onClick={()=>{
            if(!staff.length){alert("Select at least 1 cleaner");return;}
            try{
              onGenerate(generateDayRota(staff,deepLocs,pairOf,pairRotation),pairOf);
              onClose();
            }catch(e){alert("Error: "+e.message);}
          }} style={{flex:2,padding:"11px",background:"#d4a843",border:"none",borderRadius:10,color:"#000",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ✨ Generate & Apply
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// WEEKLY PLAN PANEL
// ═══════════════════════════════════════════════════════════
const WEEK_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const WEEK_DAYS_SHORT = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function WeeklyPlanPanel({weeklyPlans,allUsers,rounds,tasks,onSave,onDispatch}){
  const [view,setView]=useState("list"); // list | edit | schedule
  const [editPlan,setEditPlan]=useState(null);
  const [saving,setSaving]=useState(false);

  const todayDow = new Date().getDay(); // 0=Sun,1=Mon...
  const todayName = WEEK_DAYS[(todayDow+6)%7]; // convert to Mon=0

  const createNewPlan=()=>{
    // Find Monday of current week
    const now=new Date();
    const dow=(now.getDay()+6)%7; // Mon=0
    const monday=new Date(now);
    monday.setDate(now.getDate()-dow);
    const mondayStr=monday.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    let weekName="Week of "+mondayStr;
    // If a plan with this week already exists, use next week
    if(weeklyPlans.some(p=>p.name===weekName)){
      const nextMonday=new Date(monday);
      nextMonday.setDate(monday.getDate()+7);
      weekName="Week of "+nextMonday.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    }
    setEditPlan({
      id:"wp_"+Date.now(),
      name:weekName,
      slots: WEEK_DAYS.map(day=>({day, entries:[]})),
      scheduleTime:"07:00",
      active:false,
      lastDispatched:null,
      createdAt:new Date().toISOString(),
    });
    setView("edit");
  };

  const savePlan=async(plan)=>{
    setSaving(true);
    // Use latest weeklyPlans from state (not closure)
    const current=await stor.get(SK.weekly)||[];
    const updated=current.find(p=>p.id===plan.id)
      ?current.map(p=>p.id===plan.id?plan:p)
      :[...current,plan];
    await onSave(updated);
    setSaving(false);
    setView("list");
    setEditPlan(null);
  };

  const deletePlan=async(id)=>{
    if(!confirm("Delete this plan?"))return;
    await onSave(weeklyPlans.filter(p=>p.id!==id));
  };

  const toggleActive=async(plan)=>{
    const updated=weeklyPlans.map(p=>p.id===plan.id?{...p,active:!p.active}:p);
    await onSave(updated);
  };

  // Dispatch today's tasks from a plan
  const dispatchDay=async(plan,dayName,skipConfirm=false)=>{
    // Re-read plan from Supabase to get latest entries (not stale state)
    const freshPlans=await stor.get(SK.weekly)||[];
    const freshPlan=freshPlans.find(p=>p.id===plan.id)||plan;
    const slot=freshPlan.slots.find(s=>s.day===dayName);
    if(!slot||!slot.entries.length){if(!skipConfirm)alert("No tasks defined for "+dayName);return;}
    // Use freshPlan for pairRotation etc
    plan=freshPlan;
    const now=new Date().toISOString();
    const dueDate=new Date().toISOString().slice(0,10);
    // Anti-duplicate: check if staff already has a task from this plan for today
    const existingToday=(await stor.get(SK.tasks)||[]).filter(t=>
      t.weeklyPlanId===plan.id && (t.dueDate||"").slice(0,10)===dueDate
    );
    if(existingToday.length>0){
      if(!skipConfirm)alert(`Already dispatched today — ${existingToday.length} tasks exist for this plan.`);
      return;
    }
    const newTasks=[];
    const rot=plan.pairRotation||{};
    slot.entries.forEach(entry=>{
      if(entry.roundId){
        // Dispatch a round — creates one task per area
        const round=rounds.find(r=>r.id===entry.roundId);
        if(round){
          round.areas.forEach((area,idx)=>{
            newTasks.push({
              id:uid(),title:`${round.name} — ${area}`,
              type:round.dept==="porter"?"porter":"checklist",
              priority:entry.priority||"medium",
              location:area,assigneeId:entry.assigneeId,
              notes:`Weekly Plan: ${plan.name} | ${dayName} | Round: ${round.name}`,
              checklist:round.tasks.map(t=>({label:t,done:false})),
              status:"pending",photos:[],createdAt:now,dueDate,
              roundId:round.id,roundArea:idx+1,roundTotal:round.areas.length,
              weeklyPlanId:plan.id,
            });
          });
        }
      } else {
        // Single task — preserve deepClean flag and priority from generated entry
        newTasks.push({
          id:uid(),title:entry.title,
          type:"checklist",
          priority:entry.priority||"medium",
          location:entry.location,assigneeId:entry.assigneeId,
          notes:(entry.notes?entry.notes+"\n":"")+"Weekly Plan: "+plan.name+" | "+dayName+(entry.deepClean?" | Deep Clean":""),
          checklist:(entry.tasks||[]).map(t=>({label:t,done:false})),
          status:"pending",photos:[],createdAt:now,dueDate,
          weeklyPlanId:plan.id,
          ...(entry.deepClean?{deepClean:true}:{}),
          ...(entry.pairKey?{pairKey:entry.pairKey}:{}),
        });
      }
    });
    if(!newTasks.length){alert("No tasks to dispatch");return;}
    if(!skipConfirm&&!confirm(`Dispatch ${newTasks.length} tasks for ${dayName}?`))return;
    await onDispatch(newTasks);
    // Advance pairRotation for all pairs used today (so next dispatch swaps C1/C2)
    const newRot={...rot};
    slot.entries.forEach(entry=>{
      if(entry.pairKey){
        newRot[entry.pairKey]=(newRot[entry.pairKey]||0)+1;
      }
    });
    const updated=weeklyPlans.map(p=>p.id===plan.id?{...p,lastDispatched:{day:dayName,at:now},pairRotation:newRot}:p);
    await onSave(updated);
    alert(`✓ ${newTasks.length} tasks dispatched for ${dayName}`);
  };

  // Auto-dispatch is handled server-side by Supabase Edge Function + pg_cron
  // No client-side dispatch needed

  if(view==="edit"&&editPlan) return <WeeklyPlanEditor plan={editPlan} allUsers={allUsers} rounds={rounds} onSave={savePlan} onCancel={()=>{setView("list");setEditPlan(null);}} saving={saving}/>;

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>📅 Weekly Plans</div>
        <button onClick={createNewPlan} style={{padding:"10px 20px",background:"#d4a843",border:"none",borderRadius:10,color:"#000",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>+ New Plan</button>
      </div>
      <div style={{fontSize:13,color:"#555",marginBottom:20}}>Create weekly schedules that automatically dispatch tasks at a set time each day</div>

      {weeklyPlans.length===0&&(
        <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"60px",textAlign:"center",color:"#555"}}>
          <div style={{fontSize:40,marginBottom:12}}>📅</div>
          <div style={{fontSize:15,fontWeight:700,color:"#666",marginBottom:8}}>No weekly plans yet</div>
          <div style={{fontSize:13}}>Create a plan to automatically assign tasks each day of the week</div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {weeklyPlans.map(plan=>{
          const todaySlot=plan.slots.find(s=>s.day===todayName);
          const todayCount=todaySlot?.entries?.length||0;
          const totalEntries=plan.slots.reduce((n,s)=>n+(s.entries?.length||0),0);
          const lastD=plan.lastDispatched;
          return(
            <div key={plan.id} style={{background:"#111128",border:`1px solid ${plan.active?"#22c55e44":"#1e1e38"}`,borderRadius:16,padding:"20px"}}>
              {/* Header */}
              <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <div style={{fontSize:16,fontWeight:800,color:"#fff"}}>{plan.name}</div>
                    {plan.active
                      ?<span style={{background:"#22c55e22",border:"1px solid #22c55e44",borderRadius:6,padding:"2px 10px",fontSize:10,color:"#22c55e",fontWeight:700}}>ACTIVE</span>
                      :<span style={{background:"#55555522",border:"1px solid #55555544",borderRadius:6,padding:"2px 10px",fontSize:10,color:"#555",fontWeight:700}}>INACTIVE</span>
                    }
                  </div>
                  <div style={{display:"flex",gap:14,fontSize:11,color:"#555"}}>
                    <span>⏰ Auto-dispatch at {plan.scheduleTime}</span>
                    <span>📋 {totalEntries} schedule entries</span>
                    {lastD&&<span>Last: {new Date(lastD.at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})} ({lastD.day})</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,flexShrink:0}}>
                  <button onClick={()=>toggleActive(plan)}
                    style={{padding:"7px 14px",background:plan.active?"#ef444422":"#22c55e22",border:`1px solid ${plan.active?"#ef444444":"#22c55e44"}`,borderRadius:8,color:plan.active?"#ef4444":"#22c55e",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    {plan.active?"Deactivate":"Activate"}
                  </button>
                  <button onClick={()=>{setEditPlan({...plan,slots:plan.slots.map(s=>({...s,entries:[...s.entries]}))});setView("edit");}}
                    style={{padding:"7px 12px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                    ✏️ Edit
                  </button>
                  <button onClick={()=>deletePlan(plan.id)}
                    style={{padding:"7px 10px",background:"transparent",border:"1px solid #ef444433",borderRadius:8,color:"#ef4444",fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕</button>
                </div>
              </div>

              {/* Day overview grid */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:14}}>
                {WEEK_DAYS.map((day,i)=>{
                  const slot=plan.slots.find(s=>s.day===day);
                  const count=slot?.entries?.length||0;
                  const isToday=day===todayName;
                  return(
                    <div key={day} style={{background:isToday?"#d4a84315":"#0a0a1a",border:`1px solid ${isToday?"#d4a84344":"#1e1e38"}`,borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:isToday?"#d4a843":"#555",fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{WEEK_DAYS_SHORT[i]}</div>
                      <div style={{fontSize:16,fontWeight:900,color:count>0?(isToday?"#d4a843":"#aaa"):"#2a2a4a"}}>{count>0?count:"—"}</div>
                      {count>0&&<div style={{fontSize:8,color:"#555"}}>entries</div>}
                    </div>
                  );
                })}
              </div>

              {/* Manual dispatch buttons */}
              <div style={{borderTop:"1px solid #1e1e38",paddingTop:12}}>
                <div style={{fontSize:10,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:8,fontWeight:700}}>Manual Dispatch</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {WEEK_DAYS.map((day,di)=>{
                    const slot=plan.slots.find(s=>s.day===day);
                    const count=slot?.entries?.length||0;
                    const isToday=day===todayName;
                    const todayDow=(new Date().getDay()+6)%7;
                    const isPast=di<todayDow;
                    const isFuture=di>todayDow;
                    if(!count)return null;
                    return(
                      <button key={day}
                        onClick={()=>!isPast&&dispatchDay(plan,day)}
                        disabled={isPast}
                        title={isPast?"Past day — cannot dispatch":isFuture?"Future day":undefined}
                        style={{padding:"5px 12px",borderRadius:8,
                          background:isToday?"#d4a84322":isPast?"transparent":"transparent",
                          border:`1px solid ${isToday?"#d4a843":isPast?"#252525":"#252540"}`,
                          color:isToday?"#d4a843":isPast?"#333":"#666",
                          fontSize:11,fontWeight:isToday?700:500,
                          cursor:isPast?"not-allowed":"pointer",
                          fontFamily:"'DM Sans',sans-serif",
                          opacity:isPast?0.4:1}}>
                        {isToday?"▶ ":""}{day.slice(0,3)} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Weekly Plan Editor ────────────────────────────────────────────────────────
function WeeklyPlanEditor({plan:initPlan,allUsers,rounds,onSave,onCancel,saving}){
  const [plan,setPlan]=useState(initPlan);
  const [activeDay,setActiveDay]=useState(()=>(new Date().getDay()+6)%7); // default to today
  const [showGenerator,setShowGenerator]=useState(false);
  const set=(k,v)=>setPlan(p=>({...p,[k]:v}));

  // Auto-update plan name when activeDay changes
  const setActiveDayWithName=(dayIdx)=>{
    setActiveDay(dayIdx);
    // Calculate date for that day: today + offset
    const todayDow=(new Date().getDay()+6)%7; // Mon=0
    const diff=dayIdx-todayDow;
    const targetDate=new Date();
    targetDate.setDate(targetDate.getDate()+diff);
    const dayName=WEEK_DAYS[dayIdx];
    const dateStr=targetDate.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    setPlan(p=>({...p,name:dayName+" — "+dateStr}));
  };

  const currentSlot=plan.slots[activeDay];

  const updateSlot=(dayIdx,entries)=>{
    setPlan(p=>({...p,slots:p.slots.map((s,i)=>i===dayIdx?{...s,entries}:s)}));
  };

  const addEntry=(type)=>{
    const entry=type==="round"
      ?{id:uid(),type:"round",roundId:"",assigneeId:"",priority:"medium"}
      :{id:uid(),type:"task",title:"",location:"",assigneeId:"",priority:"medium",tasks:[]};
    updateSlot(activeDay,[...currentSlot.entries,entry]);
  };

  const updateEntry=(entryId,changes)=>{
    updateSlot(activeDay,currentSlot.entries.map(e=>e.id===entryId?{...e,...changes}:e));
  };

  const removeEntry=(entryId)=>{
    updateSlot(activeDay,currentSlot.entries.filter(e=>e.id!==entryId));
  };

  // Copy a day to another day
  const copyDay=(fromIdx,toIdx)=>{
    const copied=plan.slots[fromIdx].entries.map(e=>({...e,id:uid()}));
    updateSlot(toIdx,copied);
  };

  const roleOrder={management:0,reception:1,porter:2,cleaner:3};
  const sortedUsers=[...allUsers].sort((a,b)=>(roleOrder[a.role]??9)-(roleOrder[b.role]??9)||a.name.localeCompare(b.name));

  const IS={background:"#0d0d1e",border:"1px solid #252540",borderRadius:8,padding:"8px 11px",color:"#fff",fontSize:12,fontFamily:"'DM Sans',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"};

  return(
    <>
    <div style={{paddingBottom:40}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif"}}>
            {initPlan.name==="New Weekly Plan"?"New Weekly Plan":"Edit: "+plan.name}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{padding:"10px 16px",background:"transparent",border:"1px solid #252540",borderRadius:10,color:"#555",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Cancel</button>
          <button onClick={()=>onSave(plan)} disabled={saving}
            style={{padding:"10px 20px",background:saving?"#333":"#d4a843",border:"none",borderRadius:10,color:saving?"#666":"#000",fontWeight:700,fontSize:13,cursor:saving?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {saving?"Saving…":"💾 Save Plan"}
          </button>
        </div>
      </div>

      {/* Plan settings */}
      <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:14,padding:"16px",marginBottom:16,display:"grid",gridTemplateColumns:"1fr auto auto",gap:12,alignItems:"end"}}>
        <div>
          <label style={L}>Plan Name</label>
          <input style={IS} value={plan.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Standard Weekly Rota"/>
        </div>
        <div>
          <label style={L}>Auto-dispatch Time</label>
          <input type="time" style={{...IS,width:120}} value={plan.scheduleTime} onChange={e=>set("scheduleTime",e.target.value)}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:2}}>
          <input type="checkbox" id="planActive" checked={plan.active} onChange={e=>set("active",e.target.checked)} style={{width:16,height:16,accentColor:"#22c55e"}}/>
          <label htmlFor="planActive" style={{fontSize:12,color:"#aaa",cursor:"pointer"}}>Active (auto-dispatch)</label>
        </div>
      </div>

      {/* Day tabs */}
      <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto"}}>
        {WEEK_DAYS.map((day,i)=>{
          const count=plan.slots[i]?.entries?.length||0;
          const isActive=activeDay===i;
          return(
            <button key={day} onClick={()=>setActiveDayWithName(i)}
              style={{padding:"8px 14px",borderRadius:10,background:isActive?"#d4a84322":"transparent",border:`1px solid ${isActive?"#d4a843":"#252540"}`,color:isActive?"#d4a843":"#555",fontSize:12,fontWeight:isActive?700:500,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap",flexShrink:0,position:"relative"}}>
              {day}
              {count>0&&<span style={{marginLeft:6,background:isActive?"#d4a843":"#555",color:"#000",borderRadius:10,padding:"1px 6px",fontSize:9,fontWeight:800}}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Copy from another day */}
      <div style={{marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:11,color:"#555"}}>Copy from:</span>
        {WEEK_DAYS.map((day,i)=>i!==activeDay&&(
          <button key={day} onClick={()=>{if(confirm(`Copy ${day} entries to ${WEEK_DAYS[activeDay]}?`))copyDay(i,activeDay);}}
            style={{padding:"4px 10px",borderRadius:6,background:"transparent",border:"1px solid #252540",color:"#555",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            {WEEK_DAYS_SHORT[i]}
          </button>
        ))}
      </div>

      {/* Entries for selected day */}
      <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:14,padding:"16px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{WEEK_DAYS[activeDay]} — {currentSlot?.entries?.length||0} entries</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setShowGenerator(true)} style={{padding:"6px 12px",background:"#38bdf822",border:"1px solid #38bdf844",borderRadius:8,color:"#38bdf8",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✨ Generate Rota</button>
            <button onClick={()=>addEntry("round")}
              style={{padding:"6px 12px",background:"#a78bfa22",border:"1px solid #a78bfa44",borderRadius:8,color:"#a78bfa",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              + Round
            </button>
            <button onClick={()=>addEntry("task")}
              style={{padding:"6px 12px",background:"#d4a84322",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              + Custom Task
            </button>
          </div>
        </div>

        {(!currentSlot?.entries?.length)&&(
          <div style={{textAlign:"center",padding:"32px",color:"#333",fontSize:13}}>
            No entries for {WEEK_DAYS[activeDay]}. Add a Round or Custom Task above.
          </div>
        )}

        {currentSlot?.entries?.map((entry,ei)=>(
          <div key={entry.id} style={{background:"#0a0a1a",border:`1px solid ${entry.type==="round"?"#a78bfa33":"#d4a84333"}`,borderRadius:10,padding:"12px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:10,fontWeight:700,color:entry.type==="round"?"#a78bfa":"#d4a843",textTransform:"uppercase",letterSpacing:1}}>
                {entry.type==="round"?"🔄 Round":"📋 Custom Task"}
              </span>
              <button onClick={()=>removeEntry(entry.id)} style={{background:"transparent",border:"none",color:"#ef4444",cursor:"pointer",fontSize:16}}>✕</button>
            </div>

            {entry.type==="round"?(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.6fr",gap:8}}>
                <div>
                  <label style={L}>Round</label>
                  <select style={IS} value={entry.roundId} onChange={e=>updateEntry(entry.id,{roundId:e.target.value})}>
                    <option value="">Select round…</option>
                    {["cleaner","porter","reception"].map(dept=>(
                      <optgroup key={dept} label={dept.toUpperCase()}>
                        {rounds.filter(r=>r.dept===dept).map(r=>(
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={L}>Assign To</label>
                  <select style={IS} value={entry.assigneeId} onChange={e=>updateEntry(entry.id,{assigneeId:e.target.value})}>
                    <option value="">Select staff…</option>
                    {["management","reception","porter","cleaner"].map(role=>(
                      <optgroup key={role} label={role.toUpperCase()}>
                        {sortedUsers.filter(u=>u.role===role).map(u=>(
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={L}>Priority</label>
                  <select style={IS} value={entry.priority} onChange={e=>updateEntry(entry.id,{priority:e.target.value})}>
                    {["urgent","high","medium","low"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            ):(
              <div style={{display:"grid",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 0.6fr",gap:8}}>
                  <div><label style={L}>Task Title</label><input style={IS} value={entry.title} onChange={e=>updateEntry(entry.id,{title:e.target.value})} placeholder="e.g. Deep Clean Gym"/></div>
                  <div>
                    <label style={L}>Location</label>
                    <select style={IS} value={entry.location} onChange={e=>updateEntry(entry.id,{location:e.target.value})}>
                      <option value="">Select…</option>
                      {ALL_LOCATIONS.sort().map(l=><option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={L}>Priority</label>
                    <select style={IS} value={entry.priority} onChange={e=>updateEntry(entry.id,{priority:e.target.value})}>
                      {["urgent","high","medium","low"].map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={L}>Assign To</label>
                  <select style={IS} value={entry.assigneeId} onChange={e=>updateEntry(entry.id,{assigneeId:e.target.value})}>
                    <option value="">Select staff…</option>
                    {["management","reception","porter","cleaner"].map(role=>(
                      <optgroup key={role} label={role.toUpperCase()}>
                        {sortedUsers.filter(u=>u.role===role).map(u=>(
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={L}>Checklist items (one per line)</label>
                  <textarea style={{...IS,height:72,resize:"none"}}
                    value={(entry.tasks||[]).join("\n")}
                    onChange={e=>updateEntry(entry.id,{tasks:e.target.value.split("\n").filter(Boolean)})}
                    placeholder="Vacuum floors\nMop hard surfaces\nEmpty bins"/>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    {showGenerator&&<RotaGeneratorModal
      allUsers={allUsers}
      pairRotation={plan.pairRotation||{}}
      onGenerate={(entries,pairOf)=>{
          // Tag each entry with pairKey for rotation tracking
          const tagged=entries.map(e=>{
            const partnerId=pairOf?.[e.assigneeId];
            if(!partnerId)return e;
            const pairKey=[e.assigneeId,partnerId].sort().join("_");
            return {...e,pairKey};
          });
          updateSlot(activeDay,[...currentSlot.entries,...tagged]);
        }}
      onClose={()=>setShowGenerator(false)}
    />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// GDPR / DATA & PRIVACY PANEL
// ═══════════════════════════════════════════════════════════
function GdprPanel({allUsers,adminUser}){
  const isFrantisek=adminUser?.id==="u2";
  const rows=[
    {label:"Data Controller",value:"Soho House & Co — Operations Management"},
    {label:"Data Processor",value:"Supabase (EU North-1, Stockholm)"},
    {label:"Hosting",value:"Vercel (Edge Network — EU)"},
    {label:"Personal data collected",value:"Staff first & last name only"},
    {label:"Operational data",value:"Work tasks, location check-ins, checkout photos of locations, repair reports"},
    {label:"Legal basis",value:"Legitimate interest of employer (Art. 6(1)(f) UK GDPR)"},
    {label:"Data retention — tasks",value:"Completed tasks deleted after 12 months (automatic)"},
    {label:"Data retention — photos",value:"Checkout photos deleted after 90 days (automatic)"},
    {label:"Data retention — location",value:"Live location cleared on logout / end of shift"},
    {label:"Right to erasure",value:"Admin can delete all staff data via Staff panel → Delete All Data"},
    {label:"Push notifications",value:"Subscription stored per device, deleted on logout"},
    {label:"Encryption",value:"All data encrypted at rest (Supabase AES-256) and in transit (TLS 1.3)"},
    {label:"Access control",value:"Role-based PIN login — management, reception, porter, cleaner"},
    {label:"Third parties",value:"No data sold or shared with third parties"},
    {label:"Retention cron",value:"Runs every Sunday at 02:00 UTC automatically"},
  ];
  const C="#d4a843";
  return(
    <div>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",marginBottom:4}}>Data & Privacy</div>
      <div style={{fontSize:13,color:"#555",marginBottom:24}}>UK GDPR compliance overview for Soho House Operations Platform</div>

      {/* Status badge */}
      <div style={{background:"#22c55e12",border:"1px solid #22c55e33",borderRadius:14,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
        <div style={{fontSize:28}}>✅</div>
        <div>
          <div style={{fontSize:15,fontWeight:800,color:"#22c55e"}}>UK GDPR Compliant</div>
          <div style={{fontSize:12,color:"#22c55e88",marginTop:2}}>Legitimate interest basis · EU data storage · Automatic retention · Right to erasure implemented</div>
        </div>
      </div>

      {/* Info table */}
      <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,overflow:"hidden",marginBottom:20}}>
        {rows.map((r,i)=>(
          <div key={i} style={{display:"flex",gap:16,padding:"11px 18px",borderBottom:i<rows.length-1?"1px solid #1a1a30":"none",alignItems:"flex-start"}}>
            <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:.8,fontWeight:700,minWidth:210,flexShrink:0,paddingTop:1}}>{r.label}</div>
            <div style={{fontSize:12,color:"#ccc",lineHeight:1.5}}>{r.value}</div>
          </div>
        ))}
      </div>

      {/* What we do NOT collect */}
      <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"18px 20px",marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>What we do NOT collect or store</div>
        {["Personal addresses or contact details","National insurance or ID numbers","Bank or payment information","Health or biometric data","Personal device identifiers","Data outside of working hours"].map((item,i)=>(
          <div key={i} style={{display:"flex",gap:10,alignItems:"center",marginBottom:7}}>
            <div style={{width:16,height:16,borderRadius:"50%",background:"#ef444422",border:"1px solid #ef444444",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#ef4444",flexShrink:0}}>✕</div>
            <div style={{fontSize:12,color:"#888"}}>{item}</div>
          </div>
        ))}
      </div>

      {/* Staff rights */}
      <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"18px 20px",marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>Staff Rights under UK GDPR</div>
        {[
          {right:"Right to be informed",how:"Staff are informed by Soho House HR that this system is in use"},
          {right:"Right of access",how:"Managers can view all data associated with a staff member"},
          {right:"Right to erasure",how:"Admin → Staff panel → Delete All Data removes all records"},
          {right:"Right to rectification",how:"Admin can update name and role at any time"},
          {right:"Right to object",how:"Contact Soho House HR — system use is based on legitimate interest"},
        ].map((r,i)=>(
          <div key={i} style={{marginBottom:10,paddingBottom:10,borderBottom:i<4?"1px solid #1a1a30":"none"}}>
            <div style={{fontSize:12,fontWeight:700,color:C}}>{r.right}</div>
            <div style={{fontSize:11,color:"#666",marginTop:3}}>{r.how}</div>
          </div>
        ))}
      </div>

      {/* Automatic retention status */}
      <div style={{background:"#111128",border:"1px solid #1e1e38",borderRadius:16,padding:"18px 20px"}}>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>Automatic Data Retention Schedule</div>
        {[
          {what:"Completed tasks",when:"Deleted after 12 months",color:"#22c55e"},
          {what:"Checkout photos",when:"Photo data removed after 90 days (metadata kept)",color:"#22c55e"},
          {what:"Live location",when:"Cleared on logout or end of shift",color:"#22c55e"},
          {what:"Push subscriptions",when:"Cleared on logout",color:"#22c55e"},
          {what:"Staff names",when:"Retained while employed — delete via Staff panel",color:"#eab308"},
        ].map((r,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,paddingBottom:8,borderBottom:i<4?"1px solid #1a1a30":"none"}}>
            <div style={{fontSize:12,color:"#aaa"}}>{r.what}</div>
            <div style={{fontSize:11,color:r.color,fontWeight:600}}>{r.when}</div>
          </div>
        ))}
        <div style={{marginTop:8,fontSize:10,color:"#555"}}>🕐 Retention cron runs every Sunday at 02:00 UTC via Supabase pg_cron</div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// ROOT ADMIN APP
// ═══════════════════════════════════════════════════════════
export default function AdminPanel(){
  const [adminUser,setAdminUser]         = useState(null);
  const [extraProfiles,setExtraProfiles] = useState([]);
  const [tasks,setTasks]                 = useState([]);
  const tasksRef = useRef([]);
  const [repairs,setRepairs]             = useState([]);
  const [orders,setOrders]               = useState([]);
  const repairsRef = useRef([]);
  const ordersRef  = useRef([]);
  const [inspections,setInspections]     = useState([]);
  const [checkouts,setCheckouts]         = useState([]);
  const [liveLocations,setLiveLocations] = useState({});
  const [tab,setTab]                     = useState("overview");
  const [loading,setLoading]             = useState(true);
  const [lastSync,setLastSync]           = useState(null);
  const [pins,setPins]                   = useState({}); // overridden PINs
  const [rounds,setRounds]               = useState(DEFAULT_ROUNDS);
  const [customProducts,setCustomProducts] = useState([]);
  const [weeklyPlans,setWeeklyPlans]     = useState([]);

  const allUsers=[...BASE_USERS,...extraProfiles];

  const loadAll=useCallback(async()=>{
    const [tk,r,o,ins,ep,co,pns,rnd,cp]=await Promise.all([
      stor.get(SK.tasks),stor.get(SK.repairs),stor.get(SK.orders),
      stor.get(SK.inspections),stor.get(SK.profiles),stor.get(SK.checkouts),
      stor.get(SK.pins),stor.get(SK.rounds),stor.get("sh5_custom_products"),
    ]);
    if(tk!==null){setTasks(tk);tasksRef.current=tk;}
    if(r!==null){setRepairs(r);repairsRef.current=r;}
    if(o!==null){setOrders(o);ordersRef.current=o;}
    if(ins!==null)setInspections(ins);
    if(ep!==null)setExtraProfiles(ep);
    if(co!==null)setCheckouts(co);
    if(pns!==null)setPins(pns);
    if(rnd!==null)setRounds(rnd);
    if(cp!==null)setCustomProducts(cp);
    const wp=await stor.get(SK.weekly);
    if(wp!==null)setWeeklyPlans(wp);
    const locData={};
    await Promise.all([...BASE_USERS,...(ep||[])].map(async u=>{
      const d=await stor.get(SK.locPrefix+u.id);
      if(d?.location||d?.name)locData[u.id]={...d,location:d.location||d.name};
    }));
    setLiveLocations(locData);
    setLastSync(new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
  },[]);

  useEffect(()=>{
    (async()=>{
      await stor.del(SK.adminSess);
      await loadAll();
      setLoading(false);
    })();
    const iv=setInterval(loadAll,10000);
    return()=>clearInterval(iv);
  },[loadAll]);

  // ── END OF SHIFT ARCHIVE — runs at 7:00am ─────────────────────────────────
  // Moves all completed/approved tasks to inspections with date = previous day
  useEffect(()=>{
    const checkEndOfShift=()=>{
      const now=new Date();
      if(now.getHours()===7&&now.getMinutes()===0){
        const lastRun=localStorage.getItem("sh5_eod_run");
        const today=now.toISOString().slice(0,10);
        if(lastRun===today)return; // already ran today
        localStorage.setItem("sh5_eod_run",today);
        archiveEndOfShift();
      }
    };
    const archiveEndOfShift=async()=>{
      const prevDay=new Date(Date.now()-86400000).toISOString().slice(0,10); // yesterday
      const tk=await stor.get(SK.tasks);
      if(!tk)return;
      const doneTasks=tk.filter(t=>t.status==="done"||t.approvedAt);
      if(!doneTasks.length)return;
      // Create inspection records for each done task
      const ins=await stor.get(SK.inspections)||[];
      const newInspections=doneTasks.map(t=>({
        id:uid(),
        location:t.location||"General",
        inspector:"management",
        date:prevDay, // previous evening
        score:t.approvedAt?100:80,
        areas:[{area:"Task Completion",rating:t.approvedAt?5:4,notes:t.title}],
        taskRef:t.id,
        taskTitle:t.title,
        approvedAt:t.approvedAt||null,
        shiftDate:prevDay,
        archivedAt:new Date().toISOString(),
      }));
      await stor.set(SK.inspections,[...ins,...newInspections]);
      // Remove archived tasks from active list
      const remaining=tk.filter(t=>t.status!=="done"&&!t.approvedAt);
      await stor.set(SK.tasks,remaining);
      setTasks(remaining);
      await loadAll();
    };
    // Check every minute
    const iv=setInterval(checkEndOfShift,60000);
    checkEndOfShift(); // also check on load
    return()=>clearInterval(iv);
  },[loadAll]);

  const handleLogin=async u=>{await stor.set(SK.adminSess,{id:u.id});setAdminUser(u);};
  const handleLogout=async()=>{await stor.del(SK.adminSess);setAdminUser(null);};

  const saveTasks  =async t=>{
    tasksRef.current=t;
    setTasks(t);
    await stor.set(SK.tasks,t);
  };
  // Send push when new tasks are added
  const saveTasksWithNotify=async(newTasks, prevTasks)=>{
    tasksRef.current=newTasks;
    setTasks(newTasks);
    await stor.set(SK.tasks,newTasks);
    // Find newly added tasks
    const added=newTasks.filter(t=>!prevTasks.find(p=>p.id===t.id));
    // Group by assignee
    const byAssignee={};
    added.forEach(t=>{if(!byAssignee[t.assigneeId])byAssignee[t.assigneeId]=[];byAssignee[t.assigneeId].push(t);});
    for(const [uid,ts] of Object.entries(byAssignee)){
      sendPush([uid],{
        title:"📋 New Task Assigned",
        body: ts.length===1 ? (ts[0].roundId&&ts[0].location?ts[0].location:ts[0].title) : `${ts.length} new tasks assigned to you`,
        tag:"new-task-"+uid,
        url:"/",
      });
    }
  };
  const saveRepairs=async(newRepairs,prevRepairs)=>{
    await stor.set(SK.repairs,newRepairs);
    setRepairs(newRepairs);
    if(!prevRepairs)return;
    // Notify staff when repair is returned/rejected
    newRepairs.forEach(r=>{
      const prev=prevRepairs.find(p=>p.id===r.id);
      if(prev&&prev.status!==r.status&&(r.status==="returned"||r.status==="rejected")){
        sendPush([r.reportedBy||r.userId],{
          title:"🔧 Repair Update",
          body:`${r.title||r.location||"Repair"} — ${r.status==="returned"?"Please review and resubmit":"Request rejected"}`,
          tag:"repair-"+r.id,
          requireInteraction:true,
          url:"/",
        });
      }
    });
  };
  const saveOrders =async o=>{ordersRef.current=o;await stor.set(SK.orders,o);setOrders(o);};

  const addProfile=async p=>{const n=[...extraProfiles,p];await stor.set(SK.profiles,n);setExtraProfiles(n);};
  const deleteProfile=async id=>{const n=extraProfiles.filter(p=>p.id!==id);await stor.set(SK.profiles,n);setExtraProfiles(n);};

  const deleteStaffData=async(staffId,staffName)=>{
    if(!confirm("Delete ALL data for "+staffName+"?\n\nThis will remove:\n• All assigned tasks\n• Checkout photos\n• Live location\n• Push subscription\n\nThis cannot be undone."))return;
    try{
      const res=await fetch(SUPABASE_URL+"/rest/v1/rpc/sfh_delete_staff_data",{
        method:"POST",
        headers:{..._h,"Content-Type":"application/json"},
        body:JSON.stringify({staff_id:staffId}),
      });
      if(res.ok){
        await loadAll();
        alert("✓ All data for "+staffName+" has been deleted.");
      } else {
        alert("Error deleting data. Please try again.");
      }
    }catch(e){
      alert("Error: "+e.message);
    }
  };

  const handlePinReset=async(userId,newPin)=>{
    const updated={...pins,[userId]:newPin};
    await stor.set(SK.pins,updated);
    setPins(updated);
  };

  const pendCount=tasks.filter(t=>["pending","in_progress"].includes(t.status)).length;
  const repCount=repairs.filter(r=>r.status==="open").length;
  const ordCount=orders.filter(o=>o.status==="pending").length;
  const locCount=Object.keys(liveLocations).length;

  const navItems=[
    {id:"overview",      l:"Overview",       e:"◈"},
    {id:"tasks",         l:"Tasks",          e:"✓",  badge:pendCount},
    {id:"locations_live",l:"Live Locations", e:"📡", badge:locCount},
    {id:"report",        l:"Daily Report",   e:"📄"},
    {id:"time_report",   l:"Time Report",    e:"⏱"},
    {id:"weekly_plan",   l:"Weekly Plan",    e:"📅"},
    {id:"staff",         l:"Staff",          e:"👤"},
    {id:"repairs",       l:"Repairs",        e:"🔧", badge:repCount},
    {id:"orders",        l:"Supplies",       e:"🛒", badge:ordCount},
    {id:"inspections",   l:"Inspections",    e:"⭐"},
    {id:"rounds",        l:"Rounds",         e:"🔄"},
  ];

  if(loading)return <div style={{minHeight:"100vh",background:"#070714",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:"#d4a843",fontFamily:"Georgia,serif",fontSize:26}}>SFH Admin</div></div>;
  if(!adminUser)return <AdminLogin onLogin={handleLogin} allUsers={allUsers} pins={pins}/>;

  return(
    <div style={{minHeight:"100vh",background:"#070714",fontFamily:"'DM Sans',sans-serif",display:"flex"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{width:220,background:"#09091a",borderRight:"1px solid #181832",display:"flex",flexDirection:"column",padding:"24px 0",flexShrink:0,position:"sticky",top:0,height:"100vh",overflow:"auto"}}>
        <div style={{padding:"0 20px 28px"}}>
          <div style={{fontSize:20,fontWeight:900,color:"#d4a843",fontFamily:"Georgia,serif",letterSpacing:-.5}}>Soho House</div>
          <div style={{fontSize:9,color:"#444",letterSpacing:3,textTransform:"uppercase",marginTop:2}}>Management Portal</div>
          <div style={{width:30,height:1,background:"#d4a84344",marginTop:10}}/>
        </div>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"11px 20px",background:tab===n.id?"#d4a84315":"transparent",border:"none",borderLeft:tab===n.id?"3px solid #d4a843":"3px solid transparent",color:tab===n.id?"#d4a843":"#555",cursor:"pointer",fontSize:13,fontWeight:tab===n.id?700:500,textAlign:"left",fontFamily:"'DM Sans',sans-serif",transition:"all .15s"}}>
            <span style={{fontSize:15}}>{n.e}</span>{n.l}
            {n.badge>0&&<span style={{marginLeft:"auto",background:n.id==="locations_live"?"#22c55e":"#ef4444",color:"#fff",fontSize:10,fontWeight:800,borderRadius:10,padding:"1px 7px"}}>{n.badge}</span>}
          </button>
        ))}
        <div style={{marginTop:"auto",padding:"16px 20px",borderTop:"1px solid #181832"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"8px 10px",background:"#d4a84312",borderRadius:10,border:"1px solid #d4a84322"}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#d4a84325",border:"2px solid #d4a84355",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#d4a843",fontFamily:"Georgia,serif",flexShrink:0}}>
              {adminUser.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:"#d4a843",fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{adminUser.name.split(" ")[0]}</div>
              <div style={{fontSize:9,color:"#555"}}>{adminUser.id===FRANTISEK_ID?"Manager + Profile + PIN Reset":"Manager"}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e"}}/>
            <div style={{fontSize:10,color:"#3a7a54"}}>Live sync · Supabase</div>
          </div>
          <div style={{fontSize:9,color:"#333",marginBottom:6}}>Last: {lastSync||"—"}</div>
          <button onClick={loadAll} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #252540",borderRadius:8,color:"#555",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>↻ Refresh</button>

          <button onClick={async()=>{
            if(!confirm("Archive all completed tasks to Inspections? This will use yesterday's date as the shift date."))return;
            const prevDay=new Date(Date.now()-86400000).toISOString().slice(0,10);
            const doneTasks=tasks.filter(t=>t.status==="done"||t.approvedAt);
            if(!doneTasks.length){alert("No completed tasks to archive.");return;}
            const ins=await stor.get(SK.inspections)||[];
            const newInspections=doneTasks.map(t=>({
              id:uid(),location:t.location||"General",inspector:"management",
              date:prevDay,score:t.approvedAt?100:80,
              areas:[{area:"Task Completion",rating:t.approvedAt?5:4,notes:t.title}],
              taskRef:t.id,taskTitle:t.title,approvedAt:t.approvedAt||null,
              shiftDate:prevDay,archivedAt:new Date().toISOString(),
            }));
            await stor.set(SK.inspections,[...ins,...newInspections]);
            const remaining=tasks.filter(t=>t.status!=="done"&&!t.approvedAt);
            await stor.set(SK.tasks,remaining);
            setTasks(remaining);
            await loadAll();
            alert(`Archived ${doneTasks.length} tasks to Inspections (shift date: ${prevDay})`);
          }} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #d4a84344",borderRadius:8,color:"#d4a843",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>📦 Archive End of Shift</button>
          <button onClick={handleLogout} style={{width:"100%",padding:"6px",background:"transparent",border:"1px solid #ef444433",borderRadius:8,color:"#ef4444",fontSize:10,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Sign Out</button>
        </div>
      </div>
      <div style={{flex:1,padding:"32px",overflowX:"auto",overflowY:"auto"}}>
        {tab==="overview"      &&<Overview tasks={tasks} repairs={repairs} orders={orders} inspections={inspections} liveLocations={liveLocations} allUsers={allUsers} onNav={tabId=>setTab(tabId)}/>}
        {tab==="tasks"         &&<TasksPanel tasks={tasks} allUsers={allUsers} checkouts={checkouts} rounds={rounds} onCreate={t=>saveTasksWithNotify([...tasks,t],tasks)} onCreateMultiple={newTasks=>saveTasksWithNotify([...tasks,...newTasks],tasks)} onUpdate={t=>saveTasks(tasksRef.current.map(x=>x.id===t.id?t:x))} onDelete={id=>saveTasks(tasksRef.current.filter(t=>t.id!==id))} onDeleteCheckout={async id=>{const n=checkouts.filter((_,i)=>i!==id&&_.id!==id);await stor.set(SK.checkouts,n);setCheckouts(n);}}/>}
        {tab==="locations_live"&&<LiveLocations liveLocations={liveLocations} allUsers={allUsers}/>}
        {tab==="report"        &&<DailyReportPanel tasks={tasks} users={extraProfiles} checkouts={checkouts} repairs={repairs} inspections={inspections}/>}
        {tab==="staff"         &&<StaffPanel allUsers={allUsers} tasks={tasks} liveLocations={liveLocations} adminUser={adminUser} onAddProfile={addProfile} onDeleteProfile={deleteProfile} extraProfiles={extraProfiles} pins={pins} onResetPin={handlePinReset}/>}
        {tab==="repairs"       &&<RepairsPanel repairs={repairs} allUsers={allUsers} onUpdate={r=>saveRepairs(repairsRef.current.map(x=>x.id===r.id?r:x))} onDelete={id=>saveRepairs(repairsRef.current.filter(r=>r.id!==id))}/>}
        {tab==="orders"        &&<OrdersPanel orders={orders} allUsers={allUsers} onUpdate={o=>saveOrders(ordersRef.current.map(x=>x.id===o.id?o:x))} onDelete={id=>saveOrders(ordersRef.current.filter(o=>o.id!==id))} customProducts={customProducts} onAddProduct={async p=>{const n=[...customProducts,p];await stor.set("sh5_custom_products",n);setCustomProducts(n);}}/>}
        {tab==="inspections"   &&<InspectionsPanel inspections={inspections} allUsers={allUsers}/>}
        {tab==="gdpr"          &&<GdprPanel allUsers={allUsers} adminUser={adminUser}/>}
        {tab==="rounds"        &&<RoundsPanel rounds={rounds} allUsers={allUsers} adminUser={adminUser} isFrantisek={adminUser?.id===FRANTISEK_ID} onSave={async r=>{await stor.set(SK.rounds,r);setRounds(r);}}/>}
        {tab==="weekly_plan"  &&<WeeklyPlanPanel
          weeklyPlans={weeklyPlans}
          allUsers={allUsers}
          rounds={rounds}
          tasks={tasks}
          onSave={async p=>{await stor.set(SK.weekly,p);setWeeklyPlans(p);}}
          onDispatch={async(newTasks)=>{await saveTasksWithNotify([...tasks,...newTasks],tasks);}}
        />}
        {tab==="time_report"  &&<TimeReportPanel tasks={tasks} allUsers={allUsers}/>}
      </div>
    </div>
  );
}
