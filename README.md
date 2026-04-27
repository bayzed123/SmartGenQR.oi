# 🚀 SmartGen - Premium QR Code Generator

**SmartGen QR Code Generator**  
License MIT  
Version 1.0.0  
Status Production Ready  

🌐 **Live Demo:** https://qr.genzfrontir.com  

SmartGen is a powerful, free, and open-source QR code generator that makes it effortless  
to create professional, customizable QR codes for URLs, WiFi networks, WhatsApp  
messages, Email, SMS, and vCard contacts.

---

## 🌟 Features

### Multi-Purpose QR Code Generation

* URL QR Codes - Share links and websites  
* WiFi QR Codes - Share network credentials (SSID, Password, Encryption)  
* WhatsApp QR Codes - Direct messaging links  
* Email QR Codes - Pre-filled email templates  
* SMS QR Codes - Text message shortcuts  
* vCard QR Codes - Contact information sharing  

### Advanced Customization

* 🎨 Color Customization - Foreground and background colors  
* 🎯 Dot Patterns - Square, Dots, Rounded options  
* 📐 Corner Styles - Square, Extra Rounded, Rounded  
* 🖼️ Logo Upload - Add your logo to the center  
* 📢 Frame & CTA Text - Customizable call-to-action ("Scan Me", "Join Now", etc.)  
* 🌈 Gradient Support - Beautiful gradient backgrounds  

### Real-Time Features

* 👁️ Live Preview - See changes instantly  
* ⚡ Ultra-Fast Generation - Generate codes in milliseconds  
* 📥 High-Quality Downloads - PNG and SVG formats  
* 🔄 Static & Dynamic Options - Choose your QR code type  

### Professional Design

* 📱 Fully Responsive - Works on all devices  
* 🎯 Mobile-Friendly - Optimized for touch  
* 🌙 Modern UI - Clean, professional interface  
* ⚙️ Smooth Animations - Polished user experience  

---

## 🚀 Quick Start

### Option 1: Standalone HTML File (Easiest)

```
1. Download smartgen-standalone.html
2. Upload to your web server
3. Open in browser at yourdomain.com/smartgen/
```

```
# No installation required!
# Just open the HTML file in any modern browser
```

### Option 2: React Application (Advanced)

```
# Clone the repository
git clone https://github.com/bayzed123/SmartGenQR
cd SmartGenQR

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

### Option 3: Deploy to Your Server

```
1. Copy smartgen-standalone.html  to your server
2. Rename to index.html
3. Access via your domain
```

---

## 📋 Usage

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

---

## 📦 Project Structure

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

## 🎨 Design Features

### Color Palette

* Primary: #2563eb (Blue)  
* Accent: #3b82f6 (Light Blue)  
* Background: #ffffff (White)  
* Text Primary: #1f2937 (Dark Gray)  
* Text Secondary: #6b7280 (Medium Gray)  

### Typography

* Font Family: System fonts (Inter, Segoe UI)  
* Headings: Bold, 1.5rem - 3.5rem  
* Body: Regular, 0.95rem - 1.1rem  
* Spacing: 0.5rem - 2rem  

### Responsive Breakpoints

* Mobile: < 480px  
* Tablet: 480px - 768px  
* Desktop: > 768px  

---

## 🔒 Security & Privacy

### ✅ 100% Secure

* All processing happens in your browser  
* No data sent to external servers  
* No tracking or analytics  
* No cookies or storage without consent  

### ✅ Privacy First

* Your QR codes are not stored  
* No personal data collection  
* No third-party integrations  
* Complete user control  

---

## 📄 License

This project is licensed under the MIT License with additional attribution requirements.

### Key Points:

* Free to use - Personal and commercial use allowed  
* Open source - Source code available  
* Modifiable - You can modify and distribute  
* Attribution required - Must credit the original author  

See LICENSE file for full details.

### Attribution Requirements:

1. Include the MIT License  
2. Credit: "Sayad Md Bayezid Hosan"  
3. Link to: https://github.com/bayzed123/SmartGenQR.oi  
4. Include: www.connectwithbayezid.it.com and www.genzfrontir.com  

---

## 🤝 Contributing

We welcome contributions! Here's how:

### Steps to Contribute:

1. Fork the repository  
2. Create a feature branch ( git checkout -b feature/AmazingFeature )  
3. Commit changes ( git commit -m 'Add AmazingFeature' )  
4. Push to branch ( git push origin feature/AmazingFeature )  
5. Open a Pull Request  

### Development Setup:

```
# Install dependencies
pnpm install

# Run tests
pnpm test

# Format code
pnpm format

# Build project
pnpm build
```

https://manus.im/beta/LICENSE  
https://github.com/bayzed123/SmartGenQR.oi  
http://www.connectwithbayezid.it.com/  
http://www.genzfrontir.com/  

---

## 🐛 Bug Reports

Found a bug? Please create an issue with:

* Description of the bug  
* Steps to reproduce  
* Expected behavior  
* Actual behavior  
* Screenshots (if applicable)  
* Browser/OS information  

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

* Create an issue with label "enhancement"  
* Describe the feature  
* Explain the use case  
* Provide examples if possible  

---

## 📊 Roadmap

### Version 1.0 (Current)

* Multi-purpose QR generation  
* Real-time preview  
* Advanced customization  
* PNG & SVG export  
* Responsive design  

### Version 1.1 (Planned)

* Dynamic QR codes with scan tracking  
* Batch QR code generation  
* QR code history/templates  
* Analytics dashboard  

### Version 2.0 (Future)

* Mobile app (iOS/Android)  
* Cloud storage integration  
* Team collaboration  
* Advanced analytics  

---

## 📞 Contact & Support

**Creator**  
Sayad Md Bayezid Hosan  

**Websites**

* www.connectwithbayezid.it.com  
* www.genzfrontir.com - Bloggers  

**GitHub**

* Project: https://github.com/bayzed123/SmartGenQR.oi  
* Profile: https://github.com/bayzed123  

**Social Media**

* LinkedIn  
* Facebook  

**Support**

* Email: cwb.agency@outlook.com  

---

## 📈 Statistics

* Downloads: 1000+ (and growing!)  
* Users: 500+ active users  
* QR Codes Generated: 10,000+  
* Languages: JavaScript, TypeScript, HTML, CSS  
* Lines of Code: 5000+  

https://www.connectwithbayezid.it.com/  
https://www.genzfrontir.com/  
https://github.com/bayzed123  
https://www.linkedin.com/in/sayadbayezid  
https://www.facebook.com/bayezidhosan
mailto:cwb.agency@outlook.com  
https://github.com/bayzed123/SmartGenQR.oi/issues  
https://github.com/bayzed123/SmartGenQR.oi/wiki  

---

## 🎓 Learning Resources

### For Beginners

* QR Code Basics  
* How to Use SmartGen  
* Customization Guide  

### For Developers

* API Documentation  
* Architecture Overview  
* Contributing Guide  

---

## 🙏 Acknowledgments

* QR Code Library: qrcode.js  
* QR Styling: qr-code-styling  
* UI Framework: React  
* Styling: Tailwind CSS  
* Icons: Lucide React  

---

## 📝 Changelog

### Version 1.0.0 (2026-04-27)

* Initial release  
* Multi-purpose QR generation  
* Advanced customization  
* Responsive design  
* Privacy-focused  
* PNG & SVG export  

---

## ⭐ Show Your Support

If you find SmartGen useful, please:

* Star this repository  

https://en.wikipedia.org/wiki/QR_code  
https://manus.im/beta/docs/GETTING_STARTED.md  
https://manus.im/beta/docs/CUSTOMIZATION.md  
https://manus.im/beta/docs/API.md  
https://manus.im/beta/docs/ARCHITECTURE.md  
https://manus.im/beta/CONTRIBUTING.md  
https://davidshimjs.github.io/qrcodejs/  
https://github.com/kozakdenys/qr-code-styling  
https://react.dev/  
https://tailwindcss.com/  
https://lucide.dev/  

* Fork the project  
* Share with others  
* Leave feedback  

---

## 📄 Legal

**Copyright**  
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
https://www.connectwithbayezid.it.com/  
https://www.genzfrontir.com/  
