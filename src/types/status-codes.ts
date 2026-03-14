/**
 * Mirror of backend: Core/Enum/NonConfiguableEnums.cs
 * Dùng string enum để khớp với ValueCode trong Lookup Table.
 * Khi backend thêm/sửa enum → cập nhật file này.
 */

export enum AccountStatusCode {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    LOCKED = "LOCKED",
}

export enum InventoryTxTypeCode {
    IN = "IN",
    OUT = "OUT",
    ADJUST = "ADJUST",
}

export enum InventoryTxStatusCode {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export enum TableStatusCode {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    RESERVED = "RESERVED",
    LOCKED = "LOCKED",
}

export enum ReservationStatusCode {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CHECKED_IN = "CHECKED_IN",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW",
    COMPLETED = "COMPLETED",
}

export enum OrderStatusCode {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
}

export enum OrderItemStatusCode {
    CREATED = "CREATED",
    IN_PROGRESS = "IN_PROGRESS",
    READY = "READY",
    SERVED = "SERVED",
    REJECTED = "REJECTED",
}

export enum DishStatusCode {
    AVAILABLE = "Available",
    OUT_OF_STOCK = "Out Of Stock",
    HIDDEN = "Hidden",
}

export enum PromotionStatusCode {
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    DISABLED = "DISABLED",
}

export enum TableZoneCode {
    INDOOR = "INDOOR",
    OUTDOOR = "OUTDOOR",
    ROOFTOP = "ROOFTOP",
}

export enum RoleStatusCode {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export enum ShiftTypeCode {
    MORNING = "MORNING",
    LUNCH = "LUNCH",
    EVENING = "EVENING",
}

export enum ShiftStatusCode {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    CLOSED = "CLOSED",
    CANCELLED = "CANCELLED",
}

export enum ShiftAssignmentStatusCode {
    ASSIGNED = "ASSIGNED",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
}

export enum AttendanceStatusCode {
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    LATE = "LATE",
    ABSENT = "ABSENT",
    EARLY_LEAVE = "EARLY_LEAVE",
    EXCUSED = "EXCUSED",
}
