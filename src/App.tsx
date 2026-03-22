import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthGuard from "./components/AuthGuard";
import SetupGuide from "./components/SetupGuide";

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
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isConfigured) {
    return <SetupGuide />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Main App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<AllTools />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Tool Routes */}
            <Route path="/tools/compress" element={<CompressImage />} />
            <Route path="/tools/resize" element={<ResizeImage />} />
            <Route path="/tools/crop" element={<CropImage />} />
            <Route path="/tools/convert-to-jpg" element={<ConvertToJpg />} />
            <Route path="/tools/convert-from-jpg" element={<ConvertFromJpg />} />
            <Route path="/tools/image-to-url" element={<ImageToUrl />} />
            <Route path="/tools/image-to-pdf" element={<ImageToPdf />} />
            <Route path="/tools/watermark" element={<WatermarkImage />} />
            <Route path="/tools/rotate" element={<RotateImage />} />
            <Route path="/tools/flip" element={<FlipImage />} />
            <Route path="/tools/merge" element={<MergeImages />} />
            <Route path="/tools/thumbnail" element={<ThumbnailGenerator />} />
            <Route path="/tools/social-media" element={<SocialMediaResizer />} />
            <Route path="/tools/remove-metadata" element={<RemoveMetadata />} />
            <Route path="/tools/base64" element={<Base64Converter />} />
            <Route path="/tools/format-detector" element={<FormatDetector />} />
            <Route path="/tools/grid-splitter" element={<GridSplitter />} />
            <Route path="/tools/add-text" element={<AddText />} />
            <Route path="/tools/filters" element={<ImageFilters />} />
            <Route path="/tools/border" element={<ImageBorder />} />
            <Route path="/tools/metadata" element={<ImageMetadata />} />
            <Route path="/tools/ocr" element={<ImageToText />} />
            <Route path="/tools/favicon" element={<FaviconGenerator />} />
            <Route path="/tools/to-svg" element={<ImageToSvg />} />
            <Route path="/tools/to-ico" element={<ImageToIco />} />
            <Route path="/tools/to-webp" element={<ImageToWebp />} />
            <Route path="/tools/to-png" element={<ImageToPng />} />
            <Route path="/tools/to-bmp" element={<ImageToBmp />} />
            <Route path="/tools/to-tiff" element={<ImageToTiff />} />
            <Route path="/tools/to-gif" element={<ImageToGif />} />
            <Route path="/tools/to-jpg" element={<ImageToJpg />} />
            <Route path="/tools/to-avif" element={<ImageToAvif />} />
            <Route path="/tools/to-heic" element={<ImageToHeic />} />

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
  );
}
