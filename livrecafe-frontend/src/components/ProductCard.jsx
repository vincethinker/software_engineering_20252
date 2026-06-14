import { useState } from "react";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.status === "out_of_stock" || product.stock <= 0;

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const imageSource = product.imageUrl
    ? `http://localhost:3000${product.imageUrl}`
    : "";

  const openModal = () => {
    if (isOutOfStock) return;

    setQuantity(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      if (prev <= 1) return 1;
      return prev - 1;
    });
  };

  const handleConfirmAddToCart = () => {
    addToCart(product, quantity);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="product-card">
        <div className="product-image-box">
          {imageSource ? (
            <img src={imageSource} alt={product.name} />
          ) : (
            <span className="no-image">Không có ảnh</span>
          )}
        </div>

        <div className="product-info">
          <h3>{product.name}</h3>

          {product.type === "book" && (
            <p className="product-author">{product.author}</p>
          )}

          <p className="product-price">{formatPrice(product.price)}</p>

          <button
            className="cart-btn"
            disabled={isOutOfStock}
            onClick={openModal}
          >
            {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <button className="product-modal-close" onClick={closeModal}>
              ×
            </button>

            <div className="product-modal-image-box">
              {imageSource ? (
                <img src={imageSource} alt={product.name} />
              ) : (
                <span className="no-image">Không có ảnh</span>
              )}
            </div>

            <div className="product-modal-info">
              <h2>{product.name}</h2>

              {product.type === "book" && (
                <p className="product-modal-subtitle">
                  {product.author}
                </p>
              )}

              {product.type !== "book" && (
                <p className="product-modal-subtitle">
                  {product.category}
                </p>
              )}

              <p className="product-modal-price">
                {formatPrice(product.price)}
              </p>

              <div className="quantity-control">
                <button onClick={decreaseQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={increaseQuantity}>+</button>
              </div>
            </div>

            <button
              className="modal-add-cart-btn"
              onClick={handleConfirmAddToCart}
            >
              Thêm vào giỏ hàng:{" "}
              <span>{formatPrice(product.price * quantity)}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;