import Image from "next/image";
import "../styles/index.css";

export function ForgotPasswordHeader() {
  return (
    <div className="header-wrapper">
      <div className="icon-box">
        <Image src="/images/logo.png" alt="An Lac" width={40} height={40} />
      </div>
      <h1 className="page-title">An Lac</h1>
      <p className="page-subtext">Restaurant Portal</p>
    </div>
  );
}
