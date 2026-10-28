import os

filepath = r'd:\GAUTAM CURRENT March 2026 nihal\afsana full project\frontend\src\components\Lead & Inquiry Management\Inquriy.jsx'

with open(filepath, 'rb') as f:
    content = f.read().decode('utf-8')

# Target lines in handleAddInquiry (around line 1049)
target = '      priority: newInquiry.priority,'
replacement = '      priority: newInquiry.priority,\r\n      lead_status: "Converted to Lead",\r\n      new_leads: "New Lead",'

if target in content:
    new_content = content.replace(target, replacement)
    with open(filepath, 'wb') as f:
        f.write(new_content.encode('utf-8'))
    print("Successfully updated Inquriy.jsx")
else:
    # Try without \r if it was already normalized
    target_clean = '      priority: newInquiry.priority,'
    replacement_clean = '      priority: newInquiry.priority,\n      lead_status: "Converted to Lead",\n      new_leads: "New Lead",'
    if target_clean in content:
         new_content = content.replace(target_clean, replacement_clean)
         with open(filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
         print("Successfully updated Inquriy.jsx (Unix styles)")
    else:
        print("Target string not found in Inquriy.jsx")

# Also update InquiryForm.jsx
auth_filepath = r'd:\GAUTAM CURRENT March 2026 nihal\afsana full project\frontend\src\authtication\InquiryForm.jsx'
if os.path.exists(auth_filepath):
    with open(auth_filepath, 'rb') as f:
        content = f.read().decode('utf-8')
    if target in content:
        new_content = content.replace(target, replacement)
        with open(auth_filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
        print("Successfully updated InquiryForm.jsx")
    elif target_clean in content:
         new_content = content.replace(target_clean, replacement_clean)
         with open(auth_filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
         print("Successfully updated InquiryForm.jsx (Unix styles)")
    else:
        print("Target string not found in InquiryForm.jsx")
