import React, { useState, useEffect, useMemo, useRef } from "react";
import { Scale, Recycle, Receipt, Banknote, Building2, User, Truck, Warehouse, Factory, Camera, ScanLine, Search, Plus, Coins, TrendingUp, FileText, ChevronRight, ChevronLeft, Check, X, Trash2, ArrowRight, MapPin, Wallet, BadgeCheck, Clock, AlertTriangle, Settings, CreditCard, Printer, Smartphone, Bell, RefreshCw, Sparkles, Calculator, LogOut, Inbox, Send, MessageSquare, ShieldCheck, Megaphone, MoreHorizontal, Users } from "lucide-react";
/* ─────────── storage ─────────── */
const mem = new Map();
const lsGet = (k) => { try {
    if (typeof localStorage !== "undefined") {
        const v = localStorage.getItem(k);
        if (v != null)
            return v;
    }
}
catch (e) { } return mem.has(k) ? mem.get(k) : null; };
const store = {
    async get(k) {
        try {
            if (typeof window !== "undefined" && window.storage) {
                const r = await Promise.race([
                    Promise.resolve(window.storage.get(k)).catch(() => undefined),
                    new Promise((res) => setTimeout(() => res(undefined), 800)),
                ]);
                if (r === undefined || r === null)
                    return lsGet(k);
                return r.value != null ? r.value : null;
            }
        }
        catch (e) { }
        return lsGet(k);
    },
    async set(k, v) {
        try {
            if (typeof window !== "undefined" && window.storage) {
                await window.storage.set(k, v);
                return;
            }
        }
        catch (e) { }
        try {
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(k, v);
                return;
            }
        }
        catch (e) { }
        mem.set(k, v);
    },
};
const load = async (k, fb) => { const r = await store.get(k); if (r == null)
    return fb; try {
    return JSON.parse(r);
}
catch {
    return fb;
} };
const save = (k, v) => store.set(k, JSON.stringify(v));
/* ─────────── helpers ─────────── */
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
const pad = (n) => String(n).padStart(2, "0");
const now = () => new Date();
const todayStr = () => { const d = now(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const pln = (n) => (Math.round((n + Number.EPSILON) * 100) / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
const plnShort = (n) => Math.round(n).toLocaleString("pl-PL") + " zł";
const kg = (n) => (Math.round(n * 10) / 10).toLocaleString("pl-PL", { maximumFractionDigits: 1 }) + " kg";
const PL_MON = ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"];
const fmtTs = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtDate = (ts) => { const d = new Date(ts); return `${d.getDate()} ${PL_MON[d.getMonth()]} ${d.getFullYear()}`; };
const fnorm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
/* ─────────── seed data ─────────── */
const C = {
    FE: { code: "17 04 05", label: "Żelazo i stal", color: "#6b7787" },
    CU: { code: "17 04 01", label: "Miedź, brąz, mosiądz", color: "#c2703d" },
    AL: { code: "17 04 02", label: "Aluminium", color: "#8aa2ad" },
    PB: { code: "17 04 03", label: "Ołów", color: "#5a6470" },
    ZN: { code: "17 04 04", label: "Cynk", color: "#7f8b97" },
    SS: { code: "17 04 07", label: "Mieszaniny metali", color: "#3f7d8a" },
    KAB: { code: "17 04 11", label: "Kable", color: "#b9542f" },
    AKU: { code: "16 06 01", label: "Akumulatory ołowiowe", color: "#566" },
    EL: { code: "16 02 14", label: "Zużyte urządzenia", color: "#7c6f9b" },
};
const seedMaterials = () => [
    { id: "m_fe1", n: "Złom stalowy wsadowy", g: "FE", buy: 1.20, sell: 1.45, stock: 8420 },
    { id: "m_fe2", n: "Złom ciężki (gruby)", g: "FE", buy: 1.35, sell: 1.60, stock: 5100 },
    { id: "m_fe3", n: "Wióry stalowe", g: "FE", buy: 0.80, sell: 1.00, stock: 1240 },
    { id: "m_fe4", n: "Żeliwo", g: "FE", buy: 1.30, sell: 1.55, stock: 980 },
    { id: "m_fe5", n: "Blacha mieszana", g: "FE", buy: 1.00, sell: 1.25, stock: 2200 },
    { id: "m_cu1", n: "Miedź błyszcząca (1A)", g: "CU", buy: 30.50, sell: 33.00, stock: 145 },
    { id: "m_cu2", n: "Miedź mix", g: "CU", buy: 27.00, sell: 30.00, stock: 210 },
    { id: "m_br1", n: "Mosiądz", g: "CU", buy: 18.00, sell: 21.00, stock: 175 },
    { id: "m_br2", n: "Brąz", g: "CU", buy: 19.50, sell: 22.50, stock: 60 },
    { id: "m_kab1", n: "Kable miedziane", g: "KAB", buy: 18.00, sell: 22.00, stock: 320 },
    { id: "m_kab2", n: "Kable aluminiowe", g: "KAB", buy: 5.50, sell: 7.00, stock: 140 },
    { id: "m_al1", n: "Aluminium twarde", g: "AL", buy: 6.00, sell: 7.50, stock: 640 },
    { id: "m_al2", n: "Aluminium miękkie (profile)", g: "AL", buy: 7.00, sell: 8.50, stock: 410 },
    { id: "m_al3", n: "Puszki aluminiowe", g: "AL", buy: 3.50, sell: 5.00, stock: 180 },
    { id: "m_al4", n: "Felgi aluminiowe", g: "AL", buy: 7.50, sell: 9.00, stock: 95 },
    { id: "m_alcu", n: "Chłodnice Al-Cu", g: "CU", buy: 12.00, sell: 14.50, stock: 70 },
    { id: "m_pb1", n: "Ołów", g: "PB", buy: 6.50, sell: 8.00, stock: 130 },
    { id: "m_zn1", n: "Cynk", g: "ZN", buy: 6.00, sell: 7.50, stock: 90 },
    { id: "m_ss1", n: "Nierdzewka 18/8 (304)", g: "SS", buy: 5.50, sell: 7.00, stock: 240 },
    { id: "m_ss2", n: "Nierdzewka magnetyczna", g: "SS", buy: 2.50, sell: 3.50, stock: 160 },
    { id: "m_aku", n: "Akumulatory ołowiowe", g: "AKU", buy: 4.00, sell: 5.00, stock: 380 },
    { id: "m_sil", n: "Silniki elektryczne", g: "EL", buy: 4.50, sell: 6.00, stock: 0 },
].map((m) => ({ ...m, stock: 0 }));
const matMap = (mats) => Object.fromEntries(mats.map((m) => [m.id, m]));
const SEED_COMPANY = { name: "", nip: "", bdo: "", addr: "" };
const seedTx = () => {
    const t = todayStr();
    const at = (h, m) => new Date(`${t}T${pad(h)}:${pad(m)}:00`).getTime();
    return [
        { id: uid(), no: "FPO/2026/06/0007", ts: at(13, 42), kind: "FPO", payment: "gotowka", plate: "SK 12345",
            osoba: { imie: "Marek", nazwisko: "Kowalczyk", adres: "ul. Słoneczna 8, 41-200 Sosnowiec", dowod: "ABC456789" },
            pos: [{ matId: "m_fe1", n: "Złom stalowy wsadowy", g: "FE", w: 340, price: 1.20 }, { matId: "m_al1", n: "Aluminium twarde", g: "AL", w: 22, price: 6.00 }] },
        { id: uid(), no: "KPO/2026/06/0011", ts: at(12, 15), kind: "KPO", payment: "przelew", plate: "WZ 4521A",
            firma: { nazwa: "Instal-Bud Sp. z o.o.", nip: "634-11-22-333" },
            pos: [{ matId: "m_cu2", n: "Miedź mix", g: "CU", w: 64, price: 27.00 }, { matId: "m_kab1", n: "Kable miedziane", g: "KAB", w: 38, price: 18.00 }] },
        { id: uid(), no: "FPO/2026/06/0006", ts: at(10, 58), kind: "FPO", payment: "blik", plate: "SK 12345",
            osoba: { imie: "Anna", nazwisko: "Wiśniewska", adres: "ul. Polna 3, 40-100 Katowice", dowod: "DEF112233" },
            pos: [{ matId: "m_aku", n: "Akumulatory ołowiowe", g: "AKU", w: 48, price: 4.00 }] },
        { id: uid(), no: "FPO/2026/06/0005", ts: at(9, 30), kind: "FPO", payment: "gotowka", plate: "DG 7788X",
            osoba: { imie: "Tomasz", nazwisko: "Lewandowski", adres: "ul. Lipowa 22, 41-300 Dąbrowa Górnicza", dowod: "GHI778899" },
            pos: [{ matId: "m_fe2", n: "Złom ciężki (gruby)", g: "FE", w: 510, price: 1.35 }, { matId: "m_ss1", n: "Nierdzewka 18/8 (304)", g: "SS", w: 12, price: 5.50 }] },
    ];
};
const txTotal = (tx) => tx.pos.reduce((a, p) => a + p.w * p.price, 0);
const txMass = (tx) => tx.pos.reduce((a, p) => a + p.w, 0);
const supplierName = (tx) => tx.kind === "FPO" ? `${tx.osoba.imie} ${tx.osoba.nazwisko}` : tx.firma.nazwa;
const PAY = { gotowka: { label: "Gotówka", icon: Banknote }, przelew: { label: "Przelew", icon: CreditCard }, blik: { label: "BLIK", icon: Wallet } };
const seedControls = () => {
    const d = (days) => { const x = new Date(); x.setDate(x.getDate() + days); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`; };
    return [
        { id: uid(), name: "Legalizacja wagi", date: d(24), type: "Metrologia" },
        { id: uid(), name: "Przegląd monitoringu", date: d(8), type: "Bezpieczeństwo" },
        { id: uid(), name: "Sprawozdanie roczne BDO", date: d(74), type: "BDO" },
    ];
};
const seedUsers = () => [
    { id: "u_owner", login: "wlasciciel", pass: "1234", name: "Właściciel", role: "owner" },
    { id: "u_oper", login: "kierownik", pass: "1234", name: "Kierownik punktu", role: "operator" },
    { id: "u_ctrl", login: "kontroler", pass: "1234", name: "Kontroler", role: "controller" },
    { id: "u_mkt", login: "marketing", pass: "1234", name: "Marketing", role: "marketing" },
    { id: "u_ksieg", login: "ksiegowy", pass: "1234", name: "Księgowy", role: "accountant" },
    { id: "u_klient", login: "klient", pass: "1234", name: "Jan Klient", role: "client" },
];
const ROLE_LABEL = { owner: "Właściciel", operator: "Kierownik", controller: "Kontroler", marketing: "Marketing", accountant: "Księgowy", client: "Klient" };
// Uprawnienia konfigurowalne przez właściciela (per rola)
const PERM_KEYS = [
    ["transactions", "Transakcje (lista FPO/KPO)"],
    ["cennikView", "Cennik — podgląd"],
    ["cennikEdit", "Cennik — zmiana cen"],
    ["magazyn", "Magazyn i wydania"],
    ["reports", "Raporty dzienne"],
    ["controls", "Kontrole i terminy"],
    ["pickups", "Wywozy i odbiory"],
    ["requests", "Zgłoszenia klientów (wyceny)"],
    ["marketing", "Marketing"],
    ["accounting", "Księgowość"],
    ["companyData", "Dane punktu (edycja)"],
];
const BASE_PERMS = { transactions: false, cennikView: false, cennikEdit: false, magazyn: false, reports: false, controls: false, requests: false, marketing: false, accounting: false, pickups: false, companyData: false };
const DEFAULT_PERMS = {
    operator: { ...BASE_PERMS, transactions: true, cennikView: true, reports: true, controls: true, pickups: true },
    controller: { ...BASE_PERMS, transactions: true, cennikView: true, reports: true, controls: true },
    marketing: { ...BASE_PERMS, cennikView: true, marketing: true },
    accountant: { ...BASE_PERMS, transactions: true, cennikView: true, reports: true, accounting: true },
};
const daysTo = (dateStr) => { const t = new Date(dateStr + "T00:00:00"); const n = new Date(); n.setHours(0, 0, 0, 0); return Math.round((t - n) / 86400000); };
const downloadText = (filename, text) => {
    try {
        const blob = new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }
    catch (e) { }
};
const padR = (s, n) => (String(s) + " ".repeat(n)).slice(0, n);
const padL = (s, n) => (" ".repeat(n) + String(s)).slice(-n);
// Powiadomienia przeglądarki
function fireNotif(title, body) {
    try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(title, { body, icon: "icon-192.png" });
        }
    }
    catch (e) { }
}
async function askNotifPermission() {
    try {
        if (typeof Notification === "undefined")
            return "denied";
        if (Notification.permission === "default")
            return await Notification.requestPermission();
        return Notification.permission;
    }
    catch (e) {
        return "denied";
    }
}
// Wczytaj zdjęcie z pliku i zmniejsz (mniejszy rozmiar w pamięci/transferze)
function resizeImage(file, maxDim = 900, quality = 0.6) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    let { width: w, height: h } = img;
                    if (w > h && w > maxDim) {
                        h = Math.round(h * maxDim / w);
                        w = maxDim;
                    }
                    else if (h >= w && h > maxDim) {
                        w = Math.round(w * maxDim / h);
                        h = maxDim;
                    }
                    const cv = document.createElement("canvas");
                    cv.width = w;
                    cv.height = h;
                    cv.getContext("2d").drawImage(img, 0, 0, w, h);
                    resolve(cv.toDataURL("image/jpeg", quality));
                };
                img.onerror = reject;
                img.src = reader.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }
        catch (e) {
            reject(e);
        }
    });
}
/* ─────────── UI atoms ─────────── */
const Card = ({ children, style, onClick, pad = 16 }) => (React.createElement("div", { onClick: onClick, style: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: pad, boxShadow: "0 1px 2px rgba(16,20,24,.04), 0 6px 20px -14px rgba(16,20,24,.25)", ...style } }, children));
const Bar = ({ pct, color = "var(--copper)", h = 8, bg = "var(--track)" }) => (React.createElement("div", { style: { width: "100%", height: h, borderRadius: 99, background: bg, overflow: "hidden" } },
    React.createElement("div", { style: { width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", borderRadius: 99, background: color, transition: "width .7s cubic-bezier(.2,.8,.2,1)" } })));
const codeChip = (g) => (React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700, color: C[g].color, background: C[g].color + "1a", borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap" } }, C[g].code));
const iconBtn = { width: 40, height: 40, borderRadius: 11, border: "1px solid var(--line)", background: "var(--surface)", color: "var(--text)", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
const inputStyle = { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid var(--line2)", background: "var(--surface)", color: "var(--text)", fontSize: 15.5, fontFamily: "var(--body)", outline: "none", boxSizing: "border-box" };
const label = { fontSize: 12.5, color: "var(--muted)", fontWeight: 600, margin: "12px 0 6px", display: "block" };
const btnCopper = { width: "100%", padding: "15px", borderRadius: 13, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #c8743f, #a85829)", color: "#fff", fontWeight: 800, fontSize: 16, fontFamily: "var(--display)", letterSpacing: ".01em", boxShadow: "0 10px 22px -10px rgba(168,88,41,.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 9 };
const btnGhost = { width: "100%", padding: "14px", borderRadius: 13, border: "1px solid var(--line2)", cursor: "pointer", background: "var(--surface)", color: "var(--text)", fontWeight: 700, fontSize: 15, fontFamily: "var(--display)" };
const sectionTitle = { fontFamily: "var(--display)", fontSize: 12.5, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", margin: "22px 2px 11px" };
function Sheet({ open, onClose, title, children }) {
    if (!open)
        return null;
    return (React.createElement("div", { onClick: onClose, style: { position: "fixed", inset: 0, zIndex: 80, background: "rgba(20,24,28,.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fade .2s ease" } },
        React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { width: "100%", maxWidth: 480, background: "var(--bg)", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTop: "1px solid var(--line)", padding: "10px 18px 24px", animation: "slideUp .28s cubic-bezier(.2,.9,.2,1)", maxHeight: "86vh", overflowY: "auto" } },
            React.createElement("div", { style: { width: 40, height: 4, borderRadius: 99, background: "var(--line2)", margin: "6px auto 14px" } }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
                React.createElement("h3", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 19, fontWeight: 800 } }, title),
                React.createElement("button", { onClick: onClose, style: iconBtn },
                    React.createElement(X, { size: 18 }))),
            children)));
}
function Toast({ msg, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 8000); return () => clearTimeout(t); }, [onClose]);
    return (React.createElement("div", { onClick: onClose, className: "no-print", style: { position: "fixed", top: "max(12px, env(safe-area-inset-top))", left: "50%", transform: "translateX(-50%)", zIndex: 95, width: "calc(100% - 24px)", maxWidth: 432, cursor: "pointer", background: "#2b3440", color: "#fff", borderRadius: 14, padding: "13px 15px", display: "flex", gap: 11, alignItems: "center", boxShadow: "0 18px 40px -12px rgba(0,0,0,.5)", animation: "dropIn .3s cubic-bezier(.2,1,.3,1)" } },
        React.createElement("div", { style: { width: 32, height: 32, borderRadius: 9, background: "rgba(224,146,90,.25)", display: "grid", placeItems: "center", flexShrink: 0 } },
            React.createElement(FileText, { size: 17, color: "#e0925a" })),
        React.createElement("div", { style: { flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 } }, msg),
        React.createElement(X, { size: 16, color: "rgba(255,255,255,.6)" })));
}
function NotifList({ items, notifOn, onEnable, onItem }) {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 2px 12px" } },
            React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 14, fontWeight: 600 } }, "Powiadomienia w przegl\u0105darce"),
                React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } }, "Alert nawet przy zamkni\u0119tej karcie")),
            React.createElement("button", { onClick: onEnable, style: { width: 46, height: 27, borderRadius: 99, border: "none", cursor: "pointer", padding: 3, background: notifOn ? "var(--green)" : "var(--line2)", flexShrink: 0 } },
                React.createElement("span", { style: { display: "block", width: 21, height: 21, borderRadius: 99, background: "#fff", transform: notifOn ? "translateX(19px)" : "translateX(0)", transition: "transform .2s" } }))),
        items.length === 0 ? React.createElement("div", { style: { textAlign: "center", color: "var(--muted)", fontSize: 13.5, padding: "18px 8px" } }, "Brak nowych powiadomie\u0144.") :
            items.map((n) => (React.createElement("div", { key: n.id, onClick: () => onItem && onItem(n), style: { display: "flex", gap: 11, alignItems: "center", padding: "12px 10px", borderTop: "1px solid var(--line)", cursor: onItem ? "pointer" : "default" } },
                React.createElement("div", { style: { width: 36, height: 36, borderRadius: 10, background: "rgba(200,116,63,.12)", display: "grid", placeItems: "center", flexShrink: 0 } },
                    React.createElement(Bell, { size: 17, color: "var(--copper)" })),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600 } }, n.title),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, n.body)),
                React.createElement("span", { style: { fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)", whiteSpace: "nowrap" } }, fmtTs(n.ts)))))));
}
/* ─────────── App ─────────── */
export default function App() {
    const [ready, setReady] = useState(false);
    const [tab, setTab] = useState("home");
    const [materials, setMaterials] = useState(seedMaterials);
    const [tx, setTx] = useState([]);
    const [company, setCompany] = useState(SEED_COMPANY);
    const [intakeOpen, setIntakeOpen] = useState(false);
    const [viewDoc, setViewDoc] = useState(null);
    const [dispatch, setDispatch] = useState([]);
    const [controls, setControls] = useState([]);
    const [reports, setReports] = useState([]);
    const [settings, setSettings] = useState({ reportHour: "20:00", reportOn: true, notif: false });
    const [toast, setToast] = useState(null);
    const [notifSeen, setNotifSeen] = useState({});
    const [mode, setMode] = useState("operator");
    const [clientProfile, setClientProfile] = useState({ plates: [], snapshot: {}, seen: 0 });
    const [users, setUsers] = useState(seedUsers);
    const [session, setSession] = useState(null);
    const [usersOpen, setUsersOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [perms, setPerms] = useState(DEFAULT_PERMS);
    const [permsOpen, setPermsOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [pickups, setPickups] = useState([]);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [m, t, c, dp, ct, rp, st, cl, us, ses, rq, pm, nf, mk, pk] = await Promise.all([
                    load("sk_mat_v2", null), load("sk_tx_v2", null), load("sk_co_v2", null),
                    load("sk_disp_v2", null), load("sk_ctrl_v2", null), load("sk_rep_v2", null), load("sk_set_v2", null),
                    load("sk_client_v2", null), load("sk_users_v2", null), load("sk_session_v2", null),
                    load("sk_req_v2", null), load("sk_perms_v2", null), load("sk_notif_v2", null), load("sk_mkt_v2", null),
                    load("sk_pick_v2", null),
                ]);
                if (cancelled)
                    return;
                if (m)
                    setMaterials(m);
                if (t)
                    setTx(t);
                else
                    setTx([]);
                if (c)
                    setCompany(c);
                if (dp)
                    setDispatch(dp);
                if (ct)
                    setControls(ct);
                if (rp)
                    setReports(rp);
                if (st)
                    setSettings((s) => ({ ...s, ...st }));
                if (cl)
                    setClientProfile((p) => ({ ...p, ...cl }));
                if (us && us.length)
                    setUsers(us);
                if (ses)
                    setSession(ses);
                if (rq)
                    setRequests(rq);
                if (pm)
                    setPerms((p) => ({ operator: { ...p.operator, ...(pm.operator || {}) }, controller: { ...p.controller, ...(pm.controller || {}) }, marketing: { ...p.marketing, ...(pm.marketing || {}) }, accountant: { ...p.accountant, ...(pm.accountant || {}) } }));
                if (nf)
                    setNotifSeen(nf);
                if (mk)
                    setCampaigns(mk);
                if (pk)
                    setPickups(pk);
            }
            catch (e) { }
            finally {
                if (!cancelled)
                    setReady(true);
            }
        })();
        const safety = setTimeout(() => { if (!cancelled)
            setReady(true); }, 1500);
        return () => { cancelled = true; clearTimeout(safety); };
    }, []);
    useEffect(() => { if (ready)
        save("sk_mat_v2", materials); }, [materials, ready]);
    useEffect(() => { if (ready)
        save("sk_tx_v2", tx); }, [tx, ready]);
    useEffect(() => { if (ready)
        save("sk_co_v2", company); }, [company, ready]);
    useEffect(() => { if (ready)
        save("sk_disp_v2", dispatch); }, [dispatch, ready]);
    useEffect(() => { if (ready)
        save("sk_ctrl_v2", controls); }, [controls, ready]);
    useEffect(() => { if (ready)
        save("sk_rep_v2", reports); }, [reports, ready]);
    useEffect(() => { if (ready)
        save("sk_set_v2", settings); }, [settings, ready]);
    useEffect(() => { if (ready)
        save("sk_client_v2", clientProfile); }, [clientProfile, ready]);
    useEffect(() => { if (ready)
        save("sk_users_v2", users); }, [users, ready]);
    useEffect(() => { if (ready)
        save("sk_session_v2", session); }, [session, ready]);
    useEffect(() => { if (ready)
        save("sk_req_v2", requests); }, [requests, ready]);
    useEffect(() => { if (ready)
        save("sk_perms_v2", perms); }, [perms, ready]);
    useEffect(() => { if (ready)
        save("sk_notif_v2", notifSeen); }, [notifSeen, ready]);
    useEffect(() => { if (ready)
        save("sk_mkt_v2", campaigns); }, [campaigns, ready]);
    useEffect(() => { if (ready)
        save("sk_pick_v2", pickups); }, [pickups, ready]);
    const mm = useMemo(() => matMap(materials), [materials]);
    const stock = useMemo(() => {
        const s = {};
        materials.forEach((m) => { s[m.id] = m.stock; });
        tx.forEach((t) => t.pos.forEach((p) => { s[p.matId] = (s[p.matId] || 0) + p.w; }));
        dispatch.forEach((d) => { s[d.matId] = (s[d.matId] || 0) - d.w; });
        return s;
    }, [materials, tx, dispatch]);
    const buildReport = (dayKey) => {
        const list = tx.filter((x) => fmtDateKey(x.ts) === dayKey);
        const disp = dispatch.filter((d) => d.dateKey === dayKey);
        const byMat = {};
        let totMass = 0, totVal = 0;
        list.forEach((x) => x.pos.forEach((p) => { if (!byMat[p.n])
            byMat[p.n] = { w: 0, v: 0, g: p.g }; byMat[p.n].w += p.w; byMat[p.n].v += p.w * p.price; totMass += p.w; totVal += p.w * p.price; }));
        const sumPay = (k) => list.filter((x) => x.payment === k).reduce((a, x) => a + txTotal(x), 0);
        const r1 = (x) => Math.round(x * 10) / 10;
        let t = "";
        t += "========================================\n";
        t += "  RAPORT DZIENNY\n";
        t += "  " + company.name + "\n";
        t += "  Data: " + dayKey + "\n";
        t += "========================================\n\n";
        t += "PODSUMOWANIE\n";
        t += "  Liczba przyjec:     " + list.length + "\n";
        t += "  Masa skupiona:      " + r1(totMass) + " kg\n";
        t += "  Wyplacono lacznie:  " + totVal.toFixed(2) + " zl\n";
        t += "    - gotowka:        " + sumPay("gotowka").toFixed(2) + " zl\n";
        t += "    - przelew:        " + sumPay("przelew").toFixed(2) + " zl\n";
        t += "    - BLIK:           " + sumPay("blik").toFixed(2) + " zl\n\n";
        t += "SKUP WG SUROWCA\n";
        if (!Object.keys(byMat).length)
            t += "  (brak)\n";
        Object.entries(byMat).forEach(([n, o]) => { t += "  " + (C[o.g] ? C[o.g].code : "      ") + "  " + padR(n, 30) + padL(r1(o.w), 8) + " kg " + padL(o.v.toFixed(2), 11) + " zl\n"; });
        t += "\n";
        if (disp.length) {
            t += "WYDANIA DO KONTRAHENTA\n";
            disp.forEach((d) => { t += "  " + padR((mm[d.matId] ? mm[d.matId].n : d.matId), 30) + padL(r1(d.w), 8) + " kg  -> " + d.contractor + "\n"; });
            t += "\n";
        }
        t += "DOKUMENTY\n";
        if (!list.length)
            t += "  (brak)\n";
        list.slice().reverse().forEach((x) => { t += "  " + padR(x.no, 20) + " " + padR(supplierName(x), 24) + padL(r1(txMass(x)), 7) + " kg " + padL(txTotal(x).toFixed(2), 10) + " zl  (" + PAY[x.payment].label + ")\n"; });
        t += "\n----------------------------------------\n";
        t += "Wygenerowano: " + new Date().toLocaleString("pl-PL") + "\n";
        return t;
    };
    const generateReport = (dayKey) => {
        const text = buildReport(dayKey);
        setReports((prev) => [{ id: uid(), dayKey, text, ts: Date.now() }, ...prev.filter((r) => r.dayKey !== dayKey)].slice(0, 60));
        return text;
    };
    // auto daily report at the set hour (while app is open)
    useEffect(() => {
        if (!ready || !settings.reportOn)
            return;
        const check = () => {
            const n = new Date();
            const hhmm = pad(n.getHours()) + ":" + pad(n.getMinutes());
            const dk = fmtDateKey(Date.now());
            if (settings.reportHour && hhmm >= settings.reportHour && !reports.some((r) => r.dayKey === dk)) {
                generateReport(dk);
                setToast({ msg: "Raport dnia (" + dk + ") zapisany. Pobierz w sekcji Raport." });
            }
        };
        check();
        const iv = setInterval(check, 20000);
        return () => clearInterval(iv);
    }, [ready, settings, reports, tx, dispatch]);
    // powiadomienia personelu o zgłoszeniach klientów
    const notifInit = useRef(false);
    const reqIdsRef = useRef(null);
    useEffect(() => {
        if (!ready)
            return;
        const cu = users.find((u) => u.id === session) || null;
        if (!cu || cu.role === "client") {
            notifInit.current = false;
            reqIdsRef.current = null;
            return;
        }
        const relevant = cu.role === "owner" || (perms[cu.role] && perms[cu.role].requests);
        if (!relevant) {
            reqIdsRef.current = new Set(requests.map((r) => r.id));
            return;
        }
        const cur = new Set(requests.map((r) => r.id));
        if (!notifInit.current) {
            notifInit.current = true;
            reqIdsRef.current = cur;
            const lastSeen = notifSeen[cu.id] || 0;
            const unread = requests.filter((r) => r.ts > lastSeen).length;
            if (settings.notif && unread > 0)
                fireNotif("ZŁOM-MET — skup", `Masz ${unread} ${unread === 1 ? "nowe zgłoszenie" : "nowych zgłoszeń"} klientów`);
            return;
        }
        const fresh = requests.filter((r) => !reqIdsRef.current.has(r.id));
        reqIdsRef.current = cur;
        if (fresh.length) {
            if (settings.notif)
                fireNotif("Nowe zgłoszenie klienta", fresh[0].clientName + (fresh.length > 1 ? ` (+${fresh.length - 1})` : ""));
            setToast({ msg: "Nowe zgłoszenie: " + fresh[0].clientName });
        }
    }, [requests, ready, session, users, perms, settings.notif, notifSeen]);
    const nextNo = (kind) => {
        const d = now();
        const pre = `${kind}/${d.getFullYear()}/${pad(d.getMonth() + 1)}/`;
        const n = tx.filter((t) => t.kind === kind).length + (kind === "FPO" ? 8 : 12);
        return pre + pad(n).padStart(4, "0");
    };
    const commitIntake = (data) => {
        const t = { id: uid(), no: nextNo(data.kind), ts: Date.now(), ...data };
        setTx((p) => [t, ...p]);
        return t;
    };
    if (!ready) {
        return (React.createElement("div", { style: rootBase },
            React.createElement("style", null, CSS),
            React.createElement("div", { className: "sk-root", style: { minHeight: "100vh", display: "grid", placeItems: "center" } },
                React.createElement("div", { style: { textAlign: "center" } },
                    React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, letterSpacing: "-.02em" } }, "Z\u0141OM-MET"),
                    React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 6 } }, "Wczytywanie\u2026")))));
    }
    const currentUser = users.find((u) => u.id === session) || null;
    const logout = () => { setSession(null); setMode("operator"); setTab("home"); };
    const enableNotif = async () => { const p = await askNotifPermission(); setSettings((s) => ({ ...s, notif: p === "granted" })); };
    if (!currentUser) {
        return (React.createElement("div", { style: rootBase },
            React.createElement("style", null, CSS),
            React.createElement(Login, { users: users, onLogin: (id) => setSession(id) })));
    }
    // konto klienta → panel klienta
    if (currentUser.role === "client") {
        return (React.createElement("div", { style: rootBase },
            React.createElement("style", null, CSS),
            React.createElement(ClientApp, { materials: materials, tx: tx, clientProfile: clientProfile, setClientProfile: setClientProfile, requests: requests, setRequests: setRequests, account: currentUser, onLogout: logout, notifSeen: notifSeen, setNotifSeen: setNotifSeen, notifOn: settings.notif, onEnableNotif: enableNotif })));
    }
    // podgląd panelu klienta (tylko właściciel)
    if (mode === "client") {
        return (React.createElement("div", { style: rootBase },
            React.createElement("style", null, CSS),
            React.createElement(ClientApp, { materials: materials, tx: tx, clientProfile: clientProfile, setClientProfile: setClientProfile, requests: requests, setRequests: setRequests, preview: true, onExit: () => setMode("operator"), notifSeen: notifSeen, setNotifSeen: setNotifSeen, notifOn: settings.notif, onEnableNotif: enableNotif })));
    }
    const isOwner = currentUser.role === "owner";
    const rolePerms = perms[currentUser.role] || {};
    const can = (k) => isOwner ? true : !!rolePerms[k];
    const newReqCount = requests.filter((r) => r.status === "new").length;
    const myLastSeen = notifSeen[currentUser.id] || 0;
    const notifItems = (isOwner || can("requests"))
        ? requests.filter((r) => r.ts > myLastSeen).slice().sort((a, b) => b.ts - a.ts).map((r) => ({ id: r.id, ts: r.ts, title: "Nowe zgłoszenie / wycena", body: (r.clientName || "Klient") + (r.plate ? " · " + r.plate : "") }))
        : [];
    const markNotifsRead = () => setNotifSeen((s) => ({ ...s, [currentUser.id]: Date.now() }));
    const NAV = [
        { id: "home", label: "Pulpit", icon: Scale },
        ...(can("transactions") ? [{ id: "tx", label: "Transakcje", icon: Receipt }] : []),
        ...(can("cennikView") ? [{ id: "cennik", label: "Cennik", icon: Coins }] : []),
        ...(can("cennikView") ? [{ id: "intel", label: "Marże", icon: TrendingUp }] : []),
        ...(can("magazyn") ? [{ id: "mag", label: "Magazyn", icon: Warehouse }] : []),
        ...(can("pickups") ? [{ id: "wyw", label: "Wywozy", icon: Truck }] : []),
        ...(can("marketing") ? [{ id: "mkt", label: "Marketing", icon: Megaphone }] : []),
        ...(can("accounting") ? [{ id: "ksieg", label: "Księgowość", icon: Calculator }] : []),
        ...(can("requests") ? [{ id: "req", label: "Zgłoszenia", icon: Inbox }] : []),
    ];
    const activeTab = NAV.some((n) => n.id === tab) ? tab : "home";
    const primaryTabs = NAV.slice(0, 4);
    const moreTabs = NAV.slice(4);
    const moreActive = moreTabs.some((n) => n.id === activeTab);
    return (React.createElement("div", { style: rootBase },
        React.createElement("style", null, CSS),
        React.createElement("div", { className: "sk-root", style: { minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 150 } },
            toast && React.createElement(Toast, { msg: toast.msg, onClose: () => setToast(null) }),
            usersOpen && React.createElement(UsersManager, { users: users, setUsers: setUsers, currentUser: currentUser, onClose: () => setUsersOpen(false) }),
            permsOpen && React.createElement(PermsManager, { perms: perms, setPerms: setPerms, onClose: () => setPermsOpen(false) }),
            React.createElement("div", { key: activeTab, style: { animation: "fade .22s ease" } },
                activeTab === "home" && React.createElement(Pulpit, { tx, mm, materials, stock, company, setCompany, openIntake: () => setIntakeOpen(true), setViewDoc, setTab, controls, setControls, settings, setSettings, reports, generateReport, currentUser, isOwner, can, onLogout: logout, openUsers: () => setUsersOpen(true), openPerms: () => setPermsOpen(true), openClient: () => setMode("client"), newReqCount, notifItems, notifCount: notifItems.length, markNotifsRead, notifOn: settings.notif, onEnableNotif: enableNotif }),
                activeTab === "tx" && can("transactions") && React.createElement(Transakcje, { tx, setViewDoc }),
                activeTab === "cennik" && can("cennikView") && React.createElement(Cennik, { materials, setMaterials, canEdit: can("cennikEdit") }),
                activeTab === "intel" && can("cennikView") && React.createElement(InteligencjaCen, { materials, setMaterials, stock }),
                activeTab === "mag" && can("magazyn") && React.createElement(Magazyn, { materials, stock, mm, dispatch, setDispatch }),
                activeTab === "mkt" && can("marketing") && React.createElement(Marketing, { requests, materials, campaigns, setCampaigns, tx, company }),
                activeTab === "wyw" && can("pickups") && React.createElement(Wywozy, { pickups, setPickups }),
                activeTab === "ksieg" && can("accounting") && React.createElement(Ksiegowosc, { tx, materials, stock, company }),
                activeTab === "req" && can("requests") && React.createElement(RequestsInbox, { requests, setRequests, mm })),
            (isOwner || currentUser.role === "operator") && (React.createElement("button", { onClick: () => setIntakeOpen(true), style: { position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 45, ...btnCopper, width: "auto", padding: "14px 22px", borderRadius: 99 } },
                React.createElement(Plus, { size: 20, strokeWidth: 3 }),
                " Nowe przyj\u0119cie")),
            React.createElement("nav", { style: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, maxWidth: 480, margin: "0 auto", background: "rgba(255,255,255,.88)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: `repeat(${primaryTabs.length + (moreTabs.length ? 1 : 0)},1fr)`, padding: "8px 4px calc(8px + env(safe-area-inset-bottom))" } },
                primaryTabs.map((n) => {
                    const Ic = n.icon;
                    const on = activeTab === n.id;
                    return (React.createElement("button", { key: n.id, onClick: () => setTab(n.id), style: { background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0", color: on ? "var(--copper)" : "var(--faint)" } },
                        React.createElement(Ic, { size: 21, strokeWidth: on ? 2.6 : 2 }),
                        React.createElement("span", { style: { fontSize: 10.5, fontWeight: on ? 700 : 500 } }, n.label)));
                }),
                moreTabs.length > 0 && (React.createElement("button", { onClick: () => setMoreOpen(true), style: { background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0", color: moreActive ? "var(--copper)" : "var(--faint)" } },
                    React.createElement(MoreHorizontal, { size: 21, strokeWidth: moreActive ? 2.6 : 2 }),
                    React.createElement("span", { style: { fontSize: 10.5, fontWeight: moreActive ? 700 : 500 } }, "Wi\u0119cej")))),
            React.createElement(Sheet, { open: moreOpen, onClose: () => setMoreOpen(false), title: "Wi\u0119cej" },
                React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, moreTabs.map((n) => {
                    const Ic = n.icon;
                    const on = activeTab === n.id;
                    return (React.createElement("button", { key: n.id, onClick: () => { setTab(n.id); setMoreOpen(false); }, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "18px 10px", borderRadius: 14, cursor: "pointer", border: on ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: on ? "rgba(200,116,63,.08)" : "var(--surface)", color: on ? "var(--copper)" : "var(--text)" } },
                        React.createElement(Ic, { size: 24 }),
                        React.createElement("span", { style: { fontSize: 13, fontWeight: 700 } }, n.label)));
                }))),
            intakeOpen && React.createElement(Intake, { materials, mm, company, onClose: () => setIntakeOpen(false), commitIntake }),
            viewDoc && React.createElement(DocOverlay, { tx: viewDoc, company: company, onClose: () => setViewDoc(null) }))));
}
/* ─────────── Pulpit ─────────── */
function Pulpit({ tx, mm, materials, stock, company, setCompany, openIntake, setViewDoc, setTab, controls, setControls, settings, setSettings, reports, generateReport, openClient, currentUser, isOwner, can, onLogout, openUsers, openPerms, newReqCount, notifItems, notifCount, markNotifsRead, notifOn, onEnableNotif }) {
    can = can || (() => true);
    notifItems = notifItems || [];
    const [notifOpen, setNotifOpen] = useState(false);
    const [setOpen, setSetOpen] = useState(false);
    const [repOpen, setRepOpen] = useState(false);
    const [ctrlOpen, setCtrlOpen] = useState(false);
    const [editCtrl, setEditCtrl] = useState(null);
    const [repDoc, setRepDoc] = useState(null);
    const t = todayStr();
    const todayList = tx.filter((x) => fmtDateKey(x.ts) === t);
    const paid = todayList.reduce((a, x) => a + txTotal(x), 0);
    const mass = todayList.reduce((a, x) => a + txMass(x), 0);
    const cashOut = todayList.filter((x) => x.payment === "gotowka").reduce((a, x) => a + txTotal(x), 0);
    const sortedCtrl = (controls || []).slice().sort((a, b) => daysTo(a.date) - daysTo(b.date));
    const dlReport = () => { const txt = generateReport(t); downloadText("raport_" + t + ".txt", txt); };
    const openReportPdf = () => { const txt = generateReport(t); setRepDoc({ text: txt, day: t }); };
    const ctrlColor = (d) => d < 0 ? "var(--red)" : d <= 7 ? "var(--amber)" : "var(--green)";
    // struktura skupu dziś wg grupy materiału (wartość)
    const byGroup = {};
    todayList.forEach((x) => x.pos.forEach((p) => { byGroup[p.g] = (byGroup[p.g] || 0) + p.w * p.price; }));
    const groups = Object.entries(byGroup).sort((a, b) => b[1] - a[1]);
    const maxG = groups.length ? groups[0][1] : 1;
    const magValue = materials.reduce((a, m) => a + (stock[m.id] || 0) * m.buy, 0);
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11 } },
                React.createElement("div", { style: { width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#c8743f,#a85829)", display: "grid", placeItems: "center", boxShadow: "0 6px 16px -8px rgba(168,88,41,.8)" } },
                    React.createElement(Recycle, { size: 22, color: "#fff" })),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontFamily: "var(--display)", fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1 } }, company.name || "ZŁOM-MET"),
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 3 } },
                        company.bdo ? `BDO ${company.bdo} · ` : "Uzupełnij dane punktu · ",
                        "dzi\u015B, ",
                        now().getDate(),
                        " ",
                        PL_MON[now().getMonth()]))),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                currentUser && React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 5, background: isOwner ? "rgba(200,116,63,.12)" : "rgba(63,125,138,.12)", color: isOwner ? "var(--copper)" : "#3f7d8a", borderRadius: 99, padding: "5px 10px", fontSize: 11, fontWeight: 700 } }, ROLE_LABEL[currentUser.role]),
                (isOwner || can("requests")) && (React.createElement("button", { onClick: () => setNotifOpen(true), style: { ...iconBtn, position: "relative" } },
                    React.createElement(Bell, { size: 18 }),
                    notifCount > 0 && React.createElement("span", { style: { position: "absolute", top: -3, right: -3, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 99, background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" } }, notifCount))),
                React.createElement("button", { onClick: () => setSetOpen(true), style: iconBtn },
                    React.createElement(Settings, { size: 18 })))),
        React.createElement(Card, { style: { marginTop: 18, background: "linear-gradient(150deg,#2b3440,#1f262f)", border: "none", color: "#fff" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 12.5, color: "#aeb7c2", fontWeight: 600 } }, "Wyp\u0142acono dzi\u015B (skup)"),
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 34, letterSpacing: "-.02em", marginTop: 4 } }, plnShort(paid))),
                React.createElement("div", { style: { textAlign: "right" } },
                    React.createElement("div", { style: { fontSize: 11.5, color: "#aeb7c2" } }, "Got\u00F3wka dzi\u015B"),
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 17, color: "#7fd1a3", marginTop: 4 } }, plnShort(cashOut)))),
            React.createElement("div", { style: { display: "flex", gap: 22, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.12)" } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11.5, color: "#aeb7c2" } }, "Przyj\u0119\u0107"),
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 } }, todayList.length)),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11.5, color: "#aeb7c2" } }, "Masa skupiona"),
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 } }, kg(mass))),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 11.5, color: "#aeb7c2" } }, "Warto\u015B\u0107 magazynu"),
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, color: "#e6a263" } }, plnShort(magValue))))),
        React.createElement("div", { style: sectionTitle }, "Struktura skupu \u2014 dzi\u015B"),
        React.createElement(Card, null, groups.length === 0 ? React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, padding: "8px 2px" } }, "Brak przyj\u0119\u0107 dzisiaj. Dodaj pierwsze \u2193") :
            groups.map(([g, val]) => (React.createElement("div", { key: g, style: { marginBottom: 12 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 } },
                    React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 } },
                        React.createElement("span", { style: { width: 9, height: 9, borderRadius: 3, background: C[g].color } }),
                        C[g].label),
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700 } }, plnShort(val))),
                React.createElement(Bar, { pct: (val / maxG) * 100, color: C[g].color, h: 7 }))))),
        can("requests") && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: sectionTitle }, "Zg\u0142oszenia klient\u00F3w"),
            React.createElement(Card, { onClick: () => setTab("req"), style: { cursor: "pointer", display: "flex", alignItems: "center", gap: 13 } },
                React.createElement("div", { style: { position: "relative", width: 42, height: 42, borderRadius: 11, background: "rgba(63,125,138,.12)", display: "grid", placeItems: "center", flexShrink: 0 } },
                    React.createElement(Inbox, { size: 21, color: "#3f7d8a" }),
                    newReqCount > 0 && React.createElement("span", { style: { position: "absolute", top: -5, right: -5, minWidth: 19, height: 19, padding: "0 5px", borderRadius: 99, background: "var(--red)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" } }, newReqCount)),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 } }, "Wyceny i wiadomo\u015Bci"),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 2 } }, newReqCount > 0 ? `${newReqCount} nowych do obsługi` : "Brak nowych zgłoszeń")),
                React.createElement(ChevronRight, { size: 20, color: "var(--faint)" })))),
        can("reports") && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: sectionTitle }, "Raport dnia"),
            React.createElement(Card, null,
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 } },
                            "Podsumowanie ",
                            t),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 } },
                            reports.some((r) => r.dayKey === t) ? "Raport zapisany dzisiaj ✓" : settings.reportOn ? `Auto o ${settings.reportHour}` : "Auto wyłączone",
                            " \u00B7 zapisanych: ",
                            reports.length)),
                    React.createElement("button", { onClick: () => setRepOpen(true), style: iconBtn },
                        React.createElement(Settings, { size: 17 }))),
                React.createElement("div", { style: { display: "flex", gap: 9, marginTop: 13 } },
                    React.createElement("button", { onClick: openReportPdf, style: { ...btnCopper, flex: 1.3 } },
                        React.createElement(FileText, { size: 18 }),
                        " Podgl\u0105d / PDF"),
                    React.createElement("button", { onClick: dlReport, style: { ...btnGhost, flex: 1 } }, ".txt"))))),
        can("controls") && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("span", null, "Kontrole i terminy"),
                React.createElement("span", { onClick: () => { setEditCtrl({ id: null, name: "", date: t, type: "" }); setCtrlOpen(true); }, style: { color: "var(--copper)", textTransform: "none", letterSpacing: 0, cursor: "pointer", fontSize: 12.5 } }, "+ Dodaj")),
            React.createElement(Card, { pad: 6 }, sortedCtrl.length === 0 ? React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, padding: "10px" } }, "Brak zaplanowanych kontroli. Dodaj termin \u2191") :
                sortedCtrl.map((c, i) => {
                    const d = daysTo(c.date);
                    const col = ctrlColor(d);
                    return (React.createElement("div", { key: c.id, onClick: () => { setEditCtrl(c); setCtrlOpen(true); }, style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", cursor: "pointer", borderBottom: i < sortedCtrl.length - 1 ? "1px solid var(--line)" : "none" } },
                        React.createElement("div", { style: { width: 34, height: 34, borderRadius: 9, background: col + "18", display: "grid", placeItems: "center", flexShrink: 0 } },
                            React.createElement(Clock, { size: 17, color: col })),
                        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                            React.createElement("div", { style: { fontSize: 14, fontWeight: 600 } }, c.name),
                            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } },
                                c.type ? c.type + " · " : "",
                                c.date)),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 700, color: col, whiteSpace: "nowrap" } }, d < 0 ? `${-d} dni po` : d === 0 ? "dziś" : `za ${d} dni`)));
                })))),
        React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between" } },
            React.createElement("span", null, "Ostatnie przyj\u0119cia"),
            React.createElement("span", { onClick: () => setTab("tx"), style: { color: "var(--copper)", textTransform: "none", letterSpacing: 0, cursor: "pointer", fontSize: 12.5 } }, "Wszystkie \u2192")),
        tx.slice(0, 3).map((x) => React.createElement(TxRow, { key: x.id, x: x, onClick: () => setViewDoc(x) })),
        React.createElement("div", { style: { height: 6 } }),
        React.createElement(Sheet, { open: setOpen, onClose: () => setSetOpen(false), title: "Ustawienia" },
            currentUser && (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 11, padding: "12px 13px", borderRadius: 12, background: "var(--surface2)", marginBottom: 14 } },
                React.createElement("div", { style: { width: 40, height: 40, borderRadius: 11, background: isOwner ? "rgba(200,116,63,.14)" : "rgba(63,125,138,.14)", display: "grid", placeItems: "center", flexShrink: 0 } },
                    React.createElement(User, { size: 19, color: isOwner ? "var(--copper)" : "#3f7d8a" })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14.5 } }, currentUser.name),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } },
                        ROLE_LABEL[currentUser.role],
                        " \u00B7 @",
                        currentUser.login)))),
            React.createElement("div", { style: { ...sectionTitle, margin: "4px 2px 8px" } },
                "Dane punktu skupu ",
                !can("companyData") && React.createElement("span", { style: { textTransform: "none", letterSpacing: 0, color: "var(--faint)", fontWeight: 500 } }, "\u00B7 tylko podgl\u0105d")),
            can("companyData") ? (React.createElement(React.Fragment, null,
                React.createElement("label", { style: label }, "Nazwa"),
                React.createElement("input", { style: inputStyle, value: company.name, onChange: (e) => setCompany({ ...company, name: e.target.value }) }),
                React.createElement("label", { style: label }, "NIP"),
                React.createElement("input", { style: inputStyle, value: company.nip, onChange: (e) => setCompany({ ...company, nip: e.target.value }) }),
                React.createElement("label", { style: label }, "Numer BDO"),
                React.createElement("input", { style: inputStyle, value: company.bdo, onChange: (e) => setCompany({ ...company, bdo: e.target.value }) }),
                React.createElement("label", { style: label }, "Adres"),
                React.createElement("input", { style: inputStyle, value: company.addr, onChange: (e) => setCompany({ ...company, addr: e.target.value }) }))) : (React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, company.name),
                React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 4 } },
                    "NIP ",
                    company.nip,
                    " \u00B7 BDO ",
                    company.bdo),
                React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 2 } }, company.addr))),
            isOwner && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { height: 1, background: "var(--line)", margin: "18px 0" } }),
                React.createElement("button", { style: { ...btnGhost, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }, onClick: () => { setSetOpen(false); openUsers && openUsers(); } },
                    React.createElement(BadgeCheck, { size: 17 }),
                    " U\u017Cytkownicy i konta"),
                React.createElement("button", { style: { ...btnGhost, marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }, onClick: () => { setSetOpen(false); openPerms && openPerms(); } },
                    React.createElement(ShieldCheck, { size: 17 }),
                    " Uprawnienia r\u00F3l"),
                React.createElement("button", { style: { ...btnGhost, marginTop: 10, color: "#3f7d8a", borderColor: "rgba(63,125,138,.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }, onClick: () => { setSetOpen(false); openClient && openClient(); } },
                    React.createElement(Smartphone, { size: 17 }),
                    " Otw\u00F3rz panel klienta (demo)"))),
            React.createElement("div", { style: { height: 1, background: "var(--line)", margin: "18px 0" } }),
            React.createElement("button", { style: { ...btnGhost, color: "var(--red)", borderColor: "rgba(220,38,38,.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }, onClick: () => { setSetOpen(false); onLogout && onLogout(); } },
                React.createElement(LogOut, { size: 17 }),
                " Wyloguj")),
        React.createElement(Sheet, { open: repOpen, onClose: () => setRepOpen(false), title: "Raport dnia" },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 14.5, fontWeight: 600 } }, "Automatyczny raport"),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, "Generuje podsumowanie dnia o ustalonej porze")),
                React.createElement("button", { onClick: () => setSettings({ ...settings, reportOn: !settings.reportOn }), style: { width: 46, height: 27, borderRadius: 99, border: "none", cursor: "pointer", padding: 3, background: settings.reportOn ? "var(--green)" : "var(--line2)", flexShrink: 0 } },
                    React.createElement("span", { style: { display: "block", width: 21, height: 21, borderRadius: 99, background: "#fff", transform: settings.reportOn ? "translateX(19px)" : "translateX(0)", transition: "transform .2s" } }))),
            settings.reportOn && (React.createElement(React.Fragment, null,
                React.createElement("label", { style: label }, "Godzina generowania"),
                React.createElement("input", { type: "time", value: settings.reportHour, onChange: (e) => setSettings({ ...settings, reportHour: e.target.value }), style: { ...inputStyle, colorScheme: "light" } }))),
            React.createElement("div", { style: { display: "flex", gap: 9, marginTop: 16 } },
                React.createElement("button", { onClick: () => { setRepOpen(false); openReportPdf(); }, style: { ...btnCopper, flex: 1.3 } },
                    React.createElement(FileText, { size: 18 }),
                    " Podgl\u0105d / PDF"),
                React.createElement("button", { onClick: dlReport, style: { ...btnGhost, flex: 1 } }, ".txt")),
            reports.length > 0 && React.createElement("div", { style: { ...sectionTitle, margin: "20px 2px 8px" } }, "Zapisane raporty"),
            reports.slice(0, 14).map((r) => (React.createElement("div", { key: r.id, onClick: () => { setRepOpen(false); setRepDoc({ text: r.text, day: r.dayKey }); }, style: { display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", marginBottom: 7, borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", cursor: "pointer" } },
                React.createElement(FileText, { size: 16, color: "var(--muted)" }),
                React.createElement("span", { style: { flex: 1, fontSize: 13.5, fontFamily: "var(--mono)" } }, r.dayKey),
                React.createElement("button", { onClick: (e) => { e.stopPropagation(); downloadText("raport_" + r.dayKey + ".txt", r.text); }, style: { ...iconBtn, width: 34, height: 34 }, title: "Pobierz .txt" },
                    React.createElement(FileText, { size: 15 })),
                React.createElement(ArrowRight, { size: 15, color: "var(--faint)" }))))),
        React.createElement(Sheet, { open: ctrlOpen, onClose: () => setCtrlOpen(false), title: editCtrl && editCtrl.id ? "Edytuj kontrolę" : "Nowa kontrola" }, editCtrl && (React.createElement(React.Fragment, null,
            React.createElement("label", { style: label }, "Nazwa"),
            React.createElement("input", { style: inputStyle, placeholder: "np. Legalizacja wagi", value: editCtrl.name, onChange: (e) => setEditCtrl({ ...editCtrl, name: e.target.value }) }),
            React.createElement("label", { style: label }, "Kategoria"),
            React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, ["Metrologia", "BDO", "Bezpieczeństwo", "Podatki", "Inne"].map((k) => (React.createElement("button", { key: k, onClick: () => setEditCtrl({ ...editCtrl, type: k }), style: { padding: "8px 13px", borderRadius: 99, cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: editCtrl.type === k ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: editCtrl.type === k ? "rgba(200,116,63,.1)" : "var(--surface)", color: editCtrl.type === k ? "var(--copper)" : "var(--muted)" } }, k)))),
            React.createElement("label", { style: label }, "Termin"),
            React.createElement("input", { type: "date", style: { ...inputStyle, colorScheme: "light" }, value: editCtrl.date, onChange: (e) => setEditCtrl({ ...editCtrl, date: e.target.value }) }),
            React.createElement("button", { style: { ...btnCopper, marginTop: 16 }, onClick: () => {
                    if (!editCtrl.name.trim())
                        return;
                    if (editCtrl.id)
                        setControls(controls.map((c) => c.id === editCtrl.id ? editCtrl : c));
                    else
                        setControls([...controls, { ...editCtrl, id: uid() }]);
                    setCtrlOpen(false);
                } }, "Zapisz"),
            editCtrl.id && React.createElement("button", { style: { ...btnGhost, marginTop: 10, color: "var(--red)", borderColor: "rgba(220,38,38,.3)" }, onClick: () => { setControls(controls.filter((c) => c.id !== editCtrl.id)); setCtrlOpen(false); } }, "Usu\u0144")))),
        repDoc && React.createElement(ReportDoc, { data: repDoc, company: company, onClose: () => setRepDoc(null) }),
        React.createElement(Sheet, { open: notifOpen, onClose: () => { setNotifOpen(false); markNotifsRead && markNotifsRead(); }, title: "Powiadomienia" },
            React.createElement(NotifList, { items: notifItems, notifOn: notifOn, onEnable: onEnableNotif, onItem: (n) => { setNotifOpen(false); markNotifsRead && markNotifsRead(); setTab("req"); } }))));
}
const fmtDateKey = (ts) => { const d = new Date(ts); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
function TxRow({ x, onClick }) {
    const Pi = PAY[x.payment].icon;
    return (React.createElement(Card, { pad: 13, style: { marginBottom: 9, cursor: "pointer" }, onClick: onClick },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
            React.createElement("div", { style: { width: 40, height: 40, borderRadius: 10, background: x.kind === "FPO" ? "rgba(200,116,63,.12)" : "rgba(63,125,138,.12)", display: "grid", placeItems: "center", flexShrink: 0 } }, x.kind === "FPO" ? React.createElement(User, { size: 18, color: "var(--copper)" }) : React.createElement(Building2, { size: 18, color: "#3f7d8a" })),
            React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                React.createElement("div", { style: { fontSize: 14.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, supplierName(x)),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7, marginTop: 2 } },
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" } }, x.no),
                    React.createElement("span", { style: { fontSize: 11, color: "var(--faint)" } },
                        "\u00B7 ",
                        fmtTs(x.ts),
                        " \u00B7 ",
                        kg(txMass(x))))),
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15 } }, plnShort(txTotal(x))),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 2, color: "var(--faint)" } },
                    React.createElement(Pi, { size: 12 }),
                    React.createElement("span", { style: { fontSize: 10.5 } }, PAY[x.payment].label))))));
}
/* ─────────── Transakcje ─────────── */
function Transakcje({ tx, setViewDoc }) {
    const [f, setF] = useState("all");
    const [q, setQ] = useState("");
    const list = tx.filter((x) => (f === "all" || x.kind === f) && (!q.trim() || fnorm(supplierName(x)).includes(fnorm(q)) || fnorm(x.no).includes(fnorm(q))));
    const sum = list.reduce((a, x) => a + txTotal(x), 0);
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24 } },
            React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Transakcje"),
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } },
                list.length,
                " dokument\u00F3w \u00B7 ",
                plnShort(sum),
                " \u00B7 ewidencja BDO")),
        React.createElement("div", { style: { position: "relative", marginTop: 16 } },
            React.createElement(Search, { size: 17, color: "var(--faint)", style: { position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" } }),
            React.createElement("input", { style: { ...inputStyle, paddingLeft: 40 }, placeholder: "Szukaj po nazwisku / numerze", value: q, onChange: (e) => setQ(e.target.value) })),
        React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } }, [["all", "Wszystko"], ["FPO", "FPO (osoby)"], ["KPO", "KPO (firmy)"]].map(([k, l]) => (React.createElement("button", { key: k, onClick: () => setF(k), style: { padding: "8px 14px", borderRadius: 99, cursor: "pointer", fontSize: 13, fontWeight: 700, border: f === k ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: f === k ? "rgba(200,116,63,.1)" : "var(--surface)", color: f === k ? "var(--copper)" : "var(--muted)" } }, l)))),
        React.createElement("div", { style: { marginTop: 14 } }, list.length === 0 ? React.createElement(Card, { style: { textAlign: "center", padding: 30, color: "var(--muted)" } },
            React.createElement(Receipt, { size: 26, color: "var(--faint)", style: { marginBottom: 8 } }),
            React.createElement("div", { style: { fontSize: 14 } }, "Brak transakcji")) :
            list.map((x) => React.createElement(TxRow, { key: x.id, x: x, onClick: () => setViewDoc(x) })))));
}
/* ─────────── Cennik ─────────── */
/* ─────────── Inteligencja Cenowa (alarm marży + notowania) ─────────── */
/* ─────────── Mapa konkurencji ─────────── */
function KonkurencjaView({ materials }) {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    // Konkurenci (edytowalni, zapis lokalny) — właściciel uzupełnia z FB/Google/wizyt
    const [konkurenci, setKonkurenci] = useState(() => {
        try {
            const s = localStorage.getItem("sk_konk_v1");
            if (s)
                return JSON.parse(s);
        }
        catch { }
        return [
            { id: "k1", nazwa: "Złom-Stal Częstochowa", odleglosc: 3.2, ceny: { CU: 29.00, AL: 5.80, FE: 1.15 }, notatka: "Główny konkurent, niskie ceny FE" },
            { id: "k2", nazwa: "Metal-Skup Raków", odleglosc: 6.8, ceny: { CU: 31.50, AL: 6.20, FE: 1.25 }, notatka: "Wyższe ceny miedzi — przyciąga klientów z Cu" },
            { id: "k3", nazwa: "EkoZłom Północ", odleglosc: 11.5, ceny: { CU: 28.50, AL: 5.50, FE: 1.10 }, notatka: "Daleko, niska konkurencja" },
        ];
    });
    const save = (k) => { setKonkurenci(k); try {
        localStorage.setItem("sk_konk_v1", JSON.stringify(k));
    }
    catch { } };
    // Nasze ceny per grupa (średnia z grupy)
    const naszeCeny = {};
    ["CU", "AL", "FE", "SS", "PB"].forEach(g => {
        const mats = (materials || []).filter(m => m.g === g && m.buy > 0);
        if (mats.length)
            naszeCeny[g] = mats.reduce((a, m) => a + m.buy, 0) / mats.length;
    });
    const METAL_LBL = { CU: "Miedź", AL: "Aluminium", FE: "Stal", SS: "Nierdz.", PB: "Ołów" };
    const METAL_KOL = { CU: "#c2703d", AL: "#8aa2ad", FE: "#6b7787", SS: "#3f7d8a", PB: "#566" };
    // Analiza pozycji: dla każdego metalu czy jesteśmy najwyżej/średnio/najniżej
    const metale = ["CU", "AL", "FE"].filter(g => naszeCeny[g] != null);
    const pozycja = metale.map(g => {
        const nasza = naszeCeny[g];
        const ceny = konkurenci.map(k => k.ceny[g]).filter(c => c != null && c > 0);
        const maxKonk = ceny.length ? Math.max(...ceny) : 0;
        const minKonk = ceny.length ? Math.min(...ceny) : 0;
        const sredniaKonk = ceny.length ? ceny.reduce((a, c) => a + c, 0) / ceny.length : 0;
        let status = "rynek";
        if (nasza >= maxKonk && maxKonk > 0)
            status = "najwyzej";
        else if (nasza <= minKonk && minKonk > 0)
            status = "najnizej";
        else if (nasza > sredniaKonk)
            status = "powyzej";
        else if (nasza < sredniaKonk)
            status = "ponizej";
        return { g, nasza, maxKonk, minKonk, sredniaKonk, status };
    });
    const STATUS_INFO = {
        najwyzej: { lbl: "Najwyższa cena", kol: "var(--green)", ic: "🏆", opis: "Przyciągasz najwięcej dostawców tego metalu" },
        powyzej: { lbl: "Powyżej średniej", kol: "#84cc16", ic: "▲", opis: "Konkurencyjna cena" },
        rynek: { lbl: "Cena rynkowa", kol: "var(--muted)", ic: "●", opis: "Średnia dla okolicy" },
        ponizej: { lbl: "Poniżej średniej", kol: "var(--amber)", ic: "▼", opis: "Klienci mogą iść do konkurencji" },
        najnizej: { lbl: "Najniższa cena", kol: "var(--red)", ic: "⚠️", opis: "Tracisz dostawców — rozważ podwyżkę" },
    };
    const fmt = v => v.toFixed(2) + " zł";
    return (React.createElement("div", { style: { marginTop: 14 } },
        React.createElement(Card, { style: { background: "rgba(63,125,138,.08)", border: "1px solid rgba(63,125,138,.25)", marginBottom: 14 } },
            React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" } }, "\uD83D\uDDFA\uFE0F Dodaj okoliczne skupy i ich ceny (z profili Facebook, Google Maps lub wizyt). Apka poka\u017Ce, gdzie jeste\u015B konkurencyjny, a gdzie tracisz dostawc\u00F3w.")),
        React.createElement("div", { style: sectionTitle }, "Twoja pozycja na rynku"),
        pozycja.length === 0 ? (React.createElement(Card, null,
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "10px 0" } }, "Dodaj konkurent\u00F3w, by zobaczy\u0107 por\u00F3wnanie."))) : pozycja.map(p => {
            const info = STATUS_INFO[p.status];
            return (React.createElement(Card, { key: p.g, pad: 14, style: { marginBottom: 9, borderLeft: `4px solid ${info.kol}` } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                        React.createElement("div", { style: { width: 10, height: 10, borderRadius: 99, background: METAL_KOL[p.g] } }),
                        React.createElement("span", { style: { fontWeight: 700, fontSize: 15 } }, METAL_LBL[p.g])),
                    React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: info.kol, background: info.kol.includes("var") ? info.kol.replace(")", ",.12)").replace("var(--", "rgba(") : info.kol + "22", padding: "4px 10px", borderRadius: 99 } },
                        info.ic,
                        " ",
                        info.lbl)),
                React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginBottom: 10 } }, info.opis),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } },
                    React.createElement("span", { style: { fontSize: 11, color: "var(--muted)", width: 60 } }, "Ty"),
                    React.createElement("div", { style: { flex: 1, height: 22, background: "var(--surface2)", borderRadius: 6, position: "relative", overflow: "hidden" } },
                        React.createElement("div", { style: { height: "100%", width: `${Math.min(100, (p.nasza / Math.max(p.maxKonk, p.nasza)) * 100)}%`, background: `linear-gradient(90deg,${info.kol},${info.kol}aa)`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 8 } },
                            React.createElement("span", { style: { fontSize: 11, fontWeight: 800, color: "#fff", fontFamily: "var(--mono)" } }, fmt(p.nasza))))),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--faint)", paddingLeft: 68 } },
                    React.createElement("span", null,
                        "min konk: ",
                        fmt(p.minKonk)),
                    React.createElement("span", null,
                        "\u015Br: ",
                        fmt(p.sredniaKonk)),
                    React.createElement("span", null,
                        "max konk: ",
                        fmt(p.maxKonk)))));
        }),
        React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", null,
                "Okoliczne skupy (",
                konkurenci.length,
                ")"),
            React.createElement("button", { onClick: () => { setEdit({ id: null, nazwa: "", odleglosc: "", ceny: {}, notatka: "" }); setOpen(true); }, style: { padding: "5px 11px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--copper)", textTransform: "none", letterSpacing: 0 } }, "+ Dodaj skup")),
        konkurenci.slice().sort((a, b) => a.odleglosc - b.odleglosc).map(k => (React.createElement(Card, { key: k.id, pad: 14, style: { marginBottom: 9, cursor: "pointer" }, onClick: () => { setEdit(k); setOpen(true); } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, k.nazwa),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 } },
                        "\uD83D\uDCCD ",
                        k.odleglosc,
                        " km od Ciebie"))),
            React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid var(--line)" } }, ["CU", "AL", "FE"].map(g => {
                const ich = k.ceny[g];
                if (ich == null || ich === 0)
                    return null;
                const nasza = naszeCeny[g];
                const lepszy = nasza != null && nasza >= ich;
                return (React.createElement("div", { key: g, style: { flex: "1 1 30%", minWidth: 90, background: "var(--surface2)", borderRadius: 9, padding: "8px 10px" } },
                    React.createElement("div", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 3 } }, METAL_LBL[g]),
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13 } }, ich.toFixed(2)),
                    nasza != null && (React.createElement("div", { style: { fontSize: 10, fontWeight: 700, color: lepszy ? "var(--green)" : "var(--amber)", marginTop: 2 } },
                        lepszy ? "▲" : "▼",
                        " Ty: ",
                        nasza.toFixed(2)))));
            })),
            k.notatka && React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 8, fontStyle: "italic" } },
                "\uD83D\uDCAC ",
                k.notatka)))),
        React.createElement(Card, { style: { marginTop: 6, background: "var(--surface2)" } },
            React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" } },
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDCA1 Strategia cenowa:"),
                React.createElement("br", null),
                "Nie musisz by\u0107 najta\u0144szy we wszystkim. B\u0105d\u017A ",
                React.createElement("b", { style: { color: "var(--text)" } }, "najwy\u017Cszy w 1-2 metalach"),
                " (np. miedzi), by przyci\u0105gn\u0105\u0107 dostawc\u00F3w, a na reszcie trzymaj cen\u0119 rynkow\u0105. Klient z miedzi\u0105 przywiezie te\u017C inny z\u0142om.")),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "Ceny konkurencji uzupe\u0142nij r\u0119cznie \u2014 dane zapisuj\u0105 si\u0119 lokalnie."),
        React.createElement(Sheet, { open: open, onClose: () => setOpen(false), title: edit && edit.id ? "Edytuj skup" : "Nowy konkurent" }, edit && (React.createElement(React.Fragment, null,
            React.createElement("label", { style: label }, "Nazwa skupu"),
            React.createElement("input", { style: inputStyle, value: edit.nazwa, onChange: e => setEdit({ ...edit, nazwa: e.target.value }), placeholder: "np. Z\u0142om-Stal Cz\u0119stochowa" }),
            React.createElement("label", { style: label }, "Odleg\u0142o\u015B\u0107 od Ciebie (km)"),
            React.createElement("input", { type: "number", step: "0.1", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700 }, value: edit.odleglosc, onChange: e => setEdit({ ...edit, odleglosc: e.target.value }), placeholder: "np. 3.5" }),
            React.createElement("label", { style: label }, "Ceny skupu konkurenta (z\u0142/kg)"),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, ["CU", "AL", "FE"].map(g => (React.createElement("div", { key: g },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 4 } }, METAL_LBL[g]),
                React.createElement("input", { type: "number", step: "0.01", value: edit.ceny[g] || "", onChange: e => setEdit({ ...edit, ceny: { ...edit.ceny, [g]: parseFloat(e.target.value) || 0 } }), placeholder: "0", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--text)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } }))))),
            React.createElement("label", { style: label }, "Notatka (opcjonalnie)"),
            React.createElement("input", { style: inputStyle, value: edit.notatka, onChange: e => setEdit({ ...edit, notatka: e.target.value }), placeholder: "np. wy\u017Csze ceny miedzi" }),
            React.createElement("button", { style: { ...btnCopper, marginTop: 14 }, onClick: () => {
                    if (!edit.nazwa.trim())
                        return;
                    const item = { ...edit, odleglosc: parseFloat(edit.odleglosc) || 0, id: edit.id || uid() };
                    if (edit.id)
                        save(konkurenci.map(k => k.id === edit.id ? item : k));
                    else
                        save([...konkurenci, item]);
                    setOpen(false);
                } }, "Zapisz skup"),
            edit.id && React.createElement("button", { style: { ...btnGhost, marginTop: 8, color: "var(--red)", borderColor: "rgba(220,38,38,.3)" }, onClick: () => { save(konkurenci.filter(k => k.id !== edit.id)); setOpen(false); } }, "Usu\u0144"))))));
}
function InteligencjaCen({ materials, setMaterials, stock }) {
    const [view, setView] = useState("alarmy");
    // Progi marży (edytowalne, zapis lokalny)
    const [progi, setProgi] = useState(() => { try {
        const s = localStorage.getItem("sk_intel_progi");
        return s ? JSON.parse(s) : { min: 8, ostrzezenie: 15, dobry: 25 };
    }
    catch {
        return { min: 8, ostrzezenie: 15, dobry: 25 };
    } });
    // Notowania LME (ręczne wpisy + trend) — w PWA bez sieci wpisuje właściciel z telefonu
    const [notowania, setNotowania] = useState(() => {
        try {
            const s = localStorage.getItem("sk_lme_v1");
            if (s)
                return JSON.parse(s);
        }
        catch { }
        return {
            CU: { now: 31.20, prev: 30.10, hist: [28.5, 29.2, 29.8, 30.1, 30.6, 31.2] },
            AL: { now: 6.40, prev: 6.55, hist: [6.8, 6.7, 6.6, 6.55, 6.5, 6.4] },
            FE: { now: 1.28, prev: 1.22, hist: [1.15, 1.18, 1.20, 1.22, 1.25, 1.28] },
            PB: { now: 6.90, prev: 6.70, hist: [6.4, 6.5, 6.6, 6.7, 6.8, 6.9] },
            SS: { now: 5.80, prev: 5.85, hist: [6.0, 5.95, 5.9, 5.85, 5.82, 5.8] },
        };
    });
    const saveProgi = (p) => { setProgi(p); try {
        localStorage.setItem("sk_intel_progi", JSON.stringify(p));
    }
    catch { } };
    const saveNot = (n) => { setNotowania(n); try {
        localStorage.setItem("sk_lme_v1", JSON.stringify(n));
    }
    catch { } };
    // Analiza marży każdego materiału
    const analiza = (materials || []).map(m => {
        const marza = m.buy > 0 ? ((m.sell - m.buy) / m.buy) * 100 : 0;
        const marzaKg = m.sell - m.buy;
        let poziom = "dobry";
        if (marza < progi.min)
            poziom = "krytyczny";
        else if (marza < progi.ostrzezenie)
            poziom = "ostrzezenie";
        else if (marza < progi.dobry)
            poziom = "ok";
        return { ...m, marza, marzaKg, poziom, stockVal: (stock?.[m.id] || m.stock || 0) * m.buy };
    });
    const krytyczne = analiza.filter(a => a.poziom === "krytyczny").sort((a, b) => a.marza - b.marza);
    const ostrzezenia = analiza.filter(a => a.poziom === "ostrzezenie").sort((a, b) => a.marza - b.marza);
    const POZIOM_KOL = { krytyczny: "var(--red)", ostrzezenie: "var(--amber)", ok: "#84cc16", dobry: "var(--green)" };
    const POZIOM_LBL = { krytyczny: "KRYTYCZNA", ostrzezenie: "Niska", ok: "OK", dobry: "Dobra" };
    // Mapowanie grup materiałów na metale notowane
    const GRUPA_METAL = { CU: "CU", AL: "AL", FE: "FE", PB: "PB", ZN: "AL", SS: "SS", KAB: "CU" };
    const METAL_LBL = { CU: "Miedź", AL: "Aluminium", FE: "Stal/Żelazo", PB: "Ołów", SS: "Nierdzewka" };
    // Sygnały sprzedaży: jeśli cena rośnie i mamy zapas → sprzedaj
    const sygnalySprzedazy = Object.entries(notowania).map(([metal, d]) => {
        const zmiana = d.prev > 0 ? ((d.now - d.prev) / d.prev) * 100 : 0;
        const trend = zmiana > 1 ? "wzrost" : zmiana < -1 ? "spadek" : "stabilnie";
        // wartość zapasu tej grupy
        const zapasMetal = analiza.filter(a => GRUPA_METAL[a.g] === metal).reduce((s, a) => s + a.stockVal, 0);
        return { metal, ...d, zmiana, trend, zapasMetal };
    }).filter(s => s.zapasMetal > 0 || Math.abs(s.zmiana) > 1);
    const fmt = v => v.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
    // Mini wykres trendu (sparkline)
    const Spark = ({ data, color }) => {
        const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
        const w = 80, h = 28;
        const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
        return React.createElement("svg", { width: w, height: h, style: { display: "block" } },
            React.createElement("polyline", { points: pts, fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }));
    };
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24 } },
            React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Inteligencja cenowa"),
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } }, "Alarm mar\u017Cy \u00B7 notowania \u00B7 sygna\u0142y sprzeda\u017Cy")),
        React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 16, overflowX: "auto", paddingBottom: 2 } }, [["alarmy", "🚨 Alarm marży"], ["notowania", "📈 Notowania"], ["konkurencja", "🗺️ Konkurencja"], ["sygnaly", "💰 Kiedy sprzedać"], ["progi", "⚙️ Progi"]].map(([id, lbl]) => (React.createElement("button", { key: id, onClick: () => setView(id), style: { flexShrink: 0, padding: "8px 13px", borderRadius: 11, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: view === id ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: view === id ? "rgba(200,116,63,.1)" : "var(--surface)", color: view === id ? "var(--copper)" : "var(--muted)" } }, lbl)))),
        view === "alarmy" && (React.createElement("div", { style: { marginTop: 14 } },
            krytyczne.length === 0 && ostrzezenia.length === 0 ? (React.createElement(Card, { style: { background: "rgba(21,163,74,.08)", border: "1px solid rgba(21,163,74,.3)" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                    React.createElement("span", { style: { fontSize: 30 } }, "\u2705"),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, "Wszystkie mar\u017Ce zdrowe"),
                        React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 2 } },
                            "\u017Baden materia\u0142 nie ma mar\u017Cy poni\u017Cej ",
                            progi.ostrzezenie,
                            "%."))))) : (React.createElement(React.Fragment, null,
                krytyczne.length > 0 && (React.createElement(Card, { style: { background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.35)", marginBottom: 12 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 } },
                        React.createElement("span", { style: { fontSize: 24 } }, "\uD83D\uDEA8"),
                        React.createElement("div", null,
                            React.createElement("div", { style: { fontWeight: 800, fontSize: 15, color: "var(--red)" } },
                                "KRYTYCZNA MAR\u017BA \u2014 ",
                                krytyczne.length),
                            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, "Kupujesz za drogo! Podnie\u015B sprzeda\u017C lub obni\u017C skup."))),
                    krytyczne.map(a => (React.createElement("div", { key: a.id, style: { padding: "10px 0", borderTop: "1px solid rgba(220,38,38,.2)" } },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                            React.createElement("span", { style: { fontWeight: 700, fontSize: 13.5 } }, a.n),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15, color: "var(--red)" } },
                                a.marza.toFixed(1),
                                "%")),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 3 } },
                            "skup ",
                            a.buy.toFixed(2),
                            " \u2192 sprzeda\u017C ",
                            a.sell.toFixed(2),
                            " \u00B7 zysk ",
                            fmt(a.marzaKg),
                            "/kg"),
                        React.createElement("div", { style: { fontSize: 12, marginTop: 5, color: "var(--amber)" } },
                            "\uD83D\uDCA1 Sugestia: podnie\u015B sprzeda\u017C do ",
                            (a.buy * (1 + progi.dobry / 100)).toFixed(2),
                            " z\u0142/kg (mar\u017Ca ",
                            progi.dobry,
                            "%)")))))),
                ostrzezenia.length > 0 && (React.createElement(Card, { style: { background: "rgba(217,119,6,.08)", border: "1px solid rgba(217,119,6,.3)" } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 } },
                        React.createElement("span", { style: { fontSize: 22 } }, "\u26A0\uFE0F"),
                        React.createElement("div", null,
                            React.createElement("div", { style: { fontWeight: 700, fontSize: 14.5, color: "var(--amber)" } },
                                "Niska mar\u017Ca \u2014 ",
                                ostrzezenia.length),
                            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } },
                                "Mar\u017Ca poni\u017Cej ",
                                progi.ostrzezenie,
                                "% \u2014 warto przyjrze\u0107 si\u0119 cenom."))),
                    ostrzezenia.map(a => (React.createElement("div", { key: a.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid rgba(217,119,6,.15)" } },
                        React.createElement("div", null,
                            React.createElement("span", { style: { fontWeight: 600, fontSize: 13.5 } }, a.n),
                            React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } },
                                a.buy.toFixed(2),
                                " \u2192 ",
                                a.sell.toFixed(2),
                                " \u00B7 ",
                                fmt(a.marzaKg),
                                "/kg")),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, color: "var(--amber)" } },
                            a.marza.toFixed(1),
                            "%")))))))),
            React.createElement("div", { style: sectionTitle }, "Zdrowie mar\u017Cy \u2014 wszystkie materia\u0142y"),
            React.createElement(Card, { pad: 4 }, analiza.sort((a, b) => a.marza - b.marza).map((a, i) => (React.createElement("div", { key: a.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px", borderBottom: i < analiza.length - 1 ? "1px solid var(--line)" : "none" } },
                React.createElement("div", { style: { width: 6, height: 28, borderRadius: 3, background: POZIOM_KOL[a.poziom], flexShrink: 0 } }),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, a.n),
                    React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } },
                        a.buy.toFixed(2),
                        " \u2192 ",
                        a.sell.toFixed(2),
                        " z\u0142/kg")),
                React.createElement("div", { style: { textAlign: "right" } },
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, color: POZIOM_KOL[a.poziom] } },
                        a.marza.toFixed(0),
                        "%"),
                    React.createElement("div", { style: { fontSize: 9.5, fontWeight: 700, color: POZIOM_KOL[a.poziom], textTransform: "uppercase" } }, POZIOM_LBL[a.poziom])))))))),
        view === "notowania" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Card, { style: { background: "rgba(63,125,138,.08)", border: "1px solid rgba(63,125,138,.25)", marginBottom: 14 } },
                React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" } }, "\uD83D\uDCCA Wpisuj aktualne ceny metali z gie\u0142dy (LME / lokalna huta). Apka pokazuje trend i podpowiada, czy podnie\u015B\u0107 ceny skupu, by przyci\u0105gn\u0105\u0107 dostawc\u00F3w.")),
            Object.entries(notowania).map(([metal, d]) => {
                const zmiana = d.prev > 0 ? ((d.now - d.prev) / d.prev) * 100 : 0;
                const up = zmiana >= 0;
                return (React.createElement(Card, { key: metal, style: { marginBottom: 10 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                        React.createElement("div", null,
                            React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, METAL_LBL[metal] || metal),
                            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 } },
                                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 20 } }, d.now.toFixed(2)),
                                React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: up ? "var(--green)" : "var(--red)" } },
                                    up ? "▲" : "▼",
                                    " ",
                                    Math.abs(zmiana).toFixed(1),
                                    "%"))),
                        React.createElement(Spark, { data: d.hist, color: up ? "var(--green)" : "var(--red)" })),
                    React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
                        React.createElement("div", { style: { flex: 1 } },
                            React.createElement("label", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 4, display: "block" } }, "Cena teraz (z\u0142/kg)"),
                            React.createElement("input", { type: "number", step: "0.01", value: d.now, onChange: e => { const v = parseFloat(e.target.value) || 0; saveNot({ ...notowania, [metal]: { ...d, prev: d.now, now: v, hist: [...d.hist.slice(-5), v] } }); }, style: { width: "100%", padding: "9px 11px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--text)", fontSize: 15, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } }))),
                    Math.abs(zmiana) > 2 && (React.createElement("div", { style: { marginTop: 10, padding: "9px 11px", background: up ? "rgba(21,163,74,.08)" : "rgba(220,38,38,.08)", borderRadius: 9, fontSize: 12, color: up ? "var(--green)" : "var(--red)", lineHeight: 1.5 } }, up ? `💡 Cena rośnie — rozważ podniesienie skupu, by przyciągnąć dostawców, lub sprzedaj zapas zanim spadnie.` : `⚠️ Cena spada — rozważ szybką sprzedaż zapasu i ostrożność przy skupie po wysokiej cenie.`))));
            }))),
        view === "konkurencja" && React.createElement(KonkurencjaView, { materials: materials }),
        view === "sygnaly" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Card, { style: { background: "rgba(200,116,63,.07)", border: "1px solid rgba(200,116,63,.25)", marginBottom: 14 } },
                React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" } }, "\uD83D\uDCB0 Apka analizuje notowania i Tw\u00F3j zapas. Podpowiada, kiedy sprzeda\u0107 do huty, by nie trzyma\u0107 zamro\u017Conej got\u00F3wki ani nie sprzeda\u0107 w do\u0142ku cenowym.")),
            sygnalySprzedazy.length === 0 ? (React.createElement(Card, null,
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "10px 0" } }, "Brak sygna\u0142\u00F3w \u2014 uzupe\u0142nij notowania i stany magazynu."))) : sygnalySprzedazy.sort((a, b) => b.zapasMetal - a.zapasMetal).map(s => {
                const sygnal = s.trend === "wzrost" && s.zapasMetal > 0 ? "SPRZEDAJ" : s.trend === "spadek" ? "TRZYMAJ/SKUPUJ" : "OBSERWUJ";
                const kol = sygnal === "SPRZEDAJ" ? "var(--green)" : sygnal === "TRZYMAJ/SKUPUJ" ? "var(--amber)" : "var(--muted)";
                return (React.createElement(Card, { key: s.metal, style: { marginBottom: 10 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 } },
                        React.createElement("div", null,
                            React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, METAL_LBL[s.metal] || s.metal),
                            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 } },
                                "cena ",
                                s.now.toFixed(2),
                                " z\u0142/kg \u00B7 ",
                                s.trend === "wzrost" ? "▲" : s.trend === "spadek" ? "▼" : "●",
                                " ",
                                Math.abs(s.zmiana).toFixed(1),
                                "%")),
                        React.createElement("span", { style: { fontSize: 11.5, fontWeight: 800, color: kol, background: kol.replace("var(--", "rgba(").replace(")", ",.12)").includes("rgba") ? kol + "22" : kol + "22", padding: "5px 11px", borderRadius: 99, border: `1px solid ${kol}` } }, sygnal)),
                    React.createElement("div", { style: { paddingTop: 8, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12.5 } },
                        React.createElement("span", { style: { color: "var(--muted)" } }, "Warto\u015B\u0107 Twojego zapasu:"),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700 } }, fmt(s.zapasMetal))),
                    sygnal === "SPRZEDAJ" && s.zapasMetal > 0 && React.createElement("div", { style: { marginTop: 8, fontSize: 12, color: "var(--green)", lineHeight: 1.5 } },
                        "\uD83D\uDCA1 Cena ro\u015Bnie i masz zapas wart ",
                        fmt(s.zapasMetal),
                        " \u2014 dobry moment na sprzeda\u017C do huty.")));
            }))),
        view === "progi" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Card, { style: { marginBottom: 14 } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "\u2699\uFE0F Progi alarmu mar\u017Cy (%)"),
                [["min", "Marża krytyczna — poniżej tej wartości alarm czerwony", "var(--red)"], ["ostrzezenie", "Marża niska — ostrzeżenie pomarańczowe", "var(--amber)"], ["dobry", "Marża docelowa — cel zdrowej rentowności", "var(--green)"]].map(([key, opis, kol]) => (React.createElement("div", { key: key, style: { marginBottom: 16 } },
                    React.createElement("label", { style: { fontSize: 12.5, color: "var(--muted)", display: "block", marginBottom: 6, lineHeight: 1.4 } }, opis),
                    React.createElement("div", { style: { display: "flex", gap: 10, alignItems: "center" } },
                        React.createElement("input", { type: "number", value: progi[key], onChange: e => saveProgi({ ...progi, [key]: parseFloat(e.target.value) || 0 }), style: { flex: 1, padding: "11px 13px", borderRadius: 11, border: `1.5px solid ${kol}`, background: "var(--surface2)", color: kol, fontSize: 18, fontFamily: "var(--mono)", fontWeight: 800, outline: "none", boxSizing: "border-box" } }),
                        React.createElement("span", { style: { fontSize: 16, color: "var(--muted)", fontWeight: 700 } }, "%")))))),
            React.createElement(Card, { style: { background: "var(--surface2)" } },
                React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" } },
                    React.createElement("b", { style: { color: "var(--text)" } }, "Jak ustawi\u0107 progi?"),
                    React.createElement("br", null),
                    "Dla metali kolorowych (mied\u017A, aluminium) mar\u017Ca 8-15% jest norm\u0105 \u2014 du\u017Cy obr\u00F3t, ni\u017Csza mar\u017Ca.",
                    React.createElement("br", null),
                    "Dla stali mar\u017Ca bywa 15-25%.",
                    React.createElement("br", null),
                    "Ustaw ",
                    React.createElement("b", null, "krytyczn\u0105"),
                    " tam, gdzie zaczynasz traci\u0107 po kosztach transportu i ci\u0119cia."))))));
}
function Cennik({ materials, setMaterials, canEdit = true }) {
    const [q, setQ] = useState("");
    const [edit, setEdit] = useState(null);
    const [b, setB] = useState("");
    const [s, setS] = useState("");
    const groups = Object.keys(C);
    const open = (m) => { if (!canEdit)
        return; setEdit(m); setB(String(m.buy)); setS(String(m.sell)); };
    const saveEdit = () => { setMaterials((p) => p.map((m) => m.id === edit.id ? { ...m, buy: parseFloat(b) || 0, sell: parseFloat(s) || 0 } : m)); setEdit(null); };
    const matches = (m) => !q.trim() || fnorm(m.n).includes(fnorm(q)) || C[m.g].code.includes(q.trim());
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
            React.createElement("div", null,
                React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Cennik"),
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } }, canEdit ? "Ceny skupu i sprzedaży · zł/kg" : "Podgląd cen · tylko właściciel edytuje")),
            React.createElement("div", { style: { textAlign: "right", display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 11.5, fontWeight: 600, marginTop: 6 } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: 99, background: "var(--green)" } }),
                "notowania: dzi\u015B 8:00")),
        React.createElement("div", { style: { position: "relative", marginTop: 16 } },
            React.createElement(Search, { size: 17, color: "var(--faint)", style: { position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" } }),
            React.createElement("input", { style: { ...inputStyle, paddingLeft: 40 }, placeholder: "Szukaj materia\u0142u lub kodu (17 04\u2026)", value: q, onChange: (e) => setQ(e.target.value) })),
        React.createElement("div", { style: { display: "flex", padding: "16px 12px 4px", fontSize: 11, color: "var(--faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" } },
            React.createElement("span", { style: { flex: 1 } }, "Materia\u0142"),
            React.createElement("span", { style: { width: 74, textAlign: "right" } }, "Skup"),
            React.createElement("span", { style: { width: 74, textAlign: "right" } }, "Sprzeda\u017C"),
            React.createElement("span", { style: { width: 52, textAlign: "right" } }, "Mar\u017Ca")),
        groups.map((g) => {
            const items = materials.filter((m) => m.g === g && matches(m));
            if (!items.length)
                return null;
            return (React.createElement("div", { key: g, style: { marginBottom: 8 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, margin: "12px 4px 8px" } },
                    codeChip(g),
                    React.createElement("span", { style: { fontFamily: "var(--display)", fontSize: 13, fontWeight: 700, color: "var(--muted)" } }, C[g].label)),
                React.createElement(Card, { pad: 4 }, items.map((m, i) => {
                    const marza = m.buy ? ((m.sell - m.buy) / m.buy) * 100 : 0;
                    return (React.createElement("div", { key: m.id, onClick: () => open(m), style: { display: "flex", alignItems: "center", padding: "12px 10px", cursor: canEdit ? "pointer" : "default", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none" } },
                        React.createElement("span", { style: { flex: 1, fontSize: 14, fontWeight: 600, paddingRight: 8 } }, m.n),
                        React.createElement("span", { style: { width: 74, textAlign: "right", fontFamily: "var(--mono)", fontSize: 13.5, fontWeight: 700 } }, m.buy.toFixed(2)),
                        React.createElement("span", { style: { width: 74, textAlign: "right", fontFamily: "var(--mono)", fontSize: 13.5, color: "var(--muted)" } }, m.sell.toFixed(2)),
                        React.createElement("span", { style: { width: 52, textAlign: "right", fontFamily: "var(--mono)", fontSize: 12.5, fontWeight: 700, color: marza >= 20 ? "var(--green)" : "var(--amber)" } },
                            Math.round(marza),
                            "%")));
                }))));
        }),
        React.createElement(Sheet, { open: !!edit, onClose: () => setEdit(null), title: edit ? edit.n : "" },
            edit && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 } },
                codeChip(edit.g),
                React.createElement("span", { style: { fontSize: 12.5, color: "var(--muted)" } }, C[edit.g].label)),
            React.createElement("div", { style: { display: "flex", gap: 10 } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: label }, "Cena skupu (z\u0142/kg)"),
                    React.createElement("input", { style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 }, type: "number", inputMode: "decimal", value: b, onChange: (e) => setB(e.target.value) })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: label }, "Cena sprzeda\u017Cy"),
                    React.createElement("input", { style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 }, type: "number", inputMode: "decimal", value: s, onChange: (e) => setS(e.target.value) }))),
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", margin: "12px 2px 0" } },
                "Mar\u017Ca: ",
                React.createElement("b", { style: { color: "var(--text)" } },
                    b && s ? Math.round(((parseFloat(s) - parseFloat(b)) / parseFloat(b)) * 100) : 0,
                    "%"),
                " \u00B7 ",
                b && s ? pln(parseFloat(s) - parseFloat(b)) : "—",
                " / kg"),
            React.createElement("button", { style: { ...btnCopper, marginTop: 16 }, onClick: saveEdit }, "Zapisz ceny"))));
}
/* ─────────── Magazyn ─────────── */
/* ─────────── Konsolidacja transportu do huty ─────────── */
function KonsolidacjaTransportu({ materials, stock }) {
    const [open, setOpen] = useState(false);
    // Parametry transportu (edytowalne, zapis lokalny)
    const [param, setParam] = useState(() => {
        try {
            const s = localStorage.getItem("sk_transport_v1");
            if (s)
                return JSON.parse(s);
        }
        catch { }
        return {
            ladownosc: 24000, // ładowność auta w kg (np. 24t ciężarówka)
            dystans: 45, // km w jedną stronę do huty
            spalanie: 35, // litry/100km
            paliwo: 6.20, // zł/litr (diesel)
            kierowca: 150, // koszt kierowcy/dzień
            oplaty: 50, // autostrada, inne
        };
    });
    const save = (p) => { setParam(p); try {
        localStorage.setItem("sk_transport_v1", JSON.stringify(p));
    }
    catch { } };
    const upd = (k, v) => save({ ...param, [k]: parseFloat(v) || 0 });
    // Co mamy na stanie (do sprzedaży hucie)
    const dostepne = (materials || []).map(m => ({ ...m, st: stock?.[m.id] || 0 })).filter(m => m.st > 0);
    const totMass = dostepne.reduce((a, m) => a + m.st, 0);
    const totValue = dostepne.reduce((a, m) => a + m.st * m.sell, 0);
    // Koszt jednego kursu
    const kmTotal = param.dystans * 2; // tam i z powrotem
    const kosztPaliwa = (kmTotal * param.spalanie / 100) * param.paliwo;
    const kosztKursu = kosztPaliwa + param.kierowca + param.oplaty;
    // Ile kursów potrzeba przy obecnym stanie
    const kursy = param.ladownosc > 0 ? Math.ceil(totMass / param.ladownosc) : 0;
    const wypelnienie = param.ladownosc > 0 ? Math.min(100, (totMass / param.ladownosc) * 100) : 0;
    // Koszt transportu na kg
    const kosztNaKg = totMass > 0 ? (kosztKursu * kursy) / totMass : 0;
    // Koszt transportu jako % wartości
    const kosztProcent = totValue > 0 ? (kosztKursu * kursy) / totValue * 100 : 0;
    // Analiza: czy warto czekać na pełny ładunek?
    const brakDoPelnego = param.ladownosc - (totMass % param.ladownosc || param.ladownosc);
    const kosztNaKgTeraz = kosztNaKg;
    // Gdyby dopełnić ładunek (mniej kursów na kg)
    const masaPelna = kursy * param.ladownosc;
    const kosztNaKgPelny = masaPelna > 0 ? (kosztKursu * kursy) / masaPelna : 0;
    const oszczednoscNaKg = kosztNaKgTeraz - kosztNaKgPelny;
    const fmt = v => v.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
    const fmt0 = v => Math.round(v).toLocaleString("pl-PL") + " zł";
    // Rekomendacja
    const rekomendacja = (() => {
        if (totMass === 0)
            return { txt: "Brak materiału na stanie.", kol: "var(--muted)", ic: "📦" };
        if (wypelnienie < 60)
            return { txt: `Auto wypełnione w ${Math.round(wypelnienie)}%. Poczekaj na więcej materiału — jeden kurs z pełnym ładunkiem jest znacznie tańszy na kg.`, kol: "var(--amber)", ic: "⏳" };
        if (wypelnienie >= 90)
            return { txt: `Auto prawie pełne (${Math.round(wypelnienie)}%). Dobry moment na wywóz do huty!`, kol: "var(--green)", ic: "🚛" };
        return { txt: `Auto wypełnione w ${Math.round(wypelnienie)}%. Możesz jechać lub poczekać na dopełnienie.`, kol: "#84cc16", ic: "✅" };
    })();
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: sectionTitle }, "Konsolidacja transportu do huty"),
        React.createElement(Card, { style: { background: `linear-gradient(135deg,${rekomendacja.kol === "var(--green)" ? "rgba(21,163,74,.1)" : rekomendacja.kol === "var(--amber)" ? "rgba(217,119,6,.1)" : "rgba(132,204,22,.08)"},transparent)`, border: `1px solid ${rekomendacja.kol === "var(--muted)" ? "var(--line)" : rekomendacja.kol.includes("var") ? rekomendacja.kol.replace(")", ",.3)").replace("var(--", "rgba(") : "rgba(132,204,22,.3)"}` } },
            React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 12 } },
                React.createElement("span", { style: { fontSize: 28 } }, rekomendacja.ic),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: rekomendacja.kol } }, wypelnienie >= 90 ? "Czas na wywóz" : wypelnienie < 60 ? "Poczekaj z wywozem" : "Możesz wywozić"),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 } }, rekomendacja.txt))),
            React.createElement("div", { style: { marginTop: 12 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted)", marginBottom: 5 } },
                    React.createElement("span", null,
                        "Wype\u0142nienie auta: ",
                        kg(totMass % param.ladownosc || (totMass >= param.ladownosc ? param.ladownosc : totMass))),
                    React.createElement("span", null,
                        Math.round(wypelnienie),
                        "% z ",
                        kg(param.ladownosc))),
                React.createElement("div", { style: { height: 8, background: "var(--surface2)", borderRadius: 9, overflow: "hidden" } },
                    React.createElement("div", { style: { height: "100%", width: wypelnienie + "%", background: wypelnienie >= 90 ? "linear-gradient(90deg,var(--green),#10b981)" : wypelnienie >= 60 ? "#84cc16" : "var(--amber)", borderRadius: 9, transition: "width .4s" } })))),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 } },
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Koszt 1 kursu"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 18, marginTop: 4, color: "var(--copper)" } }, fmt0(kosztKursu)),
                React.createElement("div", { style: { fontSize: 10.5, color: "var(--faint)", marginTop: 2 } },
                    kmTotal,
                    " km tam i z powrotem")),
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Koszt transportu / kg"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 18, marginTop: 4 } },
                    kosztNaKg.toFixed(3),
                    " z\u0142"),
                React.createElement("div", { style: { fontSize: 10.5, color: "var(--faint)", marginTop: 2 } },
                    kosztProcent.toFixed(1),
                    "% warto\u015Bci \u0142adunku"))),
        totMass > 0 && wypelnienie < 90 && oszczednoscNaKg > 0.001 && (React.createElement(Card, { style: { background: "rgba(21,163,74,.07)", border: "1px solid rgba(21,163,74,.25)", marginBottom: 10 } },
            React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6 } },
                React.createElement("b", { style: { color: "var(--green)" } }, "\uD83D\uDCB0 Oszcz\u0119dno\u015B\u0107 z dope\u0142nienia \u0142adunku:"),
                React.createElement("br", null),
                React.createElement("span", { style: { color: "var(--muted)" } },
                    "Dowie\u017A jeszcze ",
                    React.createElement("b", { style: { color: "var(--text)" } }, kg(brakDoPelnego)),
                    ", a koszt transportu spadnie z ",
                    kosztNaKgTeraz.toFixed(3),
                    " do ",
                    kosztNaKgPelny.toFixed(3),
                    " z\u0142/kg. Przy pe\u0142nym aucie oszcz\u0119dzasz ",
                    React.createElement("b", { style: { color: "var(--green)" } },
                        (oszczednoscNaKg * masaPelna).toFixed(0),
                        " z\u0142"),
                    " na transporcie.")))),
        React.createElement(Card, { style: { marginBottom: 10 } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5, marginBottom: 10 } }, "\uD83D\uDCE6 Tw\u00F3j stan do wywozu"),
            [
                ["Masa łącznie", kg(totMass)],
                ["Wartość (ceny sprzedaży)", fmt(totValue)],
                ["Potrzebnych kursów", kursy + (kursy === 1 ? " kurs" : " kursy")],
                ["Łączny koszt transportu", fmt0(kosztKursu * kursy)],
                ["Zysk po transporcie", fmt0(totValue - kosztKursu * kursy)],
            ].map(([l, v], i, arr) => (React.createElement("div", { key: l, style: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none", fontSize: 13 } },
                React.createElement("span", { style: { color: "var(--muted)" } }, l),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, color: i === arr.length - 1 ? "var(--green)" : "var(--text)" } }, v))))),
        React.createElement("button", { onClick: () => setOpen(!open), style: { width: "100%", padding: "11px", borderRadius: 12, border: "1px solid var(--line2)", background: "var(--surface)", color: "var(--muted)", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 } },
            "\u2699\uFE0F ",
            open ? "Ukryj" : "Ustaw",
            " parametry transportu"),
        open && (React.createElement(Card, { style: { marginTop: 10 } },
            [
                ["ladownosc", "Ładowność auta (kg)", "np. 24000 dla ciężarówki 24t"],
                ["dystans", "Dystans do huty (km, w jedną stronę)", ""],
                ["spalanie", "Spalanie (litry / 100 km)", ""],
                ["paliwo", "Cena paliwa (zł / litr)", ""],
                ["kierowca", "Koszt kierowcy (zł / dzień)", ""],
                ["oplaty", "Opłaty drogowe (zł / kurs)", "autostrada, parkingi"],
            ].map(([k, l, hint]) => (React.createElement("div", { key: k, style: { marginBottom: 12 } },
                React.createElement("label", { style: { fontSize: 12, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 5 } },
                    l,
                    hint && React.createElement("span", { style: { color: "var(--faint)", fontWeight: 400 } },
                        " \u00B7 ",
                        hint)),
                React.createElement("input", { type: "number", value: param[k], onChange: e => upd(k, e.target.value), style: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--text)", fontSize: 15, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } })))),
            React.createElement("div", { style: { fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5, marginTop: 4 } }, "Parametry zapisuj\u0105 si\u0119 lokalnie. Ustaw raz pod swoje auto i tras\u0119 do huty.")))));
}
function Magazyn({ materials, stock, mm, dispatch, setDispatch }) {
    const [wyd, setWyd] = useState(false);
    const [wMat, setWMat] = useState("");
    const [wW, setWW] = useState("");
    const [wKontr, setWKontr] = useState("");
    const rows = materials.map((m) => ({ ...m, st: stock[m.id] || 0 })).filter((m) => m.st > 0).sort((a, b) => b.st * b.buy - a.st * a.buy);
    const totMass = rows.reduce((a, m) => a + m.st, 0);
    const totCost = rows.reduce((a, m) => a + m.st * m.buy, 0);
    const totSell = rows.reduce((a, m) => a + m.st * m.sell, 0);
    const profit = totSell - totCost;
    const maxV = rows.length ? rows[0].st * rows[0].buy : 1;
    const recentDisp = (dispatch || []).slice(0, 6);
    const addDispatch = () => {
        const w = parseFloat(wW);
        if (!wMat || isNaN(w) || w <= 0 || !wKontr.trim())
            return;
        setDispatch((p) => [{ id: uid(), matId: wMat, w, contractor: wKontr.trim(), dateKey: todayStr(), ts: Date.now() }, ...p]);
        setWMat("");
        setWW("");
        setWKontr("");
        setWyd(false);
    };
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("div", null,
                React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Magazyn"),
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } },
                    kg(totMass),
                    " na stanie")),
            React.createElement("button", { onClick: () => { setWMat(rows[0] ? rows[0].id : (materials[0] && materials[0].id)); setWW(""); setWKontr(""); setWyd(true); }, style: { ...iconBtn, width: "auto", padding: "0 14px", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--copper)" } },
                React.createElement(Truck, { size: 16 }),
                " Wydaj")),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 16 } },
            React.createElement(Card, { pad: 14 },
                React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, "Warto\u015B\u0107 (koszt skupu)"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 21, marginTop: 4 } }, plnShort(totCost))),
            React.createElement(Card, { pad: 14 },
                React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, "Potencjalny przych\u00F3d"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 21, marginTop: 4, color: "#3f7d8a" } }, plnShort(totSell)))),
        React.createElement(Card, { style: { marginTop: 11, background: "linear-gradient(135deg,rgba(21,163,74,.1),rgba(21,163,74,.02))", border: "1px solid rgba(21,163,74,.25)" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9 } },
                    React.createElement("div", { style: { width: 36, height: 36, borderRadius: 10, background: "rgba(21,163,74,.15)", display: "grid", placeItems: "center" } },
                        React.createElement(TrendingUp, { size: 18, color: "var(--green)" })),
                    React.createElement("span", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 15 } }, "Potencjalny zysk")),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 22, color: "var(--green)" } }, plnShort(profit)))),
        React.createElement(KonsolidacjaTransportu, { materials: materials, stock: stock }),
        React.createElement("div", { style: sectionTitle }, "Stany wg materia\u0142u"),
        rows.map((m) => (React.createElement(Card, { key: m.id, pad: 13, style: { marginBottom: 9 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 } },
                    React.createElement("span", { style: { width: 9, height: 9, borderRadius: 3, background: C[m.g].color, flexShrink: 0 } }),
                    React.createElement("span", { style: { fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, m.n)),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap" } }, kg(m.st))),
            React.createElement(Bar, { pct: (m.st * m.buy / maxV) * 100, color: C[m.g].color, h: 6 }),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 7, fontSize: 11.5, color: "var(--muted)" } },
                React.createElement("span", { style: { fontFamily: "var(--mono)" } },
                    "koszt ",
                    plnShort(m.st * m.buy)),
                React.createElement("span", { style: { fontFamily: "var(--mono)" } },
                    "sprzeda\u017C ",
                    plnShort(m.st * m.sell)))))),
        recentDisp.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: sectionTitle }, "Ostatnie wydania"),
            React.createElement(Card, { pad: 6 }, recentDisp.map((d, i) => (React.createElement("div", { key: d.id, style: { display: "flex", alignItems: "center", gap: 11, padding: "11px 10px", borderBottom: i < recentDisp.length - 1 ? "1px solid var(--line)" : "none" } },
                React.createElement("div", { style: { width: 32, height: 32, borderRadius: 9, background: "rgba(63,125,138,.12)", display: "grid", placeItems: "center", flexShrink: 0 } },
                    React.createElement(Truck, { size: 16, color: "#3f7d8a" })),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, mm[d.matId] ? mm[d.matId].n : d.matId),
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } },
                        d.contractor,
                        " \u00B7 ",
                        d.dateKey)),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13.5, color: "#3f7d8a", whiteSpace: "nowrap" } },
                    "\u2212",
                    kg(d.w)),
                React.createElement("button", { onClick: () => setDispatch(dispatch.filter((x) => x.id !== d.id)), style: { ...iconBtn, width: 30, height: 30, border: "none", background: "transparent", color: "var(--faint)" } },
                    React.createElement(X, { size: 15 })))))))),
        React.createElement(Sheet, { open: wyd, onClose: () => setWyd(false), title: "Wydanie do kontrahenta" },
            React.createElement("label", { style: label }, "Surowiec"),
            React.createElement("select", { value: wMat, onChange: (e) => setWMat(e.target.value), style: { ...inputStyle, colorScheme: "light" } }, materials.map((m) => React.createElement("option", { key: m.id, value: m.id },
                m.n,
                " (",
                C[m.g].code,
                ") \u2014 stan ",
                Math.round((stock[m.id] || 0) * 10) / 10,
                " kg"))),
            React.createElement("div", { style: { display: "flex", gap: 10 } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: label }, "Masa (kg)"),
                    React.createElement("input", { style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 }, type: "number", inputMode: "decimal", value: wW, onChange: (e) => setWW(e.target.value), placeholder: "0" })),
                React.createElement("div", { style: { flex: 1.4 } },
                    React.createElement("label", { style: label }, "Kontrahent"),
                    React.createElement("input", { style: inputStyle, value: wKontr, onChange: (e) => setWKontr(e.target.value), placeholder: "np. Huta Stali" }))),
            wMat && parseFloat(wW) > 0 && (stock[wMat] || 0) - parseFloat(wW) < 0 && React.createElement("div", { style: { fontSize: 12, color: "var(--amber)", marginTop: 10, fontWeight: 600 } }, "Uwaga: wydanie wi\u0119ksze ni\u017C stan \u2014 magazyn zejdzie poni\u017Cej zera."),
            React.createElement("button", { style: { ...btnCopper, marginTop: 16 }, onClick: addDispatch },
                React.createElement(Truck, { size: 18 }),
                " Zatwierd\u017A wydanie"))));
}
/* ─────────── Intake (full screen) ─────────── */
function Intake({ materials, mm, company, onClose, commitIntake }) {
    const [kind, setKind] = useState("FPO");
    const [osoba, setOsoba] = useState({ imie: "", nazwisko: "", adres: "", dowod: "", scanned: false });
    const [firma, setFirma] = useState({ nazwa: "", nip: "" });
    const [plate, setPlate] = useState("");
    const [pos, setPos] = useState([]);
    const [payment, setPayment] = useState("gotowka");
    const [photo, setPhoto] = useState(false);
    const [picker, setPicker] = useState(false);
    const [weighing, setWeighing] = useState(null);
    const [result, setResult] = useState(null);
    const [err, setErr] = useState("");
    const total = pos.reduce((a, p) => a + p.w * p.price, 0);
    const mass = pos.reduce((a, p) => a + p.w, 0);
    const addPos = (m) => { setPos((p) => [...p, { rid: uid(), matId: m.id, n: m.n, g: m.g, w: 0, price: m.buy }]); setPicker(false); };
    const upd = (rid, patch) => setPos((p) => p.map((x) => x.rid === rid ? { ...x, ...patch } : x));
    const del = (rid) => setPos((p) => p.filter((x) => x.rid !== rid));
    const weigh = (rid) => { setWeighing(rid); setTimeout(() => { upd(rid, { w: Math.round((Math.random() * 60 + 3) * 10) / 10 }); setWeighing(null); }, 750); };
    const submit = () => {
        if (!pos.length || mass <= 0) {
            setErr("Dodaj co najmniej jedną pozycję z masą.");
            return;
        }
        if (kind === "FPO" && (!osoba.imie.trim() || !osoba.nazwisko.trim() || !osoba.adres.trim())) {
            setErr("Uzupełnij dane przekazującego — bez adresu nie wolno przyjąć (wymóg FPO).");
            return;
        }
        if (kind === "KPO" && (!firma.nazwa.trim() || !firma.nip.trim())) {
            setErr("Uzupełnij nazwę firmy i NIP.");
            return;
        }
        const data = { kind, payment, plate: plate.trim().toUpperCase(), pos: pos.map(({ rid, ...r }) => r), ...(kind === "FPO" ? { osoba } : { firma }) };
        const t = commitIntake(data);
        setResult(t);
    };
    if (result)
        return React.createElement(DocOverlay, { tx: result, company: company, onClose: onClose, onNew: () => { setResult(null); setOsoba({ imie: "", nazwisko: "", adres: "", dowod: "", scanned: false }); setFirma({ nazwa: "", nip: "" }); setPlate(""); setPos([]); setPhoto(false); setErr(""); }, created: true });
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 70, background: "var(--bg)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "calc(12px + env(safe-area-inset-top)) 16px 12px", borderBottom: "1px solid var(--line)", background: "var(--surface)" } },
            React.createElement("button", { onClick: onClose, style: iconBtn },
                React.createElement(ChevronLeft, { size: 20 })),
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontFamily: "var(--display)", fontSize: 18, fontWeight: 800 } }, "Nowe przyj\u0119cie"),
                React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } }, kind === "FPO" ? "Formularz Przyjęcia Odpadów Metali" : "Karta Przekazania Odpadu")),
            React.createElement("div", { style: { width: 38, height: 38, borderRadius: 10, background: "rgba(200,116,63,.12)", display: "grid", placeItems: "center" } },
                React.createElement(Scale, { size: 19, color: "var(--copper)" }))),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 16px 180px" } },
            React.createElement("div", { style: { display: "flex", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 13, padding: 4 } }, [["FPO", "Osoba fizyczna", User], ["KPO", "Firma", Building2]].map(([k, l, Ic]) => (React.createElement("button", { key: k, onClick: () => setKind(k), style: { flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 700, border: "none", background: kind === k ? (k === "FPO" ? "rgba(200,116,63,.13)" : "rgba(63,125,138,.13)") : "transparent", color: kind === k ? (k === "FPO" ? "var(--copper)" : "#3f7d8a") : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 } },
                React.createElement(Ic, { size: 16 }),
                l)))),
            React.createElement(Card, { style: { marginTop: 12, display: "flex", alignItems: "center", gap: 11 }, pad: 12 },
                React.createElement("div", { style: { width: 36, height: 36, borderRadius: 9, background: "rgba(63,125,138,.12)", display: "grid", placeItems: "center", flexShrink: 0 } },
                    React.createElement(Truck, { size: 18, color: "#3f7d8a" })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", fontWeight: 600 } }, "Nr rejestracyjny pojazdu"),
                    React.createElement("input", { value: plate, onChange: (e) => setPlate(e.target.value.toUpperCase()), placeholder: "np. SK 12345", style: { width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 17, letterSpacing: ".06em", color: "var(--text)", padding: 0, marginTop: 2 } })),
                React.createElement("span", { style: { fontSize: 10.5, color: "var(--faint)", textAlign: "right", maxWidth: 90 } }, "\u0142\u0105czy klienta z wa\u017Ceniem")),
            kind === "FPO" ? (React.createElement(Card, { style: { marginTop: 14 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } },
                    React.createElement(ScanLine, { size: 16, color: "var(--copper)" }),
                    React.createElement("span", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 14.5 } }, "Dane przekazuj\u0105cego")),
                React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8 } },
                    React.createElement("input", { style: inputStyle, placeholder: "Imi\u0119", value: osoba.imie, onChange: (e) => setOsoba({ ...osoba, imie: e.target.value }) }),
                    React.createElement("input", { style: inputStyle, placeholder: "Nazwisko", value: osoba.nazwisko, onChange: (e) => setOsoba({ ...osoba, nazwisko: e.target.value }) })),
                React.createElement("input", { style: { ...inputStyle, marginTop: 10 }, placeholder: "Adres zamieszkania (wymagany)", value: osoba.adres, onChange: (e) => setOsoba({ ...osoba, adres: e.target.value }) }),
                React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 10 } },
                    React.createElement("input", { style: { ...inputStyle, flex: 1 }, placeholder: "Nr dowodu", value: osoba.dowod, onChange: (e) => setOsoba({ ...osoba, dowod: e.target.value }) }),
                    React.createElement("button", { onClick: () => setOsoba({ ...osoba, scanned: true, dowod: osoba.dowod || "ABX" + Math.floor(100000 + Math.random() * 899999) }), style: { ...btnGhost, width: "auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 7, color: osoba.scanned ? "var(--green)" : "var(--text)", borderColor: osoba.scanned ? "var(--green)" : "var(--line2)" } }, osoba.scanned ? React.createElement(React.Fragment, null,
                        React.createElement(Check, { size: 16 }),
                        " Zeskanowany") : React.createElement(React.Fragment, null,
                        React.createElement(Camera, { size: 16 }),
                        " Skanuj dow\u00F3d"))))) : (React.createElement(Card, { style: { marginTop: 14 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } },
                    React.createElement(Building2, { size: 16, color: "#3f7d8a" }),
                    React.createElement("span", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 14.5 } }, "Dane firmy (KPO z BDO)")),
                React.createElement("input", { style: { ...inputStyle, marginTop: 8 }, placeholder: "Nazwa firmy", value: firma.nazwa, onChange: (e) => setFirma({ ...firma, nazwa: e.target.value }) }),
                React.createElement("input", { style: { ...inputStyle, marginTop: 10 }, placeholder: "NIP", value: firma.nip, onChange: (e) => setFirma({ ...firma, nip: e.target.value }) }))),
            React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("span", null, "Towar"),
                React.createElement("span", { style: { textTransform: "none", letterSpacing: 0, color: "var(--muted)", fontWeight: 600 } },
                    pos.length,
                    " poz. \u00B7 ",
                    kg(mass))),
            pos.map((p) => {
                const m = mm[p.matId];
                return (React.createElement(Card, { key: p.rid, pad: 13, style: { marginBottom: 10 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 } },
                        React.createElement("div", { style: { minWidth: 0, paddingRight: 8 } },
                            React.createElement("div", { style: { fontSize: 14.5, fontWeight: 700 } }, p.n),
                            React.createElement("div", { style: { marginTop: 3 } }, codeChip(p.g))),
                        React.createElement("button", { onClick: () => del(p.rid), style: { ...iconBtn, width: 32, height: 32, border: "none", background: "transparent", color: "var(--faint)" } },
                            React.createElement(Trash2, { size: 16 }))),
                    React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "flex-end" } },
                        React.createElement("div", { style: { flex: 1.3 } },
                            React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 4 } }, "Masa (kg)"),
                            React.createElement("div", { style: { display: "flex", gap: 6 } },
                                React.createElement("input", { style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 17, padding: "11px 12px" }, type: "number", inputMode: "decimal", value: p.w || "", placeholder: "0", onChange: (e) => upd(p.rid, { w: parseFloat(e.target.value) || 0 }) }),
                                React.createElement("button", { onClick: () => weigh(p.rid), style: { ...iconBtn, width: 46, height: 46, background: "rgba(43,52,64,1)", color: "#fff", border: "none", flexShrink: 0 }, title: "Odczyt z wagi" }, weighing === p.rid ? React.createElement("span", { className: "spin", style: { width: 16, height: 16, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%" } }) : React.createElement(Scale, { size: 19 })))),
                        React.createElement("div", { style: { flex: 1 } },
                            React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 4 } }, "Cena z\u0142/kg"),
                            React.createElement("input", { style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 17, padding: "11px 12px" }, type: "number", inputMode: "decimal", value: p.price, onChange: (e) => upd(p.rid, { price: parseFloat(e.target.value) || 0 }) }))),
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 11, paddingTop: 10, borderTop: "1px solid var(--line)" } },
                        React.createElement("span", { style: { fontSize: 12, color: "var(--muted)" } }, "Warto\u015B\u0107 pozycji"),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 16, color: "var(--copper)" } }, pln(p.w * p.price)))));
            }),
            React.createElement("button", { onClick: () => setPicker(true), style: { ...btnGhost, borderStyle: "dashed", color: "var(--copper)", borderColor: "rgba(200,116,63,.5)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 } },
                React.createElement(Plus, { size: 17 }),
                " Dodaj pozycj\u0119 z cennika"),
            React.createElement("div", { style: sectionTitle }, "Forma p\u0142atno\u015Bci"),
            React.createElement("div", { style: { display: "flex", gap: 8 } }, Object.entries(PAY).map(([k, v]) => {
                const Ic = v.icon;
                return (React.createElement("button", { key: k, onClick: () => setPayment(k), style: { flex: 1, padding: "12px 6px", borderRadius: 12, cursor: "pointer", border: payment === k ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: payment === k ? "rgba(200,116,63,.1)" : "var(--surface)", color: payment === k ? "var(--copper)" : "var(--muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 700 } },
                    React.createElement(Ic, { size: 18 }),
                    v.label));
            })),
            React.createElement("button", { onClick: () => setPhoto(!photo), style: { ...btnGhost, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: photo ? "var(--green)" : "var(--text)", borderColor: photo ? "var(--green)" : "var(--line2)" } }, photo ? React.createElement(React.Fragment, null,
                React.createElement(Check, { size: 17 }),
                " Zdj\u0119cie towaru dodane") : React.createElement(React.Fragment, null,
                React.createElement(Camera, { size: 17 }),
                " Dodaj zdj\u0119cie towaru")),
            err && React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", marginTop: 14, padding: "11px 13px", borderRadius: 12, background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.3)", color: "var(--red)", fontSize: 12.5, fontWeight: 600 } },
                React.createElement(AlertTriangle, { size: 16, style: { flexShrink: 0 } }),
                err)),
        React.createElement("div", { style: { position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 16px calc(14px + env(safe-area-inset-bottom))", background: "var(--surface)", borderTop: "1px solid var(--line)", boxShadow: "0 -8px 24px -16px rgba(0,0,0,.3)" } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 } },
                React.createElement("span", { style: { fontSize: 13, color: "var(--muted)", fontWeight: 600 } }, "Do wyp\u0142aty"),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 26, letterSpacing: "-.02em" } }, pln(total))),
            React.createElement("button", { onClick: submit, style: btnCopper },
                React.createElement(FileText, { size: 19 }),
                " ",
                kind === "FPO" ? "Wystaw FPO i wypłać" : "Zapisz i wystaw KPO")),
        React.createElement(MaterialPicker, { open: picker, onClose: () => setPicker(false), materials: materials, onPick: addPos })));
}
function MaterialPicker({ open, onClose, materials, onPick }) {
    const [q, setQ] = useState("");
    const groups = Object.keys(C);
    const matches = (m) => !q.trim() || fnorm(m.n).includes(fnorm(q)) || C[m.g].code.includes(q.trim());
    return (React.createElement(Sheet, { open: open, onClose: onClose, title: "Wybierz materia\u0142" },
        React.createElement("div", { style: { position: "relative", marginBottom: 4 } },
            React.createElement(Search, { size: 17, color: "var(--faint)", style: { position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" } }),
            React.createElement("input", { style: { ...inputStyle, paddingLeft: 40 }, placeholder: "Szukaj (np. mied\u017A, 17 04\u2026)", value: q, autoFocus: true, onChange: (e) => setQ(e.target.value) })),
        React.createElement("div", { style: { maxHeight: "58vh", overflowY: "auto", margin: "8px -2px 0", padding: "0 2px" } }, groups.map((g) => {
            const items = materials.filter((m) => m.g === g && matches(m));
            if (!items.length)
                return null;
            return (React.createElement("div", { key: g },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, margin: "12px 2px 7px" } },
                    codeChip(g),
                    React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "var(--muted)" } }, C[g].label)),
                items.map((m) => (React.createElement("button", { key: m.id, onClick: () => onPick(m), style: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", marginBottom: 7, cursor: "pointer", borderRadius: 12, border: "1px solid var(--line)", background: "var(--surface)", textAlign: "left" } },
                    React.createElement("span", { style: { width: 9, height: 9, borderRadius: 3, background: C[m.g].color, flexShrink: 0 } }),
                    React.createElement("span", { style: { flex: 1, fontSize: 14, fontWeight: 600 } }, m.n),
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 13.5, fontWeight: 700, color: "var(--copper)" } },
                        m.buy.toFixed(2),
                        " z\u0142"),
                    React.createElement(Plus, { size: 16, color: "var(--faint)" }))))));
        }))));
}
/* ─────────── Document (FPO/KPO) ─────────── */
function DocOverlay({ tx, company, onClose, onNew, created }) {
    const total = txTotal(tx);
    const mass = txMass(tx);
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 90, background: "var(--bg)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" } },
        React.createElement("div", { className: "no-print", style: { display: "flex", alignItems: "center", gap: 12, padding: "calc(12px + env(safe-area-inset-top)) 16px 12px", borderBottom: "1px solid var(--line)", background: "var(--surface)" } },
            React.createElement("button", { onClick: onClose, style: iconBtn },
                React.createElement(X, { size: 19 })),
            React.createElement("div", { style: { flex: 1, fontFamily: "var(--display)", fontSize: 17, fontWeight: 800 } }, tx.kind === "FPO" ? "Formularz FPO" : "Karta KPO"),
            React.createElement("button", { onClick: () => { try {
                    window.print();
                }
                catch (e) { } }, style: { ...iconBtn, width: "auto", padding: "0 13px", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--copper)" } },
                React.createElement(Printer, { size: 16 }),
                " Drukuj / PDF")),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 16 } },
            created && (React.createElement("div", { className: "no-print", style: { display: "flex", alignItems: "center", gap: 11, padding: "13px 14px", borderRadius: 14, background: "rgba(21,163,74,.1)", border: "1px solid rgba(21,163,74,.3)", marginBottom: 14 } },
                React.createElement("div", { style: { width: 38, height: 38, borderRadius: 99, background: "var(--green)", display: "grid", placeItems: "center", flexShrink: 0 } },
                    React.createElement(Check, { size: 20, color: "#fff", strokeWidth: 3 })),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 } }, "Przyj\u0119cie zapisane"),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)" } }, "Dodano do ewidencji \u00B7 wpis do BDO")))),
            React.createElement("div", { id: "fpo-doc", className: "print-target", style: { background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 18, boxShadow: "0 10px 30px -18px rgba(0,0,0,.4)" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--text)", paddingBottom: 12 } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 800, fontSize: 15, lineHeight: 1.15 } }, tx.kind === "FPO" ? "FORMULARZ PRZYJĘCIA ODPADÓW METALI" : "KARTA PRZEKAZANIA ODPADU"),
                        React.createElement("div", { style: { fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", marginTop: 5 } }, tx.no)),
                    React.createElement("div", { style: { width: 38, height: 38, borderRadius: 9, background: "linear-gradient(135deg,#c8743f,#a85829)", display: "grid", placeItems: "center", flexShrink: 0 } },
                        React.createElement(Recycle, { size: 20, color: "#fff" }))),
                React.createElement("div", { style: { display: "flex", gap: 16, marginTop: 12 } },
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("div", { style: docLabel }, "Przyjmuj\u0105cy"),
                        React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700 } }, company.name),
                        React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 } },
                            company.addr,
                            React.createElement("br", null),
                            "NIP ",
                            company.nip,
                            " \u00B7 BDO ",
                            company.bdo)),
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("div", { style: docLabel }, tx.kind === "FPO" ? "Przekazujący (os. fizyczna)" : "Przekazujący (firma)"),
                        tx.kind === "FPO" ? (React.createElement(React.Fragment, null,
                            React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700 } },
                                tx.osoba.imie,
                                " ",
                                tx.osoba.nazwisko),
                            React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", lineHeight: 1.5 } },
                                tx.osoba.adres,
                                React.createElement("br", null),
                                "Dow\u00F3d: ",
                                tx.osoba.dowod || "—"))) : (React.createElement(React.Fragment, null,
                            React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700 } }, tx.firma.nazwa),
                            React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } },
                                "NIP ",
                                tx.firma.nip))))),
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 8 } },
                    "Data: ",
                    fmtDate(tx.ts),
                    ", godz. ",
                    fmtTs(tx.ts),
                    tx.plate ? ` · Pojazd: ${tx.plate}` : ""),
                React.createElement("div", { style: { marginTop: 14, border: "1px solid var(--line2)", borderRadius: 8, overflow: "hidden" } },
                    React.createElement("div", { style: { display: "flex", background: "var(--surface2)", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".03em" } },
                        React.createElement("span", { style: { width: 58 } }, "Kod"),
                        React.createElement("span", { style: { flex: 1 } }, "Rodzaj"),
                        React.createElement("span", { style: { width: 52, textAlign: "right" } }, "Masa"),
                        React.createElement("span", { style: { width: 50, textAlign: "right" } }, "Cena"),
                        React.createElement("span", { style: { width: 62, textAlign: "right" } }, "Warto\u015B\u0107")),
                    tx.pos.map((p, i) => (React.createElement("div", { key: i, style: { display: "flex", padding: "9px 10px", fontSize: 11.5, borderTop: "1px solid var(--line)", alignItems: "center" } },
                        React.createElement("span", { style: { width: 58, fontFamily: "var(--mono)", fontSize: 10, color: C[p.g].color, fontWeight: 700 } }, C[p.g].code),
                        React.createElement("span", { style: { flex: 1, fontWeight: 600 } }, p.n),
                        React.createElement("span", { style: { width: 52, textAlign: "right", fontFamily: "var(--mono)" } }, p.w),
                        React.createElement("span", { style: { width: 50, textAlign: "right", fontFamily: "var(--mono)", color: "var(--muted)" } }, p.price.toFixed(2)),
                        React.createElement("span", { style: { width: 62, textAlign: "right", fontFamily: "var(--mono)", fontWeight: 700 } }, Math.round(p.w * p.price)))))),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "2px solid var(--text)" } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Razem masa \u00B7 p\u0142atno\u015B\u0107"),
                        React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700 } },
                            kg(mass),
                            " \u00B7 ",
                            PAY[tx.payment].label)),
                    React.createElement("div", { style: { textAlign: "right" } },
                        React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Wyp\u0142acono"),
                        React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20 } }, pln(total)))),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 22 } },
                    React.createElement("div", { style: { textAlign: "center", width: "45%" } },
                        React.createElement("div", { style: { borderTop: "1px solid var(--text)", paddingTop: 5, fontSize: 10, color: "var(--muted)" } }, "Podpis przekazuj\u0105cego")),
                    React.createElement("div", { style: { textAlign: "center", width: "45%" } },
                        React.createElement("div", { style: { borderTop: "1px solid var(--text)", paddingTop: 5, fontSize: 10, color: "var(--muted)" } }, "Podpis przyjmuj\u0105cego"))),
                tx.kind === "FPO" && React.createElement("div", { style: { fontSize: 9.5, color: "var(--faint)", marginTop: 12, lineHeight: 1.5 } }, "Formularz stanowi umow\u0119 kupna-sprzeda\u017Cy (PCC 2% po stronie przyjmuj\u0105cego). Dane przekazuj\u0105cego wprowadzane do ewidencji odpad\u00F3w i BDO."))),
        React.createElement("div", { className: "no-print", style: { padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", background: "var(--surface)", borderTop: "1px solid var(--line)", display: "flex", gap: 10 } },
            onNew && React.createElement("button", { onClick: onNew, style: { ...btnGhost, flex: 1 } }, "Nowe przyj\u0119cie"),
            React.createElement("button", { onClick: onClose, style: { ...btnCopper, flex: 1 } }, "Gotowe"))));
}
const docLabel = { fontSize: 9.5, color: "var(--faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 };
/* ─────────── Raport (podgląd / PDF) ─────────── */
function ReportDoc({ data, company, onClose }) {
    if (!data)
        return null;
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 92, background: "var(--bg)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" } },
        React.createElement("div", { className: "no-print", style: { display: "flex", alignItems: "center", gap: 10, padding: "calc(12px + env(safe-area-inset-top)) 16px 12px", borderBottom: "1px solid var(--line)", background: "var(--surface)" } },
            React.createElement("button", { onClick: onClose, style: iconBtn },
                React.createElement(X, { size: 19 })),
            React.createElement("div", { style: { flex: 1, fontFamily: "var(--display)", fontSize: 17, fontWeight: 800 } }, "Raport dnia"),
            React.createElement("button", { onClick: () => downloadText("raport_" + data.day + ".txt", data.text), style: { ...iconBtn, width: "auto", padding: "0 11px", gap: 6, fontSize: 12.5, fontWeight: 700 } },
                React.createElement(FileText, { size: 15 }),
                " .txt"),
            React.createElement("button", { onClick: () => { try {
                    window.print();
                }
                catch (e) { } }, style: { ...iconBtn, width: "auto", padding: "0 11px", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--copper)" } },
                React.createElement(Printer, { size: 15 }),
                " PDF")),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: 16 } },
            React.createElement("div", { className: "print-target", style: { background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: "20px 18px", boxShadow: "0 10px 30px -18px rgba(0,0,0,.4)" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid var(--text)", paddingBottom: 12, marginBottom: 12 } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 } }, "RAPORT DZIENNY"),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 4 } },
                            company.name,
                            " \u00B7 ",
                            data.day)),
                    React.createElement("div", { style: { width: 38, height: 38, borderRadius: 9, background: "linear-gradient(135deg,#c8743f,#a85829)", display: "grid", placeItems: "center", flexShrink: 0 } },
                        React.createElement(FileText, { size: 19, color: "#fff" }))),
                React.createElement("pre", { style: { margin: 0, fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--text)" } }, data.text)),
            React.createElement("div", { className: "no-print", style: { fontSize: 11.5, color: "var(--faint)", textAlign: "center", marginTop: 14, lineHeight: 1.5 } }, "PDF: w oknie wydruku wybierz \u201EZapisz jako PDF\". Na telefonie mo\u017Cesz go potem udost\u0119pni\u0107 (e-mail, WhatsApp)."))));
}
/* ─────────── Logowanie ─────────── */
function Login({ users, onLogin }) {
    const [login, setLogin] = useState("");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState("");
    const tryLogin = (l, p) => {
        const u = users.find((x) => x.login.toLowerCase() === String(l).trim().toLowerCase() && x.pass === p);
        if (!u) {
            setErr("Błędny login lub hasło.");
            return;
        }
        setErr("");
        onLogin(u.id);
    };
    const demos = [["wlasciciel", "Właściciel", Factory], ["kierownik", "Kierownik", Scale], ["kontroler", "Kontroler", ShieldCheck], ["marketing", "Marketing", Megaphone], ["ksiegowy", "Księgowy", Calculator], ["klient", "Klient", Smartphone]];
    return (React.createElement("div", { className: "sk-root", style: { minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px", maxWidth: 480, margin: "0 auto" } },
        React.createElement("div", { style: { textAlign: "center", marginBottom: 26 } },
            React.createElement("div", { style: { width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#c8743f,#a85829)", display: "grid", placeItems: "center", margin: "0 auto 16px", boxShadow: "0 10px 26px -10px rgba(168,88,41,.8)" } },
                React.createElement(Recycle, { size: 34, color: "#fff" })),
            React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 800, fontSize: 26, letterSpacing: "-.02em" } }, "Z\u0141OM-MET"),
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 4 } }, "Logowanie do systemu skupu")),
        React.createElement(Card, null,
            React.createElement("label", { style: label }, "Login"),
            React.createElement("input", { style: inputStyle, value: login, autoCapitalize: "none", onChange: (e) => setLogin(e.target.value), placeholder: "np. kierownik" }),
            React.createElement("label", { style: label }, "Has\u0142o"),
            React.createElement("input", { style: inputStyle, type: "password", value: pass, onChange: (e) => setPass(e.target.value), placeholder: "\u2022\u2022\u2022\u2022", onKeyDown: (e) => { if (e.key === "Enter")
                    tryLogin(login, pass); } }),
            err && React.createElement("div", { style: { color: "var(--red)", fontSize: 12.5, fontWeight: 600, marginTop: 10 } }, err),
            React.createElement("button", { style: { ...btnCopper, marginTop: 16 }, onClick: () => tryLogin(login, pass) }, "Zaloguj")),
        React.createElement("div", { style: { ...sectionTitle, textAlign: "center", margin: "22px 0 10px" } }, "Konta demo \u00B7 has\u0142o: 1234"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 } }, demos.map(([l, lbl, Ic]) => (React.createElement("button", { key: l, onClick: () => tryLogin(l, "1234"), style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px 6px", borderRadius: 13, cursor: "pointer", border: "1px solid var(--line2)", background: "var(--surface)", color: "var(--text)" } },
            React.createElement(Ic, { size: 18, color: "var(--copper)" }),
            React.createElement("span", { style: { fontSize: 12.5, fontWeight: 700 } }, lbl))))),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", textAlign: "center", marginTop: 18, lineHeight: 1.5 } }, "Prototyp \u2014 konta zapisane lokalnie na urz\u0105dzeniu, bez prawdziwego serwera. Realne logowanie i szyfrowanie dochodz\u0105 przy wdro\u017Ceniu backendu.")));
}
/* ─────────── Użytkownicy (właściciel) ─────────── */
function UsersManager({ users, setUsers, currentUser, onClose }) {
    const [adding, setAdding] = useState(false);
    const [f, setF] = useState({ name: "", login: "", pass: "", role: "operator" });
    const [err, setErr] = useState("");
    const roleIcon = (r) => r === "owner" ? Factory : r === "client" ? Smartphone : r === "controller" ? ShieldCheck : r === "marketing" ? Megaphone : r === "accountant" ? Calculator : Scale;
    const addUser = () => {
        const login = f.login.trim().toLowerCase();
        if (!f.name.trim() || !login || !f.pass.trim()) {
            setErr("Uzupełnij imię, login i hasło.");
            return;
        }
        if (users.some((u) => u.login.toLowerCase() === login)) {
            setErr("Taki login już istnieje.");
            return;
        }
        setUsers([...users, { id: uid(), name: f.name.trim(), login, pass: f.pass.trim(), role: f.role }]);
        setF({ name: "", login: "", pass: "", role: "operator" });
        setErr("");
        setAdding(false);
    };
    const removeUser = (id) => setUsers(users.filter((u) => u.id !== id));
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 80, background: "var(--bg)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "calc(12px + env(safe-area-inset-top)) 16px 12px", borderBottom: "1px solid var(--line)", background: "var(--surface)" } },
            React.createElement("button", { onClick: onClose, style: iconBtn },
                React.createElement(X, { size: 19 })),
            React.createElement("div", { style: { flex: 1, fontFamily: "var(--display)", fontSize: 17, fontWeight: 800 } }, "U\u017Cytkownicy i konta"),
            React.createElement("button", { onClick: () => { setAdding((v) => !v); setErr(""); }, style: { ...iconBtn, width: "auto", padding: "0 13px", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--copper)" } },
                React.createElement(Plus, { size: 16 }),
                " Dodaj")),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 16px 40px" } },
            adding && (React.createElement(Card, { style: { marginBottom: 16 } },
                React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, marginBottom: 6 } }, "Nowe konto"),
                React.createElement("label", { style: label }, "Imi\u0119 / nazwa"),
                React.createElement("input", { style: inputStyle, value: f.name, onChange: (e) => setF({ ...f, name: e.target.value }), placeholder: "np. Adam Nowak" }),
                React.createElement("div", { style: { display: "flex", gap: 10 } },
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("label", { style: label }, "Login"),
                        React.createElement("input", { style: inputStyle, value: f.login, autoCapitalize: "none", onChange: (e) => setF({ ...f, login: e.target.value }), placeholder: "adam" })),
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("label", { style: label }, "Has\u0142o"),
                        React.createElement("input", { style: inputStyle, value: f.pass, onChange: (e) => setF({ ...f, pass: e.target.value }), placeholder: "\u2022\u2022\u2022\u2022" }))),
                React.createElement("label", { style: label }, "Rola"),
                React.createElement("div", { style: { display: "flex", gap: 8 } }, [["operator", "Kierownik"], ["controller", "Kontroler"], ["marketing", "Marketing"], ["accountant", "Księgowy"], ["owner", "Właściciel"], ["client", "Klient"]].map(([r, lbl]) => (React.createElement("button", { key: r, onClick: () => setF({ ...f, role: r }), style: { flex: "1 1 40%", padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: f.role === r ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: f.role === r ? "rgba(200,116,63,.1)" : "var(--surface)", color: f.role === r ? "var(--copper)" : "var(--muted)" } }, lbl)))),
                err && React.createElement("div", { style: { color: "var(--red)", fontSize: 12.5, fontWeight: 600, marginTop: 10 } }, err),
                React.createElement("button", { style: { ...btnCopper, marginTop: 14 }, onClick: addUser }, "Utw\u00F3rz konto"))),
            users.map((u) => {
                const Ic = roleIcon(u.role);
                const self = u.id === currentUser.id;
                return (React.createElement(Card, { key: u.id, pad: 13, style: { marginBottom: 9 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                        React.createElement("div", { style: { width: 40, height: 40, borderRadius: 11, background: u.role === "owner" ? "rgba(200,116,63,.13)" : u.role === "client" ? "rgba(63,125,138,.13)" : "rgba(43,52,64,.1)", display: "grid", placeItems: "center", flexShrink: 0 } },
                            React.createElement(Ic, { size: 19, color: u.role === "client" ? "#3f7d8a" : "var(--copper)" })),
                        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                            React.createElement("div", { style: { fontSize: 14.5, fontWeight: 700 } },
                                u.name,
                                " ",
                                self && React.createElement("span", { style: { fontSize: 11, color: "var(--faint)", fontWeight: 500 } }, "(Ty)")),
                            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } },
                                ROLE_LABEL[u.role],
                                " \u00B7 @",
                                u.login)),
                        !self && React.createElement("button", { onClick: () => removeUser(u.id), style: { ...iconBtn, width: 34, height: 34, color: "var(--red)", border: "none", background: "rgba(220,38,38,.08)" } },
                            React.createElement(Trash2, { size: 15 })))));
            }),
            React.createElement("div", { style: { fontSize: 11.5, color: "var(--faint)", marginTop: 14, lineHeight: 1.5, textAlign: "center" } }, "Konta i role dzia\u0142aj\u0105 w prototypie lokalnie. Przy wdro\u017Ceniu zast\u0105pi je prawdziwe logowanie (e-mail + has\u0142o, role po stronie serwera, reset has\u0142a)."))));
}
/* ─────────── Zgłoszenia klientów (panel właściciela) ─────────── */
function RequestsInbox({ requests, setRequests, mm }) {
    const [replyFor, setReplyFor] = useState(null);
    const [rPrice, setRPrice] = useState("");
    const [rMsg, setRMsg] = useState("");
    const [zoom, setZoom] = useState(null);
    const list = (requests || []).slice().sort((a, b) => b.ts - a.ts);
    const openReply = (r) => { setReplyFor(r); setRPrice(r.reply ? String(r.reply.price || "") : ""); setRMsg(r.reply ? (r.reply.message || "") : ""); };
    const sendReply = () => {
        setRequests((p) => p.map((x) => x.id === replyFor.id ? { ...x, status: "answered", reply: { price: rPrice ? parseFloat(rPrice) : null, message: rMsg.trim(), ts: Date.now() } } : x));
        setReplyFor(null);
        setRPrice("");
        setRMsg("");
    };
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24 } },
            React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Zg\u0142oszenia"),
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } }, "Wyceny i wiadomo\u015Bci od klient\u00F3w")),
        list.length === 0 && React.createElement(Card, { style: { marginTop: 18 } },
            React.createElement("div", { style: { textAlign: "center", color: "var(--muted)", fontSize: 13.5, padding: "16px 8px" } }, "Brak zg\u0142osze\u0144. Gdy klient wy\u015Ble zdj\u0119cie z pro\u015Bb\u0105 o wycen\u0119, pojawi si\u0119 tutaj.")),
        React.createElement("div", { style: { marginTop: 16 } }, list.map((r) => (React.createElement(Card, { key: r.id, style: { marginBottom: 11 } },
            React.createElement("div", { style: { display: "flex", gap: 12 } },
                r.photo
                    ? React.createElement("img", { src: r.photo, alt: "", onClick: () => setZoom(r.photo), style: { width: 64, height: 64, borderRadius: 11, objectFit: "cover", cursor: "zoom-in", flexShrink: 0, border: "1px solid var(--line)" } })
                    : React.createElement("div", { style: { width: 64, height: 64, borderRadius: 11, background: "var(--surface2)", display: "grid", placeItems: "center", flexShrink: 0 } },
                        React.createElement(MessageSquare, { size: 22, color: "var(--faint)" })),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
                        React.createElement("span", { style: { fontWeight: 700, fontSize: 14.5 } }, r.clientName || "Klient"),
                        React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: r.status === "new" ? "rgba(220,38,38,.12)" : "rgba(21,163,74,.12)", color: r.status === "new" ? "var(--red)" : "var(--green)" } }, r.status === "new" ? "NOWE" : "ODPOWIEDZIANO")),
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", fontFamily: "var(--mono)", marginTop: 2 } },
                        r.plate ? r.plate + " · " : "",
                        fmtDate(r.ts),
                        " ",
                        fmtTs(r.ts)),
                    r.material && React.createElement("div", { style: { fontSize: 12.5, marginTop: 6 } },
                        "Sugestia AI: ",
                        React.createElement("b", null, r.material),
                        r.est ? ` · ~${r.est}` : ""),
                    r.note && React.createElement("div", { style: { fontSize: 13, marginTop: 6, color: "var(--text)" } },
                        "\u201E",
                        r.note,
                        "\""))),
            r.reply && (React.createElement("div", { style: { marginTop: 11, padding: "10px 12px", borderRadius: 11, background: "rgba(200,116,63,.08)", border: "1px solid rgba(200,116,63,.2)" } },
                React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: "var(--copper)", marginBottom: 3 } }, "Twoja wycena"),
                r.reply.price != null && React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 17 } }, pln(r.reply.price)),
                r.reply.message && React.createElement("div", { style: { fontSize: 13, marginTop: 2 } }, r.reply.message))),
            React.createElement("div", { style: { display: "flex", gap: 9, marginTop: 12 } },
                React.createElement("button", { onClick: () => openReply(r), style: { ...btnCopper, flex: 1 } },
                    React.createElement(Send, { size: 16 }),
                    " ",
                    r.status === "new" ? "Wyceń / odpowiedz" : "Edytuj odpowiedź"),
                React.createElement("button", { onClick: () => setRequests((p) => p.filter((x) => x.id !== r.id)), style: { ...iconBtn, color: "var(--red)", border: "none", background: "rgba(220,38,38,.08)" } },
                    React.createElement(Trash2, { size: 16 }))))))),
        React.createElement(Sheet, { open: !!replyFor, onClose: () => setReplyFor(null), title: "Wycena dla klienta" }, replyFor && (React.createElement(React.Fragment, null,
            replyFor.photo && React.createElement("img", { src: replyFor.photo, alt: "", style: { width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, marginBottom: 12, border: "1px solid var(--line)" } }),
            React.createElement("label", { style: label }, "Proponowana cena / wyp\u0142ata (z\u0142)"),
            React.createElement("input", { type: "number", inputMode: "decimal", value: rPrice, onChange: (e) => setRPrice(e.target.value), placeholder: "np. 140", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 } }),
            React.createElement("label", { style: label }, "Wiadomo\u015B\u0107"),
            React.createElement("textarea", { value: rMsg, onChange: (e) => setRMsg(e.target.value), placeholder: "np. Mied\u017A mix ~5 kg, zapraszamy do punktu \u2014 cena wa\u017Cna 3 dni.", rows: 3, style: { ...inputStyle, resize: "vertical", lineHeight: 1.4 } }),
            React.createElement("button", { onClick: sendReply, style: { ...btnCopper, marginTop: 16 } },
                React.createElement(Send, { size: 18 }),
                " Wy\u015Blij do klienta")))),
        zoom && (React.createElement("div", { onClick: () => setZoom(null), style: { position: "fixed", inset: 0, zIndex: 96, background: "rgba(0,0,0,.85)", display: "grid", placeItems: "center", padding: 20, cursor: "zoom-out" } },
            React.createElement("img", { src: zoom, alt: "", style: { maxWidth: "100%", maxHeight: "100%", borderRadius: 12 } })))));
}
/* ─────────── Uprawnienia ról (panel właściciela) ─────────── */
function PermsManager({ perms, setPerms, onClose }) {
    const roles = [["operator", "Kierownik"], ["controller", "Kontroler"], ["marketing", "Marketing"], ["accountant", "Księgowy"]];
    const toggle = (role, key) => setPerms((p) => ({ ...p, [role]: { ...p[role], [key]: !p[role][key] } }));
    return (React.createElement("div", { style: { position: "fixed", inset: 0, zIndex: 80, background: "var(--bg)", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" } },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "calc(12px + env(safe-area-inset-top)) 16px 12px", borderBottom: "1px solid var(--line)", background: "var(--surface)" } },
            React.createElement("button", { onClick: onClose, style: iconBtn },
                React.createElement(X, { size: 19 })),
            React.createElement("div", { style: { flex: 1, fontFamily: "var(--display)", fontSize: 17, fontWeight: 800 } }, "Uprawnienia r\u00F3l"),
            React.createElement(ShieldCheck, { size: 18, color: "var(--copper)" })),
        React.createElement("div", { style: { flex: 1, overflowY: "auto", padding: "16px 16px 40px" } },
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 } },
                "Decydujesz, co widzi ka\u017Cda rola. ",
                React.createElement("b", null, "W\u0142a\u015Bciciel"),
                " ma zawsze pe\u0142ny dost\u0119p, a ",
                React.createElement("b", null, "Klient"),
                " korzysta z osobnej aplikacji."),
            roles.map(([role, lbl]) => (React.createElement("div", { key: role, style: { marginBottom: 18 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, margin: "10px 2px 8px" } },
                    role === "controller" ? React.createElement(ShieldCheck, { size: 17, color: "var(--copper)" }) : role === "marketing" ? React.createElement(Megaphone, { size: 17, color: "var(--copper)" }) : role === "accountant" ? React.createElement(Calculator, { size: 17, color: "var(--copper)" }) : React.createElement(Scale, { size: 17, color: "var(--copper)" }),
                    React.createElement("span", { style: { fontFamily: "var(--display)", fontSize: 15, fontWeight: 800 } }, lbl)),
                React.createElement(Card, { pad: 4 }, PERM_KEYS.map(([key, klbl], i) => {
                    const on = !!(perms[role] && perms[role][key]);
                    return (React.createElement("div", { key: key, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 10px", borderBottom: i < PERM_KEYS.length - 1 ? "1px solid var(--line)" : "none" } },
                        React.createElement("span", { style: { fontSize: 13.5, fontWeight: 600, paddingRight: 10 } }, klbl),
                        React.createElement("button", { onClick: () => toggle(role, key), style: { width: 46, height: 27, borderRadius: 99, border: "none", cursor: "pointer", padding: 3, background: on ? "var(--green)" : "var(--line2)", flexShrink: 0 } },
                            React.createElement("span", { style: { display: "block", width: 21, height: 21, borderRadius: 99, background: "#fff", transform: on ? "translateX(19px)" : "translateX(0)", transition: "transform .2s" } }))));
                }))))),
            React.createElement("div", { style: { fontSize: 11.5, color: "var(--faint)", lineHeight: 1.5, textAlign: "center" } }, "Zmiany zapisuj\u0105 si\u0119 automatycznie i dzia\u0142aj\u0105 od razu po przelogowaniu danej roli. W wersji z backendem te uprawnienia egzekwuje serwer (RLS)."))));
}
/* ─────────── Agent AI Marketing ─────────── */
function AgentMarketing({ materials, company, tx, campaigns }) {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [autoMode, setAutoMode] = useState(false);
    const [autoRun, setAutoRun] = useState(false);
    const [autoResult, setAutoResult] = useState(null);
    const chatRef = useRef(null);
    const QUICK = [
        { label: "📋 Post na dziś", prompt: "Wygeneruj gotowy post na Facebook/OLX z aktualnymi cenami skupu. Użyj danych z cennika. Dodaj emoji i zachęcający CTA." },
        { label: "🔥 Najlepsza promocja", prompt: "Przeanalizuj nasz cennik i magazyn. Zaproponuj jedną konkretną promocję na ten tydzień, która przyciągnie klientów. Podaj materiał, cenę i uzasadnienie." },
        { label: "📱 SMS do klientów", prompt: "Napisz krótki SMS (max 160 znaków) do stałych klientów skupu informujący o nowych cenach lub promocji. Konkretny i zachęcający." },
        { label: "📅 Plan na tydzień", prompt: "Stwórz plan marketingowy na najbliższy tydzień dla naszego skupu. Konkretne działania na każdy dzień (FB, OLX, ulotki, SMS). Uwzględnij sezonowość i lokalne czynniki." },
        { label: "💡 Pomysły na wzrost", prompt: "Jako ekspert od marketingu lokalnego dla branży złomowej: podaj 5 konkretnych, niskobudżetowych pomysłów na zwiększenie liczby klientów w ciągu 30 dni." },
        { label: "⭐ Wizytówka Google", prompt: "Napisz idealny opis dla wizytówki Google Moja Firma dla naszego skupu. Uwzględnij słowa kluczowe, konkurencyjne ceny i nasze wyróżniki." },
    ];
    const buildSystemPrompt = () => {
        const matList = (materials || []).map(m => `  - ${m.n}: skup ${m.buy?.toFixed(2)} zł/kg`).join("\n");
        const txMonth = (tx || []).filter(x => x.ts > Date.now() - 30 * 86400000);
        const totMonth = txMonth.reduce((a, x) => a + (x.pos || []).reduce((b, p) => b + p.w * p.price, 0), 0);
        const massMonth = txMonth.reduce((a, x) => a + (x.pos || []).reduce((b, p) => b + p.w, 0), 0);
        return `Jesteś doświadczonym ekspertem marketingu lokalnego dla punktów skupu złomu i metali w Polsce.

DANE SKUPU:
Nazwa: ${company?.name || "Punkt skupu złomu"}
Adres: ${company?.addr || "Brak danych"}
Telefon: ${company?.phone || "Brak danych"}
NIP: ${company?.nip || ""}

AKTUALNY CENNIK (ceny skupu):
${matList || "Brak danych cennika"}

STATYSTYKI MIESIĄCA:
- Transakcji: ${txMonth.length}
- Skupiono: ${Math.round(massMonth)} kg
- Obrót: ${totMonth.toFixed(2)} zł
- Aktywnych kampanii: ${(campaigns || []).filter(c => c.status === "active").length}

SPECJALIZUJESZ SIĘ W:
- Marketingu offline (ulotki, tablice, door-to-door) i online (Facebook, OLX, Google)
- Pisaniu postów, SMS-ów i ogłoszeń dla skupów złomu w języku polskim
- Znajomości branży złomowej: sezonowość, typy klientów, czynniki cenowe
- Lokalnym SEO i pozyskiwaniu klientów B2B i B2C

STYL ODPOWIEDZI:
- Zawsze konkretny, gotowy do użycia materiał (posty, SMS, plany)
- Pisz po polsku, naturalne i bezpośrednie
- Daj krótkie uzasadnienie każdej rekomendacji
- Dla postów: używaj emoji, CTA i formatowania przyjaznego dla social media`;
    };
    const send = async (text) => {
        if (!text.trim() || loading)
            return;
        const userMsg = { role: "user", content: text };
        const history = [...msgs, userMsg];
        setMsgs(history);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 1000,
                    system: buildSystemPrompt(),
                    messages: history,
                }),
            });
            const data = await res.json();
            const reply = data.content?.map(b => b.text || "").join("") || "Błąd odpowiedzi.";
            setMsgs([...history, { role: "assistant", content: reply }]);
        }
        catch (e) {
            setMsgs([...history, { role: "assistant", content: "Błąd połączenia z API. Sprawdź połączenie sieciowe." }]);
        }
        setLoading(false);
        setTimeout(() => chatRef.current?.scrollTo({ top: 9999, behavior: "smooth" }), 100);
    };
    const runAutoPromo = async () => {
        if (loading)
            return;
        setAutoRun(true);
        setAutoResult(null);
        setLoading(true);
        const prompt = `Przeanalizuj nasz cennik skupu i wygeneruj automatycznie:
1. Jeden post promocyjny na Facebook (z emoji, cena, CTA) — wybierz materiał z największym potencjałem marketingowym
2. Krótki SMS do stałych klientów (max 160 znaków)
3. Jedno konkretne działanie marketingowe na ten tydzień

Format: oddziel sekcje nagłówkami "### POST FACEBOOK", "### SMS", "### DZIAŁANIE TYGODNIA"`;
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-6",
                    max_tokens: 1000,
                    system: buildSystemPrompt(),
                    messages: [{ role: "user", content: prompt }],
                }),
            });
            const data = await res.json();
            setAutoResult(data.content?.map(b => b.text || "").join("") || "Brak wyników.");
        }
        catch {
            setAutoResult("Błąd połączenia z API.");
        }
        setLoading(false);
        setAutoRun(false);
    };
    const clearChat = () => { setMsgs([]); setAutoResult(null); };
    return (React.createElement("div", { style: { padding: "0 0 20px" } },
        React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 16 } },
            React.createElement("button", { onClick: () => setAutoMode(false), style: { flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13.5, border: !autoMode ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: !autoMode ? "rgba(200,116,63,.12)" : "var(--surface)", color: !autoMode ? "var(--copper)" : "var(--muted)" } }, "\uD83D\uDCAC Czat z agentem"),
            React.createElement("button", { onClick: () => setAutoMode(true), style: { flex: 1, padding: "11px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13.5, border: autoMode ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: autoMode ? "rgba(200,116,63,.12)" : "var(--surface)", color: autoMode ? "var(--copper)" : "var(--muted)" } }, "\u26A1 Auto promocje")),
        !autoMode && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 } }, QUICK.map((q, i) => (React.createElement("button", { key: i, onClick: () => send(q.prompt), disabled: loading, style: { padding: "7px 12px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--muted)", opacity: loading ? .5 : 1 } }, q.label)))),
            React.createElement("div", { ref: chatRef, style: { height: 340, overflowY: "auto", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "12px 14px", marginBottom: 12, display: "flex", flexDirection: "column", gap: 12 } },
                msgs.length === 0 && (React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, color: "var(--muted)" } },
                    React.createElement("span", { style: { fontSize: 40 } }, "\uD83E\uDD16"),
                    React.createElement("div", { style: { textAlign: "center", fontSize: 13.5, lineHeight: 1.6 } },
                        React.createElement("b", { style: { color: "var(--text)" } }, "Agent Marketingowy Z\u0141OM-MET"),
                        React.createElement("br", null),
                        "Mam dost\u0119p do Twojego cennika, magazynu i historii transakcji.",
                        React.createElement("br", null),
                        "Zadaj pytanie lub kliknij skr\u00F3t powy\u017Cej."))),
                msgs.map((m, i) => (React.createElement("div", { key: i, style: { display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" } },
                    m.role === "assistant" && React.createElement("div", { style: { width: 30, height: 30, borderRadius: 99, background: "rgba(200,116,63,.2)", display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0 } }, "\uD83E\uDD16"),
                    React.createElement("div", { style: { maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "rgba(200,116,63,.2)" : "var(--surface2)", fontSize: 13.5, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "var(--text)" } }, m.content)))),
                loading && (React.createElement("div", { style: { display: "flex", gap: 10 } },
                    React.createElement("div", { style: { width: 30, height: 30, borderRadius: 99, background: "rgba(200,116,63,.2)", display: "grid", placeItems: "center", fontSize: 16 } }, "\uD83E\uDD16"),
                    React.createElement("div", { style: { padding: "10px 14px", borderRadius: "18px 18px 18px 4px", background: "var(--surface2)", fontSize: 13.5, color: "var(--muted)" } },
                        "Analizuj\u0119 dane skupu\u2026",
                        React.createElement("span", { style: { marginLeft: 6, animation: "none" } }, "\u25CF\u25CF\u25CF"))))),
            React.createElement("div", { style: { display: "flex", gap: 9 } },
                React.createElement("input", { value: input, onChange: e => setInput(e.target.value), onKeyDown: e => { if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                    } }, placeholder: "Zapytaj agenta\u2026", style: { ...inputStyle, flex: 1, fontSize: 14, padding: "12px 14px" }, disabled: loading }),
                React.createElement("button", { onClick: () => send(input), disabled: loading || !input.trim(), style: { width: 48, height: 48, borderRadius: 13, border: "none", background: input.trim() && !loading ? "var(--copper)" : "var(--surface2)", color: input.trim() && !loading ? "#fff" : "var(--faint)", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 20, display: "grid", placeItems: "center", flexShrink: 0 } }, "\u2191")),
            msgs.length > 0 && React.createElement("button", { onClick: clearChat, style: { marginTop: 10, width: "100%", padding: "10px", borderRadius: 11, border: "1px solid var(--line2)", background: "transparent", color: "var(--faint)", fontSize: 12.5, cursor: "pointer", fontWeight: 600 } }, "\uD83D\uDDD1 Wyczy\u015B\u0107 rozmow\u0119"))),
        autoMode && (React.createElement("div", null,
            React.createElement("div", { style: { background: "rgba(200,116,63,.07)", border: "1px solid rgba(200,116,63,.25)", borderRadius: 16, padding: "16px", marginBottom: 16 } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 15, marginBottom: 6 } }, "\u26A1 Automatyczne Promocje"),
                React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.6 } }, "Agent analizuje Tw\u00F3j aktualny cennik, magazyn i histori\u0119 transakcji, a nast\u0119pnie automatycznie generuje gotowe materia\u0142y marketingowe: post na Facebook, SMS do klient\u00F3w i plan dzia\u0142ania na tydzie\u0144.")),
            React.createElement("button", { onClick: runAutoPromo, disabled: loading, style: { ...btnCopper, marginBottom: 16, opacity: loading ? .6 : 1, cursor: loading ? "wait" : "pointer" } }, loading ? "🤖 Analizuję dane skupu…" : "⚡ Generuj materiały promocyjne"),
            autoResult && (React.createElement("div", null,
                autoResult.split("### ").filter(Boolean).map((section, i) => {
                    const [title, ...body] = section.split("\n");
                    const content = body.join("\n").trim();
                    const icons = { "POST FACEBOOK": "📘", "SMS": "💬", "DZIAŁANIE TYGODNIA": "📅" };
                    const ic = icons[title?.trim()] || "📋";
                    return (React.createElement("div", { key: i, style: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "14px 16px", marginBottom: 12 } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 10, color: "var(--copper)" } },
                            ic,
                            " ",
                            title?.trim()),
                        React.createElement("pre", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--text)", whiteSpace: "pre-wrap", margin: 0, fontFamily: "var(--body)" } }, content),
                        React.createElement("button", { onClick: () => { try {
                                navigator.clipboard.writeText(content);
                            }
                            catch { } }, style: { marginTop: 10, padding: "7px 14px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--muted)", fontSize: 12, fontWeight: 700, cursor: "pointer" } }, "\uD83D\uDCCB Kopiuj")));
                }),
                React.createElement("button", { onClick: runAutoPromo, disabled: loading, style: { ...btnGhost, marginTop: 4 } }, "\uD83D\uDD04 Generuj ponownie"))),
            !autoResult && !loading && (React.createElement("div", { style: { textAlign: "center", padding: "30px 16px", color: "var(--muted)" } },
                React.createElement("div", { style: { fontSize: 36, marginBottom: 12 } }, "\u26A1"),
                React.createElement("div", { style: { fontSize: 13.5, lineHeight: 1.6 } }, "Kliknij przycisk powy\u017Cej, by agent przeanalizowa\u0142 dane skupu i wygenerowa\u0142 gotowe materia\u0142y marketingowe.")))))));
}
/* ─────────── Powiadom klientów (broadcast push) ─────────── */
function PowiadomKlientow({ materials, company }) {
    const [typ, setTyp] = useState("promocja");
    const [tytul, setTytul] = useState("");
    const [tresc, setTresc] = useState("");
    const [wyslane, setWyslane] = useState(false);
    const [historia, setHistoria] = useState(() => { try {
        const s = localStorage.getItem("sk_broadcast_v1");
        return s ? JSON.parse(s) : [];
    }
    catch {
        return [];
    } });
    // Symulowana liczba subskrybentów
    const subskrybenci = 47;
    const SZABLONY = {
        promocja: { ic: "🔥", tytul: "Promocja tygodnia!", tresc: `W tym tygodniu wyższe ceny skupu miedzi w ${company?.name || "naszym skupie"}! Przyjedź i zgarnij najlepszą stawkę. 📞 ${company?.phone || ""}` },
        wzrost: { ic: "📈", tytul: "Ceny w górę!", tresc: "Podnieśliśmy ceny skupu metali kolorowych. Sprawdź aktualny cennik w aplikacji i przyjedź dziś!" },
        info: { ic: "ℹ️", tytul: "Ważna informacja", tresc: "" },
        godziny: { ic: "🕐", tytul: "Zmiana godzin otwarcia", tresc: "Informujemy o zmianie godzin pracy skupu. Sprawdź szczegóły w aplikacji." },
    };
    const uzyjSzablon = (k) => { setTyp(k); setTytul(SZABLONY[k].tytul); setTresc(SZABLONY[k].tresc); };
    const wyslij = () => {
        if (!tytul.trim() || !tresc.trim())
            return;
        const broadcast = { typ: "promocja", tytul: (SZABLONY[typ]?.ic || "🔔") + " " + tytul, tresc, ts: Date.now(), odbiorcy: subskrybenci };
        const nowa = [broadcast, ...historia].slice(0, 20);
        setHistoria(nowa);
        try {
            localStorage.setItem("sk_broadcast_v1", JSON.stringify(nowa));
        }
        catch { }
        // W wersji produkcyjnej (Supabase) tutaj nastąpiłby realny push do urządzeń klientów
        setWyslane(true);
        setTimeout(() => setWyslane(false), 3000);
        setTytul("");
        setTresc("");
    };
    const fmtCzas = (ts) => { const h = Math.round((Date.now() - ts) / 3600000); if (h < 1)
        return "przed chwilą"; if (h < 24)
        return `${h}h temu`; return `${Math.round(h / 24)}d temu`; };
    return (React.createElement("div", { style: { marginTop: 14 } },
        React.createElement("div", { style: { background: "linear-gradient(135deg,rgba(200,116,63,.1),rgba(200,116,63,.02))", border: "1px solid rgba(200,116,63,.3)", borderRadius: 18, padding: "16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 14 } },
            React.createElement("span", { style: { fontSize: 32 } }, "\uD83D\uDCF2"),
            React.createElement("div", null,
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 900, fontSize: 26, color: "var(--copper)" } }, subskrybenci),
                React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)" } }, "klient\u00F3w z w\u0142\u0105czonymi powiadomieniami"))),
        React.createElement("div", { style: sectionTitle }, "Szybkie szablony"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 } }, Object.entries(SZABLONY).map(([k, s]) => (React.createElement("button", { key: k, onClick: () => uzyjSzablon(k), style: { padding: "13px 12px", borderRadius: 13, cursor: "pointer", textAlign: "left", border: typ === k ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: typ === k ? "rgba(200,116,63,.1)" : "var(--surface)", color: "var(--text)" } },
            React.createElement("div", { style: { fontSize: 22, marginBottom: 4 } }, s.ic),
            React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700 } }, s.tytul))))),
        React.createElement(Card, null,
            React.createElement("label", { style: label }, "Tytu\u0142 powiadomienia"),
            React.createElement("input", { style: inputStyle, value: tytul, onChange: e => setTytul(e.target.value), placeholder: "np. Promocja tygodnia!", maxLength: 50 }),
            React.createElement("label", { style: label }, "Tre\u015B\u0107 wiadomo\u015Bci"),
            React.createElement("textarea", { rows: 3, style: { ...inputStyle, resize: "vertical" }, value: tresc, onChange: e => setTresc(e.target.value), placeholder: "Co chcesz przekaza\u0107 klientom?", maxLength: 200 }),
            React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", textAlign: "right", marginTop: 4 } },
                tresc.length,
                "/200"),
            (tytul || tresc) && (React.createElement("div", { style: { marginTop: 12 } },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginBottom: 6, fontWeight: 600 } }, "Podgl\u0105d na telefonie klienta:"),
                React.createElement("div", { style: { background: "var(--surface2)", borderRadius: 14, padding: "12px 14px", display: "flex", gap: 11, alignItems: "flex-start", border: "1px solid var(--line)" } },
                    React.createElement("div", { style: { width: 36, height: 36, borderRadius: 9, background: "var(--copper)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 18 } }, SZABLONY[typ]?.ic || "🔔"),
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("div", { style: { fontSize: 12.5, fontWeight: 700 } }, company?.name || "ZŁOM-MET"),
                        React.createElement("div", { style: { fontSize: 13, fontWeight: 600, marginTop: 2 } }, tytul || "Tytuł powiadomienia"),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 } }, tresc || "Treść wiadomości…"))))),
            React.createElement("button", { onClick: wyslij, disabled: !tytul.trim() || !tresc.trim(), style: { ...btnCopper, marginTop: 14, opacity: (tytul.trim() && tresc.trim()) ? 1 : .5, cursor: (tytul.trim() && tresc.trim()) ? "pointer" : "not-allowed" } }, wyslane ? "✓ Wysłano do " + subskrybenci + " klientów!" : "📲 Wyślij powiadomienie")),
        historia.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: sectionTitle }, "Wys\u0142ane powiadomienia"),
            historia.map((h, i) => (React.createElement(Card, { key: i, pad: 13, style: { marginBottom: 8 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } }, h.tytul),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 } }, h.tresc))),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" } },
                    React.createElement("span", { style: { fontSize: 11, color: "var(--faint)" } }, fmtCzas(h.ts)),
                    React.createElement("span", { style: { fontSize: 11, color: "var(--green)", fontWeight: 700 } },
                        "\uD83D\uDCF2 ",
                        h.odbiorcy,
                        " odbiorc\u00F3w"))))))),
        React.createElement(Card, { style: { marginTop: 6, background: "var(--surface2)" } },
            React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.6, color: "var(--muted)" } },
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDCA1 Jak to dzia\u0142a:"),
                " Klienci, kt\u00F3rzy zainstalowali aplikacj\u0119 i w\u0142\u0105czyli powiadomienia, dostaj\u0105 Twoj\u0105 wiadomo\u015B\u0107 prosto na ekran blokady telefonu. To najta\u0144szy spos\u00F3b, by \u015Bci\u0105gn\u0105\u0107 ich do skupu, gdy ceny rosn\u0105.")),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "W wersji produkcyjnej powiadomienia trafiaj\u0105 na urz\u0105dzenia klient\u00F3w przez serwer push.")));
}
/* ─────────── Doradca Biznesowy AI (3 specjalistów) ─────────── */
const DOR_INK = "#0d1014", DOR_PANEL = "#15191f", DOR_PANEL2 = "#1b212b", DOR_HAIR = "#222932", DOR_HAIR2 = "#2b343f";
const DOR_STEEL = "#8c98a6", DOR_STEELD = "#586472", DOR_PAPER = "#eef2f6", DOR_BRASS = "#c9a35b";
function dorSpecjalisci() {
    return [
        { id: "mkt", glyf: "📈", ikona: "◆", rola: "Marketing i wzrost", tagline: "Strategia · kampanie · marka skupu", akcent: "#7c6ff0",
            powitanie: "Zbudujmy Ci przewagę na rynku. Zwiększę rozpoznawalność skupu i przyciągnę więcej dostawców — od kampanii lokalnych po markę, którą klienci zapamiętają.",
            quick: ["Plan marketingowy na najbliższy miesiąc", "Jak wykorzystać martwy sezon zimowy", "Tani sposób na lokalny rozgłos", "Jak zbudować markę mojego skupu"] },
        { id: "sales", glyf: "🎯", ikona: "▲", rola: "Pozyskiwanie klientów", tagline: "Nowi dostawcy · B2B · lojalność", akcent: "#d4814a",
            powitanie: "Zdobądźmy Ci dostawców i zatrzymajmy obecnych. Pokażę, jak wejść w B2B (warsztaty, firmy, demontaże), jak odbić klientów konkurencji i jak zbudować lojalność.",
            quick: ["Jak pozyskać klientów B2B (warsztaty, firmy)", "Jak odbić klientów konkurencji", "Program lojalnościowy dla stałych dostawców", "Skrypt pierwszej rozmowy z klientem"] },
        { id: "ksieg", glyf: "🧮", ikona: "●", rola: "Księgowość i podatki", tagline: "PCC · VAT · ZUS · koszty", akcent: "#2bb39a",
            powitanie: "Uporządkujmy Ci podatki i legalnie obniżmy obciążenia. Wyjaśnię PCC, VAT, ZUS i koszty uzyskania przychodu. Przy decyzjach wiążących zawsze potwierdź z księgowym.",
            quick: ["Jak legalnie obniżyć podatki", "PCC-4 — kiedy i jak rozliczać", "Czy opłaca mi się być VAT-owcem", "Jakie koszty mogę odliczyć (KUP)"] },
    ];
}
function dorPrompt(id, firma, ceny, staty) {
    const wspolne = `Firma: ${firma}.\n${ceny}\n${staty}\nMów po polsku, konkretnie, jak doświadczony doradca do właściciela skupu. Możesz używać nagłówków (###), pogrubień (**tekst**) i list (-).`;
    if (id === "mkt")
        return `Jesteś dyrektorem marketingu z doświadczeniem w marketingu lokalnym dla skupów złomu w Polsce.\n${wspolne}\nEkspertyza: marketing lokalny offline i online (Facebook, OLX, Google Moja Firma), sezonowość (wiosna/jesień szczyt, zima spadek), budowanie marki, pozycjonowanie cenowe. Dawaj gotowe do wdrożenia plany z budżetami w zł i uzasadnieniem, dlaczego zadziała w branży złomowej.`;
    if (id === "sales")
        return `Jesteś szefem sprzedaży i ekspertem od pozyskiwania klientów dla skupów złomu w Polsce.\n${wspolne}\nEkspertyza: pozyskiwanie B2B (warsztaty, firmy budowlane, ekipy rozbiórkowe, hydraulicy, elektrycy), B2C, programy lojalnościowe, odbijanie klientów konkurencji, skrypty rozmów, retencja. Dawaj konkretne taktyki, gotowe skrypty i kwoty bonusów w zł z psychologią: dlaczego dostawca wybierze ten skup.`;
    return `Jesteś doświadczonym doradcą podatkowym specjalizującym się w rozliczeniach skupów złomu w Polsce.\n${wspolne}\nWiedza: PCC 2% od zakupu od osób fizycznych powyżej 1000 zł (poniżej zwolnione, płaci skup), PCC-4 zbiorcza (min. 3 czynności, 3. w ciągu 14 dni od 1., termin do 7. dnia następnego miesiąca, zapłacony PCC to koszt), VAT i odwrotne obciążenie dla złomu, ZUS (ulga na start, mały ZUS), KUP (paliwo, transport, sprzęt, samochód N1, amortyzacja), legalna optymalizacja. ZAWSZE zaznacz, że to informacja ogólna, a decyzje wiążące warto potwierdzić z licencjonowanym księgowym. Nie podawaj porad jako pewników — tłumacz zasady i opcje.`;
}
function DorAvatar({ akcent, glyf }) {
    return React.createElement("div", { style: { width: 30, height: 30, borderRadius: 9, background: `linear-gradient(145deg, ${akcent}, ${akcent}88)`, display: "grid", placeItems: "center", fontSize: 15, flexShrink: 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,.2)" } }, glyf);
}
function dorStripMd(t) { return t.replace(/^#{1,6}\s+/gm, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/^[-•]\s+/gm, "• "); }
function DorRich({ text, akcent, plain }) {
    if (plain)
        return React.createElement("div", { style: { whiteSpace: "pre-wrap" } }, text);
    const linie = text.split("\n");
    const bloki = [];
    let lista = [];
    const flush = () => { if (lista.length) {
        bloki.push({ t: "ul", items: lista });
        lista = [];
    } };
    linie.forEach((ln) => {
        const h = ln.match(/^(#{1,6})\s+(.*)$/);
        const li = ln.match(/^[-•]\s+(.*)$/);
        const oli = ln.match(/^(\d+)\.\s+(.*)$/);
        if (h) {
            flush();
            bloki.push({ t: "h", txt: h[2] });
        }
        else if (li) {
            lista.push(li[1]);
        }
        else if (oli) {
            flush();
            bloki.push({ t: "oli", n: oli[1], txt: oli[2] });
        }
        else if (ln.trim() === "") {
            flush();
            bloki.push({ t: "sp" });
        }
        else {
            flush();
            bloki.push({ t: "p", txt: ln });
        }
    });
    flush();
    const inline = (s, k) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") && p.endsWith("**")
        ? React.createElement("b", { key: k + "-" + i, style: { fontWeight: 700, color: "#fff" } }, p.slice(2, -2)) : React.createElement("span", { key: k + "-" + i }, p));
    return React.createElement("div", null, bloki.map((b, i) => {
        if (b.t === "h")
            return React.createElement("div", { key: i, style: { fontFamily: "'Fraunces',Georgia,serif", fontWeight: 600, fontSize: 15, color: akcent, margin: i === 0 ? "0 0 7px" : "13px 0 7px" } }, b.txt);
        if (b.t === "p")
            return React.createElement("div", { key: i, style: { margin: "0 0 7px" } }, inline(b.txt, i));
        if (b.t === "oli")
            return React.createElement("div", { key: i, style: { display: "flex", gap: 9, margin: "0 0 6px" } },
                React.createElement("span", { style: { color: akcent, fontWeight: 700, flexShrink: 0 } },
                    b.n,
                    "."),
                React.createElement("span", null, inline(b.txt, i)));
        if (b.t === "ul")
            return React.createElement("div", { key: i, style: { margin: "2px 0 8px", display: "flex", flexDirection: "column", gap: 6 } }, b.items.map((it, j) => React.createElement("div", { key: j, style: { display: "flex", gap: 9 } },
                React.createElement("span", { style: { color: akcent, flexShrink: 0, marginTop: 1 } }, "\u25AA"),
                React.createElement("span", null, inline(it, i + "-" + j)))));
        if (b.t === "sp")
            return React.createElement("div", { key: i, style: { height: 4 } });
        return null;
    }));
}
function DoradcaBiznesowy({ materials, company, tx }) {
    const SPECJALISCI = dorSpecjalisci();
    const [aktywny, setAktywny] = useState("mkt");
    const [watki, setWatki] = useState({ mkt: [], sales: [], ksieg: [] });
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const [stream, setStream] = useState("");
    const [followups, setFollowups] = useState({ mkt: [], sales: [], ksieg: [] });
    const scrollRef = useRef(null);
    const taRef = useRef(null);
    const spec = SPECJALISCI.find(s => s.id === aktywny);
    const akcent = spec.akcent;
    const msgs = watki[aktywny];
    const firma = (company && company.nazwa) || "ZŁOM-MET";
    const inicjal = (firma.trim()[0] || "Z").toUpperCase();
    useEffect(() => {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap";
        document.head.appendChild(l);
        return () => { try {
            document.head.removeChild(l);
        }
        catch (e) { } };
    }, []);
    const DISP = "'Fraunces', Georgia, serif";
    const scrollDown = () => setTimeout(() => { if (scrollRef.current)
        scrollRef.current.scrollTo({ top: 9e6, behavior: "smooth" }); }, 40);
    const typeOut = (full, done) => {
        let i = 0;
        setStream("");
        const tick = setInterval(() => { i += 4; setStream(full.slice(0, i)); scrollDown(); if (i >= full.length) {
            clearInterval(tick);
            setStream("");
            done(full);
        } }, 11);
    };
    const cenyTxt = "CENNIK SKUPU: " + (materials || []).slice(0, 10).map(m => `${m.n} ${(+m.buy).toFixed(2)} zł/kg`).join(", ") + ".";
    const obrot = (tx || []).reduce((a, t) => a + (t.total || 0), 0);
    const statyTxt = `STATYSTYKI: ${(tx || []).length} ostatnich transakcji, obrót z nich ~${Math.round(obrot)} zł.`;
    const propozycje = (id) => ({
        mkt: ["Rozpisz to na konkretne dni", "Jaki budżet przeznaczyć?", "Pokaż przykładowy post"],
        sales: ["Napisz gotowy skrypt rozmowy", "Ile bonusu, by się opłacało?", "Jak znaleźć takie firmy?"],
        ksieg: ["Pokaż to na liczbach", "Jakie są terminy?", "O co dopytać księgowego?"],
    }[id] || []);
    const wyslij = async (text) => {
        if (!text.trim() || busy)
            return;
        const id = aktywny;
        const hist = [...watki[id], { role: "user", content: text, ts: Date.now() }];
        setWatki(w => ({ ...w, [id]: hist }));
        setInput("");
        setFollowups(f => ({ ...f, [id]: [] }));
        setBusy(true);
        if (taRef.current)
            taRef.current.style.height = "auto";
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1400, system: dorPrompt(id, firma, cenyTxt, statyTxt), messages: hist.map(m => ({ role: m.role, content: m.content })) }),
            });
            const data = await res.json();
            const reply = (data.content && data.content.map(b => b.text || "").join("")) || "Chwilowo nie mogę odpowiedzieć — spróbuj ponownie.";
            setBusy(false);
            typeOut(reply, (full) => { setWatki(w => ({ ...w, [id]: [...w[id], { role: "assistant", content: full, ts: Date.now() }] })); setFollowups(f => ({ ...f, [id]: propozycje(id) })); scrollDown(); });
        }
        catch (e) {
            setBusy(false);
            setWatki(w => ({ ...w, [id]: [...w[id], { role: "assistant", content: "Brak połączenia z doradcą. Sprawdź internet i spróbuj ponownie.", ts: Date.now() }] }));
        }
        scrollDown();
    };
    const czas = (ts) => new Date(ts).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    const autosize = (e) => { e.target.style.height = "auto"; e.target.style.height = Math.min(120, e.target.scrollHeight) + "px"; };
    return (React.createElement("div", { style: { background: DOR_INK, borderRadius: 18, overflow: "hidden", border: `1px solid ${DOR_HAIR}`, marginTop: 4 } },
        React.createElement("style", null, `
        @keyframes dorMsgIn { from { opacity:0; transform: translateY(10px);} to {opacity:1; transform:none;} }
        @keyframes dorDot { 0%,60%,100%{ transform: translateY(0); opacity:.35 } 30%{ transform: translateY(-5px); opacity:1 } }
        @keyframes dorCaret { 0%,100%{opacity:1} 50%{opacity:0} }
        .dorMin { animation: dorMsgIn .3s cubic-bezier(.2,.7,.3,1); }
        .dorAx { transition: background-color .4s, border-color .4s, color .4s; }
      `),
        React.createElement("div", { style: { background: DOR_INK, borderBottom: `1px solid ${DOR_HAIR}` } },
            React.createElement("div", { style: { height: 3, background: `linear-gradient(90deg, ${DOR_BRASS}00, ${DOR_BRASS}, ${DOR_BRASS}88, ${DOR_BRASS})` } }),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "13px 14px 12px" } },
                React.createElement("div", { style: { width: 40, height: 40, borderRadius: 11, background: `linear-gradient(145deg, ${DOR_BRASS}, ${DOR_BRASS}aa 55%, ${DOR_BRASS}66)`, display: "grid", placeItems: "center", fontFamily: DISP, fontWeight: 700, fontSize: 19, color: "#1a1407", flexShrink: 0, boxShadow: `0 4px 14px ${DOR_BRASS}30, inset 0 1px 0 rgba(255,255,255,.4)` } }, inicjal),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                        React.createElement("span", { style: { fontFamily: DISP, fontWeight: 600, fontSize: 18, color: DOR_PAPER } }, "Doradca"),
                        React.createElement("span", { style: { fontSize: 9.5, fontWeight: 700, letterSpacing: ".09em", color: DOR_BRASS, border: `1px solid ${DOR_BRASS}55`, padding: "2px 6px", borderRadius: 5 } }, "AI")),
                    React.createElement("div", { style: { fontSize: 11.5, color: DOR_STEEL, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } },
                        firma,
                        " \u00B7 panel w\u0142a\u015Bciciela"))),
            React.createElement("div", { style: { display: "flex", gap: 7, padding: "0 12px 12px", overflowX: "auto" } }, SPECJALISCI.map(s => {
                const on = s.id === aktywny;
                return React.createElement("button", { key: s.id, onClick: () => { setAktywny(s.id); setStream(""); scrollDown(); }, className: "dorAx", style: { flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", borderRadius: 12, cursor: "pointer", border: on ? `1.5px solid ${s.akcent}` : `1px solid ${DOR_HAIR2}`, background: on ? `${s.akcent}1a` : DOR_PANEL, color: on ? s.akcent : DOR_STEEL } },
                    React.createElement("span", { style: { fontSize: 15 } }, s.glyf),
                    React.createElement("span", { style: { fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" } }, s.rola));
            }))),
        React.createElement("div", { ref: scrollRef, style: { height: 440, overflowY: "auto", padding: "18px 14px 8px", display: "flex", flexDirection: "column", gap: 15 } },
            msgs.length === 0 && !busy && !stream && (React.createElement("div", { className: "dorMin", key: aktywny },
                React.createElement("div", { style: { padding: "4px 2px 18px", borderBottom: `1px solid ${DOR_HAIR}`, marginBottom: 16 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 } },
                        React.createElement("div", { className: "dorAx", style: { width: 48, height: 48, borderRadius: 13, background: `linear-gradient(145deg, ${akcent}, ${akcent}88)`, display: "grid", placeItems: "center", fontSize: 23, flexShrink: 0, boxShadow: `0 6px 18px ${akcent}35` } }, spec.glyf),
                        React.createElement("div", null,
                            React.createElement("div", { style: { fontFamily: DISP, fontWeight: 600, fontSize: 18, color: DOR_PAPER } }, spec.rola),
                            React.createElement("div", { className: "dorAx", style: { fontSize: 12, color: akcent, fontWeight: 600, marginTop: 2 } }, spec.tagline))),
                    React.createElement("div", { style: { fontSize: 13, color: DOR_STEEL, lineHeight: 1.6 } }, spec.powitanie)),
                React.createElement("div", { style: { fontSize: 10.5, fontWeight: 700, color: DOR_STEELD, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 } }, "Od czego zacz\u0105\u0107"),
                React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 9 } }, spec.quick.map((q, i) => (React.createElement("button", { key: i, onClick: () => wyslij(q), className: "dorAx", style: { textAlign: "left", padding: "13px 14px", borderRadius: 13, border: `1px solid ${DOR_HAIR2}`, background: DOR_PANEL, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: DOR_PAPER, fontSize: 13, fontWeight: 500 } },
                    React.createElement("span", { className: "dorAx", style: { width: 26, height: 26, borderRadius: 8, background: `${akcent}1e`, color: akcent, display: "grid", placeItems: "center", fontSize: 12, flexShrink: 0 } }, spec.ikona),
                    q,
                    React.createElement("span", { style: { marginLeft: "auto", color: DOR_STEELD, fontSize: 16 } }, "\u2192"))))))),
            msgs.map((m, i) => {
                const user = m.role === "user";
                return (React.createElement("div", { key: i, className: "dorMin", style: { display: "flex", gap: 11, flexDirection: user ? "row-reverse" : "row", alignItems: "flex-end" } },
                    !user && React.createElement(DorAvatar, { akcent: akcent, glyf: spec.glyf }),
                    React.createElement("div", { style: { maxWidth: user ? "82%" : "85%", display: "flex", flexDirection: "column", alignItems: user ? "flex-end" : "flex-start", gap: 4 } },
                        React.createElement("div", { style: { padding: user ? "12px 15px" : "13px 16px", fontSize: 14, lineHeight: 1.6, borderRadius: user ? "16px 16px 5px 16px" : "16px 16px 16px 5px", background: user ? `linear-gradient(145deg, ${akcent}, ${akcent}d8)` : DOR_PANEL, color: user ? "#fff" : DOR_PAPER, border: user ? "none" : `1px solid ${DOR_HAIR}`, whiteSpace: user ? "pre-wrap" : "normal" } }, user ? m.content : React.createElement(DorRich, { text: m.content, akcent: akcent })),
                        React.createElement("span", { style: { fontSize: 10, color: DOR_STEELD, fontFamily: "var(--mono)", padding: "0 4px" } }, czas(m.ts)))));
            }),
            busy && (React.createElement("div", { className: "dorMin", style: { display: "flex", gap: 11, alignItems: "flex-end" } },
                React.createElement(DorAvatar, { akcent: akcent, glyf: spec.glyf }),
                React.createElement("div", { style: { background: DOR_PANEL, border: `1px solid ${DOR_HAIR}`, borderRadius: "16px 16px 16px 5px", padding: "14px 16px", display: "flex", gap: 5 } }, [0, 1, 2].map(d => React.createElement("span", { key: d, style: { width: 7, height: 7, borderRadius: 99, background: akcent, animation: `dorDot 1.2s ${d * 0.15}s infinite ease-in-out` } }))))),
            stream && (React.createElement("div", { style: { display: "flex", gap: 11, alignItems: "flex-end" } },
                React.createElement(DorAvatar, { akcent: akcent, glyf: spec.glyf }),
                React.createElement("div", { style: { maxWidth: "85%", background: DOR_PANEL, border: `1px solid ${DOR_HAIR}`, borderRadius: "16px 16px 16px 5px", padding: "13px 16px", fontSize: 14, lineHeight: 1.6, color: DOR_PAPER } },
                    React.createElement(DorRich, { text: dorStripMd(stream), akcent: akcent, plain: true }),
                    React.createElement("span", { style: { display: "inline-block", width: 7, height: 15, background: akcent, marginLeft: 2, verticalAlign: "text-bottom", animation: "dorCaret 1s steps(1) infinite", borderRadius: 1 } })))),
            followups[aktywny].length > 0 && !busy && !stream && (React.createElement("div", { className: "dorMin", style: { display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 42 } }, followups[aktywny].map((f, i) => React.createElement("button", { key: i, onClick: () => wyslij(f), className: "dorAx", style: { padding: "8px 13px", borderRadius: 99, fontSize: 12.5, fontWeight: 500, cursor: "pointer", border: `1px solid ${akcent}44`, background: `${akcent}12`, color: akcent } }, f))))),
        React.createElement("div", { style: { background: DOR_INK, borderTop: `1px solid ${DOR_HAIR}`, padding: "12px 14px" } },
            React.createElement("div", { className: "dorAx", style: { display: "flex", gap: 10, alignItems: "flex-end", background: DOR_PANEL, border: `1px solid ${DOR_HAIR2}`, borderRadius: 16, padding: "8px 8px 8px 16px" } },
                React.createElement("textarea", { ref: taRef, rows: 1, value: input, onChange: e => { setInput(e.target.value); autosize(e); }, onKeyDown: e => { if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        wyslij(input);
                    } }, placeholder: `Zapytaj: ${spec.rola.toLowerCase()}…`, style: { flex: 1, background: "transparent", border: "none", color: DOR_PAPER, fontSize: 14.5, fontFamily: "system-ui", resize: "none", lineHeight: 1.5, padding: "9px 0", maxHeight: 120, outline: "none" } }),
                React.createElement("button", { onClick: () => wyslij(input), disabled: busy || !input.trim(), className: "dorAx", style: { width: 42, height: 42, borderRadius: 12, border: "none", background: input.trim() && !busy ? `linear-gradient(145deg, ${akcent}, ${akcent}cc)` : DOR_PANEL2, color: input.trim() && !busy ? "#fff" : DOR_STEELD, cursor: input.trim() && !busy ? "pointer" : "default", fontSize: 19, display: "grid", placeItems: "center", flexShrink: 0 } }, "\u2191")),
            React.createElement("div", { style: { textAlign: "center", fontSize: 10.5, color: DOR_STEELD, marginTop: 9 } },
                "Doradca AI \u00B7 ",
                aktywny === "ksieg" ? "informacje ogólne — decyzje potwierdź z księgowym" : "porady strategiczne dla Twojego skupu"))));
}
/* ─────────── Marketing ─────────── */
function Marketing({ requests, materials, campaigns, setCampaigns, tx, company }) {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const [activeTab, setActiveTab] = useState("posty");
    const [copied, setCopied] = useState(null);
    const list = (campaigns || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const reqWeek = (requests || []).filter((r) => r.ts > Date.now() - 7 * 86400000).length;
    const STATUS = { plan: { label: "Planowana", c: "var(--muted)", bg: "rgba(43,52,64,.08)" }, active: { label: "Aktywna", c: "var(--green)", bg: "rgba(21,163,74,.12)" }, done: { label: "Zakończona", c: "var(--faint)", bg: "var(--surface2)" } };
    const copyText = (txt, key) => { try {
        navigator.clipboard.writeText(txt);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    }
    catch { } };
    // ── Generatory postów ──
    const postCennik = () => {
        const d = new Date().toLocaleDateString("pl-PL");
        let t = `🏭 ${company?.name || "SKUP ZŁOMU"} — AKTUALNE CENY\n📅 ${d}\n${"─".repeat(30)}\n`;
        Object.keys(C).forEach((g) => {
            const items = materials.filter((m) => m.g === g && m.buy > 0);
            if (!items.length)
                return;
            t += `\n🔩 ${C[g].label.toUpperCase()}:\n`;
            items.forEach((m) => { t += `  ✅ ${m.n.padEnd(18)} ${m.buy.toFixed(2)} zł/kg\n`; });
        });
        t += `\n${"─".repeat(30)}\n📍 ${company?.addr || "Adres punktu"}\n📞 ${company?.phone || "Numer telefonu"}\n💬 Wycena bezpłatna — przyjedź lub zadzwoń!`;
        return t;
    };
    const postPromocja = (mat, bonus) => {
        const m = materials.find(x => x.id === mat);
        if (!m)
            return "";
        return `🔥 PROMOCJA — ${m.n.toUpperCase()}\n\nW tym tygodniu skupujemy ${m.n} za:\n\n💰 ${(m.buy + (parseFloat(bonus) || 0)).toFixed(2)} zł/kg\n(normalnie: ${m.buy.toFixed(2)} zł/kg)\n\n⏰ Tylko do ${new Date(Date.now() + 7 * 86400000).toLocaleDateString("pl-PL")}\n📞 Zadzwoń i przyjedź: ${company?.phone || "XXX XXX XXX"}\n📍 ${company?.addr || "Adres"}`;
    };
    const postNoweCeny = () => {
        const d = new Date().toLocaleDateString("pl-PL");
        return `📢 AKTUALIZACJA CENNIKA — ${d}\n\nSzanowni Klienci,\ninformujemy o aktualizacji cen skupu.\n\nZapraszamy do kontaktu — płacimy uczciwie i na miejscu!\n\n🏭 ${company?.name || "SKUP ZŁOMU"}\n📞 ${company?.phone || ""}\n📍 ${company?.addr || ""}\n\n#skupzlomu #metalekolorowe #zlom`;
    };
    const postReferral = () => `👥 POLECAJ I ZARABIAJ!\n\nPoleć nas znajomemu, a gdy skup u nas złom —\nTY otrzymasz dodatkowe ${company?.referralBonus || "5"} zł/kg od jego transakcji!\n\n🤝 Bez limitów, bez formalności\n📞 Podaj nasze imię przy przyjeździe\n\n${company?.name || "SKUP ZŁOMU"} — ${company?.addr || ""}`;
    const POSTS = [
        { id: "cennik", label: "📋 Pełny cennik", desc: "Do wklejenia na FB / Instagram / OLX", gen: postCennik },
        { id: "noweceny", label: "📢 Aktualizacja cen", desc: "Krótki post informacyjny", gen: postNoweCeny },
        { id: "referral", label: "👥 Program poleceń", desc: "Przyciągnij nowych klientów przez aktualnych", gen: postReferral },
    ];
    const [promoMat, setPromoMat] = useState(materials[0]?.id || "");
    const [promoBonus, setPromoBonus] = useState("0.20");
    // ── KPIs z transakcji ──
    const txMonth = (tx || []).filter(x => x.ts > Date.now() - 30 * 86400000);
    const uniqueClients = new Set(txMonth.map(x => x.sellerName || x.sellerId)).size;
    const avgTx = txMonth.length ? txMonth.reduce((a, x) => a + txTotal(x), 0) / txMonth.length : 0;
    const TABS = [["posty", "📝 Posty"], ["promocje", "🔥 Promocje"], ["powiadom", "🔔 Powiadom"], ["kampanie", "📊 Kampanie"], ["sms", "💬 SMS"], ["agent", "🤖 Doradca AI"]];
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24 } },
            React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Marketing"),
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } }, "Promocja, posty, kampanie")),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginTop: 16 } }, [["Zgłoszenia (7d)", reqWeek, TrendingUp, "var(--green)"], ["Klientów (30d)", uniqueClients, Users, "var(--copper)"], ["Śr. transakcja", pln(avgTx), Coins, "var(--amber)"]].map(([l, v, Ic, col]) => (React.createElement(Card, { key: l, pad: 13 },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, color: "var(--muted)", fontSize: 11 } },
                React.createElement(Ic, { size: 13, color: col }),
                l),
            React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18, marginTop: 5 } }, v))))),
        React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 16, overflowX: "auto", paddingBottom: 2 } }, TABS.map(([id, lbl]) => React.createElement("button", { key: id, onClick: () => setActiveTab(id), style: { flexShrink: 0, padding: "8px 13px", borderRadius: 11, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: activeTab === id ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: activeTab === id ? "rgba(200,116,63,.1)" : "var(--surface)", color: activeTab === id ? "var(--copper)" : "var(--muted)" } }, lbl))),
        activeTab === "posty" && (React.createElement("div", { style: { marginTop: 14 } }, POSTS.map(({ id, label, desc, gen }) => {
            const txt = gen();
            return (React.createElement(Card, { key: id, style: { marginBottom: 10 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, label),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, desc)),
                    React.createElement("div", { style: { display: "flex", gap: 7 } },
                        React.createElement("button", { onClick: () => copyText(txt, id), style: { padding: "7px 11px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", border: copied === id ? "1.5px solid var(--green)" : "1px solid var(--line2)", background: copied === id ? "rgba(21,163,74,.12)" : "var(--surface2)", color: copied === id ? "var(--green)" : "var(--muted)" } }, copied === id ? "✓ Skopiowano" : "Kopiuj"),
                        React.createElement("button", { onClick: () => downloadText(id + ".txt", txt), style: { padding: "7px 11px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--muted)" } }, "\u2193 .txt"))),
                React.createElement("pre", { style: { fontSize: 11.5, lineHeight: 1.5, color: "var(--text)", background: "var(--surface2)", padding: "10px 12px", borderRadius: 9, overflowX: "auto", whiteSpace: "pre-wrap", margin: 0, fontFamily: "var(--mono)" } }, txt)));
        }))),
        activeTab === "promocje" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Card, null,
                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 12 } }, "\uD83D\uDD25 Generator promocji na materia\u0142"),
                React.createElement("label", { style: label }, "Materia\u0142"),
                React.createElement("select", { value: promoMat, onChange: e => setPromoMat(e.target.value), style: { ...inputStyle, fontWeight: 700 } }, materials.map(m => React.createElement("option", { key: m.id, value: m.id },
                    m.n,
                    " \u2014 ",
                    m.buy.toFixed(2),
                    " z\u0142/kg"))),
                React.createElement("label", { style: label }, "Bonus ponad cen\u0119 (z\u0142/kg)"),
                React.createElement("input", { type: "number", step: "0.05", value: promoBonus, onChange: e => setPromoBonus(e.target.value), style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 } }),
                React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 12 } },
                    React.createElement("button", { onClick: () => copyText(postPromocja(promoMat, promoBonus), "promo"), style: { ...btnCopper, flex: 1 } }, copied === "promo" ? "✓ Skopiowano!" : "📋 Kopiuj post"),
                    React.createElement("button", { onClick: () => downloadText("promocja.txt", postPromocja(promoMat, promoBonus)), style: { ...btnGhost, width: 44 } }, "\u2193"))),
            promoMat && React.createElement("pre", { style: { fontSize: 11.5, lineHeight: 1.55, color: "var(--text)", background: "var(--surface2)", padding: "12px 14px", borderRadius: 12, overflowX: "auto", whiteSpace: "pre-wrap", marginTop: 10, fontFamily: "var(--mono)" } }, postPromocja(promoMat, promoBonus)),
            React.createElement(Card, { style: { marginTop: 14, background: "rgba(200,116,63,.06)", border: "1px solid rgba(200,116,63,.2)" } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "\uD83D\uDCC5 Kiedy robi\u0107 promocje?"),
                [["Poniedziałek", "Wzrost cen metali w weekend → pokaż aktualny cennik"], ["Piątek", "Wpłata wypłat w firmach → klienci mają gotówkę i czas"], ["Przed świętami", "Sprzątanie garaży/warsztatów — duże ilości złomu"], ["Wiosna/jesień", "Porządki — idealny czas na kampanię door-to-door"], ["Po deszczu", "Złomiarz wie: mokry złom = klienci spieszą się sprzedać"],].map(([k, v]) => (React.createElement("div", { key: k, style: { display: "flex", gap: 10, padding: "8px 0", borderTop: "1px solid var(--line)" } },
                    React.createElement("span", { style: { fontWeight: 700, fontSize: 12, color: "var(--copper)", minWidth: 80 } }, k),
                    React.createElement("span", { style: { fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 } }, v))))))),
        activeTab === "kampanie" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, "Kampanie i dzia\u0142ania"),
                React.createElement("button", { onClick: () => { setEdit({ id: null, name: "", date: todayStr(), status: "plan", channel: "facebook", budget: "", roi: "", note: "" }); setOpen(true); }, style: { ...btnCopper, width: "auto", padding: "9px 14px", fontSize: 13 } }, "+ Dodaj")),
            list.length === 0 ? React.createElement(Card, null,
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "10px 0" } }, "Brak kampanii. Dodaj pierwsz\u0105 \u2191")) :
                list.map((c) => {
                    const s = STATUS[c.status] || STATUS.plan;
                    return (React.createElement(Card, { key: c.id, pad: 13, style: { marginBottom: 9, cursor: "pointer" }, onClick: () => { setEdit(c); setOpen(true); } },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
                            React.createElement("div", null,
                                React.createElement("div", { style: { fontSize: 14, fontWeight: 700 } }, c.name),
                                React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 } },
                                    c.channel,
                                    " \u00B7 ",
                                    c.date,
                                    c.budget ? ` · budżet: ${c.budget} zł` : ""),
                                c.roi && React.createElement("div", { style: { fontSize: 12, color: "var(--green)", marginTop: 2 } },
                                    "ROI: ",
                                    c.roi,
                                    "%")),
                            React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, padding: "4px 9px", borderRadius: 99, background: s.bg, color: s.c, whiteSpace: "nowrap" } }, s.label))));
                }))),
        activeTab === "sms" && (React.createElement("div", { style: { marginTop: 14 } },
            [
                { t: "📢 Aktualizacja cen", txt: `Hej! W ${company?.name || "skupie"} mamy nowe ceny od ${new Date().toLocaleDateString("pl-PL")}. Przyjedź dziś — płacimy gotówką na miejscu! ${company?.phone || ""}` },
                { t: "🔥 Promocja tygodnia", txt: `OKAZJA! W tym tygodniu skupujemy MIEDŹ za wyższą cenę. Ograniczona oferta! Zadzwoń: ${company?.phone || "XXX XXX XXX"}` },
                { t: "👥 Program poleceń", txt: `Polecaj nasz skup i zarabiaj! Za każdego poleconego klienta — BONUS dla Ciebie. Szczegóły: ${company?.phone || ""}` },
                { t: "📅 Zaproszenie do skupu", txt: `Sprzątasz garaż/warsztat? Skupujemy złom i metale! Odbiór na terenie: ${company?.area || "Twojej okolicy"}. Tel: ${company?.phone || ""}` },
            ].map((x, i) => (React.createElement(Card, { key: i, style: { marginBottom: 10 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } }, x.t),
                    React.createElement("button", { onClick: () => copyText(x.txt, "sms" + i), style: { padding: "6px 11px", borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: "pointer", border: copied === "sms" + i ? "1.5px solid var(--green)" : "1px solid var(--line2)", background: copied === "sms" + i ? "rgba(21,163,74,.12)" : "var(--surface2)", color: copied === "sms" + i ? "var(--green)" : "var(--muted)" } }, copied === "sms" + i ? "✓" : "Kopiuj")),
                React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", lineHeight: 1.55, background: "var(--surface2)", padding: "10px 12px", borderRadius: 9 } }, x.txt)))),
            React.createElement(Card, { style: { background: "rgba(200,116,63,.06)", border: "1px solid rgba(200,116,63,.2)", marginTop: 6 } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 6 } }, "\uD83D\uDCCD Kana\u0142y promocji \u2014 od najta\u0144szego"),
                [["1", "Facebook Marketplace", "Bezpłatny, zasięg lokalny. Post z cennikiem + zdjęcia materiałów."], ["2", "OLX Ogłoszenia", "Darmowe i płatne. Ogłoszenie skupu + promocja w kategorii Złom."], ["3", "Google Moja Firma", "Bezpłatny profil w Google Maps — bardzo ważny dla lokalnych klientów!"], ["4", "Ulotki A5", "Druk 500 szt. ≈ 50-100 zł. Roznoś w targowiskach, warsztatach, OC"], ["5", "WhatsApp/SMS", "Do bazy stałych klientów — najtańsza rekonwersja."], ["6", "Instagram", "Zdjęcia skupionego materiału + ceny. Młodsi klienci."]].map(([n, k, v]) => (React.createElement("div", { key: n, style: { display: "flex", gap: 10, padding: "8px 0", borderTop: n !== "1" ? "1px solid var(--line)" : "none" } },
                    React.createElement("span", { style: { fontWeight: 800, fontSize: 12, color: "var(--copper)", minWidth: 16 } }, n),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 13 } }, k),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, v)))))))),
        activeTab === "agent" && (React.createElement(DoradcaBiznesowy, { materials: materials, company: company, tx: tx })),
        activeTab === "powiadom" && React.createElement(PowiadomKlientow, { materials: materials, company: company }),
        React.createElement(Sheet, { open: open, onClose: () => setOpen(false), title: edit && edit.id ? "Kampania" : "Nowa kampania" }, edit && (React.createElement(React.Fragment, null,
            React.createElement("label", { style: label }, "Nazwa kampanii"),
            React.createElement("input", { style: inputStyle, value: edit.name, onChange: (e) => setEdit({ ...edit, name: e.target.value }), placeholder: "np. Promocja na mied\u017A \u2014 lipiec" }),
            React.createElement("label", { style: label }, "Kana\u0142"),
            React.createElement("select", { value: edit.channel || "facebook", onChange: e => setEdit({ ...edit, channel: e.target.value }), style: { ...inputStyle, fontWeight: 600 } }, [["facebook", "Facebook/Marketplace"], ["olx", "OLX"], ["google", "Google My Business"], ["ulotki", "Ulotki"], ["sms", "SMS/WhatsApp"], ["instagram", "Instagram"], ["inne", "Inne"]].map(([v, l]) => React.createElement("option", { key: v, value: v }, l))),
            React.createElement("label", { style: label }, "Data"),
            React.createElement("input", { type: "date", style: { ...inputStyle, colorScheme: "light" }, value: edit.date, onChange: (e) => setEdit({ ...edit, date: e.target.value }) }),
            React.createElement("label", { style: label }, "Bud\u017Cet (z\u0142)"),
            React.createElement("input", { type: "number", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700 }, value: edit.budget || "", onChange: e => setEdit({ ...edit, budget: e.target.value }), placeholder: "0" }),
            React.createElement("label", { style: label }, "ROI (%)"),
            React.createElement("input", { type: "number", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700 }, value: edit.roi || "", onChange: e => setEdit({ ...edit, roi: e.target.value }), placeholder: "np. 250" }),
            React.createElement("label", { style: label }, "Status"),
            React.createElement("div", { style: { display: "flex", gap: 8 } }, [["plan", "Planowana"], ["active", "Aktywna"], ["done", "Zakończona"]].map(([k, l]) => (React.createElement("button", { key: k, onClick: () => setEdit({ ...edit, status: k }), style: { flex: 1, padding: "9px", borderRadius: 9, cursor: "pointer", fontSize: 12, fontWeight: 700, border: edit.status === k ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: edit.status === k ? "rgba(200,116,63,.1)" : "var(--surface)", color: edit.status === k ? "var(--copper)" : "var(--muted)" } }, l)))),
            React.createElement("label", { style: label }, "Notatka"),
            React.createElement("textarea", { rows: 2, style: { ...inputStyle, resize: "vertical" }, value: edit.note || "", onChange: (e) => setEdit({ ...edit, note: e.target.value }), placeholder: "Wyniki, uwagi\u2026" }),
            React.createElement("button", { style: { ...btnCopper, marginTop: 14 }, onClick: () => {
                    if (!edit.name.trim())
                        return;
                    if (edit.id)
                        setCampaigns(campaigns.map((c) => c.id === edit.id ? edit : c));
                    else
                        setCampaigns([...campaigns, { ...edit, id: uid() }]);
                    setOpen(false);
                } }, "Zapisz"),
            edit.id && React.createElement("button", { style: { ...btnGhost, marginTop: 10, color: "var(--red)", borderColor: "rgba(220,38,38,.3)" }, onClick: () => { setCampaigns(campaigns.filter((c) => c.id !== edit.id)); setOpen(false); } }, "Usu\u0144"))))));
}
/* ─────────── Kalkulator zysku ─────────── */
function KalkulatorZysku({ materials, stock, tx, kupMonth, kupTot, month }) {
    // Domyślne marże/ceny sprzedaży z cennika lub edytowalne
    const [rows, setRows] = useState(() => {
        try {
            const s = localStorage.getItem("sk_profit_v1");
            if (s)
                return JSON.parse(s);
        }
        catch { }
        return (materials || []).filter(m => (stock?.[m.id] || 0) > 0 || m.stock > 0).map(m => ({
            id: m.id, n: m.n, g: m.g,
            qty: String(Math.round(stock?.[m.id] ?? m.stock ?? 0)),
            buy: m.buy,
            sell: String(m.sell || (m.buy * 1.2).toFixed(2)),
        }));
    });
    const [extraCost, setExtraCost] = useState(() => { try {
        return localStorage.getItem("sk_profit_cost") || "0";
    }
    catch {
        return "0";
    } });
    const [vatMode, setVatMode] = useState(false);
    const save = (r, c) => { try {
        localStorage.setItem("sk_profit_v1", JSON.stringify(r));
        if (c !== undefined)
            localStorage.setItem("sk_profit_cost", c);
    }
    catch { } };
    const upd = (id, field, val) => { const r = rows.map(x => x.id === id ? { ...x, [field]: val } : x); setRows(r); save(r); };
    // Obliczenia
    const calc = rows.map(r => {
        const qty = parseFloat(r.qty) || 0;
        const buy = parseFloat(r.buy) || 0;
        const sell = parseFloat(r.sell) || 0;
        const revenue = qty * sell; // przychód ze sprzedaży
        const cost = qty * buy; // koszt zakupu
        const grossMargin = revenue - cost; // marża brutto
        const marginPct = sell > 0 ? ((sell - buy) / sell * 100) : 0;
        return { ...r, qty, buy, sell, revenue, cost, grossMargin, marginPct };
    });
    const totRevenue = calc.reduce((a, r) => a + r.revenue, 0);
    const totCost = calc.reduce((a, r) => a + r.cost, 0);
    const totGross = totRevenue - totCost;
    const extra = parseFloat(extraCost) || 0;
    const kupReal = (kupTot || 0) + extra;
    const netProfit = totGross - kupReal; // zysk netto po kosztach
    const vat = vatMode ? totRevenue * 0.23 : 0;
    const netAfterVat = netProfit - vat;
    const avgMargin = totRevenue > 0 ? (totGross / totRevenue * 100) : 0;
    const fmt = v => v.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
    return (React.createElement("div", { style: { marginTop: 14 } },
        React.createElement("div", { style: { background: netProfit >= 0 ? "linear-gradient(135deg,rgba(21,163,74,.12),rgba(21,163,74,.02))" : "linear-gradient(135deg,rgba(220,38,38,.12),rgba(220,38,38,.02))", border: `1px solid ${netProfit >= 0 ? "rgba(21,163,74,.3)" : "rgba(220,38,38,.3)"}`, borderRadius: 18, padding: "18px 16px", marginBottom: 14 } },
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", fontWeight: 600 } }, "Szacunkowy zysk netto"),
            React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 900, fontSize: 32, marginTop: 4, color: netProfit >= 0 ? "var(--green)" : "var(--red)" } }, fmt(netProfit)),
            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 4 } },
                "\u015Brednia mar\u017Ca: ",
                avgMargin.toFixed(1),
                "% \u00B7 ",
                calc.length,
                " materia\u0142\u00F3w"),
            vatMode && React.createElement("div", { style: { fontSize: 12.5, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between" } },
                React.createElement("span", { style: { color: "var(--muted)" } }, "Po odliczeniu VAT 23%:"),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700 } }, fmt(netAfterVat)))),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 } },
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Przych\u00F3d (sprzeda\u017C)"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 17, marginTop: 4, color: "var(--green)" } }, fmt(totRevenue))),
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Koszt zakupu"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 17, marginTop: 4, color: "var(--copper)" } }, fmt(totCost))),
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Mar\u017Ca brutto"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 17, marginTop: 4 } }, fmt(totGross))),
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Koszty firmy (KUP)"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 17, marginTop: 4, color: "var(--red)" } }, fmt(kupReal)))),
        React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", null, "Materia\u0142y \u2014 mar\u017Ca i sprzeda\u017C"),
            React.createElement("button", { onClick: () => setVatMode(!vatMode), style: { padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", border: vatMode ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: vatMode ? "rgba(200,116,63,.1)" : "var(--surface2)", color: vatMode ? "var(--copper)" : "var(--muted)", textTransform: "none", letterSpacing: 0 } }, vatMode ? "VAT ✓" : "VAT")),
        calc.map(r => (React.createElement(Card, { key: r.id, pad: 13, style: { marginBottom: 9 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                    React.createElement("div", { style: { width: 8, height: 8, borderRadius: 99, background: C[r.g]?.color || "var(--copper)" } }),
                    React.createElement("span", { style: { fontWeight: 700, fontSize: 13.5 } }, r.n)),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 14, color: r.grossMargin >= 0 ? "var(--green)" : "var(--red)" } },
                    r.grossMargin >= 0 ? "+" : "",
                    fmt(r.grossMargin))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 3 } }, "Ilo\u015B\u0107 (kg)"),
                    React.createElement("input", { type: "number", value: r.qty, onChange: e => upd(r.id, "qty", e.target.value), style: { width: "100%", padding: "8px 9px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--text)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } })),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 3 } }, "Skup (z\u0142/kg)"),
                    React.createElement("input", { type: "number", step: "0.01", value: r.buy, onChange: e => upd(r.id, "buy", e.target.value), style: { width: "100%", padding: "8px 9px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--copper)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } })),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 3 } }, "Sprzeda\u017C (z\u0142/kg)"),
                    React.createElement("input", { type: "number", step: "0.01", value: r.sell, onChange: e => upd(r.id, "sell", e.target.value), style: { width: "100%", padding: "8px 9px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--green)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } }))),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5, color: "var(--muted)" } },
                React.createElement("span", null,
                    "mar\u017Ca: ",
                    React.createElement("b", { style: { color: r.marginPct >= 0 ? "var(--green)" : "var(--red)" } },
                        r.marginPct.toFixed(1),
                        "%")),
                React.createElement("span", null,
                    "przych\u00F3d: ",
                    React.createElement("b", { style: { color: "var(--text)" } }, fmt(r.revenue))))))),
        React.createElement("div", { style: sectionTitle }, "Koszty dodatkowe (poza KUP)"),
        React.createElement(Card, { pad: 14 },
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 } }, "Transport do huty, ci\u0119cie, robocizna, paliwo \u2014 wszystko co pomniejsza zysk z tej partii."),
            React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
                React.createElement("input", { type: "number", value: extraCost, onChange: e => { setExtraCost(e.target.value); save(rows, e.target.value); }, placeholder: "0", style: { flex: 1, padding: "12px 14px", borderRadius: 11, border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--red)", fontSize: 18, fontFamily: "var(--mono)", fontWeight: 800, outline: "none", boxSizing: "border-box" } }),
                React.createElement("span", { style: { fontSize: 14, color: "var(--muted)", fontWeight: 600 } }, "z\u0142"))),
        React.createElement(Card, { style: { marginTop: 14, background: "var(--surface2)" } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5, marginBottom: 12 } }, "\uD83D\uDCCA Kalkulacja ko\u0144cowa"),
            [
                ["Przychód ze sprzedaży", fmt(totRevenue), "var(--green)"],
                ["− Koszt zakupu złomu", "−" + fmt(totCost), "var(--copper)"],
                ["= Marża brutto", fmt(totGross), "var(--text)"],
                ["− Koszty firmy (KUP)", "−" + fmt(kupTot || 0), "var(--red)"],
                ["− Koszty dodatkowe", "−" + fmt(extra), "var(--red)"],
                ...(vatMode ? [["− VAT 23%", "−" + fmt(vat), "var(--red)"]] : []),
            ].map(([l, v, c], i) => (React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--line)", fontSize: 13 } },
                React.createElement("span", { style: { color: "var(--muted)" } }, l),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, color: c } }, v)))),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", paddingTop: 12, marginTop: 4 } },
                React.createElement("span", { style: { fontWeight: 800, fontSize: 15 } }, "= ZYSK NETTO"),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 900, fontSize: 18, color: (vatMode ? netAfterVat : netProfit) >= 0 ? "var(--green)" : "var(--red)" } }, fmt(vatMode ? netAfterVat : netProfit)))),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "Edytuj ilo\u015Bci, ceny skupu i sprzeda\u017Cy \u2014 zysk przelicza si\u0119 automatycznie. Dane zapisuj\u0105 si\u0119 lokalnie.")));
}
/* ─────────── Rentowność materiałów ─────────── */
function RentownoscMaterialow({ tx, materials, stock, month }) {
    const [sortBy, setSortBy] = useState("zysk");
    // Gęstość nasypowa (kg/m³) per grupa — do oszacowania miejsca na placu
    const GESTOSC = { FE: 1200, CU: 2000, AL: 400, KAB: 600, SS: 1500, PB: 3000, ZN: 1800, AKU: 1500, EL: 300 };
    // Obrót z transakcji w tym miesiącu per materiał
    const txMonth = (tx || []).filter(x => fmtDateKey(x.ts).slice(0, 7) === month);
    const obrotMat = {};
    txMonth.forEach(x => (x.pos || []).forEach(p => {
        if (!obrotMat[p.matId])
            obrotMat[p.matId] = { masa: 0, wartosc: 0 };
        obrotMat[p.matId].masa += p.w;
        obrotMat[p.matId].wartosc += p.w * p.price;
    }));
    // Analiza per materiał
    const analiza = (materials || []).map(m => {
        const st = stock?.[m.id] || 0;
        const marzaKg = m.sell - m.buy;
        const marzaPct = m.buy > 0 ? (marzaKg / m.buy * 100) : 0;
        const obrot = obrotMat[m.id] || { masa: 0, wartosc: 0 };
        // Zysk z obrotu miesięcznego (marża × masa skupiona)
        const zyskObrot = obrot.masa * marzaKg;
        // Zamrożony kapitał (wartość zapasu po cenie skupu)
        const kapital = st * m.buy;
        // Miejsce na placu (m³) — masa / gęstość
        const gest = GESTOSC[m.g] || 1000;
        const miejsce = st / gest;
        // Rentowność powierzchni: potencjalny zysk z zapasu / zajmowane miejsce
        const zyskZapas = st * marzaKg;
        const zlNaM3 = miejsce > 0 ? zyskZapas / miejsce : 0;
        // Efektywność kapitału: zysk z obrotu / średni kapitał (proxy: marża%)
        const efektKapital = marzaPct;
        return { ...m, st, marzaKg, marzaPct, obrot, zyskObrot, kapital, miejsce, zyskZapas, zlNaM3, efektKapital };
    });
    const totZyskObrot = analiza.reduce((a, m) => a + m.zyskObrot, 0);
    const totKapital = analiza.reduce((a, m) => a + m.kapital, 0);
    const totMiejsce = analiza.reduce((a, m) => a + m.miejsce, 0);
    // Sortowanie
    const SORT_FN = {
        zysk: (a, b) => b.zyskObrot - a.zyskObrot,
        marza: (a, b) => b.marzaPct - a.marzaPct,
        miejsce: (a, b) => b.zlNaM3 - a.zlNaM3,
        kapital: (a, b) => b.kapital - a.kapital,
    };
    const sorted = analiza.slice().sort(SORT_FN[sortBy]);
    const maxVal = {
        zysk: Math.max(...analiza.map(m => m.zyskObrot), 1),
        marza: Math.max(...analiza.map(m => m.marzaPct), 1),
        miejsce: Math.max(...analiza.map(m => m.zlNaM3), 1),
        kapital: Math.max(...analiza.map(m => m.kapital), 1),
    }[sortBy];
    const fmt0 = v => Math.round(v).toLocaleString("pl-PL") + " zł";
    const fmt = v => v.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
    // Najlepszy i najgorszy wg zysku z obrotu
    const best = sorted[0];
    const najwiekszyKapital = analiza.slice().sort((a, b) => b.kapital - a.kapital)[0];
    const najslabszaRotacja = analiza.filter(m => m.kapital > 0 && m.zyskObrot < m.kapital * 0.05).sort((a, b) => b.kapital - a.kapital)[0];
    const SORT_LBL = { zysk: "Zysk z obrotu", marza: "Marża %", miejsce: "Zł / m³ placu", kapital: "Zamrożony kapitał" };
    const SORT_UNIT = (m) => {
        if (sortBy === "zysk")
            return fmt0(m.zyskObrot);
        if (sortBy === "marza")
            return m.marzaPct.toFixed(1) + "%";
        if (sortBy === "miejsce")
            return fmt0(m.zlNaM3) + "/m³";
        return fmt0(m.kapital);
    };
    const SORT_VAL = (m) => {
        if (sortBy === "zysk")
            return m.zyskObrot;
        if (sortBy === "marza")
            return m.marzaPct;
        if (sortBy === "miejsce")
            return m.zlNaM3;
        return m.kapital;
    };
    return (React.createElement("div", { style: { marginTop: 14 } },
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 } },
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Zysk z obrotu (mies.)"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 18, marginTop: 4, color: "var(--green)" } }, fmt0(totZyskObrot))),
            React.createElement(Card, { pad: 13 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "Zamro\u017Cony kapita\u0142"),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 18, marginTop: 4, color: "var(--copper)" } }, fmt0(totKapital)))),
        best && best.zyskObrot > 0 && (React.createElement(Card, { style: { background: "rgba(21,163,74,.07)", border: "1px solid rgba(21,163,74,.25)", marginBottom: 10 } },
            React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6 } },
                React.createElement("b", { style: { color: "var(--green)" } },
                    "\uD83C\uDFC6 Tw\u00F3j ko\u0144 poci\u0105gowy: ",
                    best.n),
                React.createElement("br", null),
                React.createElement("span", { style: { color: "var(--muted)" } },
                    "Daje ",
                    fmt0(best.zyskObrot),
                    " zysku z obrotu tego miesi\u0105ca \u2014 ",
                    totZyskObrot > 0 ? Math.round(best.zyskObrot / totZyskObrot * 100) : 0,
                    "% ca\u0142o\u015Bci. Mar\u017Ca ",
                    best.marzaPct.toFixed(0),
                    "%.")))),
        najslabszaRotacja && (React.createElement(Card, { style: { background: "rgba(217,119,6,.07)", border: "1px solid rgba(217,119,6,.25)", marginBottom: 10 } },
            React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6 } },
                React.createElement("b", { style: { color: "var(--amber)" } },
                    "\u23F3 Martwy kapita\u0142: ",
                    najslabszaRotacja.n),
                React.createElement("br", null),
                React.createElement("span", { style: { color: "var(--muted)" } },
                    "Zamra\u017Ca ",
                    fmt0(najslabszaRotacja.kapital),
                    " przy s\u0142abym obrocie. Rozwa\u017C obni\u017Ck\u0119 ceny sprzeda\u017Cy, by szybciej go up\u0142ynni\u0107 i odzyska\u0107 got\u00F3wk\u0119.")))),
        React.createElement("div", { style: sectionTitle }, "Ranking materia\u0142\u00F3w"),
        React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 4 } }, [["zysk", "💰 Zysk"], ["marza", "📊 Marża"], ["miejsce", "📦 Zł/m³ placu"], ["kapital", "🔒 Kapitał"]].map(([id, lbl]) => (React.createElement("button", { key: id, onClick: () => setSortBy(id), style: { flexShrink: 0, padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: sortBy === id ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: sortBy === id ? "rgba(200,116,63,.1)" : "var(--surface2)", color: sortBy === id ? "var(--copper)" : "var(--muted)" } }, lbl)))),
        sorted.map((m, i) => {
            const val = SORT_VAL(m);
            const pct = maxVal > 0 ? Math.max(2, (val / maxVal) * 100) : 0;
            return (React.createElement(Card, { key: m.id, pad: 13, style: { marginBottom: 8 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 } },
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 800, color: i === 0 ? "var(--copper)" : "var(--faint)", width: 20 } },
                        "#",
                        i + 1),
                    React.createElement("div", { style: { width: 8, height: 8, borderRadius: 99, background: (C[m.g] || {}).color || "var(--copper)", flexShrink: 0 } }),
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, m.n)),
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 14, color: val >= 0 ? "var(--text)" : "var(--red)" } }, SORT_UNIT(m))),
                React.createElement("div", { style: { height: 6, background: "var(--surface2)", borderRadius: 9, overflow: "hidden", marginBottom: 8 } },
                    React.createElement("div", { style: { height: "100%", width: pct + "%", background: i === 0 ? "linear-gradient(90deg,var(--copper),#a85829)" : "linear-gradient(90deg,var(--green),#0d7a37)", borderRadius: 9 } })),
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" } },
                    React.createElement("span", null,
                        "obr\u00F3t: ",
                        kg(m.obrot.masa)),
                    React.createElement("span", null,
                        "mar\u017Ca: ",
                        m.marzaKg.toFixed(2),
                        " z\u0142/kg"),
                    React.createElement("span", null,
                        "zapas: ",
                        fmt0(m.kapital)))));
        }),
        React.createElement(Card, { style: { marginTop: 6, background: "var(--surface2)" } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "\uD83C\uDFAF Jak czyta\u0107 rentowno\u015B\u0107"),
            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", lineHeight: 1.7 } },
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDCB0 Zysk z obrotu"),
                " \u2014 ile realnie zarobi\u0142e\u015B na materiale w tym miesi\u0105cu.",
                React.createElement("br", null),
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDCCA Mar\u017Ca"),
                " \u2014 procentowy zarobek na kg (wysoki = op\u0142acalny na jednostk\u0119).",
                React.createElement("br", null),
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDCE6 Z\u0142/m\u00B3 placu"),
                " \u2014 ile zysku daje materia\u0142 na zajmowane miejsce. Stal jest ci\u0119\u017Cka ale zajmuje du\u017Co \u2014 mied\u017A odwrotnie.",
                React.createElement("br", null),
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDD12 Kapita\u0142"),
                " \u2014 ile got\u00F3wki masz zamro\u017Cone w zapasie. Wysoki kapita\u0142 + niski obr\u00F3t = pieni\u0105dze stoj\u0105.")),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "Miejsce na placu szacowane z g\u0119sto\u015Bci nasypowej. Zysk liczony z transakcji miesi\u0105ca.")));
}
/* ─────────── Historia zysków (trend miesiąc do miesiąca) ─────────── */
function HistoriaZyskow({ tx, materials, kupTot, month }) {
    // Realny zysk z bieżącego miesiąca z transakcji
    const matSell = {};
    (materials || []).forEach(m => { matSell[m.id] = m.sell; });
    const txMonth = (tx || []).filter(x => fmtDateKey(x.ts).slice(0, 7) === month);
    const przychodBiez = txMonth.reduce((a, x) => a + (x.pos || []).reduce((b, p) => b + p.w * (matSell[p.matId] || p.price), 0), 0);
    const kosztBiez = txMonth.reduce((a, x) => a + txTotal(x), 0);
    const zyskBiez = przychodBiez - kosztBiez - (kupTot || 0);
    // Dane historyczne (edytowalne, zapis lokalny) — właściciel uzupełnia minione miesiące
    const [hist, setHist] = useState(() => {
        try {
            const s = localStorage.getItem("sk_history_v1");
            if (s)
                return JSON.parse(s);
        }
        catch { }
        // Przykładowe dane demonstracyjne — 6 minionych miesięcy
        return {
            "2026-01": { przychod: 42000, koszt: 33500, kup: 3100 },
            "2026-02": { przychod: 38000, koszt: 30200, kup: 2950 },
            "2026-03": { przychod: 51000, koszt: 40100, kup: 3300 },
            "2026-04": { przychod: 58000, koszt: 45200, kup: 3450 },
            "2026-05": { przychod: 54000, koszt: 42800, kup: 3200 },
        };
    });
    const save = (h) => { setHist(h); try {
        localStorage.setItem("sk_history_v1", JSON.stringify(h));
    }
    catch { } };
    const [edytuj, setEdytuj] = useState(false);
    const [edMonth, setEdMonth] = useState("");
    const [edP, setEdP] = useState("");
    const [edK, setEdK] = useState("");
    const [edKup, setEdKup] = useState("");
    // Połącz historię + bieżący miesiąc (bieżący nadpisuje, bo liczony z transakcji)
    const wszystkie = { ...hist };
    if (txMonth.length > 0)
        wszystkie[month] = { przychod: przychodBiez, koszt: kosztBiez, kup: kupTot || 0, biez: true };
    // Posortowane miesiące
    const miesiace = Object.keys(wszystkie).sort();
    const dane = miesiace.map(mk => {
        const d = wszystkie[mk];
        const zysk = d.przychod - d.koszt - (d.kup || 0);
        const marza = d.przychod > 0 ? (zysk / d.przychod * 100) : 0;
        return { mk, ...d, zysk, marza };
    });
    // Statystyki
    const zyski = dane.map(d => d.zysk);
    const sredniZysk = zyski.length ? zyski.reduce((a, z) => a + z, 0) / zyski.length : 0;
    const najlepszy = dane.length ? dane.reduce((a, b) => b.zysk > a.zysk ? b : a) : null;
    const najgorszy = dane.length ? dane.reduce((a, b) => b.zysk < a.zysk ? b : a) : null;
    const sumaRoczna = zyski.reduce((a, z) => a + z, 0);
    // Trend (ostatnie 2 miesiące)
    const trend = dane.length >= 2 ? dane[dane.length - 1].zysk - dane[dane.length - 2].zysk : 0;
    const trendPct = dane.length >= 2 && dane[dane.length - 2].zysk > 0 ? (trend / dane[dane.length - 2].zysk * 100) : 0;
    // Nazwy miesięcy
    const mcName = (mk) => { const [y, m] = mk.split("-"); const n = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"]; return n[parseInt(m) - 1]; };
    const mcFull = (mk) => { const [y, m] = mk.split("-"); const n = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"]; return `${n[parseInt(m) - 1]} ${y}`; };
    const fmt0 = v => Math.round(v).toLocaleString("pl-PL") + " zł";
    // Wykres słupkowy
    const maxZysk = Math.max(...dane.map(d => Math.abs(d.zysk)), 1);
    const ChartBars = () => (React.createElement("div", { style: { display: "flex", alignItems: "flex-end", gap: 6, height: 160, padding: "0 2px" } }, dane.map(d => {
        const h = Math.max(4, (Math.abs(d.zysk) / maxZysk) * 130);
        const isNeg = d.zysk < 0;
        return (React.createElement("div", { key: d.mk, style: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 } },
            React.createElement("div", { style: { fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, color: d.biez ? "var(--copper)" : "var(--muted)", whiteSpace: "nowrap" } },
                Math.round(d.zysk / 1000),
                "k"),
            React.createElement("div", { style: { width: "100%", maxWidth: 38, height: h, background: d.biez ? "linear-gradient(180deg,var(--copper),#a85829)" : isNeg ? "linear-gradient(180deg,#dc2626,#991b1b)" : "linear-gradient(180deg,var(--green),#0d7a37)", borderRadius: "6px 6px 0 0", position: "relative" } }, d.biez && React.createElement("div", { style: { position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 6, height: 6, borderRadius: 99, background: "var(--copper)" } })),
            React.createElement("div", { style: { fontSize: 10, color: d.biez ? "var(--copper)" : "var(--muted)", fontWeight: d.biez ? 700 : 500 } }, mcName(d.mk))));
    })));
    return (React.createElement("div", { style: { marginTop: 14 } },
        React.createElement("div", { style: { background: "linear-gradient(135deg,rgba(21,163,74,.1),rgba(21,163,74,.01))", border: "1px solid rgba(21,163,74,.3)", borderRadius: 18, padding: "18px 16px", marginBottom: 14 } },
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", fontWeight: 600 } },
                "Zysk \u0142\u0105cznie (",
                dane.length,
                " mies.)"),
            React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 900, fontSize: 30, marginTop: 4, color: "var(--green)" } }, fmt0(sumaRoczna)),
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)", fontSize: 12.5 } },
                React.createElement("span", { style: { color: "var(--muted)" } }, "\u015Arednio / miesi\u0105c:"),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700 } }, fmt0(sredniZysk)))),
        React.createElement(Card, null,
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } },
                React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, "Zysk miesi\u0119czny"),
                dane.length >= 2 && (React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: trend >= 0 ? "var(--green)" : "var(--red)" } },
                    trend >= 0 ? "▲" : "▼",
                    " ",
                    Math.abs(trendPct).toFixed(0),
                    "% m/m"))),
            React.createElement(ChartBars, null),
            React.createElement("div", { style: { display: "flex", gap: 14, marginTop: 14, justifyContent: "center", fontSize: 11, color: "var(--muted)" } },
                React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } },
                    React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: "var(--green)" } }),
                    "miniony"),
                React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 5 } },
                    React.createElement("span", { style: { width: 9, height: 9, borderRadius: 2, background: "var(--copper)" } }),
                    "bie\u017C\u0105cy (z transakcji)"))),
        najlepszy && najgorszy && (React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 } },
            React.createElement(Card, { pad: 13, style: { background: "rgba(21,163,74,.06)", border: "1px solid rgba(21,163,74,.2)" } },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "\uD83C\uDFC6 Najlepszy miesi\u0105c"),
                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginTop: 3 } }, mcFull(najlepszy.mk)),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 16, color: "var(--green)", marginTop: 2 } }, fmt0(najlepszy.zysk))),
            React.createElement(Card, { pad: 13, style: { background: "rgba(217,119,6,.06)", border: "1px solid rgba(217,119,6,.2)" } },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, "\uD83D\uDCC9 Najs\u0142abszy miesi\u0105c"),
                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginTop: 3 } }, mcFull(najgorszy.mk)),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 16, color: "var(--amber)", marginTop: 2 } }, fmt0(najgorszy.zysk))))),
        React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", null, "Szczeg\u00F3\u0142y miesi\u0119czne"),
            React.createElement("button", { onClick: () => { setEdytuj(!edytuj); setEdMonth(""); }, style: { padding: "5px 11px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--copper)", textTransform: "none", letterSpacing: 0 } }, edytuj ? "Gotowe" : "+ Dodaj miesiąc")),
        edytuj && (React.createElement(Card, { style: { marginBottom: 10, background: "var(--surface2)" } },
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 } }, "Uzupe\u0142nij miniony miesi\u0105c (bie\u017C\u0105cy liczy si\u0119 automatycznie z transakcji):"),
            React.createElement("label", { style: { fontSize: 11.5, color: "var(--muted)", fontWeight: 600, display: "block", marginBottom: 5 } }, "Miesi\u0105c"),
            React.createElement("input", { type: "month", value: edMonth, onChange: e => setEdMonth(e.target.value), style: { ...inputStyle, colorScheme: "light", fontFamily: "var(--mono)", fontWeight: 700, marginBottom: 10 } }),
            React.createElement("div", { style: { display: "flex", gap: 8 } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 4, display: "block" } }, "Przych\u00F3d"),
                    React.createElement("input", { type: "number", value: edP, onChange: e => setEdP(e.target.value), placeholder: "0", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface)", color: "var(--green)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 4, display: "block" } }, "Koszt skupu"),
                    React.createElement("input", { type: "number", value: edK, onChange: e => setEdK(e.target.value), placeholder: "0", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface)", color: "var(--copper)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: { fontSize: 10.5, color: "var(--muted)", marginBottom: 4, display: "block" } }, "KUP"),
                    React.createElement("input", { type: "number", value: edKup, onChange: e => setEdKup(e.target.value), placeholder: "0", style: { width: "100%", padding: "9px 10px", borderRadius: 9, border: "1px solid var(--line2)", background: "var(--surface)", color: "var(--red)", fontSize: 14, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } }))),
            React.createElement("button", { onClick: () => { if (!edMonth || !(parseFloat(edP) > 0))
                    return; save({ ...hist, [edMonth]: { przychod: parseFloat(edP) || 0, koszt: parseFloat(edK) || 0, kup: parseFloat(edKup) || 0 } }); setEdMonth(""); setEdP(""); setEdK(""); setEdKup(""); }, style: { ...btnCopper, marginTop: 12, fontSize: 13.5 } }, "Zapisz miesi\u0105c"))),
        React.createElement(Card, { pad: 4 }, dane.slice().reverse().map((d, i) => (React.createElement("div", { key: d.mk, style: { display: "flex", alignItems: "center", gap: 10, padding: "11px 10px", borderBottom: i < dane.length - 1 ? "1px solid var(--line)" : "none" } },
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 7 } },
                    mcFull(d.mk),
                    d.biez && React.createElement("span", { style: { fontSize: 9.5, fontWeight: 800, color: "var(--copper)", background: "rgba(200,116,63,.12)", padding: "1px 6px", borderRadius: 5 } }, "TERAZ")),
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)", marginTop: 2 } },
                    "przych\u00F3d ",
                    fmt0(d.przychod),
                    " \u00B7 mar\u017Ca ",
                    d.marza.toFixed(0),
                    "%")),
            React.createElement("div", { style: { textAlign: "right" } },
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15, color: d.zysk >= 0 ? "var(--green)" : "var(--red)" } }, fmt0(d.zysk)),
                React.createElement("div", { style: { fontSize: 10, color: "var(--faint)" } }, "zysk netto")),
            !d.biez && (React.createElement("button", { onClick: () => { const h = { ...hist }; delete h[d.mk]; save(h); }, style: { width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: "var(--faint)", cursor: "pointer", fontSize: 15, flexShrink: 0 } }, "\u00D7")))))),
        React.createElement("div", { style: sectionTitle }, "Sezonowo\u015B\u0107 bran\u017Cy z\u0142omowej"),
        React.createElement(Card, { style: { background: "rgba(63,125,138,.06)", border: "1px solid rgba(63,125,138,.2)" } },
            React.createElement("div", { style: { fontSize: 12.5, lineHeight: 1.7, color: "var(--muted)" } },
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83D\uDCC8 Wiosna (mar\u2013maj):"),
                " szczyt \u2014 porz\u0105dki, remonty, demonta\u017Ce. Najwi\u0119cej dostaw.",
                React.createElement("br", null),
                React.createElement("b", { style: { color: "var(--text)" } }, "\u2600\uFE0F Lato (cze\u2013sie):"),
                " stabilnie wysoko, du\u017Co prac budowlanych.",
                React.createElement("br", null),
                React.createElement("b", { style: { color: "var(--text)" } }, "\uD83C\uDF42 Jesie\u0144 (wrz\u2013lis):"),
                " drugi szczyt \u2014 porz\u0105dki przed zim\u0105.",
                React.createElement("br", null),
                React.createElement("b", { style: { color: "var(--text)" } }, "\u2744\uFE0F Zima (gru\u2013lut):"),
                " spadek \u2014 mr\u00F3z ogranicza zbi\u00F3rk\u0119. Czas na remonty sprz\u0119tu i planowanie.",
                React.createElement("br", null),
                React.createElement("br", null),
                React.createElement("span", { style: { color: "var(--text)" } }, "\uD83D\uDCA1 Wykorzystaj martwy sezon zimowy na inwestycje (jednorazowa amortyzacja!) i kampanie marketingowe przed wiosennym szczytem."))),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "Bie\u017C\u0105cy miesi\u0105c liczony z transakcji. Minione uzupe\u0142nij r\u0119cznie \u2014 dane zapisuj\u0105 si\u0119 lokalnie.")));
}
/* ─────────── Eksport PCC-4 (deklaracja zbiorcza) ─────────── */
function PCC4Export({ tx, company, month, setMonth }) {
    const [stawka] = useState(2); // PCC 2%
    const [prog] = useState(1000); // zwolnienie poniżej 1000 zł
    // Tylko FPO (zakup od osób fizycznych) w danym miesiącu
    const fpoMonth = (tx || []).filter(x => x.kind === "FPO" && fmtDateKey(x.ts).slice(0, 7) === month);
    // Tylko transakcje > 1000 zł podlegają PCC (poniżej = zwolnienie ustawowe)
    const podlegajace = fpoMonth.map(x => ({ ...x, wartosc: txTotal(x) })).filter(x => x.wartosc > prog).sort((a, b) => a.ts - b.ts);
    const zwolnione = fpoMonth.filter(x => txTotal(x) <= prog);
    const podstawa = podlegajace.reduce((a, x) => a + x.wartosc, 0);
    const podatek = podstawa * (stawka / 100);
    // Warunek PCC-4: min 3 czynności, ostatnia z pierwszych 3 w ciągu 14 dni od pierwszej
    const moznaPCC4 = (() => {
        if (podlegajace.length < 3)
            return { ok: false, powod: `Tylko ${podlegajace.length} transakcji > ${prog} zł. PCC-4 wymaga minimum 3.` };
        const pierwsza = podlegajace[0].ts;
        const trzecia = podlegajace[2].ts;
        const dni = Math.floor((trzecia - pierwsza) / 86400000);
        if (dni > 14)
            return { ok: false, powod: `Między 1. a 3. transakcją minęło ${dni} dni (limit 14). Złóż PCC-3 osobno.` };
        return { ok: true, powod: `${podlegajace.length} transakcji, 3. czynność ${dni} dni po pierwszej — warunki spełnione.` };
    })();
    const mcLabel = (() => { const [y, m] = month.split("-"); const names = ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"]; return `${names[parseInt(m) - 1]} ${y}`; })();
    const termin = (() => { const [y, m] = month.split("-").map(Number); const next = m === 12 ? `${y + 1}-01-07` : `${y}-${pad(m + 1)}-07`; return next; })();
    // Generowanie pliku tekstowego PCC-4
    const buildPCC4 = () => {
        let t = "";
        t += "═══════════════════════════════════════════════════════\n";
        t += "  DEKLARACJA PCC-4 — ZBIORCZA (do przepisania do e-Deklaracji)\n";
        t += "  Podatek od czynności cywilnoprawnych\n";
        t += "═══════════════════════════════════════════════════════\n\n";
        t += "PODATNIK (nabywca):\n";
        t += "  Nazwa:  " + (company?.name || "—") + "\n";
        t += "  NIP:    " + (company?.nip || "—") + "\n";
        t += "  Adres:  " + (company?.addr || "—") + "\n\n";
        t += "OKRES: " + mcLabel + "\n";
        t += "TERMIN ZŁOŻENIA I ZAPŁATY: do " + termin + "\n\n";
        t += "───────────────────────────────────────────────────────\n";
        t += "WYKAZ CZYNNOŚCI (umowy sprzedaży > " + prog + " zł):\n";
        t += "───────────────────────────────────────────────────────\n";
        podlegajace.forEach((x, i) => {
            const d = new Date(x.ts);
            t += "\n" + (i + 1) + ". " + x.osoba.imie + " " + x.osoba.nazwisko + "\n";
            t += "   Data umowy:  " + fmtDateKey(x.ts) + "\n";
            t += "   Adres zbyw.: " + (x.osoba.adres || "—") + "\n";
            t += "   Dok. tożsam.: " + (x.osoba.dowod || "—") + "\n";
            t += "   Dokument:    " + x.no + "\n";
            t += "   Wartość:     " + x.wartosc.toFixed(2) + " zł\n";
            t += "   PCC 2%:      " + (x.wartosc * 0.02).toFixed(2) + " zł\n";
        });
        t += "\n───────────────────────────────────────────────────────\n";
        t += "PODSUMOWANIE:\n";
        t += "  Liczba czynności:      " + podlegajace.length + "\n";
        t += "  Podstawa opodatkow.:   " + podstawa.toFixed(2) + " zł\n";
        t += "  Stawka:                " + stawka + "%\n";
        t += "  PODATEK DO ZAPŁATY:    " + podatek.toFixed(2) + " zł\n";
        t += "───────────────────────────────────────────────────────\n\n";
        if (zwolnione.length) {
            t += "TRANSAKCJE ZWOLNIONE (≤ " + prog + " zł, nie wchodzą do PCC):\n";
            zwolnione.forEach(x => { t += "  · " + x.osoba.imie + " " + x.osoba.nazwisko + " — " + txTotal(x).toFixed(2) + " zł (" + x.no + ")\n"; });
            t += "\n";
        }
        t += "Wygenerowano: " + new Date().toLocaleString("pl-PL") + "\n";
        t += "UWAGA: Dokument pomocniczy. Dane przepisz do formularza\n";
        t += "PCC-4 w systemie e-Deklaracje (podatki.gov.pl) lub przekaż\n";
        t += "księgowemu. Zweryfikuj poprawność przed wysłaniem.\n";
        return t;
    };
    // Generowanie CSV dla księgowego / importu
    const buildCSV = () => {
        let c = "Lp;Data;Imie;Nazwisko;Adres;Dokument tozsamosci;Nr dokumentu;Wartosc zl;PCC 2% zl\n";
        podlegajace.forEach((x, i) => {
            c += [i + 1, fmtDateKey(x.ts), x.osoba.imie, x.osoba.nazwisko, (x.osoba.adres || "").replace(/;/g, ","), x.osoba.dowod || "", x.no, x.wartosc.toFixed(2), (x.wartosc * 0.02).toFixed(2)].join(";") + "\n";
        });
        c += ";;;;;;;RAZEM:;" + podatek.toFixed(2) + "\n";
        return c;
    };
    const fmt = v => v.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
    return (React.createElement("div", { style: { marginTop: 14 } },
        React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 14 } },
            React.createElement("label", { style: { fontSize: 12.5, color: "var(--muted)", fontWeight: 600 } }, "Miesi\u0105c:"),
            React.createElement("input", { type: "month", value: month, onChange: e => setMonth(e.target.value), style: { ...inputStyle, flex: 1, colorScheme: "light", fontFamily: "var(--mono)", fontWeight: 700 } })),
        React.createElement("div", { style: { background: "linear-gradient(135deg,rgba(200,116,63,.12),rgba(200,116,63,.02))", border: "1px solid rgba(200,116,63,.3)", borderRadius: 18, padding: "18px 16px", marginBottom: 14 } },
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", fontWeight: 600 } },
                "PCC do zap\u0142aty za ",
                mcLabel),
            React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 900, fontSize: 30, marginTop: 4, color: "var(--copper)" } }, fmt(podatek)),
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 6, display: "flex", justifyContent: "space-between" } },
                React.createElement("span", null,
                    podlegajace.length,
                    " czynno\u015Bci \u00B7 podstawa ",
                    fmt(podstawa))),
            React.createElement("div", { style: { marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" } },
                React.createElement("span", { style: { fontSize: 12.5, color: "var(--muted)" } }, "Termin: do"),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 14, color: "var(--text)" } }, termin))),
        React.createElement(Card, { style: { background: moznaPCC4.ok ? "rgba(21,163,74,.08)" : "rgba(217,119,6,.08)", border: `1px solid ${moznaPCC4.ok ? "rgba(21,163,74,.3)" : "rgba(217,119,6,.3)"}` } },
            React.createElement("div", { style: { display: "flex", alignItems: "flex-start", gap: 10 } },
                React.createElement("span", { style: { fontSize: 22 } }, moznaPCC4.ok ? "✅" : "⚠️"),
                React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14, color: moznaPCC4.ok ? "var(--green)" : "var(--amber)" } }, moznaPCC4.ok ? "Możesz złożyć PCC-4 zbiorczo" : "PCC-4 niedostępne w tym miesiącu"),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 } }, moznaPCC4.powod)))),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 } },
            React.createElement("button", { onClick: () => downloadText("PCC-4_" + month + ".txt", buildPCC4()), disabled: !podlegajace.length, style: { ...btnCopper, opacity: podlegajace.length ? 1 : .5, cursor: podlegajace.length ? "pointer" : "not-allowed", fontSize: 13.5 } },
                React.createElement(FileText, { size: 16 }),
                " Eksport TXT"),
            React.createElement("button", { onClick: () => downloadText("PCC-4_" + month + ".csv", buildCSV()), disabled: !podlegajace.length, style: { ...btnGhost, opacity: podlegajace.length ? 1 : .5, cursor: podlegajace.length ? "pointer" : "not-allowed", borderColor: "var(--copper)", color: "var(--copper)" } }, "\uD83D\uDCCA Eksport CSV")),
        React.createElement("div", { style: sectionTitle },
            "Czynno\u015Bci podlegaj\u0105ce PCC (",
            podlegajace.length,
            ")"),
        podlegajace.length === 0 ? (React.createElement(Card, null,
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "10px 0", lineHeight: 1.5 } },
                "Brak transakcji powy\u017Cej ",
                prog,
                " z\u0142 od os\u00F3b fizycznych w tym miesi\u0105cu."))) : podlegajace.map((x, i) => (React.createElement(Card, { key: x.id, pad: 13, style: { marginBottom: 8 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 7 } },
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--copper)", background: "rgba(200,116,63,.12)", padding: "2px 7px", borderRadius: 6 } },
                            "#",
                            i + 1),
                        React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } },
                            x.osoba.imie,
                            " ",
                            x.osoba.nazwisko)),
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.5 } }, x.osoba.adres),
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 1 } },
                        fmtDateKey(x.ts),
                        " \u00B7 ",
                        x.no,
                        " \u00B7 dow. ",
                        x.osoba.dowod)),
                React.createElement("div", { style: { textAlign: "right", flexShrink: 0, marginLeft: 8 } },
                    React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 15 } }, fmt(x.wartosc)),
                    React.createElement("div", { style: { fontSize: 11.5, color: "var(--copper)", fontWeight: 700, marginTop: 2 } },
                        "PCC: ",
                        (x.wartosc * 0.02).toFixed(2),
                        " z\u0142")))))),
        zwolnione.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement("div", { style: sectionTitle },
                "Zwolnione z PCC (\u2264 ",
                prog,
                " z\u0142) \u2014 ",
                zwolnione.length),
            React.createElement(Card, { pad: 4 }, zwolnione.map((x, i) => (React.createElement("div", { key: x.id, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: i < zwolnione.length - 1 ? "1px solid var(--line)" : "none" } },
                React.createElement("div", null,
                    React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } },
                        x.osoba.imie,
                        " ",
                        x.osoba.nazwisko),
                    React.createElement("div", { style: { fontSize: 11, color: "var(--faint)" } }, x.no)),
                React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" } }, fmt(txTotal(x))))))))),
        React.createElement(Card, { style: { marginTop: 14, background: "var(--surface2)" } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "\uD83D\uDCCB Zasady PCC-4 dla skupu"),
            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", lineHeight: 1.6 } },
                "\u2022 PCC ",
                React.createElement("b", { style: { color: "var(--text)" } }, "2%"),
                " p\u0142aci ",
                React.createElement("b", { style: { color: "var(--text)" } }, "nabywca"),
                " (skup) od zakupu od os\u00F3b fizycznych.",
                React.createElement("br", null),
                "\u2022 Transakcje ",
                React.createElement("b", { style: { color: "var(--text)" } }, "do 1000 z\u0142 s\u0105 zwolnione"),
                " ustawowo.",
                React.createElement("br", null),
                "\u2022 Zakup od ",
                React.createElement("b", { style: { color: "var(--text)" } }, "firm (VAT) \u2014 zwolniony"),
                " niezale\u017Cnie od kwoty (nie wchodzi tu).",
                React.createElement("br", null),
                "\u2022 PCC-4 zbiorczo: ",
                React.createElement("b", { style: { color: "var(--text)" } }, "min. 3 czynno\u015Bci"),
                ", 3. w ci\u0105gu 14 dni od 1.",
                React.createElement("br", null),
                "\u2022 Termin: ",
                React.createElement("b", { style: { color: "var(--text)" } }, "do 7 dnia"),
                " nast\u0119pnego miesi\u0105ca.",
                React.createElement("br", null),
                "\u2022 Formularz w ",
                React.createElement("b", { style: { color: "var(--text)" } }, "e-Deklaracje"),
                " (podatki.gov.pl).")),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "Dokument pomocniczy \u2014 zweryfikuj z ksi\u0119gowym przed wys\u0142aniem do US.")));
}
/* ─────────── Księgowość ─────────── */
function Ksiegowosc({ tx, materials, stock, company }) {
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [activeTab, setActiveTab] = useState("rozliczenie");
    const [kupItems, setKupItems] = useState(() => { try {
        const s = localStorage.getItem("sk_kup_v1");
        return s ? JSON.parse(s) : [];
    }
    catch {
        return [];
    } });
    const [kupOpen, setKupOpen] = useState(false);
    const [kupEdit, setKupEdit] = useState(null);
    const saveKup = (items) => { setKupItems(items); try {
        localStorage.setItem("sk_kup_v1", JSON.stringify(items));
    }
    catch { } };
    const inM = (tx || []).filter((x) => fmtDateKey(x.ts).slice(0, 7) === month);
    const tot = inM.reduce((a, x) => a + txTotal(x), 0);
    const pay = (k) => inM.filter((x) => x.payment === k).reduce((a, x) => a + txTotal(x), 0);
    const fpo = inM.filter((x) => x.kind === "FPO");
    const kpo = inM.filter((x) => x.kind === "KPO");
    const fpoTot = fpo.reduce((a, x) => a + txTotal(x), 0);
    const pcc = fpoTot * 0.02;
    const magVal = materials.reduce((a, m) => a + (stock[m.id] || 0) * m.buy, 0);
    const mass = inM.reduce((a, x) => a + txMass(x), 0);
    const kupMonth = kupItems.filter(k => (k.date || "").slice(0, 7) === month);
    const kupTot = kupMonth.reduce((a, k) => a + (parseFloat(k.netto) || 0), 0);
    const dochod = tot - kupTot;
    const KUP_CATS = ["Paliwo / transport", "Najem placu / hali", "Media (prąd, woda, gaz)", "Telefon / internet", "Pracownicy (wynagrodzenia)", "ZUS własny", "Obsługa księgowa", "Leasing samochodu", "Waga / sprzęt (amortyzacja)", "Materiały biurowe", "Opłaty BDO", "PCC zapłacone", "Inne koszty firmowe"];
    const buildStatement = () => {
        let t = "ZESTAWIENIE KSIEGOWE — " + month + "\n" + (company?.name || "(punkt skupu)") + "\n";
        t += "=".repeat(42) + "\n\n";
        t += "PRZYCHODY:\n";
        t += "  Liczba transakcji: " + inM.length + "  (FPO " + fpo.length + ", KPO " + kpo.length + ")\n";
        t += "  Masa skupiona:     " + (Math.round(mass * 10) / 10) + " kg\n";
        t += "  Wartość skupu:     " + tot.toFixed(2) + " zl\n";
        t += "    gotowka:         " + pay("gotowka").toFixed(2) + " zl\n";
        t += "    przelew:         " + pay("przelew").toFixed(2) + " zl\n";
        t += "    BLIK:            " + pay("blik").toFixed(2) + " zl\n\n";
        t += "KOSZTY UZYSKANIA PRZYCHODU (KUP):\n";
        kupMonth.forEach(k => { t += "  " + (k.cat || "Inne").padEnd(28) + k.netto?.toFixed(2) + " zl\n"; });
        t += "  RAZEM KUP:         " + kupTot.toFixed(2) + " zl\n\n";
        t += "DOCHÓD (przed podatkiem): " + dochod.toFixed(2) + " zl\n\n";
        t += "PODATKI:\n";
        t += "  PCC 2% (od FPO):   " + pcc.toFixed(2) + " zl\n";
        t += "  FPO wartość:       " + fpoTot.toFixed(2) + " zl\n\n";
        t += "MAGAZYN:\n";
        t += "  Wartość (ceny skup): " + magVal.toFixed(2) + " zl\n\n";
        t += "Wygenerowano: " + new Date().toLocaleString("pl-PL") + "\n";
        t += "UWAGA: Zestawienie pomocnicze. Weryfikuj z ksiegowym.\n";
        return t;
    };
    const CHECKLIST = [
        { id: "pcc", label: "PCC-4 złożony (do 7 dnia nast. miesiąca)", help: "Deklaracja zbiorcza PCC za wszystkie transakcje FPO w miesiącu. Stawka 2% od wartości FPO." },
        { id: "jpk", label: "JPK_V7 wysłany (do 25 dnia nast. miesiąca)", help: "Plik JPK z ewidencją VAT — wysyłasz online przez e-Deklaracje lub program księgowy." },
        { id: "kpir", label: "KPiR uzupełniona na bieżąco", help: "Każda transakcja zakupu złomu i kosztu musi być wpisana do Książki Przychodów i Rozchodów." },
        { id: "pit", label: "Zaliczka PIT zapłacona (do 20 dnia)", help: "Miesięczna lub kwartalna zaliczka na podatek dochodowy. Kalkulator: dochód × stawka (12%/19%)." },
        { id: "zus", label: "ZUS zapłacony (do 15 lub 20 dnia)", help: "ZUS społeczny (do 10 dnia), ZUS zdrowotny (do 20 dnia) — dla JDG. Preferencyjne przez 24 mies. dla nowych." },
        { id: "bdo", label: "Ewidencja BDO/KEO zaktualizowana", help: "Każdy skup odpadów musi być wpisany do rejestru BDO (Baza Danych Odpadowych). Raport roczny do końca lutego." },
        { id: "ksef", label: "Faktury sprzedaży w KSeF (od 2026)", help: "Od 2026 obowiązkowy Krajowy System e-Faktur dla VAT-owców. Faktury wystawiasz elektronicznie." },
        { id: "fpo", label: "FPO/KPO skompletowane i podpisane", help: "Formularz Potwierdzenia Obrotu (dla os. fiz.) i Karta Przekazania Odpadów (dla firm) — dokumentacja każdej transakcji." },
    ];
    const [checked, setChecked] = useState(() => { try {
        const s = localStorage.getItem("sk_chk_" + month);
        return s ? JSON.parse(s) : {};
    }
    catch {
        return {};
    } });
    const toggleCheck = (id) => {
        const n = { ...checked, [id]: !checked[id] };
        setChecked(n);
        try {
            localStorage.setItem("sk_chk_" + month, JSON.stringify(n));
        }
        catch { }
    };
    const OPTYMALIZACJE = [
        { t: "PCC-4 zamiast PCC-3", sav: "⭐⭐⭐⭐⭐", desc: "Zamiast składać PCC-3 po każdej transakcji (14 dni), złóż JEDNĄ deklarację PCC-4 do 7 dnia następnego miesiąca. Ten sam efekt, 100× mniej papierkowej roboty. To Twój największy time-saver.", tag: "Obowiązki" },
        { t: "Samochód ciężarowy / VAN (N1)", sav: "⭐⭐⭐⭐", desc: "Jeśli pojazd ma homologację N1 (ciężarowy do 3,5t, 2 miejsca) → 100% VAT odliczasz i 100% kosztów (paliwo, ubezpieczenie, naprawy) wpisujesz w KUP. Brak limitu 150 tys. zł i brak proporcji 75/100.", tag: "Pojazd" },
        { t: "Leasing operacyjny zamiast zakupu", sav: "⭐⭐⭐⭐", desc: "Każda rata leasingu operacyjnego = 100% koszt (dla N1). Dla samochodu osobowego rata w 100% jako koszt (bez limitu amortyzacji). Dodatkowo: nie mrożysz gotówki, masz nowy sprzęt co 2-3 lata.", tag: "Pojazd" },
        { t: "Jednorazowa amortyzacja (waga, sprzęt)", sav: "⭐⭐⭐", desc: "Środki trwałe do 50 000 EUR rocznie możesz zamortyzować jednorazowo (nie przez 5 lat). Waga przemysłowa, wózek widłowy, kontener — zapisujesz CAŁY koszt w roku zakupu, obniżasz podatek od razu.", tag: "Majątek" },
        { t: "Mały podatnik = kwartalny VAT", sav: "⭐⭐⭐", desc: "Jeśli obrót < 9,218 mln PLN → jesteś małym podatnikiem i możesz płacić VAT kwartalnie + stosować metodę kasową (VAT płacisz dopiero gdy dostaniesz zapłatę). Lepszy cash flow.", tag: "VAT" },
        { t: "Odliczenie PCC jako KUP", sav: "⭐⭐⭐", desc: "Zapłacone PCC (2% od FPO) jest Twoim kosztem uzyskania przychodu — wpisujesz je do KPiR jako koszt. Wiele skupów o tym nie wie i przepłaca podatek dochodowy.", tag: "PIT" },
        { t: "ZUS preferencyjny (nowy przedsiębiorca)", sav: "⭐⭐⭐⭐", desc: "Przez pierwsze 6 miesięcy: ulga na start (0 zł ZUS społeczny). Kolejne 24 miesiące: mały ZUS (~400 zł/mc zamiast ~1800 zł). Łącznie oszczędność 30-40 tys. zł. Tylko dla nowych firm.", tag: "ZUS" },
        { t: "Małe ZUS (mały ZUS plus)", sav: "⭐⭐⭐", desc: "Po 2 latach preferencji: Mały ZUS Plus = podstawa wymiaru od przychodu. Dla przychodów < 120 tys. zł/rok składki znacznie niższe niż pełny ZUS. Zgłoś do ZUS do 31 stycznia.", tag: "ZUS" },
        { t: "Podatek liniowy (19%) zamiast skali", sav: "⭐⭐⭐", desc: "Przy dochodzie powyżej ~120 tys. zł/rok podatek liniowy 19% = niższy niż 32% skali podatkowej. Plus: tylko jedna stawka, przewidywalne koszty. Wniosek do 20 dnia kolejnego roku.", tag: "PIT" },
        { t: "Sp. z o.o. + Estoński CIT", sav: "⭐⭐⭐⭐", desc: "Przy dochodzie > 300-400 tys. zł/rok: spółka z o.o. płaci CIT 9% (mały podatnik). Estoński CIT = 0% dopóki zysk zostaje w firmie, 10% gdy wypłacasz. Najlepsza opcja do reinwestowania w sprzęt.", tag: "Spółka" },
        { t: "Faktura za oprogramowanie (ZŁOM-MET)", sav: "⭐⭐", desc: "Abonament za system do zarządzania skupem = 100% koszt firmowy (KUP). Wpisz w KPiR jako usługi informatyczne. Obniżasz dochód do opodatkowania.", tag: "Oprogramowanie" },
    ];
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24 } },
            React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Ksi\u0119gowo\u015B\u0107"),
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } }, "Zestawienia \u00B7 Podatki \u00B7 Optymalizacja")),
        React.createElement("div", { style: { display: "flex", gap: 5, marginTop: 14, overflowX: "auto", paddingBottom: 2 } }, [["rozliczenie", "📊 Rozliczenie"], ["zysk", "💵 Kalkulator zysku"], ["rentownosc", "🎯 Rentowność"], ["historia", "📈 Historia zysków"], ["pcc4", "🧾 PCC-4"], ["checklist", "✅ Obowiązki"], ["kup", "📋 Koszty KUP"], ["optym", "💡 Optymalizacja"]].map(([id, lbl]) => (React.createElement("button", { key: id, onClick: () => setActiveTab(id), style: { flexShrink: 0, padding: "8px 13px", borderRadius: 11, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: activeTab === id ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: activeTab === id ? "rgba(200,116,63,.1)" : "var(--surface)", color: activeTab === id ? "var(--copper)" : "var(--muted)" } }, lbl)))),
        activeTab === "rozliczenie" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 12 } },
                React.createElement("label", { style: { fontSize: 12.5, color: "var(--muted)", fontWeight: 600 } }, "Miesi\u0105c:"),
                React.createElement("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value), style: { ...inputStyle, flex: 1, colorScheme: "light", fontFamily: "var(--mono)", fontWeight: 700 } })),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 } }, [["Przychód (skup)", pln(tot), null], ["Masa skupiona", kg(mass), null], ["Koszty KUP", pln(kupTot), "var(--red)"], ["Dochód szacunkowy", pln(dochod), dochod >= 0 ? "var(--green)" : "var(--red)"]].map(([l, v, col]) => (React.createElement(Card, { key: l, pad: 13 },
                React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)" } }, l),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 19, marginTop: 4, color: col || "var(--text)" } }, v))))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 12 } }, [["Dokumenty", inM.length + " szt."], ["FPO/KPO", fpo.length + "/" + kpo.length], ["Wartość mag.", pln(magVal)]].map(([l, v]) => (React.createElement(Card, { key: l, pad: 11 },
                React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } }, l),
                React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15, marginTop: 3 } }, v))))),
            React.createElement(Card, { style: { background: "linear-gradient(135deg,rgba(200,116,63,.08),rgba(200,116,63,.01))", border: "1px solid rgba(200,116,63,.25)" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 } }, "PCC 2% do zap\u0142aty"),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 } }, "Od FPO (zakup od os. fiz.) \u2014 p\u0142acisz Ty jako nabywca")),
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 20, color: "var(--copper)" } }, pln(pcc))),
                React.createElement("div", { style: { marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between" } },
                    React.createElement("span", { style: { fontSize: 12.5 } }, "Termin: do 7 dnia nast. miesi\u0105ca"),
                    React.createElement("span", { style: { fontSize: 12, color: "var(--muted)" } }, "PCC-4 (zbiorcza)"))),
            React.createElement(Card, { style: { marginTop: 10 } },
                React.createElement("div", { style: { fontSize: 13, fontWeight: 700, marginBottom: 8 } }, "Formy p\u0142atno\u015Bci"),
                [["Gotówka", pay("gotowka")], ["Przelew", pay("przelew")], ["BLIK", pay("blik")]].map(([l, v], i) => (React.createElement("div", { key: l, style: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" } },
                    React.createElement("span", { style: { fontWeight: 600, fontSize: 13.5 } }, l),
                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700 } }, pln(v)))))),
            React.createElement("button", { onClick: () => downloadText("zestawienie_" + month + ".txt", buildStatement()), style: { ...btnCopper, marginTop: 14 } },
                React.createElement(FileText, { size: 18 }),
                " Pobierz zestawienie (.txt)"),
            React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 8, lineHeight: 1.5, textAlign: "center" } }, "Warto\u015Bci pomocnicze \u2014 nie zast\u0119puj\u0105 profesjonalnej ksi\u0119gowo\u015Bci."))),
        activeTab === "zysk" && React.createElement(KalkulatorZysku, { materials: materials, stock: stock, tx: tx, kupMonth: kupMonth, kupTot: kupTot, month: month }),
        activeTab === "pcc4" && React.createElement(PCC4Export, { tx: tx, company: company, month: month, setMonth: setMonth }),
        activeTab === "historia" && React.createElement(HistoriaZyskow, { tx: tx, materials: materials, kupTot: kupTot, month: month }),
        activeTab === "rentownosc" && React.createElement(RentownoscMaterialow, { tx: tx, materials: materials, stock: stock, month: month }),
        activeTab === "checklist" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", marginBottom: 12 } },
                React.createElement("label", { style: { fontSize: 12.5, color: "var(--muted)", fontWeight: 600 } }, "Miesi\u0105c:"),
                React.createElement("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value), style: { ...inputStyle, flex: 1, colorScheme: "light", fontFamily: "var(--mono)", fontWeight: 700 } })),
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 } },
                React.createElement("div", { style: { flex: 1, height: 6, background: "var(--surface2)", borderRadius: 9, overflow: "hidden" } },
                    React.createElement("div", { style: { height: "100%", width: (Object.values(checked).filter(Boolean).length / CHECKLIST.length * 100) + "%", background: "linear-gradient(90deg,var(--green),#10b981)", borderRadius: 9 } })),
                React.createElement("span", { style: { fontSize: 12, fontWeight: 700, color: "var(--green)" } },
                    Object.values(checked).filter(Boolean).length,
                    "/",
                    CHECKLIST.length)),
            CHECKLIST.map((item, i) => (React.createElement("button", { key: item.id, onClick: () => toggleCheck(item.id), style: { width: "100%", display: "flex", alignItems: "flex-start", gap: 12, background: checked[item.id] ? "rgba(21,163,74,.05)" : "var(--surface)", border: `1px solid ${checked[item.id] ? "rgba(21,163,74,.3)" : "var(--line)"}`, borderRadius: 12, padding: "13px 14px", marginBottom: 8, cursor: "pointer", color: "var(--text)", textAlign: "left" } },
                React.createElement("span", { style: { width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1, border: checked[item.id] ? "none" : "2px solid var(--copper)", background: checked[item.id] ? "var(--green)" : "transparent", display: "grid", placeItems: "center", color: "#04130a", fontSize: 13, fontWeight: 800 } }, checked[item.id] ? "✓" : ""),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700, textDecoration: checked[item.id] ? "line-through" : "none", opacity: checked[item.id] ? .6 : 1 } }, item.label),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 3, lineHeight: 1.45 } }, item.help))))),
            React.createElement("div", { style: { marginTop: 10, padding: "12px 14px", background: "rgba(200,116,63,.07)", borderRadius: 13, border: "1px solid rgba(200,116,63,.2)" } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 6 } }, "\uD83D\uDCCB Co musi by\u0107 rozliczone ka\u017Cdego miesi\u0105ca"),
                [["1-7", "PCC-4 złożony za poprzedni miesiąc"], ["do 15", "ZUS społeczny zapłacony"], ["do 20", "ZUS zdrowotny + zaliczka PIT"], ["do 25", "JPK_V7 wysłany + VAT zapłacony"], ["cały miesiąc", "KPiR uzupełniana na bieżąco, FPO/KPO skompletowane"]].map(([k, v]) => (React.createElement("div", { key: k, style: { display: "flex", gap: 10, padding: "6px 0", borderTop: "1px solid var(--line)" } },
                    React.createElement("span", { style: { fontWeight: 800, fontSize: 11, color: "var(--copper)", minWidth: 70, flexShrink: 0 } },
                        "Do ",
                        k),
                    React.createElement("span", { style: { fontSize: 12.5, color: "var(--muted)" } }, v))))))),
        activeTab === "kup" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } },
                React.createElement("div", null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } },
                        "Koszty KUP \u2014 ",
                        month),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)" } },
                        "\u0141\u0105cznie: ",
                        pln(kupTot))),
                React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } },
                    React.createElement("input", { type: "month", value: month, onChange: (e) => setMonth(e.target.value), style: { ...inputStyle, width: 130, colorScheme: "light", fontFamily: "var(--mono)", fontWeight: 700, padding: "8px 10px" } }),
                    React.createElement("button", { onClick: () => { setKupEdit({ id: null, cat: KUP_CATS[0], date: todayStr(), netto: "", vat: "0", desc: "" }); setKupOpen(true); }, style: { ...btnCopper, width: "auto", padding: "9px 14px", fontSize: 13 } }, "+ Dodaj"))),
            kupMonth.length === 0 ? React.createElement(Card, null,
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "10px 0" } }, "Brak koszt\u00F3w w tym miesi\u0105cu. Dodaj \u2191")) :
                kupMonth.map((k, i) => (React.createElement(Card, { key: k.id || i, pad: 12, style: { marginBottom: 8, cursor: "pointer" }, onClick: () => { setKupEdit(k); setKupOpen(true); } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                        React.createElement("div", null,
                            React.createElement("div", { style: { fontSize: 13.5, fontWeight: 700 } }, k.cat),
                            React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 } },
                                k.date,
                                k.desc ? " · " + k.desc : "")),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 16, color: "var(--red)" } },
                            "\u2212",
                            pln(parseFloat(k.netto) || 0)))))),
            React.createElement("div", { style: { marginTop: 14, padding: "12px 14px", background: "rgba(200,116,63,.07)", borderRadius: 13, border: "1px solid rgba(200,116,63,.2)" } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 13, marginBottom: 8 } }, "\uD83D\uDCCB Co mo\u017Cna wliczy\u0107 w KUP (koszty uzysk. przychodu)"),
                [["✅", "Zakup złomu/metali", "Cena zakupu surowca — główny koszt"], ["✅", "Paliwo / transport", "Rachunki za paliwo, autostrady (50-100% zal. od pojazdu)"], ["✅", "Najem placu / hali", "Czynsz za teren skupu, magazyn"], ["✅", "ZUS społeczny własny", "Składki ZUS (nie zdrowotna od 2022)"], ["✅", "Leasing samochodu", "Raty leasingu: 100% dla N1, ograniczone dla osobowego"], ["✅", "Waga / sprzęt", "Amortyzacja lub jednorazowa (do 50 tys. EUR/rok)"], ["✅", "PCC zapłacone", "2% PCC od FPO = koszt podatkowy! Wiele skupów nie wie"], ["✅", "Księgowość / ZŁOM-MET", "Opłaty za programy i usługi ksiegowe = 100% KUP"], ["✅", "Telefon / internet", "Część służbowa (50-100%)"], ["❌", "Kary i mandaty", "Nigdy nie są kosztem"], ["❌", "Wydatki prywatne", "Zakupy niezwiązane z działalnością"],].map(([ic, k, v]) => (React.createElement("div", { key: k, style: { display: "flex", gap: 10, padding: "6px 0", borderTop: "1px solid var(--line)" } },
                    React.createElement("span", { style: { fontSize: 14, flexShrink: 0, width: 20 } }, ic),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 12.5 } }, k),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--muted)" } }, v)))))),
            React.createElement(Sheet, { open: kupOpen, onClose: () => setKupOpen(false), title: kupEdit?.id ? "Edytuj koszt" : "Nowy koszt KUP" }, kupEdit && (React.createElement(React.Fragment, null,
                React.createElement("label", { style: label }, "Kategoria"),
                React.createElement("select", { value: kupEdit.cat, onChange: e => setKupEdit({ ...kupEdit, cat: e.target.value }), style: { ...inputStyle, fontWeight: 600 } }, KUP_CATS.map(c => React.createElement("option", { key: c, value: c }, c))),
                React.createElement("label", { style: label }, "Data"),
                React.createElement("input", { type: "date", style: { ...inputStyle, colorScheme: "light" }, value: kupEdit.date, onChange: e => setKupEdit({ ...kupEdit, date: e.target.value }) }),
                React.createElement("label", { style: label }, "Kwota netto (z\u0142)"),
                React.createElement("input", { type: "number", step: "0.01", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 20 }, value: kupEdit.netto, onChange: e => setKupEdit({ ...kupEdit, netto: e.target.value }), placeholder: "0.00" }),
                React.createElement("label", { style: label }, "VAT (%)"),
                React.createElement("div", { style: { display: "flex", gap: 7 } }, [["0", "0%"], ["8", "8%"], ["23", "23%"]].map(([v, l]) => React.createElement("button", { key: v, onClick: () => setKupEdit({ ...kupEdit, vat: v }), style: { flex: 1, padding: "9px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 700, border: kupEdit.vat === v ? "1.5px solid var(--copper)" : "1px solid var(--line2)", background: kupEdit.vat === v ? "rgba(200,116,63,.1)" : "var(--surface)", color: kupEdit.vat === v ? "var(--copper)" : "var(--muted)" } }, l))),
                React.createElement("label", { style: label }, "Opis (opcjonalnie)"),
                React.createElement("input", { style: inputStyle, value: kupEdit.desc, onChange: e => setKupEdit({ ...kupEdit, desc: e.target.value }), placeholder: "np. Faktura BP 2025-06-10" }),
                React.createElement("button", { style: { ...btnCopper, marginTop: 14 }, onClick: () => {
                        if (!(parseFloat(kupEdit.netto) > 0))
                            return;
                        const item = { ...kupEdit, id: kupEdit.id || uid() };
                        if (kupEdit.id)
                            saveKup(kupItems.map(k => k.id === kupEdit.id ? item : k));
                        else
                            saveKup([...kupItems, item]);
                        setKupOpen(false);
                    } }, "Zapisz koszt"),
                kupEdit.id && React.createElement("button", { style: { ...btnGhost, marginTop: 8, color: "var(--red)", borderColor: "rgba(220,38,38,.3)" }, onClick: () => { saveKup(kupItems.filter(k => k.id !== kupEdit.id)); setKupOpen(false); } }, "Usu\u0144")))))),
        activeTab === "optym" && (React.createElement("div", { style: { marginTop: 14 } },
            React.createElement(Card, { style: { background: "rgba(200,116,63,.08)", border: "1px solid rgba(200,116,63,.3)", marginBottom: 14 } },
                React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6 } },
                    "Poni\u017Csze metody s\u0105 ",
                    React.createElement("b", null, "w 100% legalne"),
                    ". To nie jest unikanie podatk\u00F3w \u2014 to ",
                    React.createElement("b", null, "korzystanie z prawa podatkowego"),
                    ", kt\u00F3re zosta\u0142o stworzone w\u0142a\u015Bnie po to, by przedsi\u0119biorcy mogli je stosowa\u0107. Skonsultuj ka\u017Cd\u0105 z biurem rachunkowym zanim wdro\u017Cysz.")),
            OPTYMALIZACJE.map((o, i) => (React.createElement(Card, { key: i, style: { marginBottom: 10 } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, o.t),
                    React.createElement("div", { style: { display: "flex", gap: 6, alignItems: "center", flexShrink: 0, marginLeft: 8 } },
                        React.createElement("span", { style: { fontSize: 11, fontWeight: 700, color: "var(--copper)", background: "rgba(200,116,63,.12)", padding: "2px 8px", borderRadius: 7 } }, o.tag))),
                React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", lineHeight: 1.55, marginBottom: 6 } }, o.desc),
                React.createElement("div", { style: { fontSize: 12.5 } },
                    "Potencja\u0142 oszcz\u0119dno\u015Bci: ",
                    o.sav)))),
            React.createElement(Card, { style: { marginTop: 6, background: "rgba(21,163,74,.07)", border: "1px solid rgba(21,163,74,.25)" } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 8 } }, "\uD83D\uDCB8 Ile mo\u017Cna zaoszcz\u0119dzi\u0107 realnie?"),
                [["PCC-4 (oszczędność czasu)", "~5-10 h/miesiąc mniej administracji"], ["Samochód N1 vs osobowy", "2 000-6 000 zł/rok więcej w KUP"], ["Jednorazowa amortyzacja sprzętu", "15-30% ceny sprzętu od razu jako koszt"], ["ZUS preferencyjny (nowy przedsięb.)", "~30 000-40 000 zł przez 2,5 roku"], ["Podatek liniowy vs skala (>120k)", "Do 40 000 zł/rok przy dużych dochodach"], ["Estoński CIT (spółka)", "Nawet 30-50% niższe podatki przy reinwestowaniu"],].map(([k, v]) => (React.createElement("div", { key: k, style: { display: "flex", gap: 10, padding: "8px 0", borderTop: "1px solid var(--line)" } },
                    React.createElement("div", { style: { flex: 1 } },
                        React.createElement("div", { style: { fontWeight: 700, fontSize: 12.5 } }, k),
                        React.createElement("div", { style: { fontSize: 12, color: "var(--green)" } }, v))))))))));
}
/* ─────────── Wywozy i odbiory (planer) ─────────── */
const PRIO = {
    high: { label: "Wysoki", c: "#dc2626", bg: "rgba(220,38,38,.12)", days: 1 },
    medium: { label: "Średni", c: "#d97706", bg: "rgba(217,119,6,.12)", days: 3 },
    low: { label: "Niski", c: "#15a34a", bg: "rgba(21,163,74,.12)", days: 7 },
};
const addDaysKey = (dateKey, n) => { const d = new Date((dateKey || todayStr()) + "T00:00:00"); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
// automatyczne, "średnie" wyliczenie ile dni powinno zająć zlecenie
const estDays = (pri, qty) => { const base = (PRIO[pri] || PRIO.medium).days; const q = parseFloat(qty) || 0; const extra = q > 1000 ? Math.ceil((q - 1000) / 2000) : 0; return base + extra; };
function Wywozy({ pickups, setPickups }) {
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);
    const col = (d) => d < 0 ? "var(--red)" : d <= 2 ? "var(--amber)" : "var(--green)";
    const [calRef, setCalRef] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const [dayFilter, setDayFilter] = useState(null);
    const keyOf = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
    const openOrders = (pickups || []).filter((p) => p.status !== "done");
    const overdue = openOrders.filter((p) => daysTo(p.due) < 0).length;
    const doneOnes = (pickups || []).filter((p) => p.status === "done" && p.doneAt && p.created);
    const avgDays = doneOnes.length ? Math.round(doneOnes.reduce((a, p) => a + Math.max(0, (p.doneAt - new Date(p.created + "T00:00:00").getTime()) / 86400000), 0) / doneOnes.length * 10) / 10 : null;
    const PW = { high: 0, medium: 1, low: 2 };
    const list = (pickups || []).slice().sort((a, b) => {
        if ((a.status === "done") !== (b.status === "done"))
            return a.status === "done" ? 1 : -1;
        if (PW[a.priority] !== PW[b.priority])
            return (PW[a.priority] ?? 1) - (PW[b.priority] ?? 1);
        return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
    });
    const shown = dayFilter ? list.filter((p) => p.due === dayFilter) : list;
    const byDay = {};
    (pickups || []).forEach((p) => { if (p.due)
        (byDay[p.due] = byDay[p.due] || []).push(p); });
    const cy = calRef.getFullYear(), cmo = calRef.getMonth();
    let startW = new Date(cy, cmo, 1).getDay();
    startW = (startW + 6) % 7;
    const daysIn = new Date(cy, cmo + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startW; i++)
        cells.push(null);
    for (let dd = 1; dd <= daysIn; dd++)
        cells.push(new Date(cy, cmo, dd));
    const monthLabel = calRef.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
    const todayKey = todayStr();
    const openNew = () => { setEdit({ id: null, contractor: "", address: "", phone: "", material: "", qtyKg: "", priority: "medium", note: "", created: todayStr(), due: dayFilter || "", manual: !!dayFilter, status: "planned" }); setOpen(true); };
    const suggested = edit ? addDaysKey(edit.created, estDays(edit.priority, edit.qtyKg)) : "";
    const saveOrder = () => {
        if (!edit.contractor.trim() && !edit.address.trim())
            return;
        const due = (edit.manual && edit.due) ? edit.due : suggested;
        const rec = { ...edit, due };
        delete rec.manual;
        if (edit.id)
            setPickups(pickups.map((p) => p.id === edit.id ? rec : p));
        else
            setPickups([...pickups, { ...rec, id: uid() }]);
        setOpen(false);
    };
    const toggleDone = (p) => setPickups(pickups.map((x) => x.id === p.id ? { ...x, status: x.status === "done" ? "planned" : "done", doneAt: x.status === "done" ? null : Date.now() } : x));
    const KPI = ({ v, l, c }) => (React.createElement(Card, { pad: 13 },
        React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", fontWeight: 600 } }, l),
        React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 21, marginTop: 5, color: c || "var(--text)" } }, v)));
    return (React.createElement("div", { style: { padding: "0 16px" } },
        React.createElement("header", { style: { paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" } },
            React.createElement("div", null,
                React.createElement("h1", { style: { margin: 0, fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" } }, "Wywozy"),
                React.createElement("div", { style: { color: "var(--muted)", fontSize: 13, marginTop: 2 } }, "Planer odbior\u00F3w i wywoz\u00F3w z\u0142omu")),
            React.createElement(Truck, { size: 26, color: "var(--copper)" })),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginTop: 16 } },
            React.createElement(KPI, { v: openOrders.length, l: "Zaplanowane" }),
            React.createElement(KPI, { v: overdue, l: "Po terminie", c: overdue ? "var(--red)" : undefined }),
            React.createElement(KPI, { v: avgDays != null ? avgDays + " dni" : "—", l: "\u015Ar. czas" })),
        React.createElement(Card, { pad: 12, style: { marginTop: 14 } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 } },
                React.createElement("button", { onClick: () => setCalRef(new Date(cy, cmo - 1, 1)), style: iconBtn },
                    React.createElement(ChevronLeft, { size: 18 })),
                React.createElement("span", { style: { fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, textTransform: "capitalize" } }, monthLabel),
                React.createElement("button", { onClick: () => setCalRef(new Date(cy, cmo + 1, 1)), style: iconBtn },
                    React.createElement(ChevronRight, { size: 18 }))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 } }, ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((w) => React.createElement("div", { key: w, style: { textAlign: "center", fontSize: 10.5, fontWeight: 700, color: "var(--faint)" } }, w))),
            React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 } }, cells.map((dt, i) => {
                if (!dt)
                    return React.createElement("div", { key: "e" + i });
                const k = keyOf(dt);
                const orders = (byDay[k] || []).slice().sort((a, b) => (PW[a.priority] ?? 1) - (PW[b.priority] ?? 1));
                const isToday = k === todayKey;
                const sel = dayFilter === k;
                const has = orders.length > 0;
                return (React.createElement("button", { key: k, onClick: () => setDayFilter(sel ? null : (has ? k : null)), style: { aspectRatio: "1 / 1", borderRadius: 9, cursor: has ? "pointer" : "default", border: sel ? "1.5px solid var(--copper)" : "1px solid transparent", background: sel ? "rgba(200,116,63,.1)" : isToday ? "rgba(43,52,64,.06)" : "transparent", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 0, color: "var(--text)" } },
                    React.createElement("span", { style: { fontSize: 12.5, fontWeight: isToday ? 800 : 500, fontFamily: "var(--mono)" } }, dt.getDate()),
                    React.createElement("span", { style: { display: "flex", gap: 2, height: 5, alignItems: "center" } }, orders.slice(0, 3).map((o, j) => React.createElement("span", { key: j, style: { width: 5, height: 5, borderRadius: 99, background: (PRIO[o.priority] || PRIO.medium).c } })))));
            }))),
        React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", null, dayFilter ? "Zlecenia: " + dayFilter : "Zlecenia (wg priorytetu)"),
            React.createElement("span", { style: { display: "flex", gap: 12, alignItems: "center", textTransform: "none", letterSpacing: 0 } },
                dayFilter && React.createElement("span", { onClick: () => setDayFilter(null), style: { color: "var(--muted)", cursor: "pointer", fontSize: 12 } }, "poka\u017C wszystkie"),
                React.createElement("span", { onClick: openNew, style: { color: "var(--copper)", cursor: "pointer", fontSize: 12.5 } }, "+ Dodaj"))),
        shown.length === 0 ? React.createElement(Card, null,
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "12px 0" } }, dayFilter ? "Brak zleceń w tym dniu. Dodaj ↑" : "Brak zleceń. Dodaj pierwszy wywóz lub odbiór ↑")) :
            shown.map((p) => {
                const pr = PRIO[p.priority] || PRIO.medium;
                const d = daysTo(p.due);
                const isDone = p.status === "done";
                return (React.createElement(Card, { key: p.id, pad: 13, style: { marginBottom: 9, opacity: isDone ? .62 : 1 } },
                    React.createElement("div", { style: { display: "flex", gap: 11 } },
                        React.createElement("button", { onClick: () => toggleDone(p), title: "Zrealizowano", style: { width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 1, cursor: "pointer", border: isDone ? "none" : "2px solid var(--line2)", background: isDone ? "var(--green)" : "transparent", display: "grid", placeItems: "center", padding: 0 } }, isDone && React.createElement(Check, { size: 16, color: "#fff", strokeWidth: 3 })),
                        React.createElement("div", { style: { flex: 1, minWidth: 0, cursor: "pointer" }, onClick: () => { setEdit({ ...p, manual: true }); setOpen(true); } },
                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 } },
                                React.createElement("span", { style: { fontSize: 14.5, fontWeight: 700, textDecoration: isDone ? "line-through" : "none" } }, p.contractor || p.address || "Zlecenie"),
                                React.createElement("span", { style: { fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: pr.bg, color: pr.c, whiteSpace: "nowrap" } }, pr.label.toUpperCase())),
                            p.address && React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 3, display: "flex", alignItems: "center", gap: 5 } },
                                React.createElement(MapPin, { size: 12 }),
                                " ",
                                p.address),
                            (p.material || parseFloat(p.qtyKg) > 0 || p.phone) && React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 4, display: "flex", flexWrap: "wrap", gap: "2px 10px" } },
                                p.material && React.createElement("span", null, p.material),
                                parseFloat(p.qtyKg) > 0 && React.createElement("span", null,
                                    "~",
                                    kg(parseFloat(p.qtyKg))),
                                p.phone && React.createElement("span", null, p.phone)),
                            !isDone
                                ? React.createElement("div", { style: { fontSize: 12.5, marginTop: 6, display: "flex", alignItems: "center", gap: 6 } },
                                    React.createElement(Clock, { size: 13, color: col(d) }),
                                    React.createElement("span", { style: { color: "var(--muted)" } },
                                        "Termin ",
                                        p.due),
                                    React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, color: col(d) } }, d < 0 ? `${-d} dni po` : d === 0 ? "dziś" : `za ${d} dni`))
                                : React.createElement("div", { style: { fontSize: 12, marginTop: 6, color: "var(--green)", fontWeight: 600 } }, "Zrealizowano \u2713")))));
            }),
        React.createElement(Sheet, { open: open, onClose: () => setOpen(false), title: edit && edit.id ? "Zlecenie wywozu" : "Nowe zlecenie" }, edit && (React.createElement(React.Fragment, null,
            React.createElement("label", { style: label }, "Kontrahent / klient"),
            React.createElement("input", { style: inputStyle, value: edit.contractor, onChange: (e) => setEdit({ ...edit, contractor: e.target.value }), placeholder: "np. Firma Kowalski / Jan Nowak" }),
            React.createElement("label", { style: label }, "Adres odbioru"),
            React.createElement("input", { style: inputStyle, value: edit.address, onChange: (e) => setEdit({ ...edit, address: e.target.value }), placeholder: "ul., miejscowo\u015B\u0107" }),
            React.createElement("div", { style: { display: "flex", gap: 10 } },
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: label }, "Telefon"),
                    React.createElement("input", { style: inputStyle, value: edit.phone, onChange: (e) => setEdit({ ...edit, phone: e.target.value }), placeholder: "\u2014" })),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("label", { style: label }, "Szac. masa (kg)"),
                    React.createElement("input", { type: "number", inputMode: "decimal", style: { ...inputStyle, fontFamily: "var(--mono)" }, value: edit.qtyKg, onChange: (e) => setEdit({ ...edit, qtyKg: e.target.value }), placeholder: "0" }))),
            React.createElement("label", { style: label }, "Rodzaj z\u0142omu"),
            React.createElement("input", { style: inputStyle, value: edit.material, onChange: (e) => setEdit({ ...edit, material: e.target.value }), placeholder: "np. stal, mied\u017A, mix" }),
            React.createElement("label", { style: label }, "Priorytet zlecenia"),
            React.createElement("div", { style: { display: "flex", gap: 8 } }, ["high", "medium", "low"].map((k) => {
                const pr = PRIO[k];
                const on = edit.priority === k;
                return (React.createElement("button", { key: k, onClick: () => setEdit({ ...edit, priority: k }), style: { flex: 1, padding: "10px 6px", borderRadius: 10, cursor: "pointer", fontSize: 12.5, fontWeight: 700, border: on ? `1.5px solid ${pr.c}` : "1px solid var(--line2)", background: on ? pr.bg : "var(--surface)", color: on ? pr.c : "var(--muted)" } }, pr.label));
            })),
            React.createElement("div", { style: { marginTop: 14, padding: "12px 13px", borderRadius: 12, background: "rgba(200,116,63,.07)", border: "1px solid rgba(200,116,63,.2)" } },
                React.createElement("div", { style: { fontSize: 11.5, color: "var(--copper)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 } },
                    React.createElement(Sparkles, { size: 14 }),
                    " Automatyczny termin realizacji"),
                React.createElement("div", { style: { fontSize: 13, marginTop: 5, lineHeight: 1.45 } },
                    "Sugerowany na ",
                    React.createElement("b", null, suggested),
                    " \u2014 ok. ",
                    React.createElement("b", null,
                        estDays(edit.priority, edit.qtyKg),
                        " dni"),
                    " (priorytet ",
                    (PRIO[edit.priority] || PRIO.medium).label.toLowerCase(),
                    parseFloat(edit.qtyKg) > 1000 ? " + duży ładunek" : "",
                    ").")),
            React.createElement("label", { style: label }, "Termin (mo\u017Cesz nadpisa\u0107)"),
            React.createElement("input", { type: "date", style: { ...inputStyle, colorScheme: "light" }, value: (edit.manual && edit.due) ? edit.due : suggested, onChange: (e) => setEdit({ ...edit, due: e.target.value, manual: true }) }),
            React.createElement("label", { style: label }, "Notatka"),
            React.createElement("textarea", { rows: 2, style: { ...inputStyle, resize: "vertical", lineHeight: 1.4 }, value: edit.note, onChange: (e) => setEdit({ ...edit, note: e.target.value }), placeholder: "Szczeg\u00F3\u0142y, dojazd, kontener\u2026" }),
            React.createElement("button", { style: { ...btnCopper, marginTop: 16 }, onClick: saveOrder }, "Zapisz zlecenie"),
            edit.id && React.createElement("button", { style: { ...btnGhost, marginTop: 10, color: "var(--red)", borderColor: "rgba(220,38,38,.3)" }, onClick: () => { setPickups(pickups.filter((p) => p.id !== edit.id)); setOpen(false); } }, "Usu\u0144 zlecenie"))))));
}
/* ─────────── Podaplikacja KLIENTA ─────────── */
const TEAL = "#3f7d8a";
const btnTeal = { width: "100%", padding: "14px", borderRadius: 13, border: "none", cursor: "pointer", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "var(--body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 };
const cnorm = (s) => fnorm(String(s || "")).replace(/\s+/g, "");
function ClientApp({ materials, tx, clientProfile, setClientProfile, onExit, account, onLogout, preview, requests, setRequests, notifSeen, setNotifSeen, notifOn, onEnableNotif }) {
    const [tab, setTab] = useState("wagi");
    const [plateInput, setPlateInput] = useState("");
    const plates = clientProfile.plates || [];
    const snapshot = clientProfile.snapshot || {};
    const haveSnapshot = Object.keys(snapshot).length > 0;
    const clientId = (account && account.id) || "preview";
    const clientName = (account && account.name) || "Klient (podgląd)";
    const allReq = requests || [];
    const myReq = allReq.filter((r) => r.clientId === clientId).slice().sort((a, b) => b.ts - a.ts);
    useEffect(() => {
        if (!Object.keys(clientProfile.snapshot || {}).length && materials.length) {
            const snap = {};
            materials.forEach((m) => { snap[m.id] = m.buy; });
            setClientProfile((c) => ({ ...c, snapshot: snap }));
        }
    }, []);
    const plateSet = plates.map(cnorm);
    const mine = tx.filter((x) => x.plate && plateSet.includes(cnorm(x.plate))).slice().sort((a, b) => b.ts - a.ts);
    const latest = mine[0] || null;
    const isToday = latest && fmtDateKey(latest.ts) === todayStr();
    const rises = materials.map((m) => ({ m, prev: snapshot[m.id] })).filter((o) => o.prev != null && o.m.buy > o.prev + 0.001).map((o) => ({ m: o.m, diff: o.m.buy - o.prev }));
    const addPlate = () => { const p = plateInput.trim().toUpperCase(); if (!p || plates.includes(p)) {
        setPlateInput("");
        return;
    } setClientProfile({ ...clientProfile, plates: [...plates, p] }); setPlateInput(""); };
    const removePlate = (p) => setClientProfile({ ...clientProfile, plates: plates.filter((x) => x !== p) });
    const refreshPrices = () => { const snap = {}; materials.forEach((m) => { snap[m.id] = m.buy; }); setClientProfile({ ...clientProfile, snapshot: snap, seen: Date.now() }); };
    // wycena (kalkulator)
    const [cMat, setCMat] = useState(materials[0] ? materials[0].id : "");
    const [cW, setCW] = useState("");
    const cm = materials.find((m) => m.id === cMat);
    const cEst = cm && parseFloat(cW) > 0 ? parseFloat(cW) * cm.buy : 0;
    // wycena ze zdjęcia (symulacja AI) + wysyłka do skupu
    const [aiLoading, setAiLoading] = useState(false);
    const [ai, setAi] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoBusy, setPhotoBusy] = useState(false);
    const [note, setNote] = useState("");
    const [sent, setSent] = useState(false);
    const runAi = () => {
        setAi(null);
        setAiLoading(true);
        setTimeout(() => {
            const pick = materials[Math.floor(Math.random() * materials.length)];
            const w = Math.round((Math.random() * 40 + 5) * 10) / 10;
            const lo = w * pick.buy * 0.85, hi = w * pick.buy * 1.1;
            setAi({ name: pick.n, g: pick.g, w, lo, hi });
            setAiLoading(false);
        }, 1400);
    };
    const onPhoto = async (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f)
            return;
        setPhotoBusy(true);
        try {
            const url = await resizeImage(f);
            setPhoto(url);
        }
        catch (err) { }
        finally {
            setPhotoBusy(false);
        }
    };
    const sendRequest = () => {
        if (!photo && !note.trim() && !ai)
            return;
        const est = ai ? `${plnShort(ai.lo)}–${plnShort(ai.hi)}` : null;
        setRequests((p) => [{ id: uid(), clientId, clientName, plate: plates[0] || "", note: note.trim(), material: ai ? ai.name : null, est, photo: photo || null, ts: Date.now(), status: "new", reply: null }, ...(p || [])]);
        setPhoto(null);
        setNote("");
        setAi(null);
        setSent(true);
        setTimeout(() => setSent(false), 4000);
    };
    // powiadomienia klienta o odpowiedziach skupu
    const cLastSeen = notifSeen ? (notifSeen[clientId] || 0) : 0;
    const myNotifs = myReq.filter((r) => r.reply && r.reply.ts > cLastSeen).map((r) => ({ id: r.id, ts: r.reply.ts, title: "Wycena ze skupu", body: (r.reply.price != null ? pln(r.reply.price) : "") + (r.reply.message ? " · " + r.reply.message : "") }));
    const [notifOpen, setNotifOpen] = useState(false);
    const [cToast, setCToast] = useState(null);
    const cNotifInit = useRef(false);
    const repliedRef = useRef(null);
    const markRead = () => setNotifSeen && setNotifSeen((s) => ({ ...s, [clientId]: Date.now() }));
    useEffect(() => {
        const answered = new Set(myReq.filter((r) => r.reply).map((r) => r.id));
        if (!cNotifInit.current) {
            cNotifInit.current = true;
            repliedRef.current = answered;
            if (notifOn && myNotifs.length)
                fireNotif("ZŁOM-MET", `Masz ${myNotifs.length} ${myNotifs.length === 1 ? "nową wycenę" : "nowe wyceny"} ze skupu`);
            return;
        }
        const fresh = myReq.filter((r) => r.reply && !repliedRef.current.has(r.id));
        repliedRef.current = answered;
        if (fresh.length) {
            if (notifOn)
                fireNotif("Wycena ze skupu", fresh[0].reply.price != null ? pln(fresh[0].reply.price) : "Sprawdź wycenę");
            setCToast({ msg: "Skup odpowiedział na Twoje zgłoszenie." });
        }
    }, [requests]);
    const NAVC = [["wagi", "Wagi", Scale], ["cennik", "Cennik", Coins], ["wycena", "Wycena", Calculator], ["alerty", "Alerty", Bell], ["zgloszenia", "Zgłoszenia", Inbox]];
    return (React.createElement("div", { className: "sk-root", style: { minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 120 } },
        cToast && React.createElement(Toast, { msg: cToast.msg, onClose: () => setCToast(null) }),
        React.createElement("div", { style: { background: `linear-gradient(135deg, ${TEAL}, #2f5f6b)`, padding: "calc(16px + env(safe-area-inset-top)) 16px 18px", color: "#fff" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
                    React.createElement("div", { style: { width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.16)", display: "grid", placeItems: "center" } },
                        React.createElement(Smartphone, { size: 20 })),
                    React.createElement("div", null,
                        React.createElement("div", { style: { fontFamily: "var(--display)", fontWeight: 800, fontSize: 18 } }, "Panel klienta"),
                        React.createElement("div", { style: { fontSize: 11.5, opacity: .8 } }, account ? account.name : "Twoje ważenia i ceny skupu"))),
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } },
                    React.createElement("button", { onClick: () => setNotifOpen(true), style: { position: "relative", background: "rgba(255,255,255,.16)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center" } },
                        React.createElement(Bell, { size: 17 }),
                        myNotifs.length > 0 && React.createElement("span", { style: { position: "absolute", top: -4, right: -4, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 99, background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 800, display: "grid", placeItems: "center" } }, myNotifs.length)),
                    preview
                        ? React.createElement("button", { onClick: onExit, style: { background: "rgba(255,255,255,.16)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 10, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 } },
                            React.createElement(ChevronLeft, { size: 15 }),
                            " Skup")
                        : React.createElement("button", { onClick: onLogout, style: { background: "rgba(255,255,255,.16)", border: "none", color: "#fff", cursor: "pointer", borderRadius: 10, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 } },
                            React.createElement(LogOut, { size: 15 }),
                            " Wyloguj"))),
            preview && React.createElement("div", { style: { marginTop: 12, fontSize: 11.5, background: "rgba(255,255,255,.14)", borderRadius: 9, padding: "8px 11px", display: "inline-flex", alignItems: "center", gap: 7 } },
                React.createElement(AlertTriangle, { size: 14 }),
                " Podgl\u0105d w\u0142a\u015Bciciela \u2014 tak ekran widzi klient")),
        React.createElement("div", { key: tab, style: { animation: "fade .22s ease", padding: "0 16px" } },
            tab === "wagi" && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { ...sectionTitle, marginTop: 18 } }, "Twoje tablice rejestracyjne"),
                React.createElement(Card, null,
                    React.createElement("div", { style: { display: "flex", gap: 8 } },
                        React.createElement("input", { value: plateInput, onChange: (e) => setPlateInput(e.target.value.toUpperCase()), placeholder: "np. SK 12345", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: ".05em" } }),
                        React.createElement("button", { onClick: addPlate, style: { ...btnTeal, width: "auto", padding: "0 18px" } },
                            React.createElement(Plus, { size: 18 }))),
                    plates.length > 0 ? (React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 } }, plates.map((p) => (React.createElement("span", { key: p, style: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(63,125,138,.1)", border: "1px solid rgba(63,125,138,.3)", color: TEAL, borderRadius: 99, padding: "7px 8px 7px 13px", fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13 } },
                        p,
                        React.createElement("button", { onClick: () => removePlate(p), style: { border: "none", background: "rgba(63,125,138,.18)", cursor: "pointer", borderRadius: 99, width: 20, height: 20, display: "grid", placeItems: "center", color: TEAL } },
                            React.createElement(X, { size: 12 }))))))) : React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 10 } },
                        "Dodaj tablic\u0119 u\u017Cyt\u0105 przy wa\u017Ceniu \u2014 system poka\u017Ce Twoje wagi (w demie: ",
                        React.createElement("b", null, "SK 12345"),
                        ").")),
                latest && (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: sectionTitle }, "Ostatnie wa\u017Cenie"),
                    React.createElement(Card, { style: { border: `1.5px solid ${TEAL}`, background: "linear-gradient(135deg,rgba(63,125,138,.08),rgba(63,125,138,.01))" } },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } },
                            React.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: isToday ? "var(--green)" : "var(--muted)" } },
                                isToday && React.createElement("span", { style: { width: 8, height: 8, borderRadius: 99, background: "var(--green)", boxShadow: "0 0 0 0 rgba(21,163,74,.5)", animation: "pulse 1.6s infinite" } }),
                                isToday ? "NA ŻYWO · dziś" : fmtDate(latest.ts),
                                " \u00B7 ",
                                fmtTs(latest.ts)),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: TEAL } }, latest.plate)),
                        latest.pos.map((p, i) => (React.createElement("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: i ? "1px solid var(--line)" : "none" } },
                            React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 } },
                                React.createElement("span", { style: { width: 9, height: 9, borderRadius: 3, background: C[p.g].color } }),
                                p.n),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 13.5 } }, kg(p.w))))),
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "2px solid var(--line2)" } },
                            React.createElement("span", { style: { fontSize: 13, color: "var(--muted)", fontWeight: 600 } }, "Wyp\u0142ata"),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 24, color: TEAL } }, pln(txTotal(latest))))))),
                mine.length > 1 && (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: sectionTitle }, "Historia wa\u017Ce\u0144"),
                    mine.slice(1).map((x) => (React.createElement(Card, { key: x.id, pad: 13, style: { marginBottom: 9 } },
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                            React.createElement("div", null,
                                React.createElement("div", { style: { fontSize: 13.5, fontWeight: 600 } },
                                    kg(txMass(x)),
                                    " \u00B7 ",
                                    x.pos.length,
                                    " ",
                                    x.pos.length === 1 ? "pozycja" : "pozycje"),
                                React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", fontFamily: "var(--mono)" } },
                                    fmtDate(x.ts),
                                    " \u00B7 ",
                                    x.plate)),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, fontSize: 15 } }, plnShort(txTotal(x))))))))),
                plates.length > 0 && mine.length === 0 && React.createElement(Card, { style: { marginTop: 4 } },
                    React.createElement("div", { style: { fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "8px 0" } }, "Brak wa\u017Ce\u0144 dla zapisanych tablic. Gdy oddasz z\u0142om, wa\u017Cenie pojawi si\u0119 tu automatycznie.")))),
            tab === "cennik" && (React.createElement(React.Fragment, null,
                rises.length > 0 && (React.createElement("div", { style: { marginTop: 18, borderRadius: 14, background: "rgba(21,163,74,.1)", border: "1px solid rgba(21,163,74,.3)", padding: 14 } },
                    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 } },
                        React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 14, color: "var(--green)" } },
                            React.createElement(Bell, { size: 16 }),
                            " ",
                            rises.length,
                            " ",
                            rises.length === 1 ? "cena wzrosła" : "ceny wzrosły"),
                        React.createElement("button", { onClick: refreshPrices, style: { background: "rgba(21,163,74,.15)", border: "none", color: "var(--green)", cursor: "pointer", borderRadius: 9, padding: "6px 10px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 } },
                            React.createElement(RefreshCw, { size: 13 }),
                            " Od\u015Bwie\u017C")),
                    rises.slice(0, 5).map(({ m, diff }) => (React.createElement("div", { key: m.id, style: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" } },
                        React.createElement("span", { style: { fontWeight: 600 } }, m.n),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700, color: "var(--green)" } },
                            "+",
                            diff.toFixed(2),
                            " z\u0142 \u2192 ",
                            m.buy.toFixed(2))))))),
                React.createElement("div", { style: sectionTitle }, "Cennik skupu"),
                React.createElement(ClientCennik, { materials: materials, rises: rises }))),
            tab === "wycena" && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { ...sectionTitle, marginTop: 18 } }, "Kalkulator wyceny"),
                React.createElement(Card, null,
                    React.createElement("label", { style: label }, "Materia\u0142"),
                    React.createElement("select", { value: cMat, onChange: (e) => setCMat(e.target.value), style: { ...inputStyle, colorScheme: "light" } }, materials.map((m) => React.createElement("option", { key: m.id, value: m.id },
                        m.n,
                        " (",
                        C[m.g].code,
                        ")"))),
                    React.createElement("label", { style: label }, "Masa (kg)"),
                    React.createElement("input", { type: "number", inputMode: "decimal", value: cW, onChange: (e) => setCW(e.target.value), placeholder: "0", style: { ...inputStyle, fontFamily: "var(--mono)", fontWeight: 700, fontSize: 18 } }),
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, padding: "14px 16px", borderRadius: 13, background: "rgba(63,125,138,.08)" } },
                        React.createElement("span", { style: { fontSize: 13, color: "var(--muted)", fontWeight: 600 } }, "Szacowana wyp\u0142ata"),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 24, color: TEAL } }, pln(cEst))),
                    cm && React.createElement("div", { style: { fontSize: 11.5, color: "var(--faint)", marginTop: 8 } },
                        "Cena skupu: ",
                        cm.buy.toFixed(2),
                        " z\u0142/kg \u00B7 wycena orientacyjna, ostateczna na wadze w punkcie.")),
                React.createElement("div", { style: sectionTitle }, "Wyce\u0144 ze zdj\u0119cia (AI) i wy\u015Blij do skupu"),
                React.createElement(Card, null,
                    sent && React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 9, padding: "11px 12px", borderRadius: 11, background: "rgba(21,163,74,.1)", border: "1px solid rgba(21,163,74,.3)", marginBottom: 12 } },
                        React.createElement(Check, { size: 18, color: "var(--green)", strokeWidth: 3 }),
                        React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, "Wys\u0142ano do skupu. Odpowied\u017A zobaczysz w \u201EZg\u0142oszenia\".")),
                    React.createElement("label", { style: { ...btnTeal, opacity: photoBusy ? .7 : 1, cursor: "pointer" } },
                        photoBusy ? React.createElement(React.Fragment, null,
                            React.createElement(RefreshCw, { size: 18, className: "spin" }),
                            " Wczytuj\u0119\u2026") : React.createElement(React.Fragment, null,
                            React.createElement(Camera, { size: 18 }),
                            " ",
                            photo ? "Zmień zdjęcie" : "Zrób / wgraj zdjęcie złomu"),
                        React.createElement("input", { type: "file", accept: "image/*", capture: "environment", onChange: onPhoto, style: { display: "none" } })),
                    photo && React.createElement("img", { src: photo, alt: "", style: { width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginTop: 12, border: "1px solid var(--line)" } }),
                    photo && (React.createElement("button", { onClick: runAi, disabled: aiLoading, style: { ...btnGhost, marginTop: 10, opacity: aiLoading ? .7 : 1 } }, aiLoading ? React.createElement(React.Fragment, null,
                        React.createElement(RefreshCw, { size: 16, className: "spin" }),
                        " Analizuj\u0119\u2026") : React.createElement(React.Fragment, null,
                        React.createElement(Sparkles, { size: 16 }),
                        " Wst\u0119pna wycena AI"))),
                    ai && (React.createElement("div", { style: { marginTop: 12, padding: 14, borderRadius: 13, border: "1px solid var(--line)", background: "var(--surface)" } },
                        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10 } },
                            React.createElement(Sparkles, { size: 16, color: TEAL }),
                            React.createElement("span", { style: { fontWeight: 700, fontSize: 14 } }, "Wst\u0119pne rozpoznanie")),
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 } },
                            React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 600 } },
                                React.createElement("span", { style: { width: 9, height: 9, borderRadius: 3, background: C[ai.g].color } }),
                                ai.name),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 700 } },
                                "~",
                                kg(ai.w))),
                        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" } },
                            React.createElement("span", { style: { fontSize: 13, color: "var(--muted)", fontWeight: 600 } }, "Szacunek"),
                            React.createElement("span", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 19, color: TEAL } },
                                plnShort(ai.lo),
                                "\u2013",
                                plnShort(ai.hi))),
                        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5 } }, "Wynik orientacyjny (demo). Ostateczna wycena po obejrzeniu i zwa\u017Ceniu w punkcie."))),
                    React.createElement("label", { style: { ...label, marginTop: 14 } }, "Wiadomo\u015B\u0107 do skupu (opcjonalnie)"),
                    React.createElement("textarea", { value: note, onChange: (e) => setNote(e.target.value), rows: 2, placeholder: "np. Mam ok. 5 kg miedzi, kiedy mog\u0119 przyjecha\u0107?", style: { ...inputStyle, resize: "vertical", lineHeight: 1.4 } }),
                    React.createElement("button", { onClick: sendRequest, disabled: !photo && !note.trim() && !ai, style: { ...btnTeal, marginTop: 12, opacity: (!photo && !note.trim() && !ai) ? .5 : 1 } },
                        React.createElement(Send, { size: 18 }),
                        " Wy\u015Blij do skupu o wycen\u0119")))),
            tab === "alerty" && React.createElement(ClientAlerty, { materials: materials, snapshot: snapshot, rises: rises, notifOn: notifOn, onEnableNotif: onEnableNotif, clientProfile: clientProfile, setClientProfile: setClientProfile, refreshPrices: refreshPrices }),
            tab === "zgloszenia" && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { ...sectionTitle, marginTop: 18 } }, "Twoje zg\u0142oszenia"),
                myReq.length === 0 ? (React.createElement(Card, null,
                    React.createElement("div", { style: { textAlign: "center", color: "var(--muted)", fontSize: 13.5, padding: "16px 8px" } }, "Nie wys\u0142ano jeszcze zg\u0142osze\u0144. Wy\u015Blij zdj\u0119cie w zak\u0142adce \u201EWycena\"."))) : myReq.map((r) => (React.createElement(Card, { key: r.id, style: { marginBottom: 11 } },
                    React.createElement("div", { style: { display: "flex", gap: 12 } },
                        r.photo
                            ? React.createElement("img", { src: r.photo, alt: "", style: { width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid var(--line)" } })
                            : React.createElement("div", { style: { width: 56, height: 56, borderRadius: 10, background: "var(--surface2)", display: "grid", placeItems: "center", flexShrink: 0 } },
                                React.createElement(MessageSquare, { size: 20, color: "var(--faint)" })),
                        React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                                React.createElement("span", { style: { fontSize: 12, fontFamily: "var(--mono)", color: "var(--muted)" } },
                                    fmtDate(r.ts),
                                    " ",
                                    fmtTs(r.ts)),
                                React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, padding: "3px 8px", borderRadius: 99, background: r.status === "new" ? "rgba(245,181,61,.15)" : "rgba(21,163,74,.12)", color: r.status === "new" ? "var(--amber)" : "var(--green)" } }, r.status === "new" ? "OCZEKUJE" : "WYCENIONO")),
                            r.material && React.createElement("div", { style: { fontSize: 12.5, marginTop: 5 } },
                                "AI: ",
                                React.createElement("b", null, r.material),
                                r.est ? ` · ~${r.est}` : ""),
                            r.note && React.createElement("div", { style: { fontSize: 13, marginTop: 4 } },
                                "\u201E",
                                r.note,
                                "\""))),
                    r.reply && (React.createElement("div", { style: { marginTop: 11, padding: "11px 13px", borderRadius: 11, background: "rgba(63,125,138,.08)", border: "1px solid rgba(63,125,138,.25)" } },
                        React.createElement("div", { style: { fontSize: 11, fontWeight: 700, color: TEAL, marginBottom: 3 } }, "Odpowied\u017A skupu"),
                        r.reply.price != null && React.createElement("div", { style: { fontFamily: "var(--mono)", fontWeight: 800, fontSize: 19, color: TEAL } }, pln(r.reply.price)),
                        r.reply.message && React.createElement("div", { style: { fontSize: 13, marginTop: 2 } }, r.reply.message))))))))),
        React.createElement("nav", { style: { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40, maxWidth: 480, margin: "0 auto", background: "rgba(255,255,255,.9)", backdropFilter: "blur(14px)", borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: `repeat(${NAVC.length},1fr)`, padding: "8px 4px calc(8px + env(safe-area-inset-bottom))" } }, NAVC.map(([id, lbl, Ic]) => {
            const on = tab === id;
            const badge = id === "zgloszenia" && myReq.some((r) => r.status === "answered");
            return (React.createElement("button", { key: id, onClick: () => setTab(id), style: { position: "relative", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0", color: on ? TEAL : "var(--faint)" } },
                React.createElement(Ic, { size: 21, strokeWidth: on ? 2.6 : 2 }),
                React.createElement("span", { style: { fontSize: 10.5, fontWeight: on ? 700 : 500 } }, lbl)));
        })),
        React.createElement(Sheet, { open: notifOpen, onClose: () => { setNotifOpen(false); markRead(); }, title: "Powiadomienia" },
            React.createElement(NotifList, { items: myNotifs, notifOn: notifOn, onEnable: onEnableNotif, onItem: () => { setNotifOpen(false); markRead(); setTab("zgloszenia"); } }))));
}
/* ─────────── Powiadomienia klienta (alerty cenowe) ─────────── */
function ClientAlerty({ materials, snapshot, rises, notifOn, onEnableNotif, clientProfile, setClientProfile, refreshPrices }) {
    // Preferencje powiadomień (zapis w profilu klienta)
    const prefs = clientProfile.notifPrefs || { wzrosty: true, promocje: true, progi: {} };
    const setPrefs = (p) => setClientProfile({ ...clientProfile, notifPrefs: p });
    // Historia alertów (broadcastów od skupu + wykryte wzrosty)
    const broadcasts = clientProfile.broadcasts || [];
    const allAlerts = [
        ...rises.map(r => ({ typ: "wzrost", material: r.m.n, diff: r.diff, cena: r.m.buy, ts: Date.now() })),
        ...broadcasts,
    ].sort((a, b) => b.ts - a.ts);
    // Materiały, które klient śledzi (z progiem ceny)
    const sledzone = materials.filter(m => prefs.progi[m.id] != null);
    const fmtCzas = (ts) => { const h = Math.round((Date.now() - ts) / 3600000); if (h < 1)
        return "przed chwilą"; if (h < 24)
        return `${h}h temu`; return `${Math.round(h / 24)}d temu`; };
    return (React.createElement("div", { style: { marginTop: 18 } },
        React.createElement(Card, { style: { background: notifOn ? "rgba(21,163,74,.08)" : "rgba(245,181,61,.1)", border: notifOn ? "1px solid rgba(21,163,74,.3)" : "1px solid rgba(245,181,61,.35)" } },
            React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12 } },
                React.createElement("span", { style: { fontSize: 28 } }, notifOn ? "🔔" : "🔕"),
                React.createElement("div", { style: { flex: 1 } },
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 14 } }, notifOn ? "Powiadomienia włączone" : "Włącz powiadomienia"),
                    React.createElement("div", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2, lineHeight: 1.45 } }, notifOn ? "Dostajesz alerty o wzrostach cen i promocjach na ekran blokady." : "Bądź pierwszy, gdy ceny wzrosną — zgarnij najlepszą stawkę.")),
                !notifOn && React.createElement("button", { onClick: onEnableNotif, style: { ...btnCopper, width: "auto", padding: "10px 16px", fontSize: 13 } }, "W\u0142\u0105cz"))),
        React.createElement("div", { style: sectionTitle }, "Co chcesz dostawa\u0107"),
        React.createElement(Card, { pad: 4 }, [["wzrosty", "📈 Wzrosty cen", "Gdy skup podnosi cenę materiału"], ["promocje", "🔥 Promocje", "Specjalne oferty i bonusy"]].map(([k, l, d], i) => (React.createElement("div", { key: k, style: { display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderBottom: i === 0 ? "1px solid var(--line)" : "none" } },
            React.createElement("div", { style: { flex: 1 } },
                React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } }, l),
                React.createElement("div", { style: { fontSize: 11.5, color: "var(--muted)", marginTop: 2 } }, d)),
            React.createElement("button", { onClick: () => setPrefs({ ...prefs, [k]: !prefs[k] }), style: { width: 46, height: 27, borderRadius: 99, border: "none", cursor: "pointer", background: prefs[k] ? "var(--green)" : "var(--line2)", position: "relative", transition: "background .2s", flexShrink: 0 } },
                React.createElement("span", { style: { position: "absolute", top: 3, left: prefs[k] ? 22 : 3, width: 21, height: 21, borderRadius: 99, background: "#fff", transition: "left .2s" } })))))),
        React.createElement("div", { style: sectionTitle }, "Powiadom mnie, gdy cena przekroczy"),
        React.createElement(Card, null,
            React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 } }, "Ustaw pr\u00F3g dla materia\u0142u \u2014 dostaniesz alert, gdy skup zap\u0142aci tyle lub wi\u0119cej."),
            materials.slice(0, 6).map(m => {
                const prog = prefs.progi[m.id];
                const aktywny = prog != null;
                const osiagniety = aktywny && m.buy >= prog;
                return (React.createElement("div", { key: m.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid var(--line)" } },
                    React.createElement("div", { style: { width: 8, height: 8, borderRadius: 99, background: (C[m.g] || {}).color || "var(--copper)", flexShrink: 0 } }),
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("div", { style: { fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, m.n),
                        React.createElement("div", { style: { fontSize: 11, color: "var(--muted)" } },
                            "teraz: ",
                            m.buy.toFixed(2),
                            " z\u0142/kg")),
                    aktywny ? (React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } },
                        React.createElement("input", { type: "number", step: "0.5", value: prog, onChange: e => setPrefs({ ...prefs, progi: { ...prefs.progi, [m.id]: parseFloat(e.target.value) || 0 } }), style: { width: 70, padding: "7px 8px", borderRadius: 8, border: `1.5px solid ${osiagniety ? "var(--green)" : "var(--line2)"}`, background: "var(--surface2)", color: osiagniety ? "var(--green)" : "var(--text)", fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700, outline: "none", boxSizing: "border-box" } }),
                        React.createElement("button", { onClick: () => { const p = { ...prefs.progi }; delete p[m.id]; setPrefs({ ...prefs, progi: p }); }, style: { width: 26, height: 26, borderRadius: 7, border: "none", background: "transparent", color: "var(--faint)", cursor: "pointer", fontSize: 15 } }, "\u00D7"))) : (React.createElement("button", { onClick: () => setPrefs({ ...prefs, progi: { ...prefs.progi, [m.id]: Math.ceil(m.buy * 1.05 * 2) / 2 } }), style: { padding: "6px 11px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--copper)" } }, "+ Pr\u00F3g"))));
            })),
        React.createElement("div", { style: { ...sectionTitle, display: "flex", justifyContent: "space-between", alignItems: "center" } },
            React.createElement("span", null, "Twoje alerty"),
            React.createElement("button", { onClick: refreshPrices, style: { padding: "5px 11px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: "1px solid var(--line2)", background: "var(--surface2)", color: "var(--muted)", textTransform: "none", letterSpacing: 0 } }, "Od\u015Bwie\u017C")),
        allAlerts.length === 0 ? (React.createElement(Card, null,
            React.createElement("div", { style: { color: "var(--muted)", fontSize: 13.5, textAlign: "center", padding: "14px 0", lineHeight: 1.5 } }, "Brak alert\u00F3w. Gdy skup podniesie ceny lub og\u0142osi promocj\u0119, zobaczysz to tutaj."))) : allAlerts.map((a, i) => (React.createElement(Card, { key: i, pad: 13, style: { marginBottom: 8, borderLeft: `4px solid ${a.typ === "wzrost" ? "var(--green)" : a.typ === "promocja" ? "var(--copper)" : "var(--blue)"}` } },
            React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } },
                React.createElement("div", { style: { flex: 1 } }, a.typ === "wzrost" ? (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } },
                        "\uD83D\uDCC8 Wzrost ceny \u2014 ",
                        a.material),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--green)", marginTop: 3 } },
                        "+",
                        a.diff.toFixed(2),
                        " z\u0142/kg \u2192 teraz ",
                        a.cena.toFixed(2),
                        " z\u0142/kg"))) : (React.createElement(React.Fragment, null,
                    React.createElement("div", { style: { fontWeight: 700, fontSize: 13.5 } }, a.tytul || "🔥 Wiadomość od skupu"),
                    React.createElement("div", { style: { fontSize: 12.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 } }, a.tresc)))),
                React.createElement("span", { style: { fontSize: 11, color: "var(--faint)", flexShrink: 0, marginLeft: 8 } }, fmtCzas(a.ts)))))),
        React.createElement("div", { style: { fontSize: 11, color: "var(--faint)", marginTop: 10, lineHeight: 1.5, textAlign: "center" } }, "Powiadomienia dzia\u0142aj\u0105 na zainstalowanej apce (ekran g\u0142\u00F3wny / PWA).")));
}
function ClientCennik({ materials, rises }) {
    const [q, setQ] = useState("");
    const riseIds = (rises || []).map((r) => r.m.id);
    const matches = (m) => !q.trim() || fnorm(m.n).includes(fnorm(q)) || C[m.g].code.includes(q.trim());
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { style: { position: "relative", marginBottom: 4 } },
            React.createElement(Search, { size: 17, color: "var(--faint)", style: { position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" } }),
            React.createElement("input", { style: { ...inputStyle, paddingLeft: 40 }, placeholder: "Szukaj (mied\u017A, 17 04\u2026)", value: q, onChange: (e) => setQ(e.target.value) })),
        Object.keys(C).map((g) => {
            const items = materials.filter((m) => m.g === g && matches(m));
            if (!items.length)
                return null;
            return (React.createElement("div", { key: g, style: { marginBottom: 8 } },
                React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, margin: "12px 4px 8px" } },
                    codeChip(g),
                    React.createElement("span", { style: { fontFamily: "var(--display)", fontSize: 13, fontWeight: 700, color: "var(--muted)" } }, C[g].label)),
                React.createElement(Card, { pad: 4 }, items.map((m, i) => (React.createElement("div", { key: m.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 10px", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none" } },
                    React.createElement("span", { style: { fontSize: 14, fontWeight: 600, paddingRight: 8 } }, m.n),
                    React.createElement("span", { style: { display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" } },
                        riseIds.includes(m.id) && React.createElement("span", { style: { fontSize: 10.5, fontWeight: 800, color: "var(--green)" } }, "\u25B2"),
                        React.createElement("span", { style: { fontFamily: "var(--mono)", fontSize: 14.5, fontWeight: 700 } }, m.buy.toFixed(2)),
                        React.createElement("span", { style: { fontSize: 11, color: "var(--faint)" } }, "z\u0142/kg"))))))));
        })));
}
const rootBase = { background: "#eef0ec", minHeight: "100vh" };
/* ─────────── styles ─────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
.sk-root{
  --bg:#f4f5f3; --surface:#ffffff; --surface2:#f6f7f4;
  --line:rgba(20,26,24,.09); --line2:rgba(20,26,24,.16); --track:rgba(20,26,24,.07);
  --text:#1b1f1b; --muted:#6b7280; --faint:#9aa1a2;
  --copper:#b5642f; --green:#15a34a; --amber:#d8902a; --red:#dc2626;
  --display:'Archivo',sans-serif; --body:'Hanken Grotesk',sans-serif; --mono:'JetBrains Mono',monospace;
  font-family:var(--body); color:var(--text);
  background:
    radial-gradient(700px 380px at 100% -5%, rgba(181,100,47,.05), transparent 70%),
    radial-gradient(600px 360px at 0% 4%, rgba(63,125,138,.05), transparent 70%),
    var(--bg);
  -webkit-font-smoothing:antialiased;
}
*{box-sizing:border-box;}
.sk-root button{font-family:var(--body);}
@keyframes fade{from{opacity:0;transform:translateY(4px);}to{opacity:1;transform:translateY(0);}}
@keyframes slideUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes dropIn{from{opacity:0;transform:translate(-50%,-14px);}to{opacity:1;transform:translate(-50%,0);}}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(21,163,74,.5);}70%{box-shadow:0 0 0 7px rgba(21,163,74,0);}100%{box-shadow:0 0 0 0 rgba(21,163,74,0);}}
.spin{animation:spin .7s linear infinite;}
input::placeholder{color:var(--faint);}
input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
@media print {
  html, body { background:#fff !important; }
  body * { visibility:hidden !important; }
  .print-target, .print-target * { visibility:visible !important; }
  .print-target { position:absolute !important; left:0 !important; top:0 !important; width:100% !important; box-shadow:none !important; border:none !important; border-radius:0 !important; margin:0 !important; }
  .no-print { display:none !important; }
}
@page { size:A4; margin:14mm; }
`;
