import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import SetupGuide from "./components/SetupGuide";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { isSupabaseConfigured } from "./lib/supabaseClient";

// Layouts
import MainLayout from "./components/layout/MainLayout";

// Pages
import Home from "./pages/Home";
import AllTools from "./pages/AllTools";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompressImage from "./pages/tools/CompressImage";
import ResizeImage from "./pages/tools/ResizeImage";
import ConvertToJpg from "./pages/tools/ConvertToJpg";
import ConvertFromJpg from "./pages/tools/ConvertFromJpg";
import ImageToUrl from "./pages/tools/ImageToUrl";
import CropImage from "./pages/tools/CropImage";
import ImageToPdf from "./pages/tools/ImageToPdf";
import WatermarkImage from "./pages/tools/WatermarkImage";
import RotateImage from "./pages/tools/RotateImage";
import FlipImage from "./pages/tools/FlipImage";
import MergeImages from "./pages/tools/MergeImages";
import ThumbnailGenerator from "./pages/tools/ThumbnailGenerator";
import SocialMediaResizer from "./pages/tools/SocialMediaResizer";
import RemoveMetadata from "./pages/tools/RemoveMetadata";
import Base64Converter from "./pages/tools/Base64Converter";
import FormatDetector from "./pages/tools/FormatDetector";
import GridSplitter from "./pages/tools/GridSplitter";
import AddText from "./pages/tools/AddText";
import ImageFilters from "./pages/tools/ImageFilters";
import ImageBorder from "./pages/tools/ImageBorder";
import ImageMetadata from "./pages/tools/ImageMetadata";
import ImageToText from "./pages/tools/ImageToText";
import FaviconGenerator from "./pages/tools/FaviconGenerator";
import ImageToSvg from "./pages/tools/ImageToSvg";
import ImageToIco from "./pages/tools/ImageToIco";
import ImageToWebp from "./pages/tools/ImageToWebp";
import ImageToPng from "./pages/tools/ImageToPng";
import ImageToBmp from "./pages/tools/ImageToBmp";
import ImageToTiff from "./pages/tools/ImageToTiff";
import ImageToGif from "./pages/tools/ImageToGif";
import ImageToJpg from "./pages/tools/ImageToJpg";
import ImageToAvif from "./pages/tools/ImageToAvif";
import ImageToHeic from "./pages/tools/ImageToHeic";

// Admin
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFeedback from "./pages/admin/Feedback";
import AdminTools from "./pages/admin/ToolSettings";

export default function App() {
  // Show setup guide when Supabase env vars are missing
  // isSupabaseConfigured is evaluated at build time by Vite
  if (!isSupabaseConfigured) {
    return <SetupGuide />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin Login (outside MainLayout) */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Main App Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
              <Route path="/tools" element={<ErrorBoundary><AllTools /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
              <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />

              {/* Tool Routes */}
              <Route path="/tools/compress" element={<ErrorBoundary><CompressImage /></ErrorBoundary>} />
              <Route path="/tools/resize" element={<ErrorBoundary><ResizeImage /></ErrorBoundary>} />
              <Route path="/tools/crop" element={<ErrorBoundary><CropImage /></ErrorBoundary>} />
              <Route path="/tools/convert-to-jpg" element={<ErrorBoundary><ConvertToJpg /></ErrorBoundary>} />
              <Route path="/tools/convert-from-jpg" element={<ErrorBoundary><ConvertFromJpg /></ErrorBoundary>} />
              <Route path="/tools/image-to-url" element={<ErrorBoundary><ImageToUrl /></ErrorBoundary>} />
              <Route path="/tools/image-to-pdf" element={<ErrorBoundary><ImageToPdf /></ErrorBoundary>} />
              <Route path="/tools/watermark" element={<ErrorBoundary><WatermarkImage /></ErrorBoundary>} />
              <Route path="/tools/rotate" element={<ErrorBoundary><RotateImage /></ErrorBoundary>} />
              <Route path="/tools/flip" element={<ErrorBoundary><FlipImage /></ErrorBoundary>} />
              <Route path="/tools/merge" element={<ErrorBoundary><MergeImages /></ErrorBoundary>} />
              <Route path="/tools/thumbnail" element={<ErrorBoundary><ThumbnailGenerator /></ErrorBoundary>} />
              <Route path="/tools/social-media" element={<ErrorBoundary><SocialMediaResizer /></ErrorBoundary>} />
              <Route path="/tools/remove-metadata" element={<ErrorBoundary><RemoveMetadata /></ErrorBoundary>} />
              <Route path="/tools/base64" element={<ErrorBoundary><Base64Converter /></ErrorBoundary>} />
              <Route path="/tools/format-detector" element={<ErrorBoundary><FormatDetector /></ErrorBoundary>} />
              <Route path="/tools/grid-splitter" element={<ErrorBoundary><GridSplitter /></ErrorBoundary>} />
              <Route path="/tools/add-text" element={<ErrorBoundary><AddText /></ErrorBoundary>} />
              <Route path="/tools/filters" element={<ErrorBoundary><ImageFilters /></ErrorBoundary>} />
              <Route path="/tools/border" element={<ErrorBoundary><ImageBorder /></ErrorBoundary>} />
              <Route path="/tools/metadata" element={<ErrorBoundary><ImageMetadata /></ErrorBoundary>} />
              <Route path="/tools/ocr" element={<ErrorBoundary><ImageToText /></ErrorBoundary>} />
              <Route path="/tools/favicon" element={<ErrorBoundary><FaviconGenerator /></ErrorBoundary>} />
              <Route path="/tools/to-svg" element={<ErrorBoundary><ImageToSvg /></ErrorBoundary>} />
              <Route path="/tools/to-ico" element={<ErrorBoundary><ImageToIco /></ErrorBoundary>} />
              <Route path="/tools/to-webp" element={<ErrorBoundary><ImageToWebp /></ErrorBoundary>} />
              <Route path="/tools/to-png" element={<ErrorBoundary><ImageToPng /></ErrorBoundary>} />
              <Route path="/tools/to-bmp" element={<ErrorBoundary><ImageToBmp /></ErrorBoundary>} />
              <Route path="/tools/to-tiff" element={<ErrorBoundary><ImageToTiff /></ErrorBoundary>} />
              <Route path="/tools/to-gif" element={<ErrorBoundary><ImageToGif /></ErrorBoundary>} />
              <Route path="/tools/to-jpg" element={<ErrorBoundary><ImageToJpg /></ErrorBoundary>} />
              <Route path="/tools/to-avif" element={<ErrorBoundary><ImageToAvif /></ErrorBoundary>} />
              <Route path="/tools/to-heic" element={<ErrorBoundary><ImageToHeic /></ErrorBoundary>} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <AuthGuard>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="feedback" element={<AdminFeedback />} />
                      <Route path="tools" element={<AdminTools />} />
                    </Routes>
                  </AuthGuard>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
