# UR DOC - Healthcare Consultation Platform

A modern healthcare consultation platform built with HTML, CSS, and JavaScript. This is a static website that can be deployed to Vercel or any static hosting service.

## 🚀 Features

- **User Authentication**: Login/Register for patients, doctors, and admins
- **Consultation Management**: Request and manage medical consultations
- **Prescription Tracking**: View and manage prescriptions
- **Admin Dashboard**: Comprehensive admin panel with statistics
- **Responsive Design**: Works on all devices
- **JSON Data Storage**: Uses static JSON files for data (no backend required)

## 📋 Demo Accounts

### Patients
- **john@example.com** / password123
- **sarah@example.com** / password123
- **robert@example.com** / password123
- **lisa@example.com** / password123

### Doctors
- **jane@example.com** / password123 (Cardiology)
- **michael@example.com** / password123 (Dermatology)
- **emily@example.com** / password123 (Pediatrics)
- **david@example.com** / password123 (Neurology)
- **jennifer@example.com** / password123 (Orthopedics)

### Admin
- **admin@example.com** / password123

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd UR-DOC
   ```

2. **Start local server**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - Test page: `http://localhost:8000/test-api.html`

## 🚀 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts**
   - Link to existing project or create new
   - Confirm deployment settings

### Option 2: Deploy via GitHub

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Deploy

### Option 3: Deploy via Vercel Dashboard

1. **Zip your project**
   - Select all files in the root directory
   - Create a ZIP file

2. **Upload to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Choose "Upload"
   - Upload your ZIP file

## 📁 Project Structure

```
UR-DOC/
├── index.html              # Home page
├── login.html              # Login page
├── register.html           # Registration page
├── dashboard.html          # User dashboard
├── admin.html              # Admin panel
├── test-api.html           # API test page
├── vercel.json             # Vercel configuration
├── js/
│   ├── api.js              # JSON data service
│   └── script.js           # Main JavaScript
├── css/
│   └── style.css           # Main stylesheet
├── data/
│   ├── users.json          # User data
│   ├── consultations.json  # Consultation data
│   ├── prescriptions.json  # Prescription data
│   └── notifications.json  # Notification data
└── assets/
    └── logo.jpg            # Logo image
```

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)

The `vercel.json` file includes:
- Static file routing
- CORS headers for JSON data
- Proper file serving configuration

### Customization

1. **Update Data**: Modify JSON files in `/data/` directory
2. **Styling**: Edit `css/style.css`
3. **Functionality**: Modify `js/script.js` and `js/api.js`
4. **Content**: Update HTML files as needed

## 🌐 Live Demo

Once deployed, your site will be available at:
- `https://your-project-name.vercel.app`

## 📱 Features Overview

### For Patients
- Register/Login
- Request consultations
- View consultation history
- Access prescriptions
- Update profile

### For Doctors
- Register/Login
- View consultation requests
- Respond to consultations
- Manage prescriptions
- Update profile

### For Admins
- User management
- System statistics
- Dashboard overview
- Data management

## 🔒 Security Notes

This is a demo application using client-side storage. For production use:
- Implement proper backend authentication
- Use secure API endpoints
- Add data validation
- Implement proper session management
- Use HTTPS

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Contact the development team

---

**Note**: This is a demonstration project. For real healthcare applications, ensure compliance with relevant healthcare regulations and security standards.