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

// Tools
import CompressImage from "./pages/tools/CompressImage";
import ResizeImage from "./pages/tools/ResizeImage";
import CropImage from "./pages/tools/CropImage";
import ConvertToJpg from "./pages/tools/ConvertToJpg";
import ConvertFromJpg from "./pages/tools/ConvertFromJpg";
import ImageToUrl from "./pages/tools/ImageToUrl";
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
import WebpConverter from "./pages/tools/WebpConverter";

// New tools
import QRCodeGenerator from "./pages/tools/QRCodeGenerator";
import QRCodeScanner from "./pages/tools/QRCodeScanner";
import TextToImage from "./pages/tools/TextToImage";

// Admin
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminFeedback from "./pages/admin/Feedback";
import AdminTools from "./pages/admin/ToolSettings";

const W = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupGuide />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route element={<MainLayout />}>
              <Route path="/" element={<W><Home /></W>} />
              <Route path="/tools" element={<W><AllTools /></W>} />
              <Route path="/login" element={<W><Login /></W>} />
              <Route path="/signup" element={<W><Signup /></W>} />

              {/* Core tools */}
              <Route path="/tools/compress" element={<W><CompressImage /></W>} />
              <Route path="/tools/resize" element={<W><ResizeImage /></W>} />
              <Route path="/tools/crop" element={<W><CropImage /></W>} />
              <Route path="/tools/rotate" element={<W><RotateImage /></W>} />
              <Route path="/tools/flip" element={<W><FlipImage /></W>} />
              <Route path="/tools/merge" element={<W><MergeImages /></W>} />
              <Route path="/tools/watermark" element={<W><WatermarkImage /></W>} />

              {/* Convert */}
              <Route path="/tools/convert-to-jpg" element={<W><ConvertToJpg /></W>} />
              <Route path="/tools/convert-from-jpg" element={<W><ConvertFromJpg /></W>} />
              <Route path="/tools/to-webp" element={<W><ImageToWebp /></W>} />
              <Route path="/tools/webp-converter" element={<W><WebpConverter /></W>} />
              <Route path="/tools/to-png" element={<W><ImageToPng /></W>} />
              <Route path="/tools/to-jpg" element={<W><ImageToJpg /></W>} />
              <Route path="/tools/to-bmp" element={<W><ImageToBmp /></W>} />
              <Route path="/tools/to-tiff" element={<W><ImageToTiff /></W>} />
              <Route path="/tools/to-gif" element={<W><ImageToGif /></W>} />
              <Route path="/tools/to-avif" element={<W><ImageToAvif /></W>} />
              <Route path="/tools/to-heic" element={<W><ImageToHeic /></W>} />
              <Route path="/tools/to-svg" element={<W><ImageToSvg /></W>} />
              <Route path="/tools/to-ico" element={<W><ImageToIco /></W>} />

              {/* Document & URL */}
              <Route path="/tools/image-to-url" element={<W><ImageToUrl /></W>} />
              <Route path="/tools/image-to-pdf" element={<W><ImageToPdf /></W>} />
              <Route path="/tools/base64" element={<W><Base64Converter /></W>} />

              {/* Social & resize */}
              <Route path="/tools/social-media" element={<W><SocialMediaResizer /></W>} />
              <Route path="/tools/thumbnail" element={<W><ThumbnailGenerator /></W>} />
              <Route path="/tools/grid-splitter" element={<W><GridSplitter /></W>} />

              {/* QR */}
              <Route path="/tools/qr-generator" element={<W><QRCodeGenerator /></W>} />
              <Route path="/tools/qr-scanner" element={<W><QRCodeScanner /></W>} />

              {/* Text & creative */}
              <Route path="/tools/text-to-image" element={<W><TextToImage /></W>} />
              <Route path="/tools/add-text" element={<W><AddText /></W>} />
              <Route path="/tools/filters" element={<W><ImageFilters /></W>} />
              <Route path="/tools/border" element={<W><ImageBorder /></W>} />

              {/* Analysis */}
              <Route path="/tools/metadata" element={<W><ImageMetadata /></W>} />
              <Route path="/tools/remove-metadata" element={<W><RemoveMetadata /></W>} />
              <Route path="/tools/format-detector" element={<W><FormatDetector /></W>} />
              <Route path="/tools/ocr" element={<W><ImageToText /></W>} />
              <Route path="/tools/favicon" element={<W><FaviconGenerator /></W>} />

              {/* Admin */}
              <Route path="/admin/*" element={
                <AuthGuard>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="feedback" element={<AdminFeedback />} />
                    <Route path="tools" element={<AdminTools />} />
                  </Routes>
                </AuthGuard>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
