import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { toast } from "react-toastify";
import {
  getCartItems,
  addProductToCart,
  updateCartItemQuantity,
  removeCartItem,
  // clearCart, // إن كانت متوفرة في API عندك فعّلها واستعملها تحت
} from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // مساعد: هل الرد فيه بيانات سلة صالحة؟
  const hasCartPayload = (payload) => {
    const raw = payload?.data ?? payload ?? {};
    return (
      Array.isArray(raw.items) ||
      Array.isArray(raw.cart_items) ||
      Array.isArray(payload?.items) ||
      Array.isArray(payload?.cart_items)
    );
  };

  // توحيد وفكّ الردود المختلفة
  const syncFromResponse = useCallback((payload) => {
    const raw =
      payload?.data?.cart ??
      payload?.cart ??
      payload?.data ??
      payload ??
      {};

    const itemsArr = Array.isArray(raw.cart_items)
      ? raw.cart_items
      : Array.isArray(raw.items)
      ? raw.items
      : Array.isArray(payload?.cart_items)
      ? payload.cart_items
      : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload)
      ? payload
      : [];

    const computedCount = itemsArr.reduce(
      (sum, it) => sum + Number(it.quantity ?? 1),
      0
    );

    const computedTotalFromItems = itemsArr.reduce((sum, it) => {
      const price = Number(it.price ?? it.product?.price ?? 0);
      const qty = Number(it.quantity ?? 1);
      return sum + price * qty;
    }, 0);

    const nextCount = Number(raw.count ?? computedCount ?? 0);
    const nextTotal = Number(
      raw.total ?? raw.total_amount ?? computedTotalFromItems ?? 0
    );

    setItems(itemsArr);
    setCount(nextCount);
    setTotal(nextTotal);
  }, []);

  // جلب السلة (لا يعمل للزائر)
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return; // لا تجيب سلة لغير الموثّق
    try {
      setLoading(true);
      const data = await getCartItems(); // اسم دالتك الحالي
      // console.log("getCart response >>>", data);
      syncFromResponse(data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, syncFromResponse]);

  // عند تغيّر حالة المصادقة
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // تنظيف سلة الواجهة لو خرج المستخدم
      setItems([]);
      setCount(0);
      setTotal(0);
    }
  }, [isAuthenticated, fetchCart]);

  // إضافة للسلة
  const add = useCallback(
    async (productId, quantity = 1) => {
      try {
        const resp = await addProductToCart(productId, quantity);
        if (hasCartPayload(resp)) {
          syncFromResponse(resp);
        } else {
          await fetchCart(); // fallback لتحديث العداد لو الـAPI ما رجّع السلة
        }
        toast.success("تمت الإضافة إلى السلة");
      } catch (err) {
        console.error("addProductToCart error", err);
        toast.error("فشل إضافة المنتج");
        throw err;
      }
    },
    [fetchCart, syncFromResponse]
  );

  // تعديل كمية عنصر
  const updateQty = useCallback(
    async (cartItemId, quantity) => {
      try {
        const resp = await updateCartItemQuantity(cartItemId, quantity);
        if (hasCartPayload(resp)) {
          syncFromResponse(resp);
        } else {
          await fetchCart();
        }
      } catch (err) {
        console.error("updateCartItemQuantity error", err);
        toast.error("تعذّر تحديث الكمية");
        throw err;
      }
    },
    [fetchCart, syncFromResponse]
  );

  // حذف عنصر
  const remove = useCallback(
    async (cartItemId) => {
      try {
        const resp = await removeCartItem(cartItemId);
        if (hasCartPayload(resp)) {
          syncFromResponse(resp);
        } else {
          await fetchCart();
        }
        toast.info("تم حذف العنصر من السلة");
      } catch (err) {
        console.error("removeCartItem error", err);
        toast.error("تعذّر حذف العنصر");
        throw err;
      }
    },
    [fetchCart, syncFromResponse]
  );

  // تفريغ السلة (محليًا مؤقتًا — فعّل API لو عندك)
  const clear = useCallback(async () => {
    try {
      // إن كان عندك clearCart في API فعّل السطرين:
      // const resp = await clearCart();
      // if (hasCartPayload(resp)) { syncFromResponse(resp); return; }

      // محليًا
      setItems([]);
      setCount(0);
      setTotal(0);
      toast.info("تم تفريغ السلة");
    } catch (e) {
      console.error("clearCart failed", e);
      toast.error("تعذّر تفريغ السلة");
    }
  }, []);

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      loading,
      fetchCart,
      add,
      updateQty,
      remove,
      clear,
    }),
    [items, count, total, loading, fetchCart, add, updateQty, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};