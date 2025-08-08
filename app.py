import os
import io
import sqlite3
from datetime import datetime

import pandas as pd
import streamlit as st
import pydeck as pdk
from fpdf import FPDF

APP_TITLE = "People Connect – Citizen Submissions"
FOOTER_CREDIT = "Prepared by Shvan Qaraman"

# ---------------------- CONFIG ----------------------
st.set_page_config(page_title=APP_TITLE, page_icon="🗂️", layout="wide")

DEFAULT_DEPARTMENTS = st.secrets.get(
    "DEPARTMENTS",
    ["Municipal", "Health", "Education", "Electricity", "Water", "Roads", "Other"],
)

TYPES = ["Complaint", "Suggestion", "Project", "Request"]
STATUSES = ["New", "In Progress", "Resolved", "Rejected"]

DB_PATH = "submissions.db"
UPLOAD_DIR = "uploads"

# Global login (requested): default username/password = shvan / shvan
AUTH_USERNAME = st.secrets.get("AUTH_USERNAME", "shvan")
AUTH_PASSWORD = st.secrets.get("AUTH_PASSWORD", "shvan")

# Optional department passwords (for Dept Panel)
DEPT_PASSWORDS = st.secrets.get("DEPT_PASSWORDS", {})  # {"Municipal": "pass"}

# Restrict the whole app (including public tabs) if desired
RESTRICT_ALL = bool(st.secrets.get("RESTRICT_ALL", False))

os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------------- I18N ----------------------
LANGS = {
    "en": {
        "lang_name": "English",
        "submit_tab": "Submit",
        "list_tab": "List",
        "map_tab": "Map",
        "admin_tab": "Admin",
        "dept_panel_tab": "Dept Panel",
        "submit_form": "Submit a Form",
        "type": "Type",
        "department": "Department",
        "name": "Third Name (Full Name)",
        "mobile": "Mobile Number",
        "address": "Address",
        "details": "Details",
        "lat": "Latitude (optional)",
        "lon": "Longitude (optional)",
        "attachments": "Attachments (max 3)",
        "btn_submit": "Submit",
        "fill_all": "Please fill all required fields.",
        "bad_mobile": "Mobile number looks invalid. Please check.",
        "success": "Submitted successfully!",
        "public_list": "All Submissions (Public View)",
        "filter_type": "Filter Type",
        "filter_dept": "Filter Dept",
        "filter_status": "Filter Status",
        "search": "Search (name/mobile/address/message)",
        "download_csv": "Download CSV",
        "download_xlsx": "Download Excel",
        "no_data": "No submissions yet.",
        "admin": "Admin Panel",
        "dept_panel": "Department Panel",
        "password": "Password",
        "username": "Username",
        "login": "Login",
        "logout": "Logout",
        "wrong_pw": "Wrong username or password.",
        "manage": "Manage Submissions",
        "mark_new": "Mark New",
        "in_prog": "In Progress",
        "resolved": "Resolved",
        "rejected": "Reject",
        "delete": "Delete",
        "download_all": "Download CSV (All/Filtered)",
        "export_pdf": "Export PDF",
        "wa": "WhatsApp",
        "sms": "SMS",
        "dept_config": "Departments Configuration",
        "dept_hint": "Select or add departments (admin can customize).",
        "current": "Current",
        "add_dept": "Add a department",
        "btn_add_dept": "Add Department",
        "btn_reset": "Reset to Defaults",
        "added": "Added",
        "reset": "Departments reset.",
        "caption": "Centralized submissions by department",
        "map_view": "Map View",
        "login_required": "Login required to access this section.",
    },
    "ar": {
        "lang_name": "العربية",
        "submit_tab": "إرسال",
        "list_tab": "القائمة",
        "map_tab": "الخريطة",
        "admin_tab": "الإدارة",
        "dept_panel_tab": "لوحة القسم",
        "submit_form": "إرسال نموذج",
        "type": "النوع",
        "department": "القسم",
        "name": "الاسم الثلاثي",
        "mobile": "رقم الهاتف",
        "address": "العنوان",
        "details": "التفاصيل",
        "lat": "خط العرض (اختياري)",
        "lon": "خط الطول (اختياري)",
        "attachments": "مرفقات (حتى 3)",
        "btn_submit": "أرسل",
        "fill_all": "يرجى ملء جميع الحقول المطلوبة.",
        "bad_mobile": "رقم الهاتف غير صالح.",
        "success": "تم الإرسال بنجاح!",
        "public_list": "جميع الطلبات (عرض عام)",
        "filter_type": "تصفية النوع",
        "filter_dept": "تصفية القسم",
        "filter_status": "تصفية الحالة",
        "search": "بحث (اسم/هاتف/عنوان/رسالة)",
        "download_csv": "تنزيل CSV",
        "download_xlsx": "تنزيل Excel",
        "no_data": "لا توجد بيانات بعد.",
        "admin": "لوحة الإدارة",
        "dept_panel": "لوحة القسم",
        "password": "كلمة المرور",
        "username": "اسم المستخدم",
        "login": "تسجيل الدخول",
        "logout": "تسجيل الخروج",
        "wrong_pw": "اسم المستخدم أو كلمة المرور غير صحيحة.",
        "manage": "إدارة الطلبات",
        "mark_new": "جديد",
        "in_prog": "قيد المعالجة",
        "resolved": "تم الحل",
        "rejected": "رفض",
        "delete": "حذف",
        "download_all": "تنزيل CSV (الكل/المحدد)",
        "export_pdf": "تصدير PDF",
        "wa": "واتساب",
        "sms": "رسالة نصية",
        "dept_config": "إعداد الأقسام",
        "dept_hint": "اختر أو أضف أقسامًا.",
        "current": "القائمة الحالية",
        "add_dept": "إضافة قسم",
        "btn_add_dept": "أضف القسم",
        "btn_reset": "إعادة الضبط",
        "added": "تمت الإضافة",
        "reset": "تمت إعادة الضبط.",
        "caption": "منصة موحدة للطلبات حسب الأقسام",
        "map_view": "عرض الخريطة",
        "login_required": "يلزم تسجيل الدخول للوصول إلى هذا القسم.",
    },
    "ku": {
        "lang_name": "کوردی",
        "submit_tab": "ناردن",
        "list_tab": "لیست",
        "map_tab": "خەریتە",
        "admin_tab": "ئەدمین",
        "dept_panel_tab": "پەڕەی بەش",
        "submit_form": "فۆرمی ناردن",
        "type": "جۆر",
        "department": "بەش",
        "name": "ناوی سێیانە (پڕ)",
        "mobile": "ژمارەی مۆبایل",
        "address": "ناونیشان",
        "details": "وردەکاری",
        "lat": "پانی (ئەرزی) – هەڵبژاردەیی",
        "lon": "درێژی (طولی) – هەڵبژاردەیی",
        "attachments": "هاوپێچەکان (تا ٣)",
        "btn_submit": "بنێرە",
        "fill_all": "تکایە هەموو خانە پێویستان پڕ بکەوە.",
        "bad_mobile": "ژمارەی مۆبایل دروست نییە.",
        "success": "ناردن سەرکەوتوو بوو!",
        "public_list": "هەموو ناردنەکان (بینینی گشتی)",
        "filter_type": "پاڵاوتنی جۆر",
        "filter_dept": "پاڵاوتنی بەش",
        "filter_status": "پاڵاوتنی دۆخ",
        "search": "گەڕان (ناو/مۆبایل/ناونیشان/پەیام)",
        "download_csv": "داگرتنی CSV",
        "download_xlsx": "داگرتنی Excel",
        "no_data": "هیچ توماریک نییە.",
        "admin": "پەڕەی ئەدمین",
        "dept_panel": "پەڕەی بەش",
        "password": "وشەی تێپەڕ",
        "username": "ناوی بەکارهێنەر",
        "login": "چوونەژوور",
        "logout": "چوونەدەرەوە",
        "wrong_pw": "ناوی بەکارهێنەر یان وشەی تێپەڕ هەڵەیە.",
        "manage": "بەڕێوەبردنی ناردنەکان",
        "mark_new": "نوێ",
        "in_prog": "لە جێبەجێکردندا",
        "resolved": "چارەسەر کرا",
        "rejected": "رەد کرا",
        "delete": "سڕینەوە",
        "download_all": "داگرتنی CSV (گشتی/پاڵاوتراو)",
        "export_pdf": "هەناردەی PDF",
        "wa": "WhatsApp",
        "sms": "SMS",
        "dept_config": "ڕێکخستنی بەشەکان",
        "dept_hint": "بەشەکان هەڵبژێرە یان زیاد بکە.",
        "current": "هەنووکە",
        "add_dept": "زیادکردنی بەش",
        "btn_add_dept": "زیادکردن",
        "btn_reset": "گەڕانەوە بۆ بنەڕەت",
        "added": "زیادکرا",
        "reset": "ڕێکخستنەکان گەرانەوە.",
        "caption": "کۆکردنەوەی ناردنەکان بەپێی بەش",
        "map_view": "بینینی خەریتە",
        "login_required": "پێویستە بچیتەژوورەوە بۆ ئەم بەشە.",
    },
}

def t(key: str):
    lang = st.session_state.get("_lang", "en")
    return LANGS.get(lang, LANGS["en"]).get(key, key)

# ---------------------- DB LAYER ----------------------
def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

def init_db():
    con = get_conn()
    cur = con.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            department TEXT NOT NULL,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            address TEXT NOT NULL,
            message TEXT NOT NULL,
            lat REAL,
            lon REAL,
            attachments TEXT,
            status TEXT NOT NULL DEFAULT 'New',
            created_at TEXT NOT NULL
        );
        """
    )
    con.commit()
    con.close()

@st.cache_data(ttl=10)
def load_df():
    con = get_conn()
    df = pd.read_sql_query("SELECT * FROM submissions ORDER BY id DESC", con)
    con.close()
    return df

def insert_submission(payload: dict):
    con = get_conn()
    cur = con.cursor()
    cur.execute(
        """
        INSERT INTO submissions (type, department, name, mobile, address, message, lat, lon, attachments, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload["type"],
            payload["department"],
            payload["name"],
            payload["mobile"],
            payload["address"],
            payload["message"],
            payload.get("lat"),
            payload.get("lon"),
            payload.get("attachments", ""),
            payload.get("status", "New"),
            payload.get("created_at", datetime.utcnow().isoformat()),
        ),
    )
    con.commit()
    con.close()

def update_status(row_id: int, new_status: str):
    con = get_conn()
    cur = con.cursor()
    cur.execute("UPDATE submissions SET status=? WHERE id=?", (new_status, row_id))
    con.commit()
    con.close()

def delete_row(row_id: int):
    con = get_conn()
    cur = con.cursor()
    cur.execute("DELETE FROM submissions WHERE id=?", (row_id,))
    con.commit()
    con.close()

# ---------------------- UTIL ----------------------
def footer_branding():
    st.markdown(
        f"""
        <div style='text-align:center; margin-top:24px; opacity:0.7;'>
            <small>{FOOTER_CREDIT}</small>
        </div>
        """,
        unsafe_allow_html=True,
    )

def mobile_is_valid(value: str) -> bool:
    digits = ''.join(ch for ch in value if ch.isdigit())
    return 9 <= len(digits) <= 15

def save_attachments(files):
    paths = []
    for f in files or []:
        if f is None:
            continue
        fname = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}_{f.name}"
        path = os.path.join(UPLOAD_DIR, fname)
        with open(path, "wb") as out:
            out.write(f.read())
        paths.append(path)
    return ",".join(paths)

def make_excel(df: pd.DataFrame) -> bytes:
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Submissions")
    buf.seek(0)
    return buf.read()

def make_pdf_record(row: pd.Series) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, APP_TITLE, ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 8, f"{FOOTER_CREDIT}", ln=True)
    pdf.ln(4)
    fields = [
        ("ID", row.get("id")),
        ("Type", row.get("type")),
        ("Department", row.get("department")),
        ("Name", row.get("name")),
        ("Mobile", row.get("mobile")),
        ("Address", row.get("address")),
        ("Status", row.get("status")),
        ("Created", row.get("created_at")),
        ("Lat", row.get("lat")),
        ("Lon", row.get("lon")),
        ("Message", row.get("message")),
        ("Attachments", row.get("attachments")),
    ]
    for k, v in fields:
        pdf.set_font("Arial", "B", 12)
        pdf.cell(35, 8, f"{k}:")
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 8, str(v if v is not None else ""))
    out = pdf.output(dest="S").encode("latin-1", errors="ignore")
    return out

def whatsapp_link(mobile: str, text: str) -> str:
    digits = ''.join(ch for ch in mobile if ch.isdigit())
    return f"https://wa.me/{digits}?text={text}"

def sms_link(mobile: str, text: str) -> str:
    return f"sms:{mobile}?body={text}"

# ---------------------- AUTH ----------------------
def require_login(section_locked=True):
    """Render a login box if needed. Return True if authenticated."""
    # Language selector top-right
    top_l, top_r = st.columns([3, 1])
    with top_l:
        st.title(APP_TITLE)
        st.caption(t("caption"))
    with top_r:
        lang = st.selectbox(
            "Language", ["en","ar","ku"],
            format_func=lambda x: LANGS[x]["lang_name"],
            index=["en","ar","ku"].index(st.session_state.get("_lang", "en"))
        )
        st.session_state["_lang"] = lang

    if st.session_state.get("_auth_ok"):
        if st.button(t("logout")):
            st.session_state["_auth_ok"] = False
        return True

    if not section_locked and not RESTRICT_ALL:
        # Allow access without login for public sections
        return True

    st.info(t("login_required"))
    with st.form("login_form"):
        u = st.text_input(t("username"), value="")
        p = st.text_input(t("password"), type="password", value="")
        ok = st.form_submit_button(t("login"))
    if ok:
        if u == AUTH_USERNAME and p == AUTH_PASSWORD:
            st.session_state["_auth_ok"] = True
            st.success("✅ Logged in")
            return True
        else:
            st.error(t("wrong_pw"))
    return st.session_state.get("_auth_ok", False)

# ---------------------- PAGES ----------------------
def page_submit(departments: list[str]):
    st.subheader(t("submit_form"))
    with st.form("submission_form", clear_on_submit=True):
        c1, c2 = st.columns(2)
        with c1:
            entry_type = st.selectbox(t("type"), TYPES, index=0)
            dept = st.selectbox(t("department"), departments, index=0)
            name = st.text_input(t("name"))
        with c2:
            mobile = st.text_input(t("mobile"), placeholder="0770...")
            address = st.text_input(t("address"))
        c3, c4 = st.columns(2)
        with c3:
            lat = st.number_input(t("lat"), value=None, placeholder="e.g. 35.53")
        with c4:
            lon = st.number_input(t("lon"), value=None, placeholder="e.g. 44.83")
        message = st.text_area(t("details"), height=140)
        files = st.file_uploader(t("attachments"), type=["png","jpg","jpeg","pdf","doc","docx"], accept_multiple_files=True)
        submitted = st.form_submit_button(t("btn_submit"))

        if submitted:
            if not name or not mobile or not address or not message or not entry_type or not dept:
                st.error(t("fill_all"))
                return
            if not mobile_is_valid(mobile):
                st.error(t("bad_mobile"))
                return
            file_paths = save_attachments(files[:3] if files else [])
            insert_submission(
                {
                    "type": entry_type,
                    "department": dept,
                    "name": name.strip(),
                    "mobile": mobile.strip(),
                    "address": address.strip(),
                    "message": message.strip(),
                    "lat": float(lat) if lat is not None else None,
                    "lon": float(lon) if lon is not None else None,
                    "attachments": file_paths,
                }
            )
            st.success("✅ " + t("success"))
            load_df.clear()

def page_list():
    st.subheader(t("public_list"))
    df = load_df()
    if df.empty:
        st.info(t("no_data"))
        return

    c1, c2, c3, c4 = st.columns([1,1,1,2])
    with c1:
        f_type = st.multiselect(t("filter_type"), TYPES, default=TYPES)
    with c2:
        f_dept = st.multiselect(t("filter_dept"), sorted(df["department"].unique().tolist()))
    with c3:
        f_status = st.multiselect(t("filter_status"), STATUSES, default=STATUSES)
    with c4:
        query = st.text_input(t("search"))

    q = df.copy()
    if f_type: q = q[q["type"].isin(f_type)]
    if f_dept: q = q[q["department"].isin(f_dept)]
    if f_status: q = q[q["status"].isin(f_status)]
    if query:
        pat = query.strip().lower()
        mask = (
            q["name"].str.lower().str.contains(pat)
            | q["mobile"].str.lower().str.contains(pat)
            | q["address"].str.lower().str.contains(pat)
            | q["message"].str.lower().str.contains(pat)
        )
        q = q[mask]

    st.dataframe(q, use_container_width=True, hide_index=True)

    xlsx_bytes = make_excel(q)
    st.download_button(t("download_xlsx"), data=xlsx_bytes, file_name="submissions.xlsx")
    st.download_button(t("download_csv"), data=q.to_csv(index=False).encode("utf-8"), file_name="submissions.csv", mime="text/csv")

def page_map():
    st.subheader(t("map_view"))
    df = load_df()
    if df.empty or (df[["lat","lon"]].dropna().empty):
        st.info(t("no_data"))
        return
    map_df = df.dropna(subset=["lat","lon"]).copy()
    map_df["lat"] = map_df["lat"].astype(float)
    map_df["lon"] = map_df["lon"].astype(float)
    layer = pdk.Layer(
        "ScatterplotLayer",
        data=map_df,
        get_position='[lon, lat]',
        get_radius=60,
        pickable=True,
    )
    view_state = pdk.ViewState(
        latitude=map_df["lat"].mean(),
        longitude=map_df["lon"].mean(),
        zoom=9,
    )
    st.pydeck_chart(pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{type} – {department}\n{name}\n{address}"}))

def record_controls(row):
    cA, cB, cC, cD, cE = st.columns(5)
    with cA:
        if st.button(t("mark_new"), key=f"new-{row['id']}"):
            update_status(int(row['id']), "New"); load_df.clear(); st.rerun()
    with cB:
        if st.button(t("in_prog"), key=f"prog-{row['id']}"):
            update_status(int(row['id']), "In Progress"); load_df.clear(); st.rerun()
    with cC:
        if st.button(t("resolved"), key=f"res-{row['id']}"):
            update_status(int(row['id']), "Resolved"); load_df.clear(); st.rerun()
    with cD:
        if st.button(t("rejected"), key=f"rej-{row['id']}"):
            update_status(int(row['id']), "Rejected"); load_df.clear(); st.rerun()
    with cE:
        if st.button(t("delete"), key=f"del-{row['id']}"):
            delete_row(int(row['id'])); load_df.clear(); st.rerun()

    msg = st.text_input("Message", value=f"Regarding your submission #{row['id']}", key=f"msg-{row['id']}")
    st.write(f"[{t('wa')}]({whatsapp_link(row['mobile'], msg)}) | [{t('sms')}]({sms_link(row['mobile'], msg)})")

    pdf_bytes = make_pdf_record(row)
    st.download_button(t("export_pdf"), data=pdf_bytes, file_name=f"submission_{row['id']}.pdf")

def page_admin():
    st.subheader(t("admin"))
    if not require_login(section_locked=True):
        st.stop()

    with st.expander(t("dept_config"), expanded=False):
        st.write(t("dept_hint"))
        depts = st.session_state.get("_departments", DEFAULT_DEPARTMENTS.copy())
        st.write(t("current") + ": " + ", ".join(depts))
        new_dept = st.text_input(t("add_dept"))
        c1, c2 = st.columns(2)
        with c1:
            if st.button(t("btn_add_dept")):
                if new_dept and new_dept not in depts:
                    depts.append(new_dept.strip())
                    st.session_state["_departments"] = depts
                    st.success(f"{t('added')}: {new_dept}")
        with c2:
            if st.button(t("btn_reset")):
                st.session_state["_departments"] = DEFAULT_DEPARTMENTS.copy()
                st.warning(t("reset"))

    df = load_df()
    if df.empty:
        st.info(t("no_data"))
        return

    c1, c2, c3 = st.columns(3)
    with c1:
        f_dept = st.multiselect(t("filter_dept"), sorted(df["department"].unique().tolist()))
    with c2:
        f_type = st.multiselect(t("filter_type"), TYPES)
    with c3:
        f_status = st.multiselect(t("filter_status"), STATUSES)

    q = df.copy()
    if f_dept: q = q[q["department"].isin(f_dept)]
    if f_type: q = q[q["type"].isin(f_type)]
    if f_status: q = q[q["status"].isin(f_status)]

    st.write("### " + t("manage"))
    for _, row in q.iterrows():
        with st.expander(f"#{row['id']} • {row['type']} • {row['department']} • {row['name']} • {row['status']}"):
            st.write(f"**{t('mobile')}:** {row['mobile']}")
            st.write(f"**{t('address')}:** {row['address']}")
            st.write(f"**{t('details')}:** {row['message']}")
            if row.get("attachments"):
                st.write("**Attachments:**")
                for p in str(row['attachments']).split(','):
                    if p.strip():
                        st.write(os.path.basename(p))
            record_controls(row)

    csv = q.to_csv(index=False).encode("utf-8")
    st.download_button(t("download_all"), data=csv, file_name="submissions_admin.csv", mime="text/csv")

def page_dept_panel():
    st.subheader(t("dept_panel"))
    if not require_login(section_locked=True):
        st.stop()

    dept = st.selectbox(t("department"), st.session_state.get("_departments", DEFAULT_DEPARTMENTS))
    # Optional per-department password check
    if DEPT_PASSWORDS:
        pw = st.text_input(t("password"), type="password")
        if st.button(t("login"), key="dept-login"):
            if DEPT_PASSWORDS.get(dept) != pw:
                st.error(t("wrong_pw"))
            else:
                st.session_state["dept_ok"] = dept
        if st.session_state.get("dept_ok") != dept:
            st.stop()

    df = load_df()
    q = df[df["department"] == dept]
    if q.empty:
        st.info(t("no_data"))
        return

    for _, row in q.iterrows():
        with st.expander(f"#{row['id']} • {row['type']} • {row['name']} • {row['status']}"):
            st.write(f"**{t('mobile')}:** {row['mobile']}")
            st.write(f"**{t('address')}:** {row['address']}")
            st.write(f"**{t('details')}:** {row['message']}")
            record_controls(row)

# ---------------------- MAIN ----------------------
def main():
    init_db()

    # Language set once (also available on login screen)
    if "_lang" not in st.session_state:
        st.session_state["_lang"] = "en"

    # Public tabs (can be globally restricted via RESTRICT_ALL)
    tabs = st.tabs([
        f"📝 {t('submit_tab')}",
        f"📋 {t('list_tab')}",
        f"🗺️ {t('map_tab')}",
        f"🔐 {t('admin_tab')}",
        f"🏢 {t('dept_panel_tab')}",
    ])

    # Render header + login if needed (for public we pass section_locked=False)
    with tabs[0]:
        if require_login(section_locked=RESTRICT_ALL):
            page_submit(st.session_state.get("_departments", DEFAULT_DEPARTMENTS))
    with tabs[1]:
        if require_login(section_locked=RESTRICT_ALL):
            page_list()
    with tabs[2]:
        if require_login(section_locked=RESTRICT_ALL):
            page_map()
    with tabs[3]:
        page_admin()
    with tabs[4]:
        page_dept_panel()

    footer_branding()

if __name__ == "__main__":
    main()
