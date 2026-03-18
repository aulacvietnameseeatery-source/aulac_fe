# Workflow Reservation

## Mục tiêu
- Khách public có thể tạo reservation online và hệ thống gán bàn ngay tại thời điểm tạo.
- Sau khi public tạo reservation, trạng thái reservation vẫn là `PENDING`.
- Admin có thể tạo reservation trực tiếp từ màn hình quản trị.
- Admin có thể chỉnh sửa reservation trước khi xác nhận, bao gồm đổi thông tin và đổi bàn.
- Bước confirm của admin chỉ dùng để xác nhận reservation, không phải bước gán bàn.
- Toàn bộ public flow và admin flow phải dùng chung một rule nghiệp vụ về availability, overlap và tính hợp lệ của bàn.

## Business Flow
1. Người dùng hoặc nhân viên nhập thông tin đặt bàn
- Thông tin đầu vào tối thiểu gồm `reservedTime` và `partySize`.
- Với public flow, khách phải nhập thêm thông tin liên hệ.
- Với admin flow, nhân viên có thể tạo reservation cho khách walk-in, khách gọi điện hoặc khách được hỗ trợ trực tiếp.

2. Hệ thống kiểm tra khả năng nhận bàn
- Server đánh giá khả năng sắp xếp bàn dựa trên thời gian đặt và số lượng khách.
- Logic availability phải giống nhau giữa public và admin để tránh lệch kết quả.
- Thứ tự tìm tổ hợp bàn:
  - Một bàn duy nhất có sức chứa phù hợp nhất
  - Nhiều bàn liền kề trong cùng khu vực
  - Tổ hợp best-fit trong cùng khu vực

3. Hệ thống xử lý theo từng kênh tạo reservation
- Public channel:
  - Chỉ cho phép gửi reservation nếu tìm được tổ hợp bàn phù hợp.
  - Reservation được tạo kèm bàn đã gán ngay tại lúc create.
  - Status sau khi create là `PENDING` để chờ admin xác nhận.
- Admin channel:
  - Nhân viên tạo reservation trực tiếp trong back office.
  - Nhân viên chọn hoặc xác nhận bàn phù hợp trước khi lưu.
  - Reservation được tạo theo rule trạng thái hiện hành của admin flow trong hệ thống.

4. Admin rà soát và hoàn tất reservation
- Trước khi confirm, admin có thể sửa:
  - thông tin khách
  - thời gian đặt
  - số lượng khách
  - ghi chú
  - danh sách bàn được gán
- Nếu thay đổi dữ liệu ảnh hưởng đến capacity hoặc time, hệ thống phải kiểm tra lại tính hợp lệ của bàn.
- Confirm chỉ được thực hiện khi reservation đã có bàn hợp lệ.

5. Reservation đi qua các trạng thái vận hành
- Sau khi được tạo, reservation sẽ tiếp tục đi qua các bước xác nhận, check-in, hoàn tất hoặc hủy tùy theo thực tế vận hành.

## Luồng chi tiết
1. Public fit-check
- Client gửi `reservedTime` và `partySize`.
- Server kiểm tra tổ hợp bàn theo thứ tự:
  - Một bàn phù hợp nhất
  - Nhiều bàn liền kề trong cùng khu vực
  - Tổ hợp best-fit trong cùng khu vực

### Thuật toán tìm candidate cho Public availability
- Input: `reservedTime`, `partySize`.
- Bước 1. Lọc pool bàn khả dụng:
  - Loại bàn `LOCKED`.
  - Nếu `reservedTime` nằm trong immediate window: loại thêm bàn đang `OCCUPIED` hoặc `RESERVED`.
  - Loại bàn có conflict reservation trong cửa sổ duration (bỏ qua `CANCELLED`, `NO_SHOW`, `COMPLETED`).
- Bước 2. Tìm candidate ứng viên theo thứ tự:
  - Single best-fit: bàn đơn có `capacity >= partySize` với excess capacity nhỏ nhất.
  - Contiguous same-zone: dãy bàn liền kề trong cùng zone, tinh gọn nhất.
  - Best-fit same-zone: tổ hợp trong cùng zone có `totalCapacity` vừa đủ nhất.
- Bước 3. Chọn candidate duy nhất:
  - Trả về bàn hoặc tổ hợp đầu tiên tìm được.
  - Nếu không tìm được candidate nào, trả về không thể đặt online.
- Output: một candidate duy nhất (không hiển thị danh sách multiple options như admin).

2. Public create reservation
- Server kiểm tra lại candidate tables tại thời điểm tạo reservation.
- Nếu không còn bàn phù hợp:
  - Từ chối tạo reservation online.
  - Trả về thông báo không thể đặt online ở khung giờ đó.
- Nếu có bàn phù hợp:
  - Tạo reservation với status `PENDING`
  - Gán trực tiếp bàn vào reservation
  - Trả về thông tin reservation gồm `TableCode` và `Zone`

3. Admin create reservation
- Admin nhập thông tin khách, thời gian đặt, số lượng khách và ghi chú nếu có.
- Admin gọi availability để lấy danh sách `table options` trước khi lưu.
- Mỗi option có thể là:
  - một bàn đơn (`A`)
  - hoặc nhiều bàn kết hợp (`A + B`)
- Danh sách option được trả về kèm cờ `isBestFit` để UI highlight phương án tối ưu.
- Nếu không có option phù hợp:
  - Admin phải đổi giờ hoặc đổi số khách.
- Nếu có option phù hợp:
  - Admin chọn một option (một hoặc nhiều `tableIds`) rồi tạo reservation.
  - Reservation được tạo kèm bàn đã gán.
  - Status khởi tạo hiện hỗ trợ `CONFIRMED` hoặc `CHECKED_IN`.
  - Reservation sau đó có thể được edit, confirm hoặc cancel.

### Thuật toán sinh option cho Admin availability
- Input: `reservedTime`, `partySize`.
- Bước 1. Lọc pool bàn khả dụng:
  - Loại bàn `LOCKED`.
  - Nếu `reservedTime` nằm trong immediate window: loại thêm bàn đang `OCCUPIED` hoặc `RESERVED`.
  - Loại bàn có conflict reservation trong cửa sổ duration (bỏ qua `CANCELLED`, `NO_SHOW`, `COMPLETED`).
- Bước 2. Sinh option ứng viên theo thứ tự:
  - Single-table: mọi bàn đơn có `capacity >= partySize`.
  - Contiguous same-zone: các dãy bàn liền kề theo thứ tự số bàn trong cùng zone.
  - Best-fit same-zone: tìm tổ hợp trong cùng zone có `totalCapacity` vừa đủ nhất.
- Bước 3. Chuẩn hóa và loại trùng:
  - Khóa option theo tập `tableIds` đã sort tăng dần.
  - Mỗi option trả về: `tableIds`, `tableCodes`, `zone`, `totalCapacity`, `excessCapacity`, `tableCount`.
- Bước 4. Đánh dấu best-fit toàn cục:
  - Chọn option tốt nhất theo thứ tự: `excessCapacity` tăng dần -> `tableCount` tăng dần -> `tableCodes` tăng dần.
  - Option thắng được gắn `isBestFit = true`.
- Output: danh sách option đã sort, best-fit đứng đầu để UI render nhanh.

4. Admin edit reservation
- Admin có thể chỉnh sửa reservation trước khi confirm.
- Các trường có thể chỉnh sửa gồm:
  - thông tin khách
  - thời gian đặt
  - số lượng khách
  - ghi chú
  - danh sách bàn
- Rule nghiệp vụ khi edit:
  - Nếu chỉ đổi thông tin khách hoặc ghi chú thì có thể giữ nguyên bàn cũ.
  - Nếu đổi thời gian đặt hoặc số lượng khách thì phải revalidate bàn.
  - Nếu bàn hiện tại không còn phù hợp thì admin phải chọn lại bàn trước khi lưu.
  - Không được tạo ra overlap với reservation active khác.

5. Admin confirm reservation
- Admin gọi endpoint confirm.
- Server chỉ cập nhật trạng thái từ `PENDING -> CONFIRMED`.
- Bước confirm không yêu cầu gán bàn mới.
- Nếu reservation chưa có bàn thì không được confirm.

6. Xử lý sau confirm
- Reservation đã confirm sẽ tiếp tục đi qua các nghiệp vụ vận hành như:
  - check-in
  - no-show
  - cancel
  - complete

## Danh sách status của reservation
- `PENDING`
  - Reservation mới được tạo, đang chờ admin xử lý hoặc xác nhận.
- `CONFIRMED`
  - Reservation đã được admin xác nhận.
- `CHECKED_IN`
  - Khách đã đến nhà hàng và bắt đầu sử dụng bàn.
- `CANCELLED`
  - Reservation đã bị hủy.
- `NO_SHOW`
  - Khách không đến theo thời gian đặt.
- `COMPLETED`
  - Reservation đã hoàn tất sau khi khách sử dụng xong.

## Danh sách status của table
- `AVAILABLE`
  - Bàn đang trống và có thể nhận reservation hoặc phục vụ.
- `OCCUPIED`
  - Bàn đang có khách sử dụng.
- `RESERVED`
  - Bàn đã được giữ cho reservation đã xác nhận hoặc đang ở trạng thái cần reserve theo rule vận hành.
- `LOCKED`
  - Bàn bị khóa tạm thời, không cho phép sử dụng hoặc gán mới.

## Rule kiểm tra table status khi tạo reservation
- Khi tạo reservation, hệ thống không chỉ nhìn vào `table status` hiện tại mà còn kiểm tra thêm conflict theo thời gian đặt.
- Có 2 lớp kiểm tra chính:
  - Kiểm tra trạng thái vận hành hiện tại của bàn
  - Kiểm tra overlap với các reservation đang active quanh khung giờ đặt

### 1. Kiểm tra trạng thái bàn tại thời điểm create
- Nếu bàn đang `LOCKED`:
  - Không được chọn để tạo reservation.
- Nếu thời gian đặt là gần hiện tại, trong immediate window của hệ thống:
  - Nếu bàn đang `OCCUPIED` hoặc `RESERVED` thì không được dùng để tạo reservation ở thời điểm gần giờ này.
- Nếu thời gian đặt còn xa:
  - Hệ thống không bắt buộc bàn phải có status `AVAILABLE` tại thời điểm hiện tại.
  - Hệ thống ưu tiên kiểm tra conflict theo reservation time (time-slot) trước, thay vì khóa cứng chỉ bằng table status hiện tại.
  - Vì vậy cùng một bàn vẫn có thể được đặt cho khung giờ khác nếu không bị overlap.

### 2. Kiểm tra conflict theo reservation time
- Dù bàn đang là `AVAILABLE`, hệ thống vẫn phải kiểm tra xem bàn đó có reservation nào bị overlap quanh thời điểm khách chọn hay không.
- Nếu đã có reservation active trong khoảng thời gian xung đột:
  - Không được tạo reservation mới vào bàn đó.
- Các reservation đã `CANCELLED`, `NO_SHOW` hoặc `COMPLETED` sẽ không còn được tính là conflict active.
- Rule này chính là ý "đặt xong thì phải cách 2 tiếng khách khác mới đặt tiếp được" (ví dụ đặt 16:00 thì mốc kế tiếp hợp lệ là 18:00 nếu không có reservation khác chồng lấn).

## Rule của table status khi reservation được confirm
- Khi reservation được confirm, bàn không phải lúc nào cũng đổi sang `RESERVED` ngay lập tức.
- Rule hiện tại trong backend là:
  - Nếu thời gian đến lịch đặt bàn còn dưới hoặc bằng 15 phút:
    - Bàn đổi sang `RESERVED` ngay khi confirm.
  - Nếu thời gian đến lịch đặt bàn còn hơn 15 phút:
    - Bàn chưa đổi status ngay.
    - Hệ thống chỉ lập lịch để tự động chuyển bàn sang `RESERVED` trước giờ ăn 15 phút.

### Ý nghĩa nghiệp vụ của rule confirm
- Confirm reservation có nghĩa là đơn đã được duyệt.
- Nhưng bàn chỉ bị khóa vận hành (`RESERVED`) khi đã đến gần giờ phục vụ.
- Cách này giúp tránh việc khóa bàn quá sớm khi lịch đặt bàn còn xa.

### Lưu ý để tránh nhầm giữa 2 rule thời gian
- Rule 1: `15 phút trước giờ ăn` dùng cho vận hành bàn
  - Mục đích: quyết định khi nào bàn đổi status sang `RESERVED` để giữ bàn gần giờ phục vụ.
- Rule 2: `2 tiếng giãn cách` dùng cho khả năng đặt bàn
  - Mục đích: sau khi đã có một reservation ở giờ T, reservation mới ở cùng bàn chỉ hợp lệ khi không overlap cửa sổ 2 tiếng.
  - Đây là rule quyết định "khách khác có đặt được giờ khác hay không".

## Khi nào table đổi sang OCCUPIED
- Bàn chuyển sang `OCCUPIED` khi khách thực sự đến và reservation được check-in.
- Nói cách khác:
  - `CONFIRMED` chưa đồng nghĩa với `OCCUPIED`
  - `CHECKED_IN` mới là mốc làm bàn thành `OCCUPIED`

### Điều kiện để đổi sang OCCUPIED
- Reservation phải được chuyển status sang `CHECKED_IN`.
- Hệ thống kiểm tra khách đang đến đúng cửa sổ thời gian cho phép check-in.
- Nếu bàn đang bị dùng bởi order active khác hoặc bị chiếm bởi khách khác:
  - Không được chuyển sang `OCCUPIED` cho reservation này.

### Sau khi CHECKED_IN
- Table status đổi thành `OCCUPIED`.
- Reservation status đổi thành `CHECKED_IN`.
- Đây là mốc nghiệp vụ xác nhận khách đã ngồi vào bàn và bắt đầu phục vụ.

## Ý nghĩa nghiệp vụ giữa reservation và table status
- Reservation status phản ánh vòng đời của yêu cầu đặt bàn.
- Table status phản ánh tình trạng vận hành thực tế của bàn trong nhà hàng.
- Một reservation có thể đang `PENDING` nhưng bàn đã được gán từ trước để giữ chỗ logic.
- Khi reservation chuyển sang `CONFIRMED`, table thường phải phản ánh trạng thái đã được reserve theo rule backend.
- Khi reservation chuyển sang `CHECKED_IN`, table thường chuyển sang `OCCUPIED`.
- Khi reservation bị `CANCELLED`, `NO_SHOW` hoặc `COMPLETED`, table thường được trả về `AVAILABLE` nếu không còn bị ràng buộc bởi nghiệp vụ khác.

## Lý do thiết kế này
- Tránh race condition khi nhiều reservation pending cùng tranh chấp bàn ở bước confirm.
- Giữ bước confirm của admin đơn giản và rõ trách nhiệm.
- Vẫn cho phép admin linh hoạt chỉnh sửa reservation trước khi confirm.
- Đảm bảo public flow và admin flow dùng chung một logic availability.

## API behavior
- Public `POST /api/public/reservations`
  - Tạo reservation với status `PENDING`.
  - Tự động gán bàn ngay khi create.
- Admin `GET /api/manual/table/availability`
  - Trả về danh sách `table options` (mỗi option có thể gồm nhiều bàn).
  - Có cờ `isBestFit` để UI ưu tiên phương án tối ưu.
- Admin `POST /api/manual/reservations`
  - Tạo reservation từ màn hình quản trị.
  - Nhận `tableIds` (ưu tiên), vẫn tương thích `tableId` cho flow cũ.
- Admin edit reservation endpoint
  - Cập nhật thông tin reservation và danh sách bàn.
  - Revalidate conflict nếu thay đổi thời gian, số khách hoặc bàn.
- Admin `PATCH /api/manual/reservations/{id}/status`
  - Cập nhật status vận hành của reservation trong manual flow.

## Ghi chú
- Nếu lưu lượng cao, nên cân nhắc tăng mức đảm bảo concurrency bằng transaction isolation hoặc locking phù hợp quanh bước chọn bàn và tạo reservation.
- Nếu team muốn tài liệu chặt hơn nữa, nên chốt riêng rule status khởi tạo cho admin create: tạo ở `PENDING` hay được phép vào status khác ngay từ đầu.
