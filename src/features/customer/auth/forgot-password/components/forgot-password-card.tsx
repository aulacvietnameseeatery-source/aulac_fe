import { Link } from "@/routing"
import { ChevronLeft } from "lucide-react";
import "../styles/index.css";

export function ForgotPasswordCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrapper">
      <div className="card-container">
        <div className="card-gradient-accent" />
        {children}
        <div className="card-footer">
          <Link href="/login" className="back-link back-link-text">
            <ChevronLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
