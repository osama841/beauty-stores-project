import { useState, useEffect } from "react";

export default function SmartImage({
  src,
  alt = "",
  className = "",
  fallback = "/fallback.png",
  style = {},
}) {
  const [error, setError] = useState(null);
  const [finalSrc, setFinalSrc] = useState(src);

  useEffect(() => {
    setError(null);
    setFinalSrc(src);
  }, [src]);

  const handleError = async () => {
    try {
      // جرب نطلب HEAD نفس الرابط لمعرفة السبب
      const r = await fetch(finalSrc, { method: "HEAD" });
      const ct = r.headers.get("content-type");
      // لو السيرفر رجّع HTML بدل صورة، وضّحها في اللوغ
      if (!r.ok || (ct && ct.includes("text/html"))) {
        console.error(
          "[IMG ERROR]",
          { url: finalSrc, status: r.status, contentType: ct }
        );
        setError(`فشل تحميل الصورة (${r.status || "?"})`);
        setFinalSrc(fallback); // أظهر بديل
        return;
      }
    } catch (err) {
      console.error("[IMG ERROR] fetch HEAD failed:", err?.message || err);
      setError("تعذر الاتصال بمصدر الصورة");
      setFinalSrc(fallback);
      return;
    }
  };

  return (
    <div className="smart-image-wrapper" style={{ position: "relative", display: "inline-block" }}>
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        style={style}
        onError={handleError}
        loading="lazy"
      />
      {error && (
        <span
          className="img-error-badge"
          style={{
            position: "absolute",
            insetInlineEnd: 6,
            insetBlockStart: 6,
            background: "rgba(220,53,69,.92)",
            color: "#fff",
            padding: "2px 6px",
            borderRadius: 6,
            fontSize: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,.2)",
          }}
          title={error}
        >
          ! صورة
        </span>
      )}
    </div>
  );
}
