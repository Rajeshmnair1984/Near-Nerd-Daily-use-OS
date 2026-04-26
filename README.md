# Near Nerd Operations Portal

A premium business expense management system built with React, Vite, and Supabase.

## 🚀 Features

- **Dashboard**: High-level overview of operational expenses.
- **Bill Management**: Track and manage bills with real-time status updates.
- **Interactive Calendar**: Visualize payment dates at a glance.
- **Proactive Alerts**: Color-coded notifications for upcoming and overdue payments.

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Database**: Supabase
- **Hosting**: Vercel
- **Styling**: Vanilla CSS (Custom Design System)

## 📋 Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase_schema.sql` and run it.
4. Go to **Project Settings > API** to find your `URL` and `anon public key`.

### 2. Environment Variables

Create a `.env` file in the root directory and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Local Development

```bash
npm install
npm run dev
```

### 4. Testing

```bash
npm test           # Run tests in watch mode
npm run test:ui    # Interactive Vitest UI
npm run test:coverage # Generate coverage report
```

### 5. Deploy to Vercel

1. Connect your GitHub repository to [Vercel](https://vercel.com/).
2. During the project setup, add the following Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **Deploy**.

## 📄 License

MIT
