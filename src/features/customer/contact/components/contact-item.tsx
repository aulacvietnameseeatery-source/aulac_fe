import "../styles/index.css";

interface ContactItemProps {
  icon: React.ReactNode;
  label: string;
  content: React.ReactNode;
}

export function ContactItem({ icon, label, content }: ContactItemProps) {
  return (
    <div className="contact-item-container">
      <div className="contact-item-icon">{icon}</div>

      <div className="contact-item-content">
        <b className="contact-item-label">{label}</b>
        <div className="contact-item-value">{content}</div>
      </div>
    </div>
  );
}
