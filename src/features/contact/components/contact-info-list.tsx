import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactItem } from "./contact-item";

export function ContactInfoList() {
  return (
    <div className="flex flex-col gap-10">
      <ContactItem
        icon={<MapPin />}
        label="Our Home"
        content={<>Quai du Mont-Blanc 13<br />1201 Geneva, Switzerland</>}
      />
      <ContactItem
        icon={<Phone />}
        label="Speak With Us"
        content="+41 22 123 45 67"
      />
      <ContactItem
        icon={<Mail />}
        label="Inquiries"
        content="geneva@aulac.ch"
      />
      <ContactItem
        icon={<Clock />}
        label="Hours"
        content="Mon - Sun: 11:30 AM - 11:00 PM"
      />
    </div>
  );
}
