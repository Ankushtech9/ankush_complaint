import { useEffect, useState } from "react";
import api from "../services/api.js";
import { dateTime } from "../utils/format.js";

export default function Activity() {
  const [items,setItems]=useState([]);
  useEffect(()=>{api.get("/activity-logs").then(r=>setItems(r.data.items))},[]);
  return <><div className="page-head"><div><span className="eyebrow">Administration</span><h1>Activity log</h1><p>A trace of important actions across the platform.</p></div></div><div className="panel"><div className="activity-list">{items.map(x=><div className="activity" key={x._id}><div className="activity-mark">•</div><div><strong>{x.action}</strong><p>{x.details||x.entity}</p><small>{x.actor?.name||"System"} · {dateTime(x.createdAt)}</small></div></div>)}</div></div></>;
}
