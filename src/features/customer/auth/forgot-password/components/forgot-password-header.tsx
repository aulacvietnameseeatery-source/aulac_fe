import { playfair, inter } from "@/lib/fonts";
import "../styles/index.css";

export function ForgotPasswordHeader() {
  return (
    <div className={`header-wrapper ${playfair.variable} ${inter.variable}`}>
      <div className="icon-box">
        <span className="material-icons icon">spa</span>
      </div>
      <h1 className="page-title">Au Lac</h1>
      <p className="page-subtext">Restaurant Portal</p>
    </div>
  );
}
