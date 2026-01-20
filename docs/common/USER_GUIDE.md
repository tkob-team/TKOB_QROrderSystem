# HƯỚNG DẪN SỬ DỤNG

**Cập nhật lần cuối:** 2026-01-20  
**Hệ thống:** TKOB_QROrderSystem (Tên sản phẩm: TKQR-in Ordering Platform)  
**Phiên bản:** 1.0

---

## Danh sách tài liệu liên quan

**Tài liệu liên quan:**
- [Hướng dẫn cài đặt](./SETUP.md) - Cài đặt và thiết lập môi trường phát triển
- [Đặc tả OpenAPI](./OPENAPI.md) - Tham chiếu API hoàn chỉnh (~140+ hoạt động; xem openapi.exported.json để biết số lượng chính xác)
- [Kiến trúc](./ARCHITECTURE.md) - Kiến trúc hệ thống và thiết kế kỹ thuật
- [Cơ sở dữ liệu phía sau](../backend/database/description.md) - Chi tiết lược đồ cơ sở dữ liệu

---

## Mục lục (Điều hướng nhanh)

**Bắt đầu:** [1. Cách truy cập](#1-cách-truy-cập) - URL và đăng nhập  
**Khách hàng:** [2. Hướng dẫn khách hàng](#2-hướng-dẫn-khách-hàng) - Quét QR, đặt hàng, thanh toán  
**Quản trị:** [3. Hướng dẫn chủ nhà hàng/Quản trị viên](#3-hướng-dẫn-chủ-nhà-hàng-quản-trị-viên) - Bảng điều khiển, menu, nhân viên  
**Phục vụ:** [4. Hướng dẫn nhân viên/Phục vụ](#4-hướng-dẫn-nhân-viên-phục-vụ) - Quản lý bàn, dịch vụ  
**Bếp:** [5. Hướng dẫn bếp/KDS](#5-hướng-dẫn-bếp-kds) - Chuẩn bị đơn hàng, ưu tiên  
**Tham khảo:** [6. Từ điển trạng thái](#6-từ-điển-trạng-thái) - Tất cả trạng thái đơn hàng/bàn  
**Trợ giúp:** [7. Câu hỏi thường gặp & Những hạn chế](#7-câu-hỏi-thường-gặp--những-hạn-chế) - Câu hỏi phổ biến  

---

## 0) Tổng quan

### TKOB_QROrderSystem là gì?

TKOB_QROrderSystem (thương hiệu sản phẩm: **TKQR-in Ordering Platform**) là một hệ thống đặt hàng qua mã QR cho nhà hàng cho phép khách hàng quét mã QR ở bàn của họ, duyệt menu, đặt hàng và thanh toán trực tiếp từ điện thoại của họ. Nhân viên nhà hàng có thể quản lý menu, bàn, đơn hàng và xem phân tích thông qua bảng điều khiển nhà hàng.

**Ghi chú:** TKOB_QROrderSystem là tên kho lưu trữ kỹ thuật; TKQR-in là tên thương hiệu hướng đến khách hàng.

### Hướng dẫn này dành cho ai?

Hướng dẫn này được tổ chức theo vai trò người dùng:

- **Khách hàng** - Những người ăn uống quét mã QR để đặt hàng
- **Chủ nhà hàng/Quản trị viên** - Chủ sở hữu và quản lý viên nhà hàng
- **Nhân viên/Phục vụ** - Nhân viên dịch vụ quản lý bàn và đơn hàng
- **Bếp/KDS** - Nhân viên bếp xem và chuẩn bị đơn hàng

---

## 1) Cách truy cập

### Ứng dụng web

**Ứng dụng khách hàng:**
- **Phát triển:** http://localhost:3001 (được xác minh từ [SETUP.md](./SETUP.md))
- **Sản xuất:** TBD (không được triển khai trong bài nộp MVP)

**Bảng điều khiển nhà hàng:**
- **Phát triển:** http://localhost:3002 (được xác minh từ [SETUP.md](./SETUP.md))
- **Sản xuất:** TBD (không được triển khai trong bài nộp MVP)

**Máy chủ API:**
- **Phát triển:** http://localhost:3000 (API + Swagger UI tại /api-docs)
- **Sản xuất:** TBD (không được triển khai trong bài nộp MVP)

### Quy trình sử dụng mã QR

1. **Quét mã QR** ở bàn của bạn bằng máy ảnh điện thoại
2. Tự động chuyển hướng sang trang menu của nhà hàng
3. **Duyệt menu** và thêm mục vào giỏ hàng
4. **Thanh toán** và chọn phương thức thanh toán
5. **Theo dõi trạng thái đơn hàng** theo thời gian thực
6. **Đánh giá và đánh dấu** các mục sau khi ăn xong

### Tài khoản Demo

**Không có tài khoản demo được hạt giống.** Tạo tài khoản kiểm tra thông qua quy trình API xác thực:
1. Đăng ký: `POST /api/v1/auth/register/submit` → `POST /api/v1/auth/register/confirm`
2. Đăng nhập: `POST /api/v1/auth/login`

Xem [OPENAPI.md](./OPENAPI.md) để biết tài liệu API hoàn chỉnh và [SETUP.md](./SETUP.md) để biết hướng dẫn cài đặt.

---

## 2) Hướng dẫn khách hàng

### 2.1) Quét mã QR & Bắt đầu một phiên

**Bước 1:** Sử dụng máy ảnh điện thoại của bạn để quét mã QR trên bàn của bạn.

**Bước 2:** Bạn sẽ được tự động chuyển hướng sang trang menu của nhà hàng. Một phiên sẽ được tạo và liên kết với bàn của bạn.

**Những gì bạn sẽ thấy:** Các danh mục menu với các món ăn có sẵn, giá cả và ảnh.

> **Ghi chú:** Mỗi mã QR là duy nhất cho một bàn cụ thể. Nếu bàn đã được sử dụng, bạn sẽ thấy thông báo lỗi.

### 2.2) Duyệt menu

**Các tính năng có sẵn:**
- Xem menu theo danh mục (Khai vị, Món chính, Tráng miệng, v.v.)
- Xem chi tiết mục: tên, mô tả, giá, thời gian chuẩn bị, chất gây dị ứng
- Xem ảnh của các món ăn
- Lọc theo đề xuất của đầu bếp (nếu nhà hàng bật)
- Tìm kiếm các mục cụ thể (nếu bật)

**Để xem chi tiết mục:**
1. Nhấn vào bất kỳ mục menu nào
2. Xem mô tả đầy đủ, bộ sửa đổi (kích thước, topping, v.v.) và ảnh
3. Đọc thông tin chất gây dị ứng nếu có

[Ảnh chụp màn hình: Trang menu khách hàng]

### 2.3) Thêm mục vào giỏ hàng

**Bước 1:** Từ menu, nhấn vào mục bạn muốn đặt hàng.

**Bước 2:** Chọn các bộ sửa đổi (nếu có sẵn):
- **Lựa chọn duy nhất:** Chọn một tùy chọn (ví dụ: Nhỏ/Vừa/Lớn)
- **Lựa chọn nhiều:** Chọn nhiều tùy chọn (ví dụ: topping)

**Bước 3:** Thêm hướng dẫn đặc biệt trong trường "Ghi chú" (ví dụ: "Không nước đá", "Cay thêm").

**Bước 4:** Chọn số lượng và nhấn "Thêm vào giỏ hàng".

**Để sửa đổi giỏ hàng:**
- Xem giỏ hàng bằng cách nhấn biểu tượng giỏ hàng
- Cập nhật số lượng hoặc xóa các mục
- Tổng cộng tự động cập nhật với thuế và phí dịch vụ

[Ảnh chụp màn hình: Chi tiết mục với bộ sửa đổi]  
[Ảnh chụp màn hình: Xem giỏ hàng]

### 2.4) Thanh toán & Thanh toán

**Bước 1:** Xem lại giỏ hàng của bạn và nhấn "Thanh toán".

**Bước 2:** Nhập tên của bạn (tùy chọn) và bất kỳ ghi chú nào liên quan đến toàn bộ bàn.

**Bước 3:** Chọn phương thức thanh toán:
- **Thanh toán theo bàn:** Trả tiền mặt khi nhân viên mang hóa đơn
- **SePay QR:** Trả ngay bằng cách quét mã QR VietQR
- **Thanh toán trực tuyến bằng thẻ:** ❌ Chưa triển khai trong MVP hiện tại (enum tồn tại nhưng không có tích hợp bộ xử lý)

**Bước 4:** Đối với thanh toán QR:
- Quét mã QR thanh toán bằng ứng dụng ngân hàng của bạn
- Nhập nội dung chuyển khoản chính xác như hiển thị
- Thanh toán được xác nhận tự động trong vòng vài giây

**Bước 5:** Đơn hàng được gửi đến bếp sau khi thanh toán thành công.

> **Quan trọng:** Nếu bạn chọn "Thanh toán theo bàn", nhiều đơn hàng có thể được kết hợp trên một hóa đơn ở cuối bữa ăn của bạn.

[Ảnh chụp màn hình: Trang thanh toán]  
[Ảnh chụp màn hình: Mã QR thanh toán]

### 2.5) Theo dõi đơn hàng của bạn

Sau khi thanh toán, bạn sẽ thấy theo dõi đơn hàng với:

- **Số đơn hàng** và **số bàn**
- **Trạng thái hiện tại:**
  - PENDING - Đơn hàng được tạo, chờ xác nhận từ nhân viên/bếp
  - RECEIVED - Bếp đã xác nhận đơn hàng
  - PREPARING - Thức ăn đang được nấu
  - READY - Thức ăn sẵn sàng để phục vụ
  - SERVED - Thức ăn được giao tới bàn của bạn
  - COMPLETED - Đơn hàng hoàn tất

- **Thời gian còn lại ước tính** (tính bằng phút)
- **Dòng thời gian đơn hàng** hiển thị tiến độ

**Bạn có thể:**
- Xem tất cả đơn hàng cho bàn của bạn
- Theo dõi nhiều đơn hàng riêng biệt
- Hủy đơn hàng (nếu được phép bởi chính sách nhà hàng và bếp chưa bắt đầu chuẩn bị)

[Ảnh chụp màn hình: Trang theo dõi đơn hàng]

### 2.6) Yêu cầu hóa đơn

Khi bạn sẵn sàng thanh toán (cho những đơn hàng "Thanh toán theo bàn"):

1. Vào chi tiết đơn hàng của bạn
2. Nhấn nút "Yêu cầu hóa đơn"
3. Nhân viên sẽ được thông báo và mang hóa đơn cho bạn

### 2.7) Đánh giá & Đánh giá

Sau bữa ăn của bạn, bạn có thể đánh giá các mục riêng lẻ:

1. Vào đơn hàng hoàn tất của bạn
2. Nhấn vào một mục để đánh giá nó (1-5 sao)
3. Thêm bình luận tùy chọn
4. Gửi bài đánh giá

**Các bài đánh giá giúp:**
- Nhà hàng cải thiện các mục menu
- Khách hàng khác thực hiện những lựa chọn tốt hơn

---

## 3) Hướng dẫn chủ nhà hàng/Quản trị viên

### 3.1) Cài đặt tài khoản & Đăng nhập

**Đăng ký lần đầu:**
1. Truy cập URL bảng điều khiển nhà hàng
2. Nhấp vào "Đăng ký"
3. Nhập:
   - Địa chỉ email
   - Mật khẩu
   - Tên đầy đủ
   - Tên nhà hàng
   - Slug nhà hàng (định danh URL)
4. Xác minh email qua mã OTP
5. Hoàn thành các bước onboarding

**Đăng nhập:**
1. Vào bảng điều khiển nhà hàng
2. Nhập email và mật khẩu
3. Nhấp vào "Đăng nhập"

**Vai trò:**
- **OWNER:** Truy cập đầy đủ vào tất cả các tính năng
- **STAFF:** Quản lý bàn và đơn hàng
- **KITCHEN:** Chỉ hệ thống hiển thị bếp

### 3.2) Tổng quan bảng điều khiển

Sau khi đăng nhập, bạn sẽ thấy:

- Tổng số đơn hàng hôm nay
- Tóm tắt doanh thu
- Bàn hoạt động
- Các đơn hàng chờ xử lý
- Các bài đánh giá gần đây
- Biểu đồ phân tích

[Ảnh chụp màn hình: Bảng điều khiển quản trị viên]

### 3.3) Quản lý menu

**Truy cập:** Menu → Quản lý menu

#### Tạo danh mục

1. Nhấp vào "Thêm danh mục"
2. Nhập tên danh mục (ví dụ: "Khai vị")
3. Thêm mô tả (tùy chọn)
4. Đặt thứ tự hiển thị (số nhỏ hơn xuất hiện trước)
5. Nhấp vào "Lưu"

#### Thêm mục menu

1. Chọn một danh mục
2. Nhấp vào "Thêm mục"
3. Điền vào chi tiết:
   - Tên
   - Mô tả
   - Giá (trong tiền tệ của nhà hàng, thường là VND)
   - Thời gian chuẩn bị (phút)
   - Thẻ (ví dụ: "chay", "cay")
   - Chất gây dị ứng (ví dụ: "gluten", "hạt")
4. Tải lên ảnh (ADD HERE: giới hạn ảnh chưa xác nhận, ví dụ: tối đa 10 ảnh mỗi mục)
5. Lưu thành "Bản nháp" hoặc "Xuất bản" ngay lập tức

**Trạng thái mục:**
- **DRAFT:** Không hiển thị cho khách hàng
- **PUBLISHED:** Hiển thị trên menu khách hàng
- **ARCHIVED:** Xóa mềm, có thể khôi phục

**Nút chuyển đổi khả dụng:**
- Đánh dấu các mục là không khả dụng tạm thời (ví dụ: hết hàng)
- Mục vẫn được xuất bản nhưng bị xám cho khách hàng

[Ảnh chụp màn hình: Trình chỉnh sửa mục menu]

### 3.4) Quản lý bộ sửa đổi

Bộ sửa đổi cho phép khách hàng tùy chỉnh các mục (kích thước, topping, phụ tùng).

**Truy cập:** Menu → Bộ sửa đổi

**Tạo một nhóm bộ sửa đổi:**

1. Nhấp vào "Thêm nhóm bộ sửa đổi"
2. Nhập tên (ví dụ: "Kích thước")
3. Chọn loại:
   - **Lựa chọn duy nhất:** Khách hàng phải chọn một (nút radio)
   - **Lựa chọn nhiều:** Khách hàng có thể chọn nhiều (checkbox)
4. Đặt nếu bắt buộc hoặc tùy chọn
5. Thêm các tùy chọn:
   - Tên tùy chọn (ví dụ: "Nhỏ", "Vừa", "Lớn")
   - Điều chỉnh giá (+ hoặc - từ giá cơ sở)
6. Lưu nhóm bộ sửa đổi
7. Gán cho các mục menu

**Ví dụ:**
- **Nhóm:** Kích thước thức uống
- **Loại:** Lựa chọn duy nhất (bắt buộc)
- **Tùy chọn:**
  - Nhỏ: điều chỉnh giá (ví dụ: -10.000 VND hoặc -$1)
  - Vừa: không điều chỉnh
  - Lớn: điều chỉnh giá (ví dụ: +15.000 VND hoặc +$1,50)

**Ghi chú:** Tiền tệ và số tiền khác nhau tùy theo cấu hình nhà hàng. Ví dụ được hiển thị chỉ để minh họa.

### 3.5) Quản lý bàn & Mã QR

**Truy cập:** Bàn → Quản lý bàn

#### Tạo bàn

1. Nhấp vào "Thêm bàn"
2. Nhập:
   - Số bàn (ví dụ: "Bàn 1", "VIP-A")
   - Sức chứa (số chỗ ngồi)
   - Vị trí (ví dụ: "Phòng chính", "Sân hiên")
   - Mô tả (tùy chọn)
3. Mã QR được tạo tự động
4. Nhấp vào "Lưu"

**Trạng thái bàn:**
- **AVAILABLE:** Sẵn sàng cho khách hàng
- **OCCUPIED:** Đang được sử dụng
- **RESERVED:** Đã đặt trước
- **INACTIVE:** Tạm thời không khả dụng

#### Tải xuống mã QR

**Bàn đơn:**
1. Nhấp vào hàng bàn
2. Nhấp vào "Tải xuống QR"
3. Chọn định dạng: PNG, SVG hoặc PDF

**Tất cả bàn:**
1. Nhấp vào "Tải xuống tất cả mã QR"
2. Chọn ZIP (các tệp riêng lẻ) hoặc PDF (nhiều trang)
3. In và đặt trên các bàn

**Tạo lại mã QR:**
- Sử dụng nếu mã QR bị xâm phạm
- Các mã QR cũ trở nên không hợp lệ
- Có thể tạo lại các bàn riêng lẻ hoặc tất cả cùng một lúc

[Ảnh chụp màn hình: Quản lý bàn]

### 3.6) Quản lý nhân viên

**Truy cập:** Cài đặt → Quản lý nhân viên

**Giới hạn đăng ký áp dụng** (Miễn phí: 1 nhân viên, Cơ bản: 5, Premium: không giới hạn)

#### Mời nhân viên

1. Nhấp vào "Mời nhân viên"
2. Nhập địa chỉ email
3. Chọn vai trò:
   - **STAFF:** Có thể quản lý bàn, đơn hàng, bảng dịch vụ
   - **KITCHEN:** Chỉ có thể truy cập KDS
4. Gửi lời mời
5. Nhân viên nhận được email với liên kết đăng ký
6. Họ tạo mật khẩu và tham gia nhà hàng của bạn

**Quản lý nhân viên hiện có:**
- Xem tất cả nhân viên
- Thay đổi vai trò
- Xóa nhân viên (họ mất quyền truy cập ngay lập tức)
- Gửi lại lời mời nếu hết hạn

### 3.7) Xem & Quản lý đơn hàng

**Truy cập:** Đơn hàng → Tất cả đơn hàng

**Lọc đơn hàng theo:**
- Trạng thái (Chờ xử lý, Đang chuẩn bị, Hoàn tất, v.v.)
- Bàn
- Phạm vi ngày
- Tìm kiếm theo số đơn hàng hoặc tên khách hàng

**Hành động đơn hàng:**
- Xem chi tiết đơn hàng
- Cập nhật trạng thái đơn hàng theo cách thủ công
- Đánh dấu là đã thanh toán (cho tiền mặt/thanh toán theo bàn)
- Hủy đơn hàng (có lý do)
- In hóa đơn

**Trạng thái đơn hàng được sử dụng:**
- PENDING - Đơn hàng được tạo, chờ xác nhận từ nhân viên/bếp
- RECEIVED - Bếp đã xác nhận
- PREPARING - Đang được nấu
- READY - Thức ăn sẵn sàng để nhận/phục vụ
- SERVED - Được giao tới bàn
- COMPLETED - Khách hàng hoàn tất ăn
- PAID - Thanh toán hoàn tất
- CANCELLED - Đơn hàng đã hủy

**Ghi chú:** Thứ tự của các trạng thái COMPLETED và PAID có thể khác nhau tùy thuộc vào phương thức thanh toán (thanh toán ngay SePay so với thanh toán sau khi ăn xong).

[Ảnh chụp màn hình: Trang quản lý đơn hàng]

### 3.8) Quản lý đăng ký

**Truy cập:** Cài đặt → Đăng ký

**Xem gói hiện tại:**
- Tầng gói (Miễn phí, Cơ bản, Premium)
- Giới hạn: bàn, mục menu, đơn hàng mỗi tháng, nhân viên
- Các tính năng được bật
- Thống kê sử dụng

**Nâng cấp:**
1. Nhấp vào "Nâng cấp gói"
2. Chọn tầng đích
3. Xem lại giá
4. Trả qua mã QR SePay
5. Đăng ký được nâng cấp tự động sau khi thanh toán

**Các tầng đăng ký:**

| Tính năng | Miễn phí | Cơ bản | Premium |
|----------|---------|--------|---------|
| Bàn | 1 | 10 | Không giới hạn |
| Mục Menu | 10 | 50 | Không giới hạn |
| Đơn hàng/Tháng | 100 | 500 | Không giới hạn |
| Nhân viên | 1 | 5 | Không giới hạn |
| Phân tích | Không | Có | Có |
| Khuyến mãi | Không | Có | Có |
| Hỗ trợ ưu tiên | Không | Không | Có |

### 3.9) Cấu hình thanh toán

**Truy cập:** Cài đặt → Cài đặt thanh toán

**Cài đặt tích hợp SePay:**
1. Nhập khóa API SePay
2. Nhập chi tiết tài khoản ngân hàng:
   - Số tài khoản
   - Tên chủ tài khoản
   - Mã ngân hàng (ví dụ: VCB, ACB, MB)
3. Đặt bí mật webhook (tùy chọn, để xác nhận thanh toán tự động)
4. Cấu hình kiểm tra
5. Bật SePay cho khách hàng

**Phương thức thanh toán có sẵn cho khách hàng:**
- Thanh toán theo bàn: Luôn có sẵn
- SePay QR: Chỉ nếu được cấu hình
- Thanh toán trực tuyến bằng thẻ: Không trong MVP hiện tại

### 3.10) Cài đặt nhà hàng

**Truy cập:** Cài đặt → Hồ sơ nhà hàng

**Cài đặt có thể cấu hình:**

- **Thông tin cơ bản:** Tên, slug, mô tả, địa chỉ, điện thoại
- **Giờ mở cửa:** Đặt giờ cho mỗi ngày trong tuần
- **Giá:**
  - Tiền tệ (VND theo mặc định, có thể cấu hình cho mỗi nhà hàng)
  - Tỷ lệ thuế và nhãn (ví dụ: 10% VAT)
  - Phí dịch vụ (ví dụ: 5%)
  - Đề xuất tip (ví dụ: 10%, 15%, 20%)
- **Ngôn ngữ & Múi giờ**

### 3.11) Phân tích & Báo cáo

**Truy cập:** Phân tích → Bảng điều khiển

**Báo cáo có sẵn:**

- **Doanh thu:** Tổng hàng ngày, hàng tuần, hàng tháng
- **Thống kê đơn hàng:** Số lượng, giá trị đơn hàng trung bình, tỷ lệ hoàn thành
- **Mục phổ biến:** Những món ăn bán chạy nhất
- **Phân phối theo giờ:** Thời gian đặt hàng cao điểm
- **Hiệu suất bàn:** Doanh thu và luân chuyển theo bàn
- **Bài đánh giá:** Xu hướng xếp hạng và phản hồi khách hàng

[Ảnh chụp màn hình: Bảng điều khiển phân tích]

---

## 4) Hướng dẫn nhân viên/Phục vụ

### 4.1) Đăng nhập & Bảng điều khiển

**Đăng nhập:**
1. Truy cập URL bảng điều khiển nhà hàng
2. Nhập email và mật khẩu nhân viên của bạn
3. Bạn sẽ thấy bảng điều khiển nhân viên với:
   - Bàn hoạt động
   - Các đơn hàng chờ xử lý
   - Yêu cầu dịch vụ

### 4.2) Quản lý bàn

**Truy cập:** Nhân viên → Bàn hoặc Phục vụ → Bàn

**Xem trạng thái bàn:**
- Xem tất cả bàn với trạng thái thực tế
- Lọc theo vị trí hoặc trạng thái
- Xem các phiên hoạt động

**Mở một bàn:**
- Bàn trở thành OCCUPIED khi khách hàng quét mã QR
- Phiên được tạo tự động
- Không cần hành động thủ công

**Đóng một bàn:**
1. Nhấp vào bàn được sử dụng
2. Nhấp vào "Đóng phiên & Tạo hóa đơn"
3. Chọn phương thức thanh toán:
   - **Tiền mặt:** Đánh dấu hóa đơn là đã thanh toán ngay lập tức
   - **Thanh toán theo bàn:** Tạo hóa đơn để thanh toán
4. Nhập tip (tùy chọn)
5. Thêm ghi chú (tùy chọn)
6. Xác nhận - bàn trở thành AVAILABLE

**Xóa bàn:** (Phương pháp kế thừa, sử dụng Đóng phiên)
- Đánh dấu bàn là đã xóa mà không tạo hóa đơn

[Ảnh chụp màn hình: Xem bàn của nhân viên]

### 4.3) Bảng dịch vụ

**Truy cập:** Nhân viên → Bảng dịch vụ hoặc Phục vụ → Bảng dịch vụ

**Giám sát các yêu cầu khách hàng:**
- Yêu cầu hóa đơn
- Yêu cầu hỗ trợ đặc biệt
- Sự cố đơn hàng

**Xử lý yêu cầu:**
1. Xem chi tiết yêu cầu (bàn, thời gian, loại)
2. Hành động
3. Đánh dấu là đã giải quyết

### 4.4) Hỗ trợ đơn hàng

**Xem tất cả đơn hàng:**
- Xem đơn hàng theo bàn hoặc trạng thái
- Giúp khách hàng có câu hỏi

**Hành động đơn hàng thủ công:**
- Cập nhật trạng thái đơn hàng nếu cần
- Đánh dấu đơn hàng là đã thanh toán (để thanh toán tiền mặt)
- Hủy đơn hàng (với sự chấp thuận của khách hàng)

**Liên lạc với bếp:**
- Kiểm tra trạng thái đơn hàng trước khi hỏi bếp
- Thông báo cho khách hàng về độ trễ
- Xử lý các yêu cầu đặc biệt

---

## 5) Hướng dẫn bếp/KDS

### 5.1) Truy cập hệ thống hiển thị bếp (KDS)

**Đăng nhập:**
1. Truy cập URL bảng điều khiển nhà hàng
2. Đăng nhập bằng thông tin xác thực nhân viên bếp
3. Tự động chuyển hướng đến chế độ xem KDS

**Thay thế:** URL KDS trực tiếp (nếu được cấu hình)

### 5.2) Tổng quan giao diện KDS

**Hiển thị cho thấy:**
- **Đơn hàng ưu tiên thông thường:** Trong thời gian ước tính (≤ 100% thời gian chuẩn bị ước tính)
- **Đơn hàng ưu tiên cao:** Vượt quá thời gian ước tính (100-150% thời gian chuẩn bị ước tính)
- **Đơn hàng khẩn cấp:** Bị trễ đáng kể (> 150% thời gian chuẩn bị ước tính)

**Cho mỗi thẻ đơn hàng:**
- Số đơn hàng
- Số bàn
- Thời gian trôi qua kể từ khi đơn hàng được đặt
- Tất cả các mục có số lượng và bộ sửa đổi
- Ghi chú đặc biệt từ khách hàng
- Thời gian chuẩn bị ước tính so với thời gian thực

[Ảnh chụp màn hình: Bảng KDS với đơn hàng]

### 5.3) Xử lý đơn hàng

**Khi đơn hàng mới đến:**

1. Đơn hàng xuất hiện với trạng thái "RECEIVED"
2. Xem lại các mục và kiểm tra tính khả dụng
3. Nhấp vào "Bắt đầu chuẩn bị" - trạng thái thay đổi thành PREPARING
4. Bộ đếm thời gian bắt đầu

**Trong khi chuẩn bị:**
- Theo dõi công thức và kiểm tra bộ sửa đổi
- Kiểm tra các hướng dẫn đặc biệt
- Đánh dấu các mục riêng lẻ như đã chuẩn bị (tùy chọn)

**Khi đơn hàng sẵn sàng:**
1. Nhấp vào "Đánh dấu sẵn sàng" - trạng thái thay đổi thành READY
2. Thông báo cho nhân viên phục vụ
3. Đơn hàng rời khỏi màn hình chính của bạn

### 5.4) Xử lý trạng thái đơn hàng

**Ý nghĩa trạng thái trong KDS:**

- **RECEIVED:** Đơn hàng mới, cần xác nhận
- **PREPARING:** Hiện đang được nấu
- **READY:** Hoàn thành, chờ nhân viên phục vụ nhận
- **CANCELLED:** Khách hàng hoặc nhân viên hủy, ngừng chuẩn bị

**Chỉ báo ưu tiên:**

- **Xanh (Thường):** ≤ 100% thời gian ước tính, theo đúng tiến độ
- **Vàng (Cao):** 100-150% thời gian ước tính, ưu tiên
- **Đỏ (Khẩn cấp):** > 150% thời gian ước tính, chú ý ngay lập tức

### 5.5) Thống kê KDS

**Bảng điều khiển hiển thị:**
- Tổng số đơn hàng hoạt động
- Thời gian chuẩn bị trung bình hôm nay
- Các đơn hàng hoàn tất hôm nay
- Số lượng khẩn cấp/ưu tiên cao

**Sử dụng thống kê để:**
- Giám sát hiệu suất bếp
- Xác định các nút thắt
- Lập kế hoạch nhu cầu nhân viên

### 5.6) Hủy & Sửa đổi

**Nếu đơn hàng bị hủy:**
- Thẻ đơn hàng chuyển sang màu xám hoặc biến mất
- Ngừng chuẩn bị ngay lập tức
- Vứt bỏ hoặc tái sử dụng nguyên liệu

**Nếu khách hàng sửa đổi đơn hàng:**
- Không được hỗ trợ trong MVP hiện tại
- Khách hàng phải hủy và đặt lại
- Hoặc phối hợp qua nhân viên

---

## 6) Từ điển trạng thái

### Trạng thái đơn hàng (Giá trị hệ thống thực tế)

| Trạng thái | Mô tả | Ai có thể đặt | Trạng thái tiếp theo |
|-----------|-------|--------------|-------------------|
| **PENDING** | Đơn hàng được tạo, chờ bếp | Hệ thống (tự động) | RECEIVED |
| **RECEIVED** | Bếp đã xác nhận đơn hàng | Nhân viên bếp | PREPARING |
| **PREPARING** | Thức ăn đang được nấu | Nhân viên bếp | READY |
| **READY** | Thức ăn sẵn sàng để nhận | Nhân viên bếp | SERVED |
| **SERVED** | Thức ăn được giao tới bàn | Phục vụ/Nhân viên | COMPLETED |
| **COMPLETED** | Khách hàng hoàn tất ăn | Phục vụ/Nhân viên | PAID |
| **PAID** | Thanh toán hoàn tất | Hệ thống/Nhân viên | - |
| **CANCELLED** | Đơn hàng đã hủy | Khách hàng/Nhân viên | - |

### Trạng thái bàn (Giá trị hệ thống thực tế)

| Trạng thái | Mô tả | Màu sắc | Hành động có sẵn |
|-----------|-------|--------|-----------------|
| **AVAILABLE** | Sẵn sàng cho khách hàng | Xanh lá | Quét QR, đặt trước thủ công |
| **OCCUPIED** | Hiện đang được sử dụng | Đỏ | Xem đơn hàng, đóng phiên |
| **RESERVED** | Đã đặt trước | Vàng | Hủy đặt trước |
| **INACTIVE** | Tạm thời không khả dụng | Xám | Kích hoạt lại |

### Trạng thái thanh toán

| Trạng thái | Mô tả |
|-----------|-------|
| **PENDING** | Chờ thanh toán |
| **PROCESSING** | Thanh toán đang được xác minh |
| **COMPLETED** | Thanh toán thành công |
| **FAILED** | Thanh toán thất bại hoặc hết hạn |
| **REFUNDED** | Thanh toán được hoàn lại |

### Mức độ ưu tiên (KDS)

| Ưu tiên | Điều kiện | Màu sắc |
|--------|----------|--------|
| **NORMAL** | Thời gian chuẩn bị ≤ 100% ước tính | Xanh lá |
| **HIGH** | Thời gian chuẩn bị 100-150% ước tính | Vàng |
| **URGENT** | Thời gian chuẩn bị > 150% ước tính | Đỏ |

**Ghi chú:** Các ngưỡng được xác nhận từ triển khai hệ thống (kds-response.dto.ts).

---

## 7) Câu hỏi thường gặp & Những hạn chế

### Các câu hỏi thường gặp

**Q: Tôi có thể đặt hàng từ nhiều bàn bằng một lần quét QR không?**  
A: Không, mỗi mã QR được liên kết với một bàn cụ thể. Mỗi bàn có phiên riêng của nó.

**Q: Tôi có thể sửa đổi đơn hàng của mình sau khi đặt hàng không?**  
A: Bạn có thể hủy trong vòng 5 phút nếu bếp chưa bắt đầu. Sửa đổi không được hỗ trợ trong MVP hiện tại - bạn phải hủy và đặt lại.

**Q: Điều gì xảy ra nếu tôi quét mã QR cho một bàn đã được sử dụng?**  
A: Bạn sẽ thấy thông báo lỗi. Mỗi bàn chỉ có thể có một phiên hoạt động cùng một lúc.

**Q: Tôi có thể thanh toán riêng cho các mục ở cùng một bàn không?**  
A: Không trong MVP hiện tại. Tất cả đơn hàng ở một bàn được kết hợp thành một hóa đơn khi sử dụng "Thanh toán theo bàn".

**Q: Giỏ hàng của tôi hoạt động bao lâu?**  
A: Giỏ hàng dựa trên phiên và hết hạn khi bạn đóng trình duyệt hoặc sau khi hết thời gian chờ phiên (được cấu hình cho mỗi nhà hàng).

**Q: Khách hàng có thể để lại bài đánh giá mà không đặt hàng không?**  
A: Không, bài đánh giá được liên kết với các đơn hàng hoàn tất. Chỉ những khách hàng đặt hàng một mục mới có thể đánh giá nó.

### Những hạn chế đã biết (MVP hiện tại)

**Ứng dụng khách hàng:**
- ❌ **Sửa đổi đơn hàng:** Không thể chỉnh sửa đơn hàng sau khi thanh toán (phải hủy và đặt lại)
- ❌ **Chia hóa đơn:** Không thể chia hóa đơn theo các mục riêng lẻ
- ❌ **Nhiều phương thức thanh toán:** Không thể sử dụng nhiều phương thức thanh toán cho một đơn hàng
- ❌ **Thanh toán khách:** Cần có phiên (quét QR), chưa có duyệt web độc lập
- ❌ **Lịch sử đơn hàng:** Giới hạn cho phiên hiện tại chỉ

**Bảng điều khiển nhà hàng:**
- ❌ **Kho hàng nâng cao:** Không theo dõi hàng tồn kho hoặc quản lý nguyên liệu
- ❌ **Quản lý ca:** Không có lịch biểu hoặc báo cáo ca làm việc
- ❌ **Nhiều vị trí:** Nhà hàng đơn lẻ chỉ (không hỗ trợ chuỗi)
- ❌ **Thông báo email:** Cảnh báo email hạn chế (chỉ đăng ký)
- ❌ **Giao diện tùy chỉnh:** Giao diện cố định, không tùy chỉnh
- ❌ **Chương trình trung thành:** Không có hệ thống điểm hoặc phần thưởng

**KDS:**
- ❌ **Định tuyến đơn hàng:** Tất cả đơn hàng đi đến một KDS (không định tuyến từng trạm)
- ❌ **In ấn:** Không tích hợp máy in khu bếp
- ❌ **Bumping:** Không thể đánh dấu các mục con riêng biệt (tất cả hoặc không)
- ❌ **Thu hồi:** Không thể bỏ sẵn sàng một đơn hàng

**Thanh toán:**
- ❌ **Thanh toán thẻ:** Chỉ hỗ trợ tiền mặt và SePay QR
- ❌ **Trả góp:** Không có tùy chọn mua ngay trả sau
- ❌ **Quốc tế:** Chỉ VND và USD
- ❌ **Hoàn lại:** Không có quy trình tự phục vụ (liên hệ hỗ trợ)

**Chung:**
- ❌ **Ứng dụng di động:** Chỉ web (không có ứng dụng iOS/Android gốc)
- ❌ **Chế độ ngoại tuyến:** Internet được yêu cầu cho tất cả hoạt động
- ❌ **Đa ngôn ngữ:** Hỗ trợ ngôn ngữ hạn chế
- ❌ **Trợ cập:** Chưa tuân thủ đầy đủ WCAG

### Các tính năng được lên kế hoạch (Phiên bản tương lai)

**Ưu tiên cao:**
- Sửa đổi đơn hàng sau khi thanh toán
- Chia hóa đơn theo mục
- Tích hợp máy in bếp
- Lịch sử đơn hàng của khách hàng

**Ưu tiên trung:**
- Quản lý nhà hàng nhiều địa điểm
- Theo dõi kho hàng nâng cao
- Chương trình trung thành và phần thưởng
- Ứng dụng di động gốc

**Ưu tiên thấp:**
- Chế độ đặt hàng ngoại tuyến
- Thẻ quà tặng và phiếu giảm giá

**Để biết lộ trình kỹ thuật:** Xem [ARCHITECTURE.md Phần 10](./ARCHITECTURE.md#10-future-enhancements-planned-but-not-implemented)

---

## 8) Ảnh chụp màn hình - Chú thích

Dưới đây là các chú thích ảnh chụp màn hình cho các ảnh sẽ được thêm vào hướng dẫn này:

### Ứng dụng khách hàng

1. **[Ảnh chụp: Trang menu khách hàng]**
   - Hiển thị các tab danh mục, thẻ mục với ảnh và giá, biểu tượng giỏ hàng
   - Chú thích: "Duyệt menu theo danh mục và thêm mục vào giỏ hàng"

2. **[Ảnh chụp: Chi tiết mục với bộ sửa đổi]**
   - Hiển thị ảnh mục, mô tả, các nhóm bộ sửa đổi (kích thước, topping), bộ chọn số lượng
   - Chú thích: "Tùy chỉnh đơn hàng của bạn với bộ sửa đổi và hướng dẫn đặc biệt"

3. **[Ảnh chụp: Xem giỏ hàng]**
   - Hiển thị các mục giỏ hàng, số lượng, tổng phụ, thuế, phí dịch vụ, tổng cộng
   - Chú thích: "Xem lại giỏ hàng của bạn trước khi thanh toán"

4. **[Ảnh chụp: Trang thanh toán]**
   - Hiển thị lựa chọn phương thức thanh toán, trường tên khách hàng, trường ghi chú
   - Chú thích: "Chọn phương thức thanh toán và hoàn thành thanh toán"

5. **[Ảnh chụp: Mã QR thanh toán]**
   - Hiển thị mã QR VietQR, nội dung chuyển khoản, chi tiết ngân hàng, bộ đếm thời gian
   - Chú thích: "Quét mã QR này bằng ứng dụng ngân hàng của bạn để thanh toán"

6. **[Ảnh chụp: Trang theo dõi đơn hàng]**
   - Hiển thị dòng thời gian trạng thái đơn hàng, thời gian còn lại ước tính, các mục đơn hàng, số bàn
   - Chú thích: "Theo dõi trạng thái đơn hàng của bạn theo thời gian thực"

### Bảng điều khiển nhà hàng

7. **[Ảnh chụp: Bảng điều khiển quản trị viên]**
   - Hiển thị biểu đồ doanh thu, thống kê đơn hàng, bàn hoạt động, bài đánh giá gần đây
   - Chú thích: "Giám sát hiệu suất nhà hàng của bạn trong nháy mắt"

8. **[Ảnh chụp: Trình chỉnh sửa mục menu]**
   - Hiển thị biểu mẫu cho tên mục, giá, mô tả, ảnh, bộ sửa đổi
   - Chú thích: "Tạo và chỉnh sửa các mục menu với ảnh và bộ sửa đổi"

9. **[Ảnh chụp: Quản lý bàn]**
   - Hiển thị danh sách bàn với chỉ báo trạng thái, bộ lọc, nút tải xuống QR
   - Chú thích: "Quản lý bàn và tải xuống mã QR"

10. **[Ảnh chụp: Trang quản lý đơn hàng]**
    - Hiển thị danh sách đơn hàng với bộ lọc, huy hiệu trạng thái, thanh tìm kiếm
    - Chú thích: "Xem và quản lý tất cả đơn hàng với bộ lọc"

11. **[Ảnh chụp: Bảng điều khiển phân tích]**
    - Hiển thị biểu đồ doanh thu, mục phổ biến, biểu đồ phân phối theo giờ
    - Chú thích: "Phân tích xu hướng bán hàng và số liệu hiệu suất"

### Ứng dụng nhân viên/Phục vụ

12. **[Ảnh chụp: Xem bàn của nhân viên]**
    - Hiển thị lưới bàn với chỉ báo trạng thái màu sắc, thông tin phiên, hành động
    - Chú thích: "Xem tất cả bàn và trạng thái hiện tại của chúng"

### Hệ thống hiển thị bếp

13. **[Ảnh chụp: Bảng KDS với đơn hàng]**
    - Hiển thị thẻ đơn hàng được nhóm theo ưu tiên, bộ đếm thời gian, danh sách mục
    - Chú thích: "Hệ thống hiển thị bếp hiển thị các đơn hàng hoạt động với chỉ báo ưu tiên"

---

## Cần giúp đỡ?

**Hỗ trợ kỹ thuật:**  
ADD HERE (ví dụ: support@tkqrin.com)

**Tài liệu:**  
Để tìm tài liệu nhà phát triển và chi tiết API, xem:
- [docs/common/OPENAPI.md](./OPENAPI.md)
- [docs/backend/README.md](../backend/README.md)
- [docs/frontend/README.md](../frontend/README.md)

**Báo cáo sự cố:**  
ADD HERE (ví dụ: liên kết GitHub Issues hoặc cổng thông tin hỗ trợ)

---

**Phiên bản tài liệu:** 1.0  
**Lần kiểm tra lần cuối:** 2026-01-20  
**Lần kiểm tra tiếp theo:** 2026-04-20
