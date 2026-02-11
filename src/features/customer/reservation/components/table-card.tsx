import React from 'react';
import Image from 'next/image';
import { Users, Lock, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
export type TableStatus = 'available' | 'reserved' | 'selected';
import { useTranslations } from 'next-intl';
import "../styles/index.css";

interface TableCardProps {
  id: string;
  name: string;
  guests: number;
  image: string;
  status: TableStatus;
  onClick?: () => void;
}

export default function TableCard({ id, name, guests, image, status, onClick }: TableCardProps) {
  const t = useTranslations('Reservation.TableCard');
  const isDisabled = status === 'reserved';

  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className={`table-card-wrapper group ${status === "selected" ? "table-card-selected" : ""
        } ${isDisabled ? "table-card-reserved" : "table-card-available"}`}
    >
      {status === "selected" && (
        <div className="table-selected-badge">
          <Check size={16} strokeWidth={3} />
        </div>
      )}

      <div className="table-image-wrapper">
        <Image
          width={1920}
          height={1080}
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className={`table-image ${isDisabled ? "table-image-disabled" : ""}`}
        />

        {status === "reserved" && (
          <div className="table-reserved-overlay">
            <Lock className="w-10 h-10 text-white/80" strokeWidth={1.5} />
          </div>
        )}

        {status === "available" && (
          <div className="table-available-badge">
            <span className="table-available-badge-text">{t("available")}</span>
          </div>
        )}
      </div>

      <div className="table-footer-wrapper">
        <div className="table-info-wrapper">
          <h3
            className={`table-name ${status === "selected"
                ? "table-name-selected"
                : "table-name-default"
              }`}
          >
            {name}
          </h3>
          <div className="table-guest-info">
            <Users size={16} />
            <span>{t("guests", { count: guests })}</span>
          </div>
        </div>
        <div className="table-action-wrapper">
          {status === "available" && (
            <div className="table-arrow-button table-arrow-button-hover">
              <ArrowRight size={16} />
            </div>
          )}
          {status === "reserved" && (
            <span className="table-reserved-text">{t("reserved")}</span>
          )}
          {status === "selected" && (
            <span className="table-selected-text">{t("selected")}</span>
          )}
        </div>
      </div>
    </div>
  );
};