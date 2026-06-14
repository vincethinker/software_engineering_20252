# LivrèCafé Project

## 1. Giới thiệu

LivrèCafé là hệ thống web dành cho mô hình nhà sách kết hợp quán cà phê và không gian làm việc. Dự án gồm hai phần chính:

- **Frontend:** giao diện khách hàng, xây dựng bằng React + Vite.
- **Backend:** API server, xây dựng bằng Node.js + ExpressJS.
- **Database:** MongoDB.

Các chức năng chính hiện tại:

- Xem thực đơn đồ uống, đồ ăn và sách.
- Đăng ký, đăng nhập tài khoản khách hàng.
- Xem và chỉnh sửa thông tin tài khoản.
- Giỏ hàng và thanh toán demo.
- Đặt chỗ / đăng ký tổ chức sự kiện.
- Chọn đồ ăn - uống cho sự kiện.
- Lưu và đọc dữ liệu sản phẩm từ MongoDB.

---

## 2. Công nghệ sử dụng

### Frontend

- React
- Vite
- React Router DOM
- CSS thuần

### Backend

- Node.js
- ExpressJS
- Mongoose
- MongoDB
- CORS
- Dotenv
- BcryptJS
- JSON Web Token

### Database

- MongoDB local
- MongoDB Compass để xem dữ liệu trực quan

---

## 3. Cấu trúc thư mục dự án

Ví dụ cấu trúc tổng thể:

```txt
SE Prj/
└── code/
    ├── livrecafe-frontend/
    │   ├── public/
    │   ├── src/
    │   │   ├── assets/
    │   │   ├── components/
    │   │   ├── context/
    │   │   ├── pages/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   └── styles.css
    │   ├── package.json
    │   └── vite.config.js
    │
    └── livrecafe-backend/
        ├── data/
        │   ├── image/
        │   │   ├── Books/
        │   │   ├── Drinks/
        │   │   └── Snacks/
        │   └── livrecafe-products.json
        ├── models/
        ├── routes/
        ├── .env
        ├── seedProducts.js
        ├── server.js
        └── package.json
```

---

## 4. Yêu cầu trước khi chạy

Máy cần cài sẵn:

1. Node.js LTS
2. npm
3. MongoDB Community Server
4. MongoDB Compass, khuyến khích dùng để kiểm tra dữ liệu
5. Visual Studio Code

Kiểm tra Node.js và npm:

```bash
node -v
npm -v
```

Nếu hai lệnh trên hiện phiên bản, nghĩa là Node.js và npm đã cài thành công.

---

## 5. Cấu hình backend

Mở terminal tại thư mục backend:

```bash
cd "code\livrecafe-backend"
```

Cài thư viện:

```bash
npm install
```

Nếu chưa có thư viện cần thiết, có thể cài thêm:

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
```

Tạo file `.env` trong thư mục `livrecafe-backend`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/livrecafe
PORT=3000
JWT_SECRET=livrecafe_secret_key_123
```

Ý nghĩa:

- `MONGO_URI`: đường dẫn kết nối MongoDB local.
- `PORT`: cổng chạy backend.
- `JWT_SECRET`: khóa dùng để tạo token đăng nhập.

---

## 6. Chạy MongoDB

Trước khi chạy backend, cần đảm bảo MongoDB đang chạy.

Nếu dùng MongoDB Compass, kết nối tới:

```txt
mongodb://127.0.0.1:27017
```

Database dự án sẽ là:

```txt
livrecafe
```

Các collection thường dùng:

```txt
users
products
orders
bookingsSpace
```

---

## 7. Import dữ liệu sản phẩm vào MongoDB

Nếu database chưa có sản phẩm, chạy file seed:

```bash
cd "code\livrecafe-backend"
node seedProducts.js
```

Nếu chạy thành công, terminal sẽ hiện tương tự:

```txt
Connected to MongoDB
Inserted 27 products successfully
Drinks: 8
Snacks: 8
Books: 11
MongoDB connection closed
```

Sau đó mở MongoDB Compass và kiểm tra:

```txt
Database: livrecafe
Collection: products
```

---

## 8. Chạy backend

Trong terminal backend:

```bash
cd "code\livrecafe-backend"
node server.js
```

Nếu chạy thành công, terminal sẽ hiện:

```txt
Connected to MongoDB
Server running at http://localhost:3000
```

Kiểm tra backend bằng trình duyệt:

```txt
http://localhost:3000
```

Nếu hiện dòng:

```txt
LivrèCafé backend is running
```

nghĩa là backend đã chạy.

Một số API có thể kiểm tra:

```txt
http://localhost:3000/api/products
http://localhost:3000/api/products?type=drink
http://localhost:3000/api/products?type=book
```

---

## 9. Cấu hình frontend

Mở terminal mới tại thư mục frontend:

```bash
cd "C:\Users\ASUS\Desktop\SE Prj\code\livrecafe-frontend"
```

Cài thư viện:

```bash
npm install
```

Nếu chưa có React Router DOM:

```bash
npm install react-router-dom
```

---

## 10. Chạy frontend

Trong terminal frontend:

```bash
npm run dev
```

Nếu chạy thành công, terminal sẽ hiện link tương tự:

```txt
http://localhost:5173
```

Mở trình duyệt tại:

```txt
http://localhost:5173
```

---

## 11. Thứ tự chạy project

Mỗi lần vận hành project, nên chạy theo thứ tự:

### Bước 1: Mở MongoDB

Đảm bảo MongoDB local đang chạy.

### Bước 2: Chạy backend

```bash
cd "C:\Users\ASUS\Desktop\SE Prj\code\livrecafe-backend"
node server.js
```

Backend chạy tại:

```txt
http://localhost:3000
```

### Bước 3: Chạy frontend

Mở terminal khác:

```bash
cd "C:\Users\ASUS\Desktop\SE Prj\code\livrecafe-frontend"
npm run dev
```

Frontend chạy tại:

```txt
http://localhost:5173
```

---

## 12. Các trang chính của frontend

```txt
/                         Trang chủ
/thuc-don                 Trang thực đơn
/sach                     Trang sách
/dat-cho                  Trang đặt chỗ
/dat-cho/chon-thuc-don    Trang chọn đồ ăn - uống cho sự kiện
/dang-nhap                Trang đăng nhập
/dang-ky                  Trang đăng ký
/lam-lai-mat-khau         Trang làm lại mật khẩu
/thong-tin-ca-nhan        Trang thông tin cá nhân
/khach-hang-thanh-vien    Trang khách hàng thành viên
/uu-dai-cua-toi           Trang ưu đãi của tôi
/don-hang                 Trang đơn hàng
/thanh-toan               Trang thanh toán
/thanh-toan-thanh-cong    Trang thanh toán thành công
```

---

## 13. Các API backend chính

### Product API

Lấy toàn bộ sản phẩm:

```txt
GET /api/products
```

Lấy đồ uống:

```txt
GET /api/products?type=drink
```

Lấy sách:

```txt
GET /api/products?type=book
```

Lấy snack:

```txt
GET /api/products?type=snack
```

Lấy chi tiết sản phẩm:

```txt
GET /api/products/:id
```

### Auth API

Đăng ký:

```txt
POST /api/auth/register
```

Đăng nhập:

```txt
POST /api/auth/login
```

Lấy thông tin tài khoản hiện tại:

```txt
GET /api/auth/me
```

Làm lại mật khẩu:

```txt
POST /api/auth/forgot-password
```

Cập nhật thông tin cá nhân, nếu đã thêm API:

```txt
PATCH /api/auth/profile
```

---

## 14. Lưu ý về ảnh sản phẩm

Ảnh sản phẩm được lưu trong backend tại:

```txt
livrecafe-backend/data/image/
```

Cấu trúc:

```txt
data/image/
├── Books/
├── Drinks/
└── Snacks/
```

Backend public ảnh qua đường dẫn:

```txt
http://localhost:3000/images/...
```

Ví dụ:

```txt
http://localhost:3000/images/Drinks/Iced Milk Coffee.png
```

Trong MongoDB, sản phẩm chỉ lưu đường dẫn ảnh:

```js
imageUrl: "/images/Drinks/Iced Milk Coffee.png"
```

Không lưu trực tiếp file ảnh vào MongoDB.

---

## 15. Lưu ý về giỏ hàng

Hiện tại giỏ hàng đang lưu tạm ở frontend bằng `localStorage`.

Key sử dụng:

```txt
livrecafe_cart
```

Khi thêm sản phẩm vào giỏ hàng:

- Sản phẩm được lưu vào localStorage.
- Icon giỏ hàng trên header hiển thị số loại sản phẩm.
- Trang thanh toán đọc dữ liệu từ localStorage.

Hiện tại nút thanh toán mới là demo frontend. Sau này cần nối backend để tạo đơn hàng thật trong MongoDB.

---

## 16. Lưu ý về đặt chỗ

Trang đặt chỗ hiện gồm:

- Họ tên khách hàng
- Số điện thoại
- Email
- Tên sự kiện
- Loại sự kiện
- Số người tham gia
- Ngày tổ chức
- Giờ bắt đầu
- Thời lượng sử dụng
- Chọn đồ ăn - uống
- Ghi chú

Menu chọn cho sự kiện được lưu tạm bằng localStorage:

```txt
livrecafe_booking_menu
```

Hiện tại nút `Đặt chỗ` mới xử lý demo trên frontend. Sau này cần tạo API:

```txt
POST /api/bookings-space
```

để lưu dữ liệu đặt chỗ vào MongoDB.

---

## 17. Một số lỗi thường gặp

### Lỗi `npm is not recognized`

Nguyên nhân: Node.js chưa được cài hoặc chưa thêm vào PATH.

Cách sửa:

1. Cài Node.js LTS.
2. Tắt và mở lại terminal.
3. Chạy lại:

```bash
node -v
npm -v
```

### Lỗi frontend không gọi được backend

Kiểm tra backend đã chạy chưa:

```txt
http://localhost:3000
```

Kiểm tra frontend gọi đúng API chưa:

```js
fetch("http://localhost:3000/api/products")
```

### Lỗi không hiện ảnh sản phẩm

Kiểm tra:

1. File ảnh có nằm đúng thư mục không.
2. `server.js` có dòng static ảnh không:

```js
app.use("/images", express.static(path.join(__dirname, "data", "image")));
```

3. `imageUrl` trong MongoDB có đúng dạng không:

```txt
/images/Drinks/tên ảnh.png
```

### Lỗi route không hiện trang

Kiểm tra `App.jsx` đã khai báo route chưa.

Ví dụ:

```jsx
<Route path="/dat-cho" element={<Booking />} />
```

### Lỗi CSS không áp dụng

Kiểm tra `main.jsx` có import CSS:

```jsx
import "./styles.css";
```

Nếu đang import cả `App.css` và `styles.css`, có thể CSS bị đè nhau. Nên thống nhất dùng một file CSS chính.

---

## 18. Tắt project

Tại terminal đang chạy backend hoặc frontend, nhấn:

```txt
Ctrl + C
```

Sau đó nhập:

```txt
Y
```

nếu terminal yêu cầu xác nhận.

---

## 19. Ghi chú cho nhóm phát triển

- Nên thống nhất schema MongoDB trước khi chia việc.
- Customer frontend và admin frontend/backend nên dùng chung database `livrecafe`.
- Các collection quan trọng nên thống nhất tên:
  - `users`
  - `products`
  - `orders`
  - `bookingsSpace`
  - `promotions`
  - `membershipLevels`
- Không nên đặt tên field khác nhau giữa customer và admin.
- Ví dụ sản phẩm nên thống nhất field:
  - `name`
  - `type`
  - `category`
  - `price`
  - `imageUrl`
  - `stock`
  - `status`
  - `isActive`

---

## 20. Tài khoản và dữ liệu demo

Hiện tại người dùng có thể tự đăng ký tài khoản ở trang:

```txt
http://localhost:5173/dang-ky
```

Sau khi đăng ký, dữ liệu được lưu vào MongoDB collection:

```txt
users
```

Sản phẩm demo được import từ file:

```txt
livrecafe-backend/data/livrecafe-products.json
```

---

## 21. Tóm tắt lệnh chạy nhanh

### Backend

```bash
cd "code\livrecafe-backend"
node server.js
```

### Frontend

```bash
cd "code\livrecafe-frontend"
npm run dev
```

### Seed sản phẩm

```bash
cd "code\livrecafe-backend"
node seedProducts.js
```

### Link truy cập

```txt
Frontend: http://localhost:5173
Backend:  http://localhost:3000
MongoDB:  mongodb://127.0.0.1:27017/livrecafe
```
