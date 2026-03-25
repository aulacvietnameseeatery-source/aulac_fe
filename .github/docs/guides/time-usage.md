# Hướng dẫn sử dụng Thời gian (Timezone Handling)

Tài liệu này hướng dẫn cách xử lý thời gian đồng nhất giữa Frontend (FE) và Backend (BE) để tránh lỗi lệch múi giờ (ví dụ: lệch 5 tiếng hoặc 7 tiếng).

---

## Nguyên tắc chung
1. **Lưu trữ & Truyền tải**: Luôn sử dụng múi giờ **UTC** (hậu tố `Z`).
2. **Hiển thị**: Chỉ chuyển đổi sang giờ địa phương (**Local Time**) tại lớp hiển thị cuối cùng trên trình duyệt.
3. **Frontend**: Sử dụng thư viện trung tâm `date-utils.ts`.
4. **Backend**: Đảm bảo mọi đối tượng `DateTime` gửi về FE đều được đánh dấu là `DateTimeKind.Utc`.

---

## 1. Frontend (Next.js)

Sử dụng các tiện ích trong `src/lib/date-utils.ts`.

### A. Gửi dữ liệu lên Backend (`toUtcIso`)
Khi người dùng chọn ngày và giờ trên UI (giờ địa phương), hãy chuyển đổi sang chuỗi UTC ISO trước khi gửi API.

```typescript
import { dateUtils } from '@/lib/date-utils';

const localDate = "2026-03-25"; // Từ component chọn ngày
const localTime = "10:00";      // Từ component chọn giờ

const reservedTime = dateUtils.toUtcIso(localDate, localTime);
// Kết quả: "2026-03-25T03:00:00.000Z" (Nếu trình duyệt ở GMT+7)

// Gửi payload lên API
await api.createReservation({ reservedTime });
```

### B. Hiển thị dữ liệu từ Backend (`formatLocal`)
Khi nhận chuỗi thời gian từ API, hãy dùng `formatLocal` để hiển thị đúng giờ của người dùng.

```typescript
import { dateUtils } from '@/lib/date-utils';

// Giả sử reservation.reservedTime = "2026-03-25T03:00:00Z"
const displayTime = dateUtils.formatLocal(reservation.reservedTime, "HH:mm");
// Kết quả: "10:00" (Nếu trình duyệt ở GMT+7)

const displayDate = dateUtils.formatLocal(reservation.reservedTime, "dd/MM/yyyy");
// Kết quả: "25/03/2026"
```

### C. Kiểm tra thời gian trong quá khứ (`isPast`)
Dùng để validate form ngay tại FE.

```typescript
if (dateUtils.isPast(date, time)) {
    toast.error("Vui lòng không chọn thời gian trong quá khứ");
}
```

---

## 2. Backend (ASP.NET Core / C#)

### A. Sử dụng UTC cho thời gian hệ thống
Luôn sử dụng `DateTime.UtcNow` thay vì `DateTime.Now`.

```csharp
var reservation = new Reservation {
    CreatedAt = DateTime.UtcNow, // Đúng
    // CreatedAt = DateTime.Now  // SAI - sẽ lấy giờ của server
};
```

### B. Đảm bảo Serializer thêm hậu tố 'Z'
Khi đọc dữ liệu từ Database (MySQL `datetime` không lưu trữ múi giờ), Entity Framework sẽ trả về `DateTime` với `Kind = Unspecified`. Để JSON Serializer biết đây là UTC và thêm chữ `Z`, bạn cần dùng `DateTime.SpecifyKind`.

**Trong Service hoặc Repository:**

```csharp
public async Task<ReservationDetailDto> GetDetailAsync(long id) {
    var entity = await _context.Reservations.FindAsync(id);
    
    return new ReservationDetailDto {
        ReservationId = entity.ReservationId,
        // Ép kiểu về Utc để JSON có hậu tố 'Z'
        ReservedTime = DateTime.SpecifyKind(entity.ReservedTime, DateTimeKind.Utc),
        CreatedAt = entity.CreatedAt.HasValue 
            ? DateTime.SpecifyKind(entity.CreatedAt.Value, DateTimeKind.Utc) 
            : null
    };
}
```

---

## Tại sao phải làm vậy?
- Nếu không có `Z` ở cuối chuỗi JSON, trình duyệt sẽ hiểu nhầm đó là giờ địa phương của nó.
- Nếu server đặt tại Mỹ (GMT-5) và chạy `DateTime.Now`, giờ lưu vào DB sẽ bị lệch 12 tiếng so với Việt Nam.
- Việc sử dụng `date-utils.ts` giúp tập trung logic xử lý, dễ dàng bảo trì và sửa lỗi sau này.
