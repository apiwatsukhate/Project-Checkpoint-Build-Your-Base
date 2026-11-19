# CS100 Power Up! — Learning Portfolio & Challenge Exchange

เว็บแอปพลิเคชัน Learning Portfolio ที่พัฒนาต่อยอดจาก Checkpoint สำหรับรายวิชา CS100 โดยรองรับการจัดเก็บข้อมูลแบบ Server-side JSON บน AWS EC2 การแลกเปลี่ยน Portfolio Item JSON ระหว่างบูธ Challenge และฟีเจอร์ **Color Challenge (สุ่มสี)**

## ฟีเจอร์หลัก (Features)

- **Portfolio & Item Management:** สร้างโปรไฟล์ Portfolio และเพิ่ม Portfolio Item พร้อมข้อมูล Reflection (`whatIDid`, `whatILearned`, `challenge`, `nextStep`) และลิงก์หลักฐาน (`evidence`)
- **Server-side JSON Storage & Validation:** บันทึกและอ่านข้อมูลผ่าน Node.js/Express Server โดยตรวจสอบความถูกต้องของข้อมูลฝั่ง Server ก่อนบันทึก และเก็บไฟล์ JSON ไว้นอกโฟลเดอร์ที่เปิดเข้าถึงโดยตรงผ่าน URL
- **Color Challenge (สุ่มสี):** สุ่มสีง่ายๆ ที่กำหนดไว้ในระบบ แสดงชื่อสี พร้อมแถบประวัติสีล่าสุด คัดลอกชื่อสี และเติมแท็กสีลงในช่อง `skills` ของฟอร์ม Challenge (`#booth-generator-form`)
- **Challenge Booth & Portfolio Item Exchange:**
  - **Host Booth:** สร้าง Portfolio Item JSON ตามโครงสร้างเดิมจาก Checkpoint สำหรับส่งต่อให้ผู้เข้าร่วม (Copy/Paste หรือดาวน์โหลด `.json`)
  - **Tester Import:** วางหรืออัปโหลด JSON ตรวจสอบ/แก้ไข Reflection เลือก Portfolio ปลายทาง และบันทึกลง Server พร้อมรองรับการ Export เฉพาะ Portfolio ของตนเองเป็น `my-portfolio.json`

## โครงสร้างโปรเจกต์ (Project Structure)

```text
Project-Checkpoint-Build-Your-Base/
├── server.js            # Express server, API routes และ server-side validation
├── package.json         # Dependencies และ scripts
├── .gitignore           # ป้องกันการอัปโหลด node_modules, คีย์ลับ หรือไฟล์ที่ไม่ต้องการขึ้น Git
├── data/                # ไฟล์ข้อมูล JSON (จัดการผ่าน Server)
└── public/
    ├── index.html       # โครงสร้างหน้าเว็บและ UI (Bootstrap 5 + Font Awesome)
    ├── script.js        # Logic หลักของหน้าเว็บและ Color Challenge
    ├── exchange.js      # Logic การสร้าง/Import/Export Portfolio Item JSON
    └── css/
        └── style.css    # สไตล์เพิ่มเติมของหน้าเว็บ
        การติดตั้งและรันในเครื่อง (Local Setup)
โคลน Repository และเข้าสู่โฟลเดอร์โปรเจกต์:

Bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Project-Checkpoint-Build-Your-Base
ติดตั้ง Dependencies:

Bash
npm install
รัน Server:

Bash
npm start
เปิดใช้งานผ่านเบราว์เซอร์ที่:

Plaintext
http://localhost:3000
(หลีกเลี่ยงการเปิดไฟล์ผ่าน file:/// โดยตรง)

การนำไปใช้งานบน AWS EC2 (Deployment)
ตั้งค่า Security Group: เปิดเฉพาะ Port ที่จำเป็น เช่น 22 (SSH) และ Port ของแอปพลิเคชัน เช่น 3000 (หรือ 80/443 หากตั้งค่า Reverse Proxy)

ความปลอดภัยของข้อมูลลับ: ห้ามนำไฟล์คีย์ (.pem / .ppk), AWS Credentials หรือ Passwords ขึ้น GitHub และตรวจสอบ .gitignore ให้เรียบร้อย

รันบน EC2:

Bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Project-Checkpoint-Build-Your-Base
npm install
npm start
(แนะนำให้ใช้ pm2 เช่น pm2 start server.js เพื่อให้ระบบจัดการโปรเซสได้สะดวกและข้อมูล JSON ยังคงอยู่หลัง Restart Server หรือ Reboot EC2)

เข้าใช้งานผ่าน Public IP หรือ Public URL ของ EC2:

Plaintext
http://<EC2_PUBLIC_IP>:3000
การทดสอบระบบเบื้องต้น (Basic Testing Checklist)
Cross-device & Persistence: เพิ่ม/แก้ไขข้อมูลจากเบราว์เซอร์หนึ่ง แล้วเปิดดูจากอีกเบราว์เซอร์/อุปกรณ์ รวมถึงทดสอบ Restart Server หรือ Reboot EC2 เพื่อยืนยันว่าข้อมูลไม่หาย

Server Validation & File Access: ทดสอบส่งข้อมูลไม่ครบหรือไม่ถูกต้องเพื่อดูว่า Server ปฏิเสธได้ และตรวจสอบว่าไม่สามารถดาวน์โหลดไฟล์ JSON ของ Server ผ่าน Public URL โดยตรงได้

Portfolio Item Exchange: ทดสอบทำ Challenge → Generate/Copy JSON → Paste/Import → เลือก Portfolio และปรับ Reflection → Save → Refresh หน้าเว็บเพื่อยืนยันว่าข้อมูลถูกบันทึกและแสดงผลถูกต้อง

Individual Export: ทดสอบ Export เฉพาะ Portfolio ของตนเองเป็น my-portfolio.json หลัง Import รายการจาก Challenge ต่างกลุ่ม

- **GitHub Repository URL:https://github.com/apiwatsukhate/Project-Checkpoint-Build-Your-Base.git
- **รายชื่อสมาชิกกลุ่มและบทบาท:
Group:9
อภิวัชร์ สุขะเต หน้าที่:ดูแลbackend file jsonและโครงสร้างbackendโดยรวมและตรวจเช็ค
ปัณณทัต ปลื้ม หน้าที่:ดูแลภาพรวมfrontend,backend และทำchallenge ตรวจเช็คและปรับแต่งงานโดยรวม
ศุภกร ทำดี หน้าที่:จัดการไฟล์backendช่วยเพื่อนโดยรวมและคอยตรวจเสนอจุดที่ควรปรับแก้ไข
รฎาพร ดู่ป้อง หน้าที่:คิดchallenge และตกแต่งfrontend คอยตรวจงานภาพรวม
ปดิวรัดา ฝ่ายเฉลิมพลี หน้าที่:เขียนตกแต่งfrontend  จัดlayout โครงสร้างไฟล์ โฟล์เดอร์ตามโจทย์
สาริศา อินทมาตร์ หน้าที่: ตกแต่งหน้าและเขียนfrontend และช่วยเพื่อนเสริมโดยรวมเบ็ดตเล็ด

