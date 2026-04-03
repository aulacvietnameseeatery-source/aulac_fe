"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPublicGroupSettings } from "@/features/staff/system-settings/services/system-setting.service";
import { formatCHF } from "@/lib/format-chf-utils";
import type { CustomerListDto, CustomerDetailDto } from "../types/customer-types";
import { loyaltyService } from "../services/loyalty-service";
import type { LoyaltyCouponHistoryDto, LoyaltyRedemptionSettings } from "../types/loyalty-types";
import { staffCustomerService } from "../services/customer-service";
import { Loader2, Coins, Gift, History, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";

interface LoyaltyManagementModalProps {
    isOpen: boolean;
    customer: CustomerListDto | null;
    onClose: () => void;
    onSuccess?: () => void;
}

const defaultSettings: LoyaltyRedemptionSettings = {
    redemptionEnabled: false,
    pointsToCurrencyRatio: 0,
    minRedemptionPoints: 0,
};

const parseBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") return value === "true" || value === "1";
    return false;
};

const parseNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value);
    return 0;
};

const formatCurrency = (_locale: string, amount: number) => {
    // Get CHF formatted string, e.g. "CHF 1'000.00"
    let raw = formatCHF(amount);
    // Remove apostrophe as thousands separator
    raw = raw.replace(/'/g, "");
    // Move CHF to the end: "1000.00 CHF"
    const match = raw.match(/^(.*?)(\s?)(CHF)$/);
    if (match) {
        return `${match[1]} CHF`;
    }
    // fallback
    return raw;
};

const formatDateTime = (locale: string, value: string) =>
    new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

export const LoyaltyManagementModal: React.FC<LoyaltyManagementModalProps> = ({
    isOpen,
    customer,
    onClose,
    onSuccess,
}) => {
    const locale = useLocale();
    const t = useTranslations("Customer.Loyalty");
    const tList = useTranslations("Customer.List");

    const [customerDetail, setCustomerDetail] = useState<CustomerDetailDto | null>(null);
    const [history, setHistory] = useState<LoyaltyCouponHistoryDto[]>([]);
    const [settings, setSettings] = useState<LoyaltyRedemptionSettings>(defaultSettings);
    const [redeemPoints, setRedeemPoints] = useState("");
    const [activeTab, setActiveTab] = useState("redeem");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const currentPoints = customerDetail?.loyaltyPoints ?? customer?.loyaltyPoints ?? 0;
    const redeemPointsNumber = Number(redeemPoints || 0);
    const voucherValue = useMemo(() => {
        if (!redeemPointsNumber || !settings.pointsToCurrencyRatio) {
            return 0;
        }

        return redeemPointsNumber * settings.pointsToCurrencyRatio;
    }, [redeemPointsNumber, settings.pointsToCurrencyRatio]);

    const loadData = async () => {
        if (!customer) return;

        setIsLoading(true);
        try {
            const [detailResult, historyResult, settingsResult] = await Promise.allSettled([
                staffCustomerService.getById(customer.customerId),
                loyaltyService.getCustomerCoupons(customer.customerId),
                getPublicGroupSettings("loyalty"),
            ]);

            if (detailResult.status === "fulfilled") {
                setCustomerDetail(detailResult.value);
            } else {
                setCustomerDetail({
                    customerId: customer.customerId,
                    fullName: customer.fullName,
                    phone: customer.phone,
                    email: customer.email,
                    isMember: customer.isMember,
                    loyaltyPoints: customer.loyaltyPoints,
                    createdAt: customer.createdAt,
                });
            }

            if (historyResult.status === "fulfilled") {
                setHistory(historyResult.value);
            } else {
                setHistory([]);
                toast.error(t("notifications.loadError"));
            }

            if (settingsResult.status === "fulfilled") {
                const nextSettings = { ...defaultSettings };
                settingsResult.value.forEach((item) => {
                    const key = item.settingKey.replace("loyalty.", "");

                    if (key === "redemption_enabled") {
                        nextSettings.redemptionEnabled = parseBoolean(item.value);
                    }

                    if (key === "points_to_currency_ratio") {
                        nextSettings.pointsToCurrencyRatio = parseNumber(item.value);
                    }

                    if (key === "min_redemption_points") {
                        nextSettings.minRedemptionPoints = parseNumber(item.value);
                    }
                });

                setSettings(nextSettings);
            } else {
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error("Failed to load loyalty data", error);
            toast.error(t("notifications.loadError"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !customer) {
            setCustomerDetail(null);
            setHistory([]);
            setRedeemPoints("");
            setSettings(defaultSettings);
            setActiveTab("redeem");
            return;
        }

        setRedeemPoints("");
        setActiveTab("redeem");
        loadData();
    }, [isOpen, customer?.customerId]);

    const handleRedeem = async () => {
        if (!customer) return;

        const points = Number(redeemPoints);
        if (!Number.isFinite(points) || points <= 0) {
            toast.error(t("validation.pointsPositive"));
            return;
        }

        if (!settings.redemptionEnabled) {
            toast.error(t("notifications.redemptionDisabled"));
            return;
        }

        if (points < settings.minRedemptionPoints) {
            toast.error(t("validation.minPoints", { points: settings.minRedemptionPoints }));
            return;
        }

        if (points > currentPoints) {
            toast.error(t("validation.insufficientPoints"));
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await loyaltyService.exchangePointsToCoupon({
                customerId: customer.customerId,
                points,
            });

            setCustomerDetail((prev) =>
                prev
                    ? {
                        ...prev,
                        loyaltyPoints: result.remainingPoints,
                    }
                    : prev
            );
            setRedeemPoints("");
            setActiveTab("history");
            await loadData();
            toast.success(t("notifications.exchangeSuccess", { code: result.couponCode }));
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.userMessage || t("notifications.exchangeError"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const statusBadge = (item: LoyaltyCouponHistoryDto) => {
        switch (item.redemptionStatus) {
            case "USED":
                return <Badge variant="secondary">{t("status.used")}</Badge>;
            case "EXPIRED":
                return <Badge variant="destructive">{t("status.expired")}</Badge>;
            case "DISABLED":
                return <Badge variant="warning">{t("status.disabled")}</Badge>;
            default:
                return <Badge variant="success">{t("status.unused")}</Badge>;
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            title={t("title")}
            width="920px"
            footer={
                <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        {/*<Sparkles className="h-4 w-4 text-amber-500" />*/}
                        <span>
                            {t("minPointsHint", { points: settings.minRedemptionPoints })}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            {tList("close")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleRedeem}
                            disabled={isSubmitting || !settings.redemptionEnabled}
                            isLoading={isSubmitting}
                        >
                            {t("redeemButton")}
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-5 p-5">
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm text-gray-500">{t("customer")}</p>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {customerDetail?.fullName || customer?.fullName || tList("labels.guest")}
                                </h3>
                                <p className="text-sm text-gray-500">{customerDetail?.phone || customer?.phone}</p>
                            </div>
                            <div className="rounded-full bg-amber-100 p-3 text-amber-700">
                                <Coins className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white/80 p-3 ring-1 ring-amber-100">
                                <p className="text-xs uppercase tracking-wide text-gray-500">{t("currentPoints")}</p>
                                <p className="mt-1 text-2xl font-bold text-amber-700">
                                    {currentPoints.toLocaleString(locale)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/80 p-3 ring-1 ring-amber-100">
                                <p className="text-xs uppercase tracking-wide text-gray-500">{t("voucherValue")}</p>
                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    {formatCurrency(locale, voucherValue)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p>{t("ratioHint", { amount: formatCurrency(locale, settings.pointsToCurrencyRatio || 0) })}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-4 shadow-sm">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="redeem">
                                    <Gift className="h-4 w-4" />
                                    {t("exchangeTab")}
                                </TabsTrigger>
                                <TabsTrigger value="history">
                                    <History className="h-4 w-4" />
                                    {t("historyTab")}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="redeem" className="mt-4 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        {t("pointsLabel")}
                                    </label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={redeemPoints}
                                        onChange={(e) => setRedeemPoints(e.target.value)}
                                        placeholder={t("pointsPlaceholder")}
                                    />
                                </div>

                                <div className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                                    <div className="flex items-center justify-between">
                                        <span>{t("voucherValue")}</span>
                                        <strong className="text-gray-900">{formatCurrency(locale, voucherValue)}</strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{t("minPointsHint", { points: settings.minRedemptionPoints })}</span>
                                        <strong className="text-gray-900">{settings.minRedemptionPoints.toLocaleString(locale)}</strong>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>{t("currentPoints")}</span>
                                        <strong className="text-gray-900">{currentPoints.toLocaleString(locale)}</strong>
                                    </div>
                                </div>

                                {!settings.redemptionEnabled && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                                        {t("notifications.redemptionDisabled")}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="mt-4">
                                <div className="space-y-3">
                                    {isLoading && (
                                        <div className="flex items-center justify-center py-10 text-gray-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        </div>
                                    )}

                                    {!isLoading && history.length === 0 && (
                                        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                                            {t("historyEmpty")}
                                        </div>
                                    )}

                                    {!isLoading && history.map((item) => (
                                        <div key={item.couponId} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                            <div className="flex flex-wrap items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-gray-900">{item.couponCode}</p>
                                                        {statusBadge(item)}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{item.couponName}</p>
                                                </div>
                                                <p className="text-lg font-bold text-amber-700">
                                                    {formatCurrency(locale, item.discountValue)}
                                                </p>
                                            </div>

                                            <div className="mt-3 grid gap-2 text-xs text-gray-500 md:grid-cols-2">
                                                <div>{formatDateTime(locale, item.startTime)}</div>
                                                <div className="md:text-right">{formatDateTime(locale, item.endTime)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                )}
            </div>
        </Dialog>
    );
};