# Frontend - Sistem Laporan Aduan

Frontend untuk sistem laporan aduan menggunakan Next.js, TypeScript, dan Tailwind CSS.

## 🚀 Fitur

- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Authentication**: JWT-based dengan role management
- **State Management**: React Query untuk server state
- **UI Components**: Headless UI + Tailwind untuk komponen yang accessible
- **Form Handling**: React Hook Form dengan validasi
- **File Upload**: Drag & drop dengan preview
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Polling untuk update status aduan
- **Dashboard**: Grafik dan statistik menggunakan Chart.js

## 📋 Prerequisites

- Node.js (v16 atau lebih tinggi)
- npm atau yarn
- Backend API running

## 🛠 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_APP_NAME=Sistem Laporan Aduan
   NODE_ENV=development
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📁 Struktur Project

```
src/
├── components/
│   ├── layout/
│   │   ├── Layout.tsx         # Main layout wrapper
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── common/
│   │   ├── Button.tsx         # Reusable button component
│   │   ├── Modal.tsx          # Modal component
│   │   ├── Table.tsx          # Data table component
│   │   └── LoadingSpinner.tsx # Loading states
│   └── forms/
│       ├── ComplaintForm.tsx  # Form create/edit aduan
│       ├── LoginForm.tsx      # Login form
│       └── UserForm.tsx       # User management form
├── hooks/
│   ├── useAuth.tsx           # Authentication hook
│   ├── useComplaints.ts      # Complaint data hooks
│   └── useUsers.ts           # User management hooks
├── lib/
│   ├── api.ts                # API client
│   └── utils.ts              # Utility functions
├── pages/
│   ├── _app.tsx              # App wrapper with providers
│   ├── index.tsx             # Landing/redirect page
│   ├── login.tsx             # Login page
│   ├── admin/                # Admin pages
│   ├── simrs/                # SIMRS pages
│   ├── teknisi/              # Teknisi pages
│   └── ruangan/              # Ruangan pages
├── styles/
│   └── globals.css           # Global styles + Tailwind
├── types/
│   └── index.ts              # TypeScript type definitions
└── utils/
    ├── constants.ts          # App constants
    └── helpers.ts            # Helper functions
```

## 🔐 Role-based Pages

### Admin (`/admin/*`)
- **Dashboard**: Statistik lengkap, grafik, overview
- **Complaints**: Semua aduan dengan filter advanced
- **Users**: CRUD user management
- **Settings**: Konfigurasi sistem

### SIMRS (`/simrs/*`)
- **Complaints**: Aduan pending verifikasi
- **Verify**: Form verifikasi aduan
- **Technicians**: Assign teknisi ke aduan

### Teknisi (`/teknisi/*`)
- **Dashboard**: Aduan assigned dan statistik personal
- **Complaints**: Aduan yang ditugaskan
- **Tasks**: Task management dan update status

### Ruangan (`/ruangan/*`)
- **Dashboard**: Overview aduan milik sendiri
- **Complaints**: Daftar aduan yang dibuat
- **Create**: Form buat aduan baru dengan upload

## 🎨 UI Components

### Layout Components
```tsx
// Main layout dengan sidebar dan navigation
<Layout title="Page Title">
  <YourPageContent />
</Layout>

// Protected route wrapper
export default withAuth(YourComponent, ['admin', 'simrs']);
```

### Form Components
```tsx
// Form dengan validation
const form = useForm<FormData>();

<form onSubmit={form.handleSubmit(onSubmit)}>
  <input 
    {...form.register('email', { required: 'Email required' })}
    className="form-input"
  />
  {form.errors.email && (
    <p className="form-error">{form.errors.email.message}</p>
  )}
</form>
```

### Data Fetching
```tsx
// Using React Query hooks
const { data, loading, error } = useComplaints(filters);
const createMutation = useCreateComplaint();

// Submit new complaint
const handleSubmit = (data) => {
  createMutation.mutate(data);
};
```

## 🔄 State Management

### Authentication State
```tsx
const { user, login, logout, loading } = useAuth();

// Check if authenticated
if (!user) return <LoginPage />;

// Check role
const isAdmin = user.role === 'admin';
```

### Server State (React Query)
```tsx
// Fetch complaints with caching
const { data: complaints } = useComplaints({
  status: 'pending',
  page: 1,
  limit: 10
});

// Optimistic updates
const mutation = useMutation(updateComplaint, {
  onSuccess: () => {
    queryClient.invalidateQueries(['complaints']);
  }
});
```

## 📱 Responsive Design

### Breakpoints (Tailwind)
- **sm**: 640px (Small tablets)
- **md**: 768px (Tablets)
- **lg**: 1024px (Laptops)
- **xl**: 1280px (Desktops)

### Mobile-first Approach
```css
/* Mobile default */
.container { padding: 1rem; }

/* Tablet and up */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}
```

## 🎯 Key Features

### File Upload
- Drag & drop interface
- Image preview
- Progress indicator
- File type validation (PDF, DOC, images)
- Size limit (5MB)

### Real-time Updates
- Auto-refresh complaint status
- Toast notifications
- Optimistic UI updates

### Form Validation
- Client-side validation with React Hook Form
- Server-side error handling
- Accessible error messages

### Data Tables
- Sortable columns
- Pagination
- Search and filtering
- Bulk actions (admin only)

## 🎨 Styling System

### Custom CSS Classes
```css
/* Buttons */
.btn-primary    /* Primary button */
.btn-secondary  /* Secondary button */
.btn-danger     /* Danger button */

/* Forms */
.form-input     /* Input fields */
.form-label     /* Labels */
.form-error     /* Error messages */

/* Status Badges */
.badge-pending     /* Yellow badge */
.badge-approved    /* Green badge */
.badge-rejected    /* Red badge */
.badge-processing  /* Blue badge */
.badge-completed   /* Green badge */

/* Priority Badges */
.priority-low      /* Gray badge */
.priority-medium   /* Yellow badge */
.priority-high     /* Red badge */
```

### Color Palette
```css
--primary-600: #2563eb    /* Main brand color */
--success-600: #16a34a    /* Success states */
--warning-600: #d97706    /* Warning states */
--danger-600: #dc2626     /* Error states */
```

## 📊 Dashboard Features

### Admin Dashboard
- Total complaints overview
- Status distribution charts
- Monthly trend graphs
- Technician performance metrics
- Recent activity feed

### Role-specific Dashboards
- Personalized statistics
- Quick actions
- Relevant notifications
- Performance indicators

## 🧪 Development

### Available Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # TypeScript checking
```

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Husky for git hooks

## 🚀 Deployment

### Build Process
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_NAME=Sistem Laporan Aduan
NODE_ENV=production
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://react-query.tanstack.com/)
- [React Hook Form](https://react-hook-form.com/)
- [Headless UI](https://headlessui.dev/)

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request
