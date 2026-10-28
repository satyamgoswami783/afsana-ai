import os

# Update Inquriy.jsx
filepath = r'd:\GAUTAM CURRENT March 2026 nihal\afsana full project\frontend\src\components\Lead & Inquiry Management\Inquriy.jsx'

with open(filepath, 'rb') as f:
    content = f.read().decode('utf-8')

target = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\r\n      if (response.status === 201) {'
replacement = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\r\n      if (response.status === 201 || response.status === 200) {\r\n        const newInquiryId = response.data.inquiryId || response.data.id;\r\n        if (newInquiryId) {\r\n          try {\r\n            await api.patch(`${BASE_URL}fee/update-lesd-status`, {\r\n              id: newInquiryId,\r\n              lead_status: "Converted to Lead",\r\n            });\r\n          } catch (err) {\r\n            console.error("Failed to force update status:", err);\r\n          }\r\n        }'

if target in content:
    new_content = content.replace(target, replacement)
    with open(filepath, 'wb') as f:
        f.write(new_content.encode('utf-8'))
    print("Successfully updated Inquriy.jsx (Double-call strategy)")
else:
    # Try Unix style
    target_clean = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\n      if (response.status === 201) {'
    replacement_clean = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\n      if (response.status === 201 || response.status === 200) {\n        const newInquiryId = response.data.inquiryId || response.data.id;\n        if (newInquiryId) {\n          try {\n            await api.patch(`${BASE_URL}fee/update-lesd-status`, {\n              id: newInquiryId,\n              lead_status: "Converted to Lead",\n            });\n          } catch (err) {\n            console.error("Failed to force update status:", err);\n          }\n        }'
    if target_clean in content:
        new_content = content.replace(target_clean, replacement_clean)
        with open(filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
        print("Successfully updated Inquriy.jsx (Unix Double-call)")
    else:
        print("Target string for Double-call not found in Inquriy.jsx")

# Update TodaysInqiury.jsx
today_filepath = r'd:\GAUTAM CURRENT March 2026 nihal\afsana full project\frontend\src\components\Lead & Inquiry Management\TodaysInqiury.jsx'
with open(today_filepath, 'rb') as f:
    content = f.read().decode('utf-8')

target = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\r\n      if (response.status === 200) {'
replacement = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\r\n      if (response.status === 200 || response.status === 201) {\r\n        const newInquiryId = response.data.inquiryId || response.data.id;\r\n        if (newInquiryId) {\r\n          try {\r\n            await api.patch(`${BASE_URL}fee/update-lesd-status`, {\r\n              id: newInquiryId,\r\n              lead_status: "Converted to Lead",\r\n            });\r\n          } catch (err) {\r\n            console.error("Failed to force update status:", err);\r\n          }\r\n        }'

if target in content:
    new_content = content.replace(target, replacement)
    with open(today_filepath, 'wb') as f:
        f.write(new_content.encode('utf-8'))
    print("Successfully updated TodaysInqiury.jsx (Double-call)")
else:
    target_clean = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\n      if (response.status === 200) {'
    replacement_clean = '      const response = await api.post(`${BASE_URL}inquiries`, requestData);\n      if (response.status === 200 || response.status === 201) {\n        const newInquiryId = response.data.inquiryId || response.data.id;\n        if (newInquiryId) {\n          try {\n            await api.patch(`${BASE_URL}fee/update-lesd-status`, {\n              id: newInquiryId,\n              lead_status: "Converted to Lead",\n            });\n          } catch (err) {\n            console.error("Failed to force update status:", err);\n          }\n        }'
    if target_clean in content:
        new_content = content.replace(target_clean, replacement_clean)
        with open(today_filepath, 'wb') as f:
            f.write(new_content.encode('utf-8'))
        print("Successfully updated TodaysInqiury.jsx (Unix Double-call)")
    else:
        print("Target string for Double-call not found in TodaysInqiury.jsx")
