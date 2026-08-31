import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useDemoAuth } from "@/contexts/DemoAuthContext";
import {
  markFeedLow,
  clearFeedLow,
  markSupplementLow,
  clearSupplementLow,
  addToFeedOrder,
  removeFromFeedOrder
} from "@/store/farmSlice";

export const AnimalListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const animals = useSelector((state: RootState) => state.farm.animals);
  const feedOrder = useSelector((state: RootState) => state.farm.feedOrder);
  const location = useLocation();
  const cameFromChecklist = (location.state as { from?: string } | null)?.from === "checklist";
  const { user } = useDemoAuth();
  const canMarkFeedLow = user?.role === "manager" || user?.role === "staff";

  const removeOrderItem = (
    horseId: number,
    itemType: "feed" | "supplement",
    name?: string
  ) => {
    const index = feedOrder.findIndex(item =>
      item.horseId === horseId &&
      item.itemType === itemType &&
      (itemType === "feed" || item.name === name)
    );
    if (index >= 0) {
      dispatch(removeFromFeedOrder({ index }));
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold page-title-banner">Animals</h1>
        {cameFromChecklist && (
          <Link
            to="/demo/staff/dashboard"
            className="review-animals-link inline-flex items-center justify-center rounded-md bg-amber-700 px-4 py-2 text-white hover:bg-amber-800 shadow-sm"
          >
            Continue Checklist
          </Link>
        )}
      </div>

      <ul className="space-y-4">
        {animals.map(a => (
          <li key={a.id}>
            <div className="bulletin-item horse-card">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Link to={`/animals/${a.id}`} className="flex-1 flex items-center gap-4">
                  <img
                    src={a.image}
                    alt={`${a.name} portrait`}
                    className="horse-thumb"
                    loading="lazy"
                  />
                  <div>
                    <strong>{a.name}</strong> — {a.breed}
                    <div className="text-sm text-gray-700">Stall: {a.stall} · Pasture: {a.pasture} · Next vet: {a.health.vet}</div>
                  </div>
                </Link>

                {canMarkFeedLow && (
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (a.feed.low) {
                          dispatch(clearFeedLow({ horseId: a.id }));
                          removeOrderItem(a.id, "feed");
                        } else {
                          dispatch(markFeedLow({ horseId: a.id }));
                          const alreadyOrdered = feedOrder.some(
                            item => item.horseId === a.id && item.itemType === "feed"
                          );
                          if (!alreadyOrdered) {
                            dispatch(addToFeedOrder({
                              horseId: a.id,
                              itemType: "feed",
                              name: a.feed.type || "Feed",
                              productType: a.feed.type,
                              brand: a.feed.brand,
                              quantity: 50,
                            }));
                          }
                        }
                      }}
                      className="px-3 py-2 text-sm rounded-md border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    >
                      {a.feed.low ? "Clear feed low" : "Mark feed low"}
                    </button>

                    {a.supplements.map(supp => (
                      <button
                        key={supp.name}
                        type="button"
                        onClick={() => {
                          if (supp.low) {
                            dispatch(clearSupplementLow({ horseId: a.id, supplementName: supp.name }));
                            removeOrderItem(a.id, "supplement", supp.name);
                          } else {
                            dispatch(markSupplementLow({ horseId: a.id, supplementName: supp.name }));
                            const alreadyOrdered = feedOrder.some(
                              item =>
                                item.horseId === a.id &&
                                item.itemType === "supplement" &&
                                item.name === supp.name
                            );
                            if (!alreadyOrdered) {
                              dispatch(addToFeedOrder({
                                horseId: a.id,
                                itemType: "supplement",
                                name: supp.name,
                                productType: supp.type,
                                brand: supp.brand,
                                quantity: 1,
                              }));
                            }
                          }
                        }}
                        className="px-3 py-2 text-sm rounded-md border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      >
                        {supp.low ? `Clear ${supp.name}` : `Mark ${supp.name} low`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
