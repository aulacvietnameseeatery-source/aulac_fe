import { Playfair_Display, Inter } from "next/font/google";
import "../styles/index.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
