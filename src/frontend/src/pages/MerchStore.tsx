import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";

export default function MerchStore() {
  const { merchProducts, addMerchSale, setMerchProducts } = useApp();
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎁");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) return;
    const price = Number.parseFloat(newPrice);
    if (Number.isNaN(price) || price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    const newProduct = {
      id: `m-${Date.now()}`,
      name: newName.trim(),
      price,
      emoji: newEmoji || "🎁",
      totalSales: 0,
      totalRevenue: 0,
    };
    setMerchProducts((prev) => [...prev, newProduct]);
    toast.success(`${newEmoji} "${newName}" added to your store!`);
    setNewName("");
    setNewPrice("");
    setNewEmoji("🎁");
  };

  const handleSimulateSale = (
    productId: string,
    name: string,
    emoji: string,
  ) => {
    addMerchSale(productId);
    toast.success(`${emoji} Someone just bought "${name}"! 🎉`, {
      duration: 3000,
    });
  };

  const cardStyle: React.CSSProperties = {
    background: "oklch(0.16 0.018 280 / 0.8)",
    border: "1px solid oklch(0.28 0.025 280 / 0.5)",
    borderRadius: "16px",
    backdropFilter: "blur(16px)",
  };

  return (
    <div
      data-ocid="merch.page"
      className="max-w-4xl mx-auto py-6 px-4 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Merch Store
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your merchandise and simulate sales
        </p>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={cardStyle}
        className="p-5"
      >
        <h2 className="text-sm font-semibold mb-4">Your Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchProducts.map((product, i) => (
            <motion.div
              key={product.id}
              data-ocid={`merch.product.item.${i + 1}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="p-4 rounded-xl flex flex-col gap-3"
              style={{
                background: "oklch(0.13 0.016 280 / 0.6)",
                border: "1px solid oklch(0.25 0.02 280 / 0.4)",
              }}
            >
              {/* Product header */}
              <div className="flex items-start gap-3">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: "oklch(0.2 0.02 280 / 0.6)" }}
                >
                  {product.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight">
                    {product.name}
                  </p>
                  <p
                    className="text-lg font-bold mt-0.5"
                    style={{ color: "oklch(0.72 0.18 150)" }}
                  >
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="p-2 rounded-lg text-center"
                  style={{ background: "oklch(0.18 0.02 280 / 0.5)" }}
                >
                  <p className="text-xs text-muted-foreground">Sales</p>
                  <p className="font-bold text-sm">{product.totalSales}</p>
                </div>
                <div
                  className="p-2 rounded-lg text-center"
                  style={{ background: "oklch(0.18 0.02 280 / 0.5)" }}
                >
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p
                    className="font-bold text-sm"
                    style={{ color: "oklch(0.72 0.18 150)" }}
                  >
                    ${product.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Simulate sale button */}
              <button
                type="button"
                data-ocid={`merch.simulate_sale.button.${i + 1}`}
                onClick={() =>
                  handleSimulateSale(product.id, product.name, product.emoji)
                }
                className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))",
                  color: "white",
                }}
              >
                Simulate Sale 🛒
              </button>
            </motion.div>
          ))}

          {merchProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">🛍️</p>
              <p>No products yet. Add your first product below!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Product Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={cardStyle}
        className="p-5"
      >
        <h2 className="text-sm font-semibold mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label
                htmlFor="emoji-input"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Emoji Icon
              </label>
              <input
                id="emoji-input"
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="🎁"
                maxLength={4}
                className="w-full px-3 py-2 rounded-xl text-center text-xl"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.6)",
                  border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                  color: "oklch(0.95 0.01 260)",
                  outline: "none",
                }}
              />
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="product-name-input"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Product Name
              </label>
              <input
                id="product-name-input"
                type="text"
                data-ocid="merch.product_name.input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Signature Tee"
                className="w-full px-3 py-2 rounded-xl"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.6)",
                  border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                  color: "oklch(0.95 0.01 260)",
                  outline: "none",
                }}
              />
            </div>
            <div className="sm:col-span-1">
              <label
                htmlFor="product-price-input"
                className="text-xs text-muted-foreground mb-1.5 block"
              >
                Price ($)
              </label>
              <input
                id="product-price-input"
                type="number"
                data-ocid="merch.product_price.input"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="29.99"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 rounded-xl"
                style={{
                  background: "oklch(0.13 0.016 280 / 0.6)",
                  border: "1px solid oklch(0.28 0.025 280 / 0.5)",
                  color: "oklch(0.95 0.01 260)",
                  outline: "none",
                }}
              />
            </div>
          </div>
          <button
            type="submit"
            data-ocid="merch.add_product.button"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.55 0.2 240))",
              color: "white",
            }}
          >
            + Add Product
          </button>
        </form>
      </motion.div>

      {/* Sales Log from notifications is handled via the main notif system */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={cardStyle}
        className="p-5"
      >
        <h2 className="text-sm font-semibold mb-3">📊 Store Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Products",
              value: merchProducts.length,
              icon: "📦",
            },
            {
              label: "Total Sales",
              value: merchProducts.reduce((s, p) => s + p.totalSales, 0),
              icon: "🛒",
            },
            {
              label: "Total Revenue",
              value: `$${merchProducts.reduce((s, p) => s + p.totalRevenue, 0).toFixed(2)}`,
              icon: "💰",
            },
            {
              label: "Best Seller",
              value:
                merchProducts.length > 0
                  ? `${merchProducts.sort((a, b) => b.totalSales - a.totalSales)[0].emoji} ${merchProducts.sort((a, b) => b.totalSales - a.totalSales)[0].name.split(" ")[0]}`
                  : "—",
              icon: "🏆",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl text-center"
              style={{
                background: "oklch(0.13 0.016 280 / 0.6)",
                border: "1px solid oklch(0.25 0.02 280 / 0.4)",
              }}
            >
              <div className="text-xl mb-1">{stat.icon}</div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p
                className="font-bold text-sm mt-0.5"
                style={{ color: "oklch(0.72 0.18 150)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
