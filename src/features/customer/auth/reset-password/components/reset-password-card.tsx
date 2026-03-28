import { Link } from "@/routing"
import "../styles/index.css";

export function ResetPasswordCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrapper">
      <div className="card-container">
        <div className="card-gradient-accent" />
        {children}
        <div className="card-footer">
          <Link href="/login" className="back-link back-link-text">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
