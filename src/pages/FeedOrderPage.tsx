import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { finalizeOrder, removeFromFeedOrder } from "@/store/farmSlice";

// Mock pricing table
const FEED_PRICES: Record<string, number> = {
  "Feed": 22,
  "Pellets": 18,
  "Hay Bale": 12,
  "Senior Feed": 28,
  "Performance Mix": 32
};

const SUPPLEMENT_PRICES: Record<string, number> = {
  "Supplement": 14,
  "Joint Support": 32,
  "Electrolytes": 18,
  "Hoof Health": 26
};

// Standard feed bag size
const BAG_SIZE_LBS = 50;

// Format feed quantity into “50 lb bag” or “100 lb (2 bags)”
const formatFeedLabel = (quantity: number) => {
  if (quantity === BAG_SIZE_LBS) return `${quantity} lb bag`;

  const bags = quantity / BAG_SIZE_LBS;
  return `${quantity} lb (${bags.toFixed(1)} bags)`;
};

const getFeedPrice = (name: string) => FEED_PRICES[name] ?? 20;
const getSupplementPrice = (name: string) => SUPPLEMENT_PRICES[name] ?? 15;

export const FeedOrderPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const feedOrder = useSelector((state: RootState) => state.farm.feedOrder);
  const pastOrders = useSelector((state: RootState) => state.farm.pastOrders);
  const animals = useSelector((state: RootState) => state.farm.animals);

  // Compute active order total
  const activeOrderTotal = feedOrder.reduce((sum, item) => {
    if (item.itemType === "feed") {
      const bags = item.quantity / BAG_SIZE_LBS;
      return sum + getFeedPrice(item.name) * bags;
    } else {
      return sum + getSupplementPrice(item.name) * item.quantity;
    }
  }, 0);

  return (
    <div className="p-6 md:p-8 space-y-10">

      <h1 className="text-3xl font-bold tracking-tight page-title-banner">Feed Orders</h1>

      {/* ACTIVE ORDER */}
      <div className="panel active-order-card">
        <h2 className="panel-title">Active Order</h2>

        {feedOrder.length === 0 ? (
          <p className="text-gray-700">No items in the current order.</p>
        ) : (
          <div className="receipt-card">
            {feedOrder.map((item, index) => {
              const horse = animals.find(a => a.id === item.horseId);

              let price = 0;
              let lineTotal = 0;
              let label = "";

              const productType = item.productType ?? item.name;
              const brandSuffix = item.brand ? ` • ${item.brand}` : "";

              if (item.itemType === "feed") {
                price = getFeedPrice(productType);
                const bags = item.quantity / BAG_SIZE_LBS;
                lineTotal = price * bags;
                label = `${formatFeedLabel(item.quantity)} · ${productType}${brandSuffix} @ $${price.toFixed(2)}`;
              } else {
                price = getSupplementPrice(productType);
                lineTotal = price * item.quantity;
                label = `${item.quantity} units · ${productType}${brandSuffix} @ $${price.toFixed(2)}`;
              }

              return (
                <div key={index} className="receipt-item flex items-center justify-between gap-4">
                  <div>
                    {productType} {item.brand ? `• ${item.brand}` : ""} — {horse?.name ?? `Horse #${item.horseId}`}
                    <div className="text-xs text-gray-600">{label}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-right font-semibold">
                      ${lineTotal.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className="button text-sm"
                      onClick={() => {
                        if (window.confirm("Remove this item from the feed order?")) {
                          dispatch(removeFromFeedOrder({ index }));
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="receipt-item font-bold text-lg pt-2">
              <span>Total</span>
              <span>${activeOrderTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {feedOrder.length > 0 && (
          <button
            className="button mt-4"
            onClick={() => dispatch(finalizeOrder())}
          >
            Finalize Order
          </button>
        )}
      </div>

      {/* PAST ORDERS */}
      <div className="panel">
        <h2 className="panel-title">Previous Orders</h2>

        {pastOrders.length === 0 && (
          <p className="text-gray-700 wood-text-box">No previous orders yet.</p>
        )}

        <div className="order-history-grid">
          {pastOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-title">Order #{order.id}</div>
            <div className="order-meta">
              {order.date} • {order.items.length} items
            </div>

            <div className="receipt-card">
              {order.items.map((item, index) => {
                const horse = animals.find(a => a.id === item.horseId);

                let price = 0;
                let lineTotal = 0;
                let label = "";

                const productType = item.productType ?? item.name;
                const brandSuffix = item.brand ? ` • ${item.brand}` : "";

                if (item.itemType === "feed") {
                  price = getFeedPrice(productType);
                  const bags = item.quantity / BAG_SIZE_LBS;
                  lineTotal = price * bags;
                  label = `${formatFeedLabel(item.quantity)} · ${productType}${brandSuffix} @ $${price.toFixed(2)}`;
                } else {
                  price = getSupplementPrice(productType);
                  lineTotal = price * item.quantity;
                  label = `${item.quantity} units · ${productType}${brandSuffix} @ $${price.toFixed(2)}`;
                }

                return (
                  <div key={index} className="receipt-item">
                    <span>
                      {productType}{item.brand ? ` • ${item.brand}` : ""} — {horse?.name ?? `Horse #${item.horseId}`}
                      <div className="text-xs text-gray-600">{label}</div>
                    </span>

                    <span className="text-right font-semibold">
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="order-total">
              Total: ${order.totalPrice?.toFixed(2) ?? "0.00"}
            </div>
          </div>
        ))}
        </div>
      </div>

    </div>
  );
};






