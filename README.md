# Velocity Admin Panel

Velocity Admin Panel is a comprehensive, modern dashboard built to manage the Velocity application ecosystem. It provides administrators with powerful tools to oversee products, orders, customers, delivery partners, and content, all seamlessly integrated with a real-time Firebase backend.

## 🚀 Features

- **Authentication:** Secure Login and Signup workflows powered by Firebase Auth.
- **Dashboard & Analytics:** Real-time metrics and interactive charts using Recharts.
- **Product Management:** Full CRUD operations for products and categories.
- **Order Management:** Track, manage, and update customer orders efficiently.
- **User Management:** Oversee both customers and delivery partners from dedicated interfaces.
- **Content Management:** Manage app banners, dynamic content, and promotional offers.
- **Data Import/Export:** Built-in capabilities to parse and export data using `xlsx` and `papaparse`.
- **Inventory & Payments:** Track stock levels and view payment statuses.
- **Notifications & Reviews:** Manage system notifications and monitor customer feedback.

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 with Vite for lightning-fast development.
- **Styling:** Tailwind CSS v4 for fully responsive and customizable utility-first styling.
- **Routing:** React Router v7 for seamless page navigation.
- **Backend/BaaS:** Firebase 12 (Auth, Firestore, Storage) for real-time data and file management.
- **Icons:** Lucide React for consistent and beautiful iconography.
- **Charts:** Recharts for data visualization.
- **Toast Notifications:** React Hot Toast for elegant feedback messages.

## 📁 Project Structure

- `src/pages`: Contains all the main views (Dashboard, Products, Orders, Customers, Analytics, Settings, etc.).
- `src/components`: Reusable UI components.
- `src/contexts`: React Context providers for state management (e.g., Auth context).
- `src/services`: API interactions and Firebase configurations.

## ⚙️ Getting Started

### Prerequisites

Ensure you have Node.js and npm (or yarn) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Manav111111/velocity-adminpanel.git
   ```
2. Navigate to the project directory:
   ```bash
   cd velocity-adminpanel
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the App Locally

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

## 🤝 Contribution

Feel free to open an issue or submit a pull request if you find any bugs or want to add new features.
