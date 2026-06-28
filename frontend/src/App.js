import { useState, useRef } from "react";
import axios from "axios";

const SUGGESTIONS = [
  "What causes gear tooth breakage?",
  "How to prevent bearing wear?",
  "Lubrication best practices",
  "Signs of shaft misalignment",
];

function parseResult(text) {
  const lines = text.split("\n").filter(Boolean);
  const result = {};
  lines.forEach((line) => {
    if (line.startsWith("FAULT TYPE:")) result.faultType = line.replace("FAULT TYPE:", "").trim();
    else if (line.startsWith("CONFIDENCE:")) result.confidence = line.replace("CONFIDENCE:", "").trim();
    else if (line.startsWith("LOCATION:")) result.location = line.replace("LOCATION:", "").trim();
    else if (line.startsWith("SEVERITY:")) result.severity = line.replace("SEVERITY:", "").trim();
    else if (line.startsWith("EXPLANATION:")) result.explanation = line.replace("EXPLANATION:", "").trim();
    else if (line.startsWith("RECOMMENDATION:")) result.recommendation = line.replace("RECOMMENDATION:", "").trim();
  });
  if (!result.faultType) result.explanation = text;
  return result;
}

const colors = {
  bg: "#F5F0E8",
  card: "#FDFAF5",
  topbar: "#2C2416",
  accent: "#8B6914",
  accentLight: "#F0E6C8",
  accentMid: "#C4A35A",
  text: "#1C1810",
  textSec: "#6B5E45",
  textMut: "#A89880",
  border: "#E8DFC8",
  borderDark: "#D4C49A",
  userBubble: "#2C2416",
  botBubble: "#FDFAF5",
  danger: "#C0392B",
  dangerBg: "#FDF0EE",
  warn: "#B7770D",
  warnBg: "#FEF8EC",
  success: "#2E7D32",
  successBg: "#EDF7EE",
};

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rawResult, setRawResult] = useState("");
  const [parsed, setParsed] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const chatRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setRawResult("");
    setParsed(null);
  };

  const analyzeImage = async () => {
    if (!image) return;
    setImageLoading(true);
    setRawResult("Analyzing your component...");
    setParsed(null);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const res = await axios.post("http://localhost:5001/analyze-image", formData, { timeout: 60000 });
      setRawResult(res.data.result);
      setParsed(parseResult(res.data.result));
    } catch {
      setRawResult("Quota exceeded — please wait a minute and try again.");
    }
    setImageLoading(false);
  };

  const askQuestion = async (q) => {
    const text = q || question;
    if (!text.trim()) return;
    setChatHistory((p) => [...p, { role: "user", text }]);
    setQuestion("");
    setChatLoading(true);
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
    try {
      const res = await axios.post("http://localhost:5001/chat", { question: text }, { timeout: 60000 });
      setChatHistory((p) => [...p, { role: "bot", text: res.data.answer }]);
    } catch {
      setChatHistory((p) => [...p, { role: "bot", text: "Quota exceeded — please wait a minute and try again." }]);
    }
    setChatLoading(false);
    setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
  };

  const severityColor = (s) => {
    if (!s) return colors.textMut;
    const l = s.toLowerCase();
    if (l.includes("critical")) return colors.danger;
    if (l.includes("moderate")) return colors.warn;
    return colors.success;
  };

  const severityBg = (s) => {
    if (!s) return "#f0f0f0";
    const l = s.toLowerCase();
    if (l.includes("critical")) return colors.dangerBg;
    if (l.includes("moderate")) return colors.warnBg;
    return colors.successBg;
  };

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: colors.bg, minHeight: "100vh" }}>

      {/* TOPBAR */}
      <div style={{ background: colors.topbar, padding: "0 2rem", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, background: colors.accentMid, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚙️</div>
          <div>
            <div style={{ color: "#F5F0E8", fontSize: 15, fontWeight: 600, letterSpacing: "0.3px" }}>Mechanical Fault Analyzer</div>
            <div style={{ color: colors.accentMid, fontSize: 11 }}></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Fault Detection", "Manual Chat", "History"].map((t) => (
            <span key={t} style={{ color: t === "Fault Detection" ? colors.accentMid : "#A89070", fontSize: 13, cursor: "pointer", borderBottom: t === "Fault Detection" ? `1.5px solid ${colors.accentMid}` : "none", paddingBottom: 2 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, #2C2416 0%, #4A3728 100%)`, padding: "2rem 2rem 1.75rem" }}>
        <div style={{ maxWidth: 700 }}>
          <div style={{ display: "inline-block", background: "rgba(196,163,90,0.2)", border: "1px solid rgba(196,163,90,0.4)", borderRadius: 20, padding: "3px 12px", fontSize: 11, color: colors.accentMid, marginBottom: 12, letterSpacing: "0.5px", fontFamily: "system-ui" }}>
          
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#F5F0E8", marginBottom: 8, lineHeight: 1.3, fontFamily: "'Georgia', serif" }}>
            Detect faults.<br />Understand failures.
          </h1>
          <p style={{ fontSize: 14, color: "#C4B49A", lineHeight: 1.7, marginBottom: "1.25rem", fontFamily: "system-ui" }}>
            Upload an image of any mechanical component — gears, bearings, shafts — and get an instant AI-powered diagnosis with engineering manual references.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { icon: "🤖", val: "Gemini 2.0", label: "Vision model" },
              { icon: "📖", val: "4,172 chunks", label: "Manual indexed" },
              { icon: "🔬", val: "6 fault types", label: "Detectable" },
            ].map((s) => (
              <div key={s.val} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,163,90,0.25)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{s.icon}</span>
                <div style={{ fontFamily: "system-ui" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#F5F0E8" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#A89070" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", padding: "1.25rem 2rem 2rem" }}>

        {/* LEFT */}
        <div style={{ background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 8, background: "#FAF6EE" }}>
            <span style={{ fontSize: 16 }}>📸</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: "system-ui" }}>Component image</span>
          </div>
          <div style={{ padding: "1.25rem" }}>
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{ border: `2px dashed ${dragOver ? colors.accentMid : colors.borderDark}`, borderRadius: 12, padding: "1.75rem", textAlign: "center", background: dragOver ? colors.accentLight : "#FAF6EE", cursor: "pointer", marginBottom: "1rem", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: 30, marginBottom: 8 }}>🖼️</div>
              <div style={{ fontSize: 13, color: colors.textSec, marginBottom: 3, fontFamily: "system-ui" }}>Drop your image here or <span style={{ color: colors.accent, fontWeight: 600 }}>click to browse</span></div>
              <div style={{ fontSize: 11, color: colors.textMut, fontFamily: "system-ui" }}>JPG, PNG — up to 10MB</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />

            {preview && (
              <div style={{ position: "relative", marginBottom: "1rem" }}>
                <img src={preview} alt="preview" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 10, border: `1px solid ${colors.border}` }} />
                <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(44,36,22,0.7)", borderRadius: 6, padding: "3px 8px", fontSize: 11, color: "#F5F0E8", fontFamily: "system-ui" }}>
                  {image?.name}
                </div>
              </div>
            )}

            <button
              onClick={analyzeImage}
              disabled={!image || imageLoading}
              style={{ width: "100%", padding: "12px", background: !image || imageLoading ? colors.borderDark : colors.topbar, color: "#F5F0E8", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: image && !imageLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, letterSpacing: "0.3px", fontFamily: "system-ui", transition: "background 0.2s" }}
            >
              {imageLoading ? "⏳  Analyzing your component..." : "🧠  Analyze with AI"}
            </button>

            {rawResult && !parsed && (
              <div style={{ marginTop: "1rem", background: colors.accentLight, borderRadius: 10, padding: "1rem", fontSize: 13, color: colors.textSec, borderLeft: `3px solid ${colors.accentMid}`, fontFamily: "system-ui", lineHeight: 1.6 }}>
                {rawResult}
              </div>
            )}

            {parsed && (
              <div style={{ marginTop: "1rem", borderRadius: 12, border: `1px solid ${colors.border}`, overflow: "hidden" }}>
                <div style={{ background: colors.topbar, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "#F5F0E8", fontSize: 13, fontWeight: 600, fontFamily: "system-ui" }}>🔍 Diagnosis result</span>
                  {parsed.severity && (
                    <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: severityBg(parsed.severity), color: severityColor(parsed.severity), fontWeight: 700, fontFamily: "system-ui" }}>
                      {parsed.severity}
                    </span>
                  )}
                </div>
                <div style={{ padding: "14px 16px", background: colors.card }}>
                  {parsed.faultType && <div style={{ fontSize: 15, fontWeight: 700, color: colors.text, marginBottom: 6, fontFamily: "system-ui" }}>{parsed.faultType}</div>}
                  {parsed.explanation && <div style={{ fontSize: 13, color: colors.textSec, lineHeight: 1.7, marginBottom: 12, fontFamily: "system-ui" }}>{parsed.explanation}</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[{ label: "Confidence", val: parsed.confidence }, { label: "Location", val: parsed.location }].filter(i => i.val).map((item) => (
                      <div key={item.label} style={{ background: colors.accentLight, borderRadius: 8, padding: "8px 10px", border: `1px solid ${colors.borderDark}` }}>
                        <div style={{ fontSize: 10, color: colors.textMut, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: "system-ui" }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: "system-ui" }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                  {parsed.recommendation && (
                    <div style={{ background: colors.warnBg, borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${colors.warn}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.warn, marginBottom: 4, fontFamily: "system-ui", letterSpacing: "0.5px" }}>⚡ RECOMMENDATION</div>
                      <div style={{ fontSize: 13, color: colors.textSec, lineHeight: 1.6, fontFamily: "system-ui" }}>{parsed.recommendation}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ background: colors.card, borderRadius: 14, border: `1px solid ${colors.border}`, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 8, background: "#FAF6EE" }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, fontFamily: "system-ui" }}>Ask the engineering manual</div>
              <div style={{ fontSize: 11, color: colors.textMut, fontFamily: "system-ui" }}>4,172 chunks indexed from maintenance handbook</div>
            </div>
          </div>

          <div style={{ padding: "1rem 1.25rem 0.5rem" }}>
            <div style={{ fontSize: 10, color: colors.textMut, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, fontFamily: "system-ui" }}>Try asking</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => askQuestion(s)} style={{ fontSize: 11, padding: "5px 11px", borderRadius: 20, border: `1px solid ${colors.borderDark}`, background: colors.accentLight, color: colors.accent, cursor: "pointer", fontFamily: "system-ui", fontWeight: 500 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 14, minHeight: 260, maxHeight: 360, background: "#FAF6EE", margin: "0.75rem 1.25rem 0", borderRadius: 10, border: `1px solid ${colors.border}` }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign: "center", color: colors.textMut, fontSize: 13, marginTop: "2.5rem", fontFamily: "system-ui" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📖</div>
                Ask about mechanical failures, maintenance procedures, or fault causes...
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: 10, color: colors.textMut, marginBottom: 4, fontWeight: 700, fontFamily: "system-ui" }}>{msg.role === "user" ? "You" : "Manual AI"}</div>
                <div style={{ maxWidth: "88%", padding: "10px 14px", borderRadius: 14, fontSize: 13, lineHeight: 1.7, fontFamily: "system-ui", background: msg.role === "user" ? colors.userBubble : colors.card, color: msg.role === "user" ? "#F5F0E8" : colors.text, border: msg.role === "bot" ? `1px solid ${colors.border}` : "none", borderBottomRightRadius: msg.role === "user" ? 4 : 14, borderBottomLeftRadius: msg.role === "bot" ? 4 : 14 }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ fontSize: 10, color: colors.textMut, marginBottom: 4, fontWeight: 700, fontFamily: "system-ui" }}>Manual AI</div>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, borderBottomLeftRadius: 4, padding: "10px 14px", fontSize: 13, color: colors.textMut, fontFamily: "system-ui" }}>Searching manual...</div>
              </div>
            )}
          </div>

          <div style={{ padding: "1rem 1.25rem", display: "flex", gap: 8 }}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askQuestion()}
              placeholder="e.g. What causes gear tooth breakage?"
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${colors.borderDark}`, fontSize: 13, outline: "none", background: "#FAF6EE", color: colors.text, fontFamily: "system-ui" }}
            />
            <button
              onClick={() => askQuestion()}
              disabled={chatLoading}
              style={{ padding: "10px 18px", background: colors.topbar, color: "#F5F0E8", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}
            >
              Send ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}