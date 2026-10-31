import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { dateTime } from "../utils/format.js";

export default function ComplaintCard({ complaint }) {
  return <Link className="complaint-card" to={`/complaints/${complaint._id}`}>
    <div className="complaint-card-top"><span>{complaint.complaintNo}</span><StatusBadge status={complaint.status}/></div>
    <h3>{complaint.title}</h3>
    <p>{complaint.description?.slice(0, 105)}{complaint.description?.length > 105 ? "…" : ""}</p>
    <div className="complaint-meta"><span>{complaint.category?.name || "Uncategorized"}</span><span>{dateTime(complaint.createdAt)}</span></div>
  </Link>;
}
