# Payment Flow (FE + BE Reference)

## Mục tiêu
- Mô tả đúng luồng thanh toán hiện tại để FE/QA/BE đối chiếu cùng một nguồn.
- Làm rõ cộng trừ tiền (subtotal, discount, tax, tip, final, change).
- Làm rõ entity nào bị cập nhật và tăng/giảm bao nhiêu.

## Đầu vào API payment
Nguồn DTO: Core/DTO/Order/CreatePaymentDTO.cs

- OrderId: id đơn hàng cần thanh toán.
- ReceivedAmount: số tiền khách đưa.
- PaymentMethod: CASH, CARD, QR (được map sang lookup id ở backend).
- CouponId: tùy chọn.
- PromotionId: tùy chọn.
- TipAmount: tùy chọn.
- Note: hiện tại chưa được sử dụng trong PaymentService.

## Trình tự xử lý backend
Nguồn chính: Infa/Service/PaymentService.cs, hàm ProcessPaymentAsync.

1. Load order theo OrderId, include Payments, Customer, OrderItems, OrderCoupons, OrderPromotions.
2. Resolve lookup id cần dùng:
- Order status: CANCELLED, COMPLETED.
- Table status: AVAILABLE.
- Order item status: REJECTED, CANCELLED.
- Coupon status: ACTIVE.
- Promotion status: ACTIVE.
3. Chặn thanh toán nếu order đã CANCELLED.
4. Chặn thanh toán nếu order đã có payment (tránh double pay).
5. Resolve PaymentMethod thành MethodLvId.
6. Đọc loyalty policy từ system settings.
7. Begin transaction.
8. Tính subTotal từ item hợp lệ (bỏ qua REJECTED/CANCELLED).
9. Tính tipAmount = dto.TipAmount ?? order.TipAmount ?? 0.
10. Nếu có CouponId thì validate coupon (tồn tại, active, trong thời gian, chưa vượt max usage), tính discount, tạo OrderCoupon nếu chưa có và tăng UsedCount.
11. Nếu có PromotionId thì validate promotion tương tự coupon, tính discount, tạo OrderPromotion nếu chưa có và tăng UsedCount.
12. Tính finalAmount và validate ReceivedAmount >= finalAmount.
13. Tạo bản ghi Payment.
14. Update Order (SubTotalAmount, TotalAmount, TipAmount, status COMPLETED, UpdatedAt).
15. Nếu order có bàn thì update table status về AVAILABLE.
16. Nếu loyalty bật và customer là member thì cộng LoyaltyPoints.
17. SaveChanges + Commit.
18. Publish notification PAYMENT_COMPLETED và realtime event payment_completed.
19. Nếu có lỗi trước commit thì rollback transaction.

## Công thức cộng trừ tiền
### 1) Subtotal
SubTotal = tổng (Price x Quantity) của order item không có status REJECTED/CANCELLED.

### 2) Discount cho coupon/promotion
Nếu loại PERCENT:
Discount = min(round(BaseAmount x (DiscountValue / 100), 2), BaseAmount)

Nếu loại FIXED_AMOUNT:
Discount = min(DiscountValue, BaseAmount)

### 3) Tổng giảm giá
TotalDiscount = CouponDiscount + PromotionDiscount

### 4) Thuế (Tax)
Thuế được tính dựa trên số tiền sau giảm giá (**Tax Base = SubTotal - TotalDiscount**).
Số tiền thuế cho mỗi loại thuế mặc định:
- Nếu là **EXCLUSIVE**: `Số tiền thuế = Tax Base x TaxRate` (Sẽ cộng thêm vào tổng thanh toán).
- Nếu là **INCLUSIVE**: `Số tiền thuế = Tax Base x (TaxRate / (1 + TaxRate))` (Đã bao gồm trong SubTotal, chỉ dùng để hiển thị bóc tách).

**TotalExclusiveTax** là tổng số tiền của tất cả các loại thuế EXCLUSIVE áp dụng cho đơn hàng.

### 5) Tổng thanh toán cuối cùng
FinalAmount = max(0, SubTotal + TotalExclusiveTax + TipAmount - TotalDiscount)

### 6) Tiền thối
ChangeAmount = max(0, ReceivedAmount - FinalAmount)

### 7) Điểm loyalty
EarnedPoints = floor(FinalAmount / loyalty.point_base_amount)

Chỉ cộng điểm khi:
- loyalty.enabled = true
- Customer.IsMember = true
- point_base_amount > 0

## Entity bị ảnh hưởng và mức thay đổi
### Order
- SubTotalAmount: set = subTotal mới tính.
- TotalAmount: set = finalAmount.
- TipAmount: set = tipAmount sau khi fallback.
- OrderStatusLvId: set = COMPLETED.
- UpdatedAt: set thời gian hiện tại.

### Payment
Tạo mới 1 bản ghi:
- OrderId
- ReceivedAmount
- ChangeAmount
- PaidAt
- MethodLvId

### OrderCoupon
Nếu order chưa có coupon đó:
- Tạo mới (CouponId, DiscountAmount, AppliedAt)

### OrderPromotion
Nếu order chưa có promotion đó:
- Tạo mới (PromotionId, DiscountAmount, AppliedAt)

### Coupon
- UsedCount tăng +1 khi tạo mới OrderCoupon.

### Promotion
- UsedCount tăng +1 khi tạo mới OrderPromotion.

### RestaurantTable
Nếu order có TableId và tìm thấy bàn:
- TableStatusLvId -> AVAILABLE
- UpdatedAt cập nhật thời gian

### Customer
Nếu đủ điều kiện loyalty:
- LoyaltyPoints = LoyaltyPoints hiện tại + EarnedPoints

## System settings liên quan
Được seed bởi migration: Infa/Data/Migrations/20260324193000_SeedLoyaltySystemSettings.cs

- loyalty.enabled (BOOL)
- loyalty.point_base_amount (DECIMAL)

Nếu loyalty.enabled = true mà loyalty.point_base_amount <= 0 thì backend ném InvalidOperationException.

## Lưu ý cho FE
- FE có thể tính tạm để hiển thị, nhưng backend là nguồn sự thật cuối cùng.
- FE không gửi changeAmount; backend tự tính và lưu.
- FE nên chặn submit nếu số tiền đưa nhỏ hơn tổng cần trả để giảm lỗi UX, nhưng backend vẫn validate lại.
- Luồng đã có guard không cho thanh toán 2 lần cùng 1 order.
