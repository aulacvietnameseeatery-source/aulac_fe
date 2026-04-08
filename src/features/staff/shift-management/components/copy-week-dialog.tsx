"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { Switch } from "@/components/ui/switch";
import { Dialog } from "@/components/ui/dialog";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { useCopyWeekMutation } from "../hooks/use-shift-queries";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function weekLabel(isoDate: string) {
  const mon = new Date(isoDate + "T00:00:00");
  const sun = addDays(mon, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${mon.toLocaleDateString(undefined, opts)} – ${sun.toLocaleDateString(undefined, opts)}`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface CopyWeekDialogProps {
  /** Default source week (Monday in yyyy-MM-dd). Falls back to current week. */
  defaultSource?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CopyWeekDialog({ defaultSource }: CopyWeekDialogProps) {
  const t = useTranslations("shift.schedule.copyWeekDialog");
  const [open, setOpen] = useState(false);

  const defaultMon = defaultSource ?? fmtDate(getMonday(new Date()));

  const [source, setSource] = useState(defaultMon);
  const [target, setTarget] = useState(() => fmtDate(addDays(new Date(defaultMon + "T00:00:00"), 7)));
  const [asDraft, setAsDraft] = useState(true);

  const copy = useCopyWeekMutation();

  // Auto-snap any selected date to the Monday of that week
  const handleSourceChange = (v: string) => {
    const mon = getMonday(new Date(v + "T00:00:00"));
    setSource(fmtDate(mon));
  };

  const handleTargetChange = (v: string) => {
    const mon = getMonday(new Date(v + "T00:00:00"));
    setTarget(fmtDate(mon));
  };

  const handleSubmit = () => {
    copy.mutate(
      {
        sourceWeekStart: source,
        targetWeekStart: target,
        asDraft,
      },
      { onSuccess: () => setOpen(false) }
    );
  };

  return (
    <PermissionGuard permission={Permissions.ScheduleShift}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Copy className="h-3.5 w-3.5" />
        {t("open")}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("title")}
        width="480px"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!source || !target || copy.isPending}
              isLoading={copy.isPending}
            >
              {t("submit")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-5">
          <p className="text-sm text-[#1A3A52]/60">
            {t("description")}
          </p>

          {/* Monday auto-snap info note */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-700">
              {t("mondayNote")}
            </p>
          </div>

          <ALDatePicker
            title={t("sourceTitle")}
            value={source}
            onChange={handleSourceChange}
            placeholder={t("sourcePlaceholder")}
            required
          />
          {source && (
            <p className="text-xs text-[#1A3A52]/50 -mt-2 ml-1">
              {weekLabel(source)}
            </p>
          )}

          <ALDatePicker
            title={t("targetTitle")}
            value={target}
            onChange={handleTargetChange}
            placeholder={t("targetPlaceholder")}
            required
          />
          {target && (
            <p className="text-xs text-[#1A3A52]/50 -mt-2 ml-1">
              {weekLabel(target)}
            </p>
          )}

          <div className="flex items-center gap-3 rounded-lg border border-[#D5BA98]/30 bg-[#FDFBF9] p-3">
            <Switch
              checked={asDraft}
              onChange={setAsDraft}
            />
            <div className="text-sm cursor-pointer">
              {t("asDraft")}
              <span className="block text-xs text-[#1A3A52]/50 font-normal">
                {t("asDraftHint")}
              </span>
            </div>
          </div>
        </div>
      </Dialog>
    </PermissionGuard>
  );
}
