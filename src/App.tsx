import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { Navbar } from './components/ui/Navbar';
import { GalleryPage } from './pages/GalleryPage';
import { UploadPage } from './pages/UploadPage';
import { AdminPage } from './pages/AdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Animated mesh background */}
        <div className="mesh-bg">
          <div className="mesh-orb" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<GalleryPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/[0.05] py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
              <p>NoteVault — Academic File Sharing Platform</p>
              <p>Built for students, by students ✦</p>
            </div>
          </footer>
        </div>

        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(15, 21, 37, 0.95)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#e2e8f0',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
