import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Menu from "./pages/Menu";
import Books from "./pages/Books";
import Booking from "./pages/Booking";
import BookingMenuSelect from "./pages/BookingMenuSelect";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Membership from "./pages/Membership";
import MyVouchers from "./pages/MyVouchers";
import MyOrders from "./pages/MyOrders";

import "./styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        <Route path="/lam-lai-mat-khau" element={<ForgotPassword />} />
        <Route path="/thuc-don" element={<Menu />} />
        <Route path="/sach" element={<Books />} />
        <Route path="/dat-cho" element={<Booking />} />
        <Route path="/dat-cho/chon-thuc-don" element={<BookingMenuSelect />} />

        <Route path="/thong-tin-ca-nhan" element={<Profile />} />
        <Route path="/khach-hang-thanh-vien" element={<Membership />} />
        <Route path="/uu-dai-cua-toi" element={<MyVouchers />} />
        <Route path="/don-hang" element={<MyOrders />} />

        <Route path="/thanh-toan" element={<Checkout />} />
        <Route path="/thanh-toan-thanh-cong" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;