# Quản lý SignalR (WebSocket / Real-time) - Dự án AuLac

Tài liệu này hướng dẫn về cấu trúc, vị trí đặt Hub và cách thêm mới các luồng dữ liệu thời gian thực (Real-time) qua cơ chế SignalR giữa Backend và Frontend trong dự án.

---

## 1. Cấu trúc và Vị trí Hub (Backend)
Để tránh rò rỉ bộ nhớ, thất thoát socket và mở quá nhiều kết nối từ client, dự án gom tất cả luồng Real-time về **01 Hub duy nhất**:
- **Endpoint Hub:** `/hubs/restaurant`
- **Vị trí File Class:** `Api/Hubs/RestaurantHub.cs`
- **Class đại diện:** `RestaurantHub` 

Mọi module/tính năng mới cần real-time đều sẽ Dependency Inject `IHubContext<RestaurantHub>` vào service tương ứng để broadcast dữ liệu thay vì tự tạo thêm các Hub nhỏ lẻ (ví dụ: Không tạo `OrderHub`, `TableHub`).

---

## 2. Hướng dẫn thêm tính năng Real-time (SignalR) mới

Quy trình chuẩn khi mở rộng thêm 01 tính năng cần thiết kế Real-time trong dự án:

### 🔹 Bước 1: Phía Backend (C# REST API)
1. **Thiết kế Interface:** Tạo khai báo Service tại thư mục `Core/Interface/Service/...`
2. **Triển khai Logic:** Thực thi interface đó tại thư mục `Api/SignalR/...` và inject `IHubContext<RestaurantHub>`.
3. **Phát dữ liệu:** Sử dụng `_hubContext.Clients.All.SendAsync("TenSuKienMoi", data);` hoặc chỉ phát theo nhóm (ví dụ: `.Group("orders")` hoặc `.Group($"user:{userId}")`) để linh hoạt điều hướng thông điệp.
4. **Đăng ký Service:** Hãy chắc chắn thêm khai báo Service này vào tệp định tuyến chính `Api/Program.cs`.

### 🔹 Bước 2: Phía Frontend (Next.js React Hook)
1. **Quản lý kết nối chung:** Bắt buộc sử dụng tiện ích kết nối Singleton được xây sẵn là `acquireConnection` tại tệp `src/lib/signalr.ts` để chắc chắn không gọi khởi tạo quá nhiều kết nối trùng lặp làm nghẽn máy chủ.
2. **Khai báo Custom Hook:** Viết một hook riêng biệt (vd: `useMyFeatureSignalR.ts`) tại thư mục của tính năng đó (`src/features/.../hooks/`) để hứng sự kiện:

```typescript
import { useEffect } from 'react';
import { acquireConnection, releaseConnection } from '@/lib/signalr';

export const useMyFeatureSignalR = () => {
  useEffect(() => {
    // 1. Lấy kết nối từ Singleton Manager
    const connection = acquireConnection('/hubs/restaurant');
    
    // 2. Khai báo hàm hứng logic
    const onMyEvent = (data: any) => {
        // Có thể dùng queryClient.invalidateQueries() để gọi lại API mới nhất
        console.log("Nhận event SignalR mới:", data);
    };
    
    // 3. Đăng ký nghe sự kiện
    connection.on("TenSuKienMoi", onMyEvent);
    
    // 4. Cleanup Memory khi Component/Hook bị unmount
    return () => {
        connection.off("TenSuKienMoi", onMyEvent);
        releaseConnection('/hubs/restaurant');
    };
  }, []);
};
```
