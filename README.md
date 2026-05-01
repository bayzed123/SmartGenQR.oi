# 🚀 SmartGen - Premium QR Code Generator

![SmartGen Logo](https://i.postimg.cc/J4tdfLr2/Smart-Gen-Logo-Modern.png)

**SmartGen** is a modern, fast, and privacy-focused QR code generator built for professionals, developers, and everyday users.  
Create beautifully styled, fully customizable QR codes in seconds — directly in your browser.

🌐 **Live Demo:** https://qr.genzfrontir.com  

---

## ✨ Why SmartGen?

SmartGen isn’t just another QR generator — it’s a **complete design + utility toolkit**.

* ⚡ **Instant Generation** – Real-time preview as you type  
* 🎨 **Full Customization** – Colors, gradients, patterns, logos  
* 🔒 **Privacy First** – 100% client-side processing  
* 📱 **Responsive UI** – Works perfectly on all devices  
* 🚀 **Blazing Fast** – Optimized for performance  

---

## 🌟 Features

### 🔹 Multi-Purpose QR Code Support

Generate QR codes for:

* 🌐 URL (Websites & Links)  
* 📶 WiFi (SSID, Password, Encryption)  
* 💬 WhatsApp Messages  
* 📧 Email (Pre-filled templates)  
* 📩 SMS Messages  
* 👤 vCard (Contact Info)  

---

### 🎨 Advanced Customization

* Foreground & Background Colors  
* Gradient Support  
* Dot Styles (Square, Dots, Rounded)  
* Corner Styles (Square, Rounded, Extra Rounded)  
* Logo Upload (Center branding)  
* Custom Frames & CTA Text ("Scan Me", "Join Now")  

---

### ⚡ Real-Time Experience

* 👁️ Live Preview  
* ⚡ Ultra-fast generation (milliseconds)  
* 📥 Export as PNG & SVG  
* 🔄 Static & Dynamic QR support (future-ready)  

---

### 💼 Professional UI/UX

* Clean & modern interface  
* Smooth animations  
* Mobile-first design  
* Touch optimized  

---

## 🚀 Get Started

### 🔗 Use Online
👉 https://qr.genzfrontir.com  

---

### 📦 Quick Deployment (Standalone)

```bash
1. Download smartgen-standalone.html
2. Upload to your server
3. Rename to index.html
4. Open in browser
```

✅ No installation required!

---

### ⚛️ Run as React App

```bash
# Clone repo
git clone https://github.com/bayzed123/SmartGenQR

# Go to project
cd SmartGenQR

# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build production
pnpm build
```

---

## 🧑‍💻 Developer Usage
### For End Users
1. Select QR Type - Choose from URL, WiFi, WhatsApp, Email, SMS, or vCard 
 2. Enter Data - Fill in the required information 
 3. Customize Design - Choose colors, patterns, and styles 
 4. Preview - See your QR code in real-time 
 5. Download - Export as PNG or SVG  
### For Developers
**HTML/JavaScript**
```html
 <!-- Include the standalone file -->
 <iframe src="smartgen-standalone.html"></iframe>
 ```
**React Integration**
```jsx
 import Generator from './pages/Generator';
export default function App( ) {
   return <Generator />;
 }
 ```
**QR Code Generation**
```javascript
 // Using the QRCode library
 const qrCode = new QRCode(element, {
   text: "https://example.com",
   width: 300,
   height: 300,
   colorDark: "#000000",
   colorLight: "#ffffff"
 } );
 ```
---
## 🛠️ Technology Stack
### Frontend
* React 19 - UI Framework 
 * TypeScript - Type Safety 
 * Tailwind CSS 4 - Styling 
 * QR Code Styling - Advanced QR customization 
 * Vite - Build Tool  
### Backend
* Express 4 - Server Framework 
 * tRPC 11 - Type-safe APIs 
 * Drizzle ORM - Database Management 
 * MySQL/TiDB - Database  
### Libraries
* qrcode.js - QR Code Generation 
 * qr-code-styling - Advanced Styling 
 * Lucide React - Icons 
 * Shadcn/UI - UI Components  

### Project Structure 
```
 smartgen-qr-generator/
 ├── client/
 │   ├── src/
 │   │   ├── pages/
 │   │   │   ├── Home.tsx          # Landing page
 │   │   │   ├── Generator.tsx     # QR generator
 │   │   │   └── NotFound.tsx      # 404 page
 │   │   ├── components/           # Reusable components
 │   │   ├── contexts/             # React contexts
 │   │   ├── App.tsx               # Main app
 │   │   └── index.css             # Global styles
 │   └── index.html                # HTML template
 ├── server/
 │   ├── routers.ts                # tRPC routes
 │   ├── db.ts                     # Database queries
 │   └── _core/                    # Core infrastructure
 ├── drizzle/
 │   ├── schema.ts                 # Database schema
 │   └── migrations/               # Database migrations
 ├── smartgen-standalone.html      # Standalone version
 ├── LICENSE                       # MIT License
 ├── README.md                     # This file
 └── package.json                  # Dependencies
 ```

---

### Basic QR Example

```javascript
const qrCode = new QRCode(element, {
  text: "https://example.com",
  width: 300,
  height: 300,
  colorDark: "#000000",
  colorLight: "#ffffff"
});
```

---

## 🛠️ Tech Stack

### Frontend
* React 19  
* TypeScript  
* Tailwind CSS 4  
* Vite  

### Backend
* Express 4  
* tRPC  
* Drizzle ORM  
* MySQL / TiDB  

### Libraries
* qrcode.js  
* qr-code-styling  
* Lucide Icons  
* ShadCN UI  

---

## 🔒 Security & Privacy

✅ 100% Client-Side Processing  
✅ No data collection  
✅ No tracking  
✅ No cookies without consent  

> Your data never leaves your device.

---

## 📊 Project Stats

* 👥 Users: 500+  
* 📥 Downloads: 1000+  
* 🔢 QR Codes Generated: 10,000+  
* 🧾 Lines of Code: 5000+  

---

## 🗺️ Roadmap

### 🔹 v1.1 (Next)
* Dynamic QR codes  
* Scan tracking  
* Batch generation  
* Templates  

### 🔹 v2.0 (Future)
* Mobile apps (iOS & Android)  
* Cloud sync  
* Team collaboration  
* Advanced analytics  

---

## 🤝 Contributing

We welcome contributors!

```bash
git checkout -b feature/AmazingFeature
git commit -m "feat: Add AmazingFeature"
git push origin feature/AmazingFeature
```

Then open a Pull Request 🚀

---

## 🐛 Bug Reports

Include:

* Description  
* Steps to reproduce  
* Expected vs actual result  
* Screenshots  
* Device/Browser info  

---

## 💡 Feature Requests

Open an issue with:

* Idea description  
* Use case  
* Example (optional)  

---

## 📄 License

Licensed under the **MIT License**

✔ Free for personal & commercial use  
✔ Modification allowed  
✔ Attribution required  

---

## 👨‍💻 Creator

**Sayad Md Bayezid Hosan**

🌐 https://www.connectwithbayezid.it.com  
📰 https://www.genzfrontir.com  

---

## 📞 Contact

* 📧 Email: cwb.agency@outlook.com  
* 💼 LinkedIn: https://www.linkedin.com/in/sayadbayezid  
* 📘 Facebook: https://www.facebook.com/bayezidhosan  

---

## 🙏 Acknowledgments

* qrcode.js  
* qr-code-styling  
* React  
* Tailwind CSS  
* Lucide Icons  

---

## ⭐ Support the Project

If you like SmartGen:

* ⭐ Star the repo  
* 🍴 Fork it  
* 📢 Share it  
* 💬 Give feedback  

---

## ⚖️ Legal
 © 2026 SmartGen. All Rights Reserved.  
Developed by Sayad Md Bayezid Hosan  
**Disclaimer** 
 This software is provided "as is" without warranty. The author is not liable for any damages 
 or issues arising from the use of this software.  
**Trademark** 
 "SmartGen" is a trademark of Sayad Md Bayezid Hosan. You may not use the SmartGen 
 name for derivative works without permission.  
Made with ❤️ by Sayad Md Bayezid Hosan  
Visit: www.connectwithbayezid.it.com | www.genzfrontir.com  
 https://www.connectwithbayezid.it.com/ 
 https://www.genzfrontir.com/ 
  
---

### ❤️ Built with passion by Sayad Md Bayezid Hosan
**A GenZ Frontier Project**
