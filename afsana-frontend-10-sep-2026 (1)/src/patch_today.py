import os

# Update TodaysInqiury.jsx
today_filepath = r'd:\GAUTAM CURRENT March 2026 nihal\afsana full project\frontend\src\components\Lead & Inquiry Management\TodaysInqiury.jsx'

with open(today_filepath, 'rb') as f:
    content = f.read().decode('utf-8')

target = '      preferred_countries: newInquiry.preferredCountries,'
replacement = '      preferred_countries: newInquiry.preferredCountries,\r\n      lead_status: "Converted to Lead",\r\n      new_leads: "New Lead",'

if target in content:
    new_content = content.replace(target, replacement)
    with open(today_filepath, 'wb') as f:
        f.write(new_content.encode('utf-8'))
    print("Successfully updated TodaysInqiury.jsx")
else:
    target_clean = '      preferred_countries: newInquiry.preferredCountries,'
    replacement_clean = '      preferred_countries: newInquiry.preferredCountries,\n      lead_status: "Converted to Lead",\n      new_leads: "New Lead",'
    if target_clean in content:
         new_content = content.replace(target_clean, replacement_clean)
         with open(today_filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
         print("Successfully updated TodaysInqiury.jsx (Unix styles)")
    else:
        print("Target string not found in TodaysInqiury.jsx")
