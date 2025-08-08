# People Connect – Citizen Submissions (Professional)

**Prepared by Shvan Qaraman**

A professional Streamlit app for collecting and managing **Complaints, Suggestions, Projects, and Requests**, organized by department.
Includes multilingual UI (Kurdish/Arabic/English), login, Excel/PDF export, and a map view.

## Quickstart (Local)
```bash
pip install -r requirements.txt
streamlit run app.py
```
Login: **username `shvan`**, **password `shvan`**.

## Streamlit Cloud Deploy (recommended)
1) Push this folder to a GitHub repo (e.g. `citizen-submissions-pro`).  
2) Create a new Streamlit app and select `app.py`.  
3) In **Secrets**, paste the contents of `.streamlit/secrets.toml` (edit if needed).  
4) Press **Deploy**.

## Files
- `app.py` – main app
- `requirements.txt` – dependencies
- `.streamlit/secrets.toml` – credentials & config (DON'T COMMIT THIS)
- `scripts/deploy.sh` – helper script to run locally
- `uploads/` – local file storage (ephemeral on Streamlit Cloud)

## Notes
- On Streamlit Cloud, uploaded files are not permanent. For persistence, integrate S3/Cloud Storage later.
