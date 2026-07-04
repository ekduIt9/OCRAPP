# ScanBiz OCR

Monorepo MVP theo SOP quản lý hóa đơn, phiếu giao hàng và chứng từ:

```text
web/       Next.js + TypeScript — dashboard và web admin
mobile/    Flutter — ứng dụng Android/iOS
index.html Prototype HTML ban đầu, giữ làm bản tham chiếu giao diện
```

## Chức năng đã dựng

### Next.js web admin

- Dashboard và chỉ số xử lý.
- Danh sách, tìm kiếm, lọc chứng từ.
- Upload kéo-thả JPG, PNG, PDF.
- Review hai cột: bản gốc và dữ liệu OCR.
- Chỉnh sửa trường dữ liệu và dòng hàng hóa.
- Duyệt/từ chối chứng từ.
- Xuất CSV UTF-8 tương thích Excel.
- Giao diện responsive.

### Flutter mobile

- Trang chủ và thống kê nhanh.
- Chụp ảnh bằng camera, chọn từ thư viện hoặc tải PDF.
- Danh sách, tìm kiếm, lọc chứng từ.
- Review ảnh gốc và form dữ liệu OCR.
- Thêm/xóa dòng hàng hóa.
- Duyệt chứng từ.
- Điều hướng Trang chủ, Chứng từ, Báo cáo, Tài khoản.

Hiện dữ liệu đang là mock để hoàn thiện UX. OCR engine, đăng nhập, API,
database, lưu file và đồng bộ realtime là phần backend tiếp theo.

## Chạy web Next.js

Yêu cầu Node.js 20 trở lên:

```powershell
cd web
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Chạy Flutter

Yêu cầu Flutter stable và Dart 3.3 trở lên. Do workspace được tạo trên máy
chưa có Flutter SDK, chạy một lần lệnh sau để sinh thư mục native:

```powershell
cd mobile
flutter create --platforms=android,ios,web .
flutter pub get
flutter run
```

Lệnh `flutter create` giữ nguyên source trong `lib/` và bổ sung project
Android/iOS/Web cần thiết.

## Kiến trúc đề xuất tiếp theo

```text
Flutter / Next.js
       │
       ▼
 REST API + JWT + RBAC
       │
       ├── OCR worker / queue
       ├── PostgreSQL hoặc SQL Server
       └── S3-compatible object storage
```

Các enum trạng thái bám SOP:
`APPROVED`, `WAITING_REVIEW`, `NEED_CORRECTION`, `PROCESSING`.
