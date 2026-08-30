import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { animals as initialAnimals } from "@/demo-data/animals";
import { farmMap } from "@/demo-data/farm";

export interface FeedOrderItem {
  horseId: number;
  itemType: "feed" | "supplement";
  name: string;
  quantity: number;
  productType?: string;
  brand?: string;
}

export interface FarmState {
  farmId: string;
  animals: typeof initialAnimals;
  locations: typeof farmMap.locations;
  feedOrder: FeedOrderItem[];
  pastOrders: {
    id: number;
    date: string;
    items: FeedOrderItem[];
    totalPrice: number;
  }[];
}

const defaultFeedMetadata: Record<number, { type: string; brand: string }> = {
  1: { type: "Sweet Feed", brand: "Golden Meadow" },
  2: { type: "Senior Feed", brand: "Harvest Ridge" },
  3: { type: "Performance Mix", brand: "Sunrise Stables" },
  4: { type: "Senior Feed", brand: "Harvest Ridge" },
  5: { type: "Sweet Feed", brand: "Golden Meadow" },
  6: { type: "Performance Mix", brand: "Sunrise Stables" },
  7: { type: "Sweet Feed", brand: "Golden Meadow" },
  8: { type: "Senior Feed", brand: "Harvest Ridge" },
  9: { type: "Sweet Feed", brand: "Golden Meadow" },
  10: { type: "Senior Feed", brand: "Harvest Ridge" }
};

const normalizeAnimalFeedData = (animals: typeof initialAnimals) =>
  animals.map(animal => {
    const metadata = defaultFeedMetadata[animal.id] ?? { type: "Sweet Feed", brand: "Golden Meadow" };
    return {
      ...animal,
      feed: {
        ...animal.feed,
        type: animal.feed.type ?? metadata.type,
        brand: animal.feed.brand ?? metadata.brand
      },
      supplements: animal.supplements.map(supplement => ({
        ...supplement,
        type: supplement.type ?? (supplement.name === "Magnesium" ? "Mineral Supplement" : "Hydration Mix"),
        brand: supplement.brand ?? (supplement.name === "Magnesium" ? "Horizon" : "EquiBoost")
      }))
    };
  });

const initialState: FarmState = {
  farmId: crypto.randomUUID(),
  animals: normalizeAnimalFeedData(initialAnimals),
  locations: farmMap.locations,
  feedOrder: [],
  pastOrders: []   // ✅ FIXED — must be an array
};

export const farmSlice = createSlice({
  name: "farm",
  initialState,
  reducers: {
    assignAnimalOptimistic: (state, action) => {
      const { animalId, locationName } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (!animal) return;

      if (locationName.startsWith("Stall")) {
        animal.stall = locationName;
        animal.pasture = "";
      }

      if (locationName.startsWith("Pasture")) {
        animal.pasture = locationName;
        animal.stall = "";
      }
    },

    assignAnimalToLocation: (state, action) => {
      const { animalId, locationName } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (!animal) return;

      animal.pasture = "";
      animal.stall = "";

      if (locationName.startsWith("Stall")) {
        animal.stall = locationName;
      } else if (locationName.startsWith("Pasture")) {
        animal.pasture = locationName;
      }
    },

    setAnimalLocationLabel(
      state,
      action: PayloadAction<{ animalId: number; stall: string; pasture: string }>
    ) {
      const animal = state.animals.find((a) => a.id === action.payload.animalId);
      if (!animal) return;
      animal.stall = action.payload.stall;
      animal.pasture = action.payload.pasture;
    },

    markFeedLow: (state, action) => {
      const horse = state.animals.find(a => a.id === action.payload.horseId);
      if (!horse) return;
      horse.feed.low = true;
    },

    clearFeedLow: (state, action) => {
      const horse = state.animals.find(a => a.id === action.payload.horseId);
      if (!horse) return;
      horse.feed.low = false;
    },

    markSupplementLow: (state, action) => {
      const horse = state.animals.find(a => a.id === action.payload.horseId);
      if (!horse) return;

      const supplement = horse.supplements.find(
        s => s.name === action.payload.supplementName
      );
      if (!supplement) return;

      supplement.low = true;
    },

    clearSupplementLow: (state, action) => {
      const horse = state.animals.find(a => a.id === action.payload.horseId);
      if (!horse) return;

      const supplement = horse.supplements.find(
        s => s.name === action.payload.supplementName
      );
      if (!supplement) return;

      supplement.low = false;
    },

    addToFeedOrder: (state, action) => {
      state.feedOrder.push(action.payload);
    },

    removeFromFeedOrder: (state, action) => {
      state.feedOrder.splice(action.payload.index, 1);
    },

    updateAnimalImage: (
      state,
      action: PayloadAction<{ animalId: number; image: string }>
    ) => {
      const animal = state.animals.find(a => a.id === action.payload.animalId);
      if (!animal) return;
      animal.image = action.payload.image;
    },

    recordProviderVisit: (
      state,
      action: PayloadAction<{
        animalId: number;
        field: "lastVet" | "lastFarrier" | "lastDentist" | "lastChiropractor";
        date: string;
      }>
    ) => {
      const animal = state.animals.find(a => a.id === action.payload.animalId);
      if (!animal) return;
      animal.health[action.payload.field] = action.payload.date;
    },

    finalizeOrder: (state) => {
      const BAG_SIZE_LBS = 50;

      const FEED_PRICES: Record<string, number> = {
        "Feed": 22,
        "Sweet Feed": 24,
        "Senior Feed": 28,
        "Performance Mix": 32,
        "Pellets": 18,
        "Hay Bale": 12,
      };

      const SUPPLEMENT_PRICES: Record<string, number> = {
        "Magnesium": 18,
        "Electrolytes": 18,
        "Joint Support": 32,
        "Hoof Health": 26,
        "Digestive Support": 20,
      };

      const getFeedPrice = (name: string) => FEED_PRICES[name] ?? 20;
      const getSupplementPrice = (name: string) => SUPPLEMENT_PRICES[name] ?? 15;

      const totalPrice = state.feedOrder.reduce((sum, item) => {
        const itemName = item.productType ?? item.name;
        if (item.itemType === "feed") {
          const bags = item.quantity / BAG_SIZE_LBS;
          return sum + getFeedPrice(itemName) * bags;
        } else {
          return sum + getSupplementPrice(itemName) * item.quantity;
        }
      }, 0);

      state.pastOrders.push({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        items: state.feedOrder,
        totalPrice
      });

      state.feedOrder = [];
    }
  }
});

export const {
  assignAnimalOptimistic,
  assignAnimalToLocation,
  setAnimalLocationLabel,
  markFeedLow,
  clearFeedLow,
  markSupplementLow,
  clearSupplementLow,
  addToFeedOrder,
  removeFromFeedOrder,
  updateAnimalImage,
  recordProviderVisit,
  finalizeOrder
} = farmSlice.actions;

export const farmReducer = farmSlice.reducer;

