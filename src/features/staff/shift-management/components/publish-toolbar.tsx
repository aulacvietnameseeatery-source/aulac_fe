"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { Dialog } from "@/components/ui/dialog";
import { usePublishAssignmentsMutation } from "../hooks/use-shift-queries";

interface PublishToolbarProps {
  /** Number of draft assignments in the current week */
  draftCount: number;
  /** Week range to publish (both yyyy-MM-dd) */
  weekStart: string;
  weekEnd: string;
}

export function PublishToolbar({
  draftCount,
  weekStart,
  weekEnd,
}: PublishToolbarProps) {
  const t = useTranslations("shift.schedule.publishToolbar");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const publish = usePublishAssignmentsMutation();

  if (draftCount === 0) return null;

  const handlePublish = () => {
    publish.mutate(
      { fromDate: weekStart, toDate: weekEnd },
      { onSuccess: () => setConfirmOpen(false) }
    );
  };

  return (
    <PermissionGuard permission={Permissions.PublishShift}>
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">
            {t("unpublishedDraft", { count: draftCount })}
          </p>
          <p className="text-xs text-amber-700/70">
            {t("hint")}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 bg-[#1A3A52] hover:bg-[#1A3A52]/90"
          onClick={() => setConfirmOpen(true)}
        >
          <Send className="h-3.5 w-3.5" />
          {t("publishAll")}
        </Button>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t("dialogTitle")}
        width="400px"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publish.isPending}
              isLoading={publish.isPending}
              className="bg-[#1A3A52] hover:bg-[#1A3A52]/90"
            >
              {t("confirmPublish")}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-[#1A3A52]/70">
          {t("dialogDescription", { count: draftCount })}
        </p>
      </Dialog>
    </PermissionGuard>
  );
}
