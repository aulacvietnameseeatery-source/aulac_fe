

## Tổng quan cấu trúc

```text
src/
├── app/          # Định nghĩa route (URL) và layout – KHÔNG xử lý nghiệp vụ
├── components/   # UI dùng chung toàn dự án – KHÔNG chứa business logic
├── features/     # Nơi làm việc chính – mỗi tính năng một folder
├── lib/          # Cấu hình & hạ tầng dùng toàn hệ thống
├── hooks/        # Custom hooks dùng chung nhiều feature
├── store/        # Global state (Zustand)
└── types/        # Kiểu dữ liệu dùng chung toàn app
```

---

##  Nguyên tắc 

> **Code thuộc về đâu thì đặt ở đó.**
> Nếu code gắn với **một tính năng cụ thể** → vào `features`.
> Nếu code dùng **cho nhiều nơi** → đặt ở `components`, `hooks`, `lib`, hoặc `types`.

---

## 📦 `src/features/` – Tính năng 

Đây là nơi chứa **toàn bộ logic nghiệp vụ**.
Mỗi thư mục trong `features` đại diện cho **một chức năng độc lập** (menu, auth, reservation…).

Ví dụ:

```text
features/
├── menu/
├── auth/
├── reservation/
```

### Bên trong một feature

```text
menu/
├── components/   # UI chỉ dùng cho menu
├── services/     # Gọi API liên quan đến menu
├── hooks/        # Logic xử lý dữ liệu menu
└── types/        # Kiểu dữ liệu riêng của menu
```

**Cách dùng:**

* UI chỉ phục vụ feature này → `components/`
* Gọi API / xử lý backend → `services/`
* Logic lọc, map, xử lý state → `hooks/`
* Interface / type riêng → `types/`

 Khi sửa hoặc làm mới 1 tính năng → **chỉ cần vào đúng folder feature đó**.

---

## 🎨 `src/components/` – UI dùng chung

Chứa các component **tái sử dụng cho nhiều feature**.

```text
components/
├── ui/       # Button, Input, Modal… (không chứa logic nghiệp vụ)
└── layout/   # Header, Footer, Navbar
```

**Cách dùng:**

* Component càng “ngu” càng tốt
* Không fetch API
* Không biết đến business logic

 Feature nào cũng có thể import và dùng lại.

---

##  `src/lib/` – Hạ tầng & cấu hình

Chứa các thứ **nền tảng của toàn hệ thống**.

```text
lib/
├── http.ts        # HTTP client (Axios / fetch wrapper)
├── constants.ts  # Hằng số dùng chung
└── utils.ts      # Hàm helper (vd: cn())
```

**Cách dùng:**

* Không viết logic nghiệp vụ ở đây
* Chỉ xử lý kỹ thuật, cấu hình, helper

---

##  `src/app/` – Routing (Next.js App Router)

Nơi định nghĩa **URL và layout**.

```text
app/
├── (public)/     # Trang ai cũng xem được
├── (auth)/       # Login / Register
└── layout.tsx    # Root layout
```

**Cách dùng:**

* File `page.tsx` chỉ:

    * Import component từ `features`
    * Render ra màn hình
* Tránh viết logic xử lý dữ liệu tại đây

 `app` chỉ đóng vai trò **kết nối UI với URL**.

---

##  `src/hooks/` – Hook dùng chung

Chứa custom hook **dùng cho nhiều feature**.

Ví dụ:

* `useDebounce`
* `useMediaQuery`

 Nếu hook chỉ dùng cho 1 feature → để trong `features/<name>/hooks`.

---

##  `src/store/` – Global State

Chứa Zustand store cho state dùng toàn app:

* Auth state
* User info
* Cart (nếu có)

 Tránh nhét toàn bộ state vào đây nếu chỉ dùng cho 1 feature.

---

##  `src/types/` – Kiểu dữ liệu chung

Chứa các type / interface **dùng cho nhiều feature**.

Ví dụ:

* `User`
* `ApiResponse<T>`

 Type riêng cho feature nào → đặt trong feature đó.

---

> *Feature nào – code nằm trọn trong feature đó.*

---

## Notification UX Notes

- Notification panel uses a tall Facebook-style dropdown: width 420px and max-height `min(calc(100vh-72px),720px)`.
- Category tabs do not use a horizontal scrollbar; use previous/next tab buttons to navigate tab groups.
- Notification preferences panel is scrollable inside the fixed-height dropdown using `flex-1 min-h-0 overflow-y-auto`.
- Use dedicated Sonner routing for notification toasts to avoid duplicate toasts:
    - `notification-toaster.tsx`: set `toasterId="notification"`
    - `notification-toast-renderer.tsx`: call `toast.custom(..., { toasterId: "notification" })`
