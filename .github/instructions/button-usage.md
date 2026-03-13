# Hướng dẫn thiết kế (Design Instructions)

## Hướng dẫn sử dụng Button Variants

Dưới đây là các quy định về việc sử dụng các variant cho component `Button` trong project:

| Variant | Mô tả & Trường hợp sử dụng | Ví dụ |
| :--- | :--- | :--- |
| **Default** | Các hành động chính, mặc định. | Lưu thay đổi (Save Changes), Gửi form (Submit Form). |
| **Primary** | Các hành động nổi bật, kêu gọi hành động mạnh. | Đặt bàn (Reserve), Đặt món ngay (Order Now). |
| **Outline** | Các nút có viền, dùng cho hành động phụ trong header hoặc toolbar. | Làm mới (Refresh), Hủy (Cancel), Sửa (Header), Thêm mới (Add Table). |
| **Ghost** | Nút trong suốt, dùng cho các icon action trong hàng dừa hoặc các hành động tinh tế. | Icon Sửa/Xem/Xóa trong bảng, các nút điều hướng phụ. |
| **Link** | Dạng liên kết văn bản. | Xem thêm, Quên mật khẩu. |
| **Gold** | Nút màu vàng, dành cho các tính năng VIP, Premium hoặc ưu đãi đặc biệt. | Gói Premium, Ưu đãi đặc quyền. |
| **Success** | Các hành động xác nhận thành công hoặc trạng thái tích cực. | Hoàn thành, Duyệt, Kích hoạt (Active). |
| **Danger** | Các hành động nguy hiểm hoặc mang tính hủy bỏ. | Xóa (Delete), Vô hiệu hóa (Deactivate), Từ chối (Reject). |

---

> [!TIP]
> Luôn ưu tiên sử dụng `outline` hoặc `ghost` cho các hành động phụ để tránh làm nhiễu thị giác người dùng. Các nút `default` và `primary` chỉ nên xuất hiện 1-2 lần trên màn hình.
