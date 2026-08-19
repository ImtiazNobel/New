"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, Bookmark, Check, ChevronLeft, LogOut,
  Menu, MessageSquare, Search, Send, ShieldCheck, Star, UserRound, X
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "/api";

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    let message = "Request failed";
    try { const data = await res.json(); message = data?.error || data?.message || message; } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

function Logo({ small=false }) {
  return <div className={small ? "logo small" : "logo"}>R</div>;
}

function Button({ children, variant="primary", ...props }) {
  return <button className={`btn ${variant}`} {...props}>{children}</button>;
}

function Avatar({ name="User", size=42 }) {
  const initials = String(name).split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase() || "U";
  return <div className="avatar" style={{width:size,height:size}}>{initials}</div>;
}

function Landing({ onLogin, onSignup }) {
  return <div className="public">
    <header className="public-header">
      <div className="brand"><Logo/><span>ResearchHub</span></div>
      <div className="public-actions"><button onClick={onLogin}>Log in</button><Button onClick={onSignup}>Get started</Button></div>
    </header>
    <section className="hero">
      <div className="hero-copy">
        <div className="pill">Academic research collaboration</div>
        <h1>Find the right research connection.</h1>
        <p>ResearchHub connects students with supervisors, research opportunities and academic conversations in one focused workspace.</p>
        <div className="hero-actions"><Button onClick={onSignup}>Create account <ArrowRight size={16}/></Button><button className="ghost" onClick={onLogin}>I already have an account</button></div>
      </div>
      <div className="hero-panel">
        <div className="mini-card"><div className="mini-icon"><Search size={18}/></div><div><b>Discover</b><span>Find supervisors by research area</span></div></div>
        <div className="mini-card"><div className="mini-icon"><MessageSquare size={18}/></div><div><b>Connect</b><span>Start academic conversations</span></div></div>
        <div className="mini-card"><div className="mini-icon"><ShieldCheck size={18}/></div><div><b>Collaborate</b><span>Build your research network</span></div></div>
      </div>
    </section>
    <section className="public-section">
      <div><p className="section-label">BUILT FOR ACADEMIC COLLABORATION</p><h2>Everything you need to find and manage research connections.</h2></div>
      <div className="feature-grid">
        {[
          ["01","Faculty discovery","Search real supervisor profiles from your university database."],
          ["02","Direct messaging","Keep student–supervisor conversations in one place."],
          ["03","Research profiles","Show interests, departments, availability and academic details."]
        ].map(([n,t,d])=><div className="feature" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}
      </div>
    </section>
  </div>
}

function Auth({ mode, setMode, onDone }) {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      if (mode==="signup") {
        const data=await api("/auth/signup",{method:"POST",body:JSON.stringify({name,email,password})});
        onDone(data);
      } else {
        // Backend uses NextAuth credentials. The user can still use the backend's
        // existing sign-in page/flow if credentials are configured there.
        throw new Error("Use the existing authentication flow from your backend for login.");
      }
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return <div className="auth-page">
    <div className="auth-card">
      <button className="back-link" onClick={()=>setMode(null)}><ChevronLeft size={16}/> Back</button>
      <div className="brand center"><Logo/><span>ResearchHub</span></div>
      <h1>{mode==="signup" ? "Create your account" : "Welcome back"}</h1>
      <p>{mode==="signup" ? "Start building your academic profile." : "Sign in to continue."}</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        {mode==="signup" && <label>Full name<input value={name} onChange={e=>setName(e.target.value)} required/></label>}
        <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
        <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
        <Button disabled={loading}>{loading ? "Please wait..." : mode==="signup" ? "Create account" : "Log in"}</Button>
      </form>
      <button className="switch" onClick={()=>setMode(mode==="signup"?"login":"signup")}>{mode==="signup"?"Already have an account? Log in":"Need an account? Sign up"}</button>
    </div>
  </div>
}

function Nav({user,tab,setTab,onLogout}) {
  const student=user?.role==="STUDENT" || user?.role==="student";
  const items=student
    ? [["dashboard","Dashboard"],["directory","Find Supervisors"],["bookmarks","Bookmarks"],["messages","Messages"],["profile","Profile"]]
    : [["dashboard","Dashboard"],["directory","Directory"],["recommendations","Recommendations"],["messages","Messages"],["profile","Profile"]];
  return <header className="app-nav">
    <div className="brand"><Logo/><span>ResearchHub</span></div>
    <nav>{items.map(([k,v])=><button key={k} className={tab===k?"active":""} onClick={()=>setTab(k)}>{v}</button>)}</nav>
    <div className="nav-right"><button className="nav-icon"><Bell size={18}/></button><Avatar name={user?.name}/><button className="logout" onClick={onLogout}><LogOut size={16}/></button></div>
  </header>
}

function PageHeader({title,subtitle,children}) {
  return <div className="page-head"><div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{children}</div>
}

function Dashboard({user,setTab}) {
  const student=user?.role==="STUDENT"||user?.role==="student";
  return <main className="page">
    <PageHeader title={`Welcome back${user?.name?`, ${user.name.split(" ")[0]}`:""}`} subtitle={student?"Explore research opportunities and connect with supervisors.":"Manage your research network and student recommendations."}/>
    <div className="dashboard-hero">
      <div><span className="section-label">YOUR RESEARCH SPACE</span><h2>{student?"Ready to find your research fit?":"Build your next research connection."}</h2><p>{student?"Browse supervisor profiles, save promising matches and start conversations.":"Keep your profile current and connect with students through recommendations and messages."}</p><Button onClick={()=>setTab("directory")}>{student?"Explore supervisors":"Open directory"} <ArrowRight size={16}/></Button></div>
      <div className="dashboard-art"><div className="orb"></div><div className="art-card"><Star size={17}/><b>Research-first</b><span>Profiles built from your database</span></div></div>
    </div>
    <div className="quick-grid">
      {[["Discover","Find supervisors by research interest","directory"],["Messages","Continue academic conversations","messages"],["Profile","Keep your academic details updated","profile"]].map(([a,b,c])=><button className="quick" key={a} onClick={()=>setTab(c)}><span>{a}</span><b>{b}</b><ArrowRight size={16}/></button>)}
    </div>
  </main>
}

function Directory({user,onOpen}) {
  const [items,setItems]=useState([]);
  const [q,setQ]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{api("/supervisors").then(x=>setItems(Array.isArray(x)?x:(x?.supervisors||x?.data||[]))).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
  const filtered=useMemo(()=>items.filter(s=>JSON.stringify(s).toLowerCase().includes(q.toLowerCase())),[items,q]);
  return <main className="page">
    <PageHeader title="Faculty directory" subtitle="Browse supervisor profiles from your ResearchHub database."/>
    <div className="search-row"><div className="search"><Search size={18}/><input placeholder="Search by name, department or research area..." value={q} onChange={e=>setQ(e.target.value)}/></div></div>
    {error&&<div className="error">{error}</div>}
    {loading?<div className="loading">Loading supervisors...</div>:filtered.length===0?<Empty title="No supervisors found" text="There are no matching supervisor profiles in the backend."/>:<div className="profile-grid">{filtered.map(s=><SupervisorCard key={s.id} supervisor={s} onOpen={()=>onOpen(s)}/>)}</div>}
  </main>
}

function SupervisorCard({supervisor,onOpen}) {
  const areas=supervisor.researchAreas||supervisor.research_areas||[];
  return <article className="sup-card">
    <div className="sup-top"><Avatar name={supervisor.name||"Supervisor"} size={56}/><span className={supervisor.acceptingStudents?"status yes":"status"}>{supervisor.acceptingStudents?"Accepting students":"Unavailable"}</span></div>
    <h3>{supervisor.name}</h3><p className="muted">{supervisor.designation||"Supervisor"}</p><p>{supervisor.department||"Department not specified"}</p>
    <div className="tags">{areas.slice(0,4).map((x,i)=><span key={i}>{x}</span>)}</div>
    <div className="sup-bottom"><span className="rating"><Star size={14} fill="currentColor"/> {supervisor.rating?.toFixed?supervisor.rating.toFixed(1):supervisor.rating||"—"}</span><button onClick={onOpen}>View profile <ArrowRight size={14}/></button></div>
  </article>
}

function SupervisorDetail({sup,onBack,setTab}) {
  const [profile,setProfile]=useState(sup);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{if(!sup?.id){setLoading(false);return} api(`/users/${sup.id}`).then(x=>setProfile(x?.user||x)).catch(()=>{}).finally(()=>setLoading(false))},[sup]);
  const areas=profile.researchAreas||profile.research_areas||[];
  return <main className="page"><button className="back-link" onClick={onBack}><ChevronLeft size={16}/> Directory</button>
    <div className="detail-grid"><section className="detail-main"><div className="detail-hero"><Avatar name={profile.name||"Supervisor"} size={84}/><div><span className="section-label">SUPERVISOR PROFILE</span><h1>{profile.name}</h1><p>{profile.designation||"Supervisor"} · {profile.department||"Department"}</p></div></div>
    <div className="detail-section"><h2>About</h2><p>{profile.bio||"No biography has been added yet."}</p></div>
    <div className="detail-section"><h2>Research areas</h2><div className="tags large">{areas.map((x,i)=><span key={i}>{x}</span>)}</div></div>
    </section>
    <aside className="detail-side"><div className="action-card"><h3>Interested in working together?</h3><p>Start a conversation using your ResearchHub account.</p><Button onClick={()=>setTab("messages")}><MessageSquare size={16}/> Message</Button></div><div className="action-card"><h3>Availability</h3><div className="availability"><Check size={16}/>{profile.acceptingStudents?"Currently accepting students":"Not currently accepting students"}</div></div></aside></div>
  </main>
}

function Empty({title,text}){return <div className="empty"><UserRound size={28}/><h3>{title}</h3><p>{text}</p></div>}

function Bookmarks({user,onOpen}) {
  const [items,setItems]=useState([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{api("/bookmarks").then(x=>setItems(x?.bookmarks||x?.data||x||[])).catch(()=>setItems([])).finally(()=>setLoading(false))},[]);
  return <main className="page"><PageHeader title="Bookmarks" subtitle="Your saved supervisor profiles."/>
    {loading?<div className="loading">Loading bookmarks...</div>:items.length?<div className="profile-grid">{items.map(b=><SupervisorCard key={b.id||b.supervisorId} supervisor={b.supervisor||b} onOpen={()=>onOpen(b.supervisor||b)}/>)}</div>:<Empty title="No saved supervisors" text="Save a supervisor from the directory and they will appear here."/>}</main>
}

function Messages({user}) {
  const [conversations,setConversations]=useState([]); const [active,setActive]=useState(null); const [thread,setThread]=useState([]); const [draft,setDraft]=useState(""); const [loading,setLoading]=useState(true);
  async function load(){try{const x=await api("/conversations");setConversations(x?.conversations||x?.data||x||[])}catch{}finally{setLoading(false)}}
  useEffect(()=>{load()},[]);
  async function open(c){setActive(c);try{const id=c.contactId||c.userId||c.id;const x=await api(`/messages/${id}`);setThread(x?.messages||x?.data||x||[])}catch{setThread([])}}
  async function send(){if(!draft.trim()||!active)return;const id=active.contactId||active.userId||active.id;try{const x=await api(`/messages/${id}`,{method:"POST",body:JSON.stringify({content:draft.trim(),message:draft.trim()})});setThread(t=>[...t,(x?.message||x)]);setDraft("")}catch{}}
  return <main className="page"><PageHeader title="Messages" subtitle="Your academic conversations."/><div className="messages">
    <aside className="conversation-list">{loading?<div className="loading">Loading...</div>:conversations.length?conversations.map((c,i)=><button className={active===c?"conversation active":"conversation"} key={c.id||i} onClick={()=>open(c)}><Avatar name={c.name||c.contactName||"User"} size={42}/><div><b>{c.name||c.contactName||"Conversation"}</b><span>{c.lastMessage||"Open conversation"}</span></div></button>):<Empty title="No conversations" text="Your messages will appear here."/>}</aside>
    <section className="chat">{active?<><div className="chat-head"><Avatar name={active.name||active.contactName||"User"}/><div><b>{active.name||active.contactName||"Conversation"}</b><span>ResearchHub contact</span></div></div><div className="thread">{thread.map((m,i)=><div key={m.id||i} className={m.senderId===user?.id?"bubble mine":"bubble"}>{m.content||m.message||""}</div>)}</div><div className="composer"><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Write a message..."/><button onClick={send}><Send size={17}/></button></div></>:<div className="chat-empty"><MessageSquare size={30}/><h3>Select a conversation</h3><p>Choose a conversation to start messaging.</p></div>}</section>
  </div></main>
}

function Recommendations(){const [data,setData]=useState([]);useEffect(()=>{api("/recommendations").then(x=>setData(x?.recommendations||x?.data||x||[])).catch(()=>{})},[]);return <main className="page"><PageHeader title="Recommendations" subtitle="Students recommended through your research network."/><div className="recommend-list">{data.length?data.map((r,i)=><div className="recommend" key={r.id||i}><Avatar name={r.studentName||r.name||"Student"}/><div><b>{r.studentName||r.name||"Student"}</b><p>{r.reason||r.message||"Research recommendation"}</p></div></div>):<Empty title="No recommendations yet" text="Recommendations from your network will appear here."/>}</div></main>}

function Profile({user}) {
  const [data,setData]=useState(user||{}); const [saving,setSaving]=useState(false); const [message,setMessage]=useState("");
  useEffect(()=>{api("/users/me").then(x=>setData(x?.user||x)).catch(()=>{})},[]);
  async function save(e){e.preventDefault();setSaving(true);setMessage("");try{const body={name:data.name,university:data.university,fieldOfInterest:data.fieldOfInterest,bio:data.bio,designation:data.designation,department:data.department,researchAreas:data.researchAreas,acceptingStudents:data.acceptingStudents};const x=await api("/users/me",{method:"PATCH",body:JSON.stringify(body)});setData(x?.user||x);setMessage("Profile saved.")}catch(e){setMessage(e.message)}finally{setSaving(false)}}
  return <main className="page"><PageHeader title="My profile" subtitle="Manage the profile stored in your ResearchHub account."/><form className="profile-form" onSubmit={save}><div className="profile-banner"><Avatar name={data.name||"User"} size={74}/><div><h2>{data.name||"Your profile"}</h2><span>{data.role||"User"}</span></div></div>
    <div className="form-grid"><label>Full name<input value={data.name||""} onChange={e=>setData({...data,name:e.target.value})}/></label><label>Email<input value={data.email||""} disabled/></label><label>University<input value={data.university||""} onChange={e=>setData({...data,university:e.target.value})}/></label><label>Department<input value={data.department||""} onChange={e=>setData({...data,department:e.target.value})}/></label></div>
    <label>Bio<textarea rows="5" value={data.bio||""} onChange={e=>setData({...data,bio:e.target.value})}/></label><div className="form-actions">{message&&<span className="save-msg">{message}</span>}<Button disabled={saving}>{saving?"Saving...":"Save changes"}</Button></div>
  </form></main>
}

export default function Home(){
  const [user,setUser]=useState(null),[screen,setScreen]=useState("landing"),[auth,setAuth]=useState("signup"),[tab,setTab]=useState("dashboard"),[sup,setSup]=useState(null);
  useEffect(()=>{api("/users/me").then(x=>{setUser(x?.user||x);setScreen("app")}).catch(()=>{})},[]);
  if(screen==="landing")return <Landing onLogin={()=>{setAuth("login");setScreen("auth")}} onSignup={()=>{setAuth("signup");setScreen("auth")}}/>;
  if(screen==="auth")return <Auth mode={auth} setMode={m=>m?setAuth(m):setScreen("landing")} onDone={u=>{setUser(u?.user||u);setScreen("app")}}/>;
  function logout(){window.location.href="/api/auth/signout"}
  return <div><Nav user={user} tab={tab} setTab={t=>{setTab(t);setSup(null)}} onLogout={logout}/>
    {tab==="dashboard"&&<Dashboard user={user} setTab={setTab}/>}
    {tab==="directory"&&!sup&&<Directory user={user} onOpen={setSup}/>}
    {tab==="directory"&&sup&&<SupervisorDetail sup={sup} onBack={()=>setSup(null)} setTab={setTab}/>}
    {tab==="bookmarks"&&<Bookmarks user={user} onOpen={setSup}/>}
    {tab==="messages"&&<Messages user={user}/>}
    {tab==="recommendations"&&<Recommendations/>}
    {tab==="profile"&&<Profile user={user}/>}
  </div>
}
