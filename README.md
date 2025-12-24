# FileGuard AI

**Advanced ML-Based Malware Detection System**

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

FileGuard AI is a sophisticated real-time ransomware detection and monitoring system. It leverages machine learning algorithms to analyze file behavior patterns, modification rates, and entropy changes to detect potential threats before they cause damage.

🔗 **Live Demo**: [https://Sonu9526.github.io/sentinel-watch-ai/](https://Sonu9526.github.io/sentinel-watch-ai/)

## 🚀 Key Features

- **Real-time Monitoring**: Tracks file system events including creations, modifications, and renames.
- **ML-Based Detection**: Uses a Random Forest model trained on ransomware signatures to classify behavior.
- **Behavioral Analysis**: Monitors entropy changes and high-frequency modification patterns.
- **Instant Alerts**: Real-time notifications for suspicious activities via Supabase Realtime.
- **Dashboard**: A comprehensive dashboard built with Shadcn UI for monitoring system status and alerts.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Shadcn UI, Tailwind CSS
- **Backend/Database**: Supabase (Auth, Postgres, Realtime)
- **State Management**: TanStack Query
- **Routing**: React Router (HashRouter for GitHub Pages support)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Sonu9526/sentinel-watch-ai.git
    cd sentinel-watch-ai
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

## 🌐 Deployment

This project is configured for deployment on **GitHub Pages**.

To deploy updates manually:
1.  Push changes to the `main` branch.
2.  The GitHub Actions workflow will automatically build and deploy the site.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
