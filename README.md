# 🚩 GFGKIIT CTF Platform

<div align="center">
  <img src="https://img.shields.io/badge/CTF-Platform-red?style=for-the-badge&logo=flag" alt="CTF Platform">
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js Express">
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">
</div>

<div align="center">
  <h3>A Full-Stack Capture The Flag Platform for Internal Hackathons</h3>
  <img src="https://res.cloudinary.com/dzabseimd/image/upload/v1748451444/Screenshot_2025-05-28_222626_waqj1x.png" alt="Website Image" width=auto>
</div>

---

## 🌟 Overview

GFGKIIT CTF Platform is a comprehensive web application designed specifically for organizing and managing Capture The Flag competitions within our college community. This platform was developed to host internal hackathons and cybersecurity challenges, providing an engaging and competitive environment for students to test their skills.

## ✨ Key Features

### 🎯 **Competition Management**
- **Live CTF Control**: Start and stop competitions with real-time effect
- **Submission Control**: Automatic submission blocking when CTF is stopped
- **Question Management**: Dynamic addition and deletion of challenges
- **CTF Reset**: Complete platform reset for new competitions

### 👥 **User Experience**
- **Secure Authentication**: Powered by PassportJS for reliable user management
- **Live Leaderboard**: Real-time ranking updates with intelligent tie-breaking algorithm
- **Responsive Design**: Bootstrap-powered interface that works on all devices
- **Intuitive Navigation**: Clean, user-friendly interface built with EJS templating

### 🔧 **Admin Dashboard**
- **Live Activity Monitor**: Real-time tracking of user activities and submissions
- **Competition Control Panel**: Easy-to-use controls for CTF management
- **User Management**: Comprehensive admin tools for user oversight
- **Analytics Dashboard**: Insights into competition progress and participant engagement

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | Express.js | Server framework and API endpoints |
| **Frontend** | EJS + Bootstrap | Dynamic templating and responsive UI |
| **Database** | MongoDB | User data and challenge storage |
| **Authentication** | PassportJS | Secure user authentication |
| **Deployment** | Vercel | Cloud hosting and deployment |

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/DebSaha141/GFGKIITCTFPlatform.git
   cd gfgkiit-ctf-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   PORT=3000
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Access the platform**
   Open your browser and navigate to `http://localhost:3000`

## 📱 Features Deep Dive

### 🏆 **Leaderboard System**
Our sophisticated leaderboard features:
- **Real-time Updates**: Instant score reflection
- **Tie-Breaking Algorithm**: Fair resolution of tied scores
- **Historical Tracking**: Complete submission history
- **Performance Metrics**: Detailed user statistics

### 🎮 **CTF Management**
- **Dynamic Challenge Loading**: Add/remove challenges on the fly
- **Time-based Controls**: Precise start/stop functionality
- **Submission Validation**: Automated answer checking
- **Progress Tracking**: Monitor participant advancement

### 🔐 **Security Features**
- **Authenticated Sessions**: Secure user sessions
- **Role-based Access**: Admin and participant roles
- **Input Validation**: Protection against common attacks
- **Secure Password Handling**: Encrypted password storage

## 🌐 Live Demo

The platform is live and deployed on Vercel! Experience the full functionality at:
**[GFGKIIT CTF Platform - Live Demo](https://gfgkiitctf.vercel.app/)**

## 📊 Platform Statistics

- ⚡ **Real-time Updates**: Live leaderboard and activity monitoring
- 🔒 **Secure Authentication**: PassportJS integration
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- ⚙️ **Admin Controls**: Complete CTF lifecycle management

## 🎯 Use Cases

- **College CTF Competitions**: Internal cybersecurity challenges
- **Hackathon Events**: Programming and problem-solving contests
- **Educational Workshops**: Learning-focused competitive programming
- **Recruitment Drives**: Technical assessment and screening

## 🤝 Contributing

We welcome contributions from the GFGKIIT community! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


##

<div align="center">
  <p><em>Built with ❤️ for GeeksforGeeks KIIT Student Chapter By Debmalya Saha</em></p>
</div>
