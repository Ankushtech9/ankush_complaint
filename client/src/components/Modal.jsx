export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div>{children}</div></div>;
}
