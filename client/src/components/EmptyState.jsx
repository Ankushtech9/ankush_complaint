export default function EmptyState({ title = "Nothing here yet", text = "There are no records to show." }) {
  return <div className="empty-state"><div className="empty-mark">○</div><h3>{title}</h3><p>{text}</p></div>;
}
