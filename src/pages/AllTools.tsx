import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Minimize2,
  Maximize2,
  FileType2,
  Link as LinkIcon,
  Image as ImageIcon,
  Crop as CropIcon,
  FileText,
  Droplet,
  RotateCw,
  FlipHorizontal,
  Layers,
  Youtube,
  Share2,
  Shield,
  FileImage,
  FileStack,
  Type,
  Grid,
  Code,
  Search,
  Zap,
  Sparkles,
  EyeOff,
  ScanText,
  ArrowUpCircle,
  Scissors,
  Palette,
  Frame,
  Info,
  Box,
  Film,
  Smartphone,
  CheckCircle2,
  QrCode,
  Scan,
  Type as TextIcon
} from "lucide-react";
import ToolCard from "../components/ui/ToolCard";

export default function AllTools() {
  const location = useLocation();
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const savedSection = sessionStorage.getItem("lastSection");
    const savedScroll = sessionStorage.getItem("lastScroll");

    if (savedSection && categoryRefs.current[savedSection]) {
      categoryRefs.current[savedSection]?.scrollIntoView({ behavior: "auto", block: "start" });
      // Clear after restoration to avoid sticky behavior
      sessionStorage.removeItem("lastSection");
      sessionStorage.removeItem("lastScroll");
    } else if (savedScroll) {
      window.scrollTo(0, parseInt(savedScroll));
      sessionStorage.removeItem("lastSection");
      sessionStorage.removeItem("lastScroll");
    }
  }, []);

  const categories = [
    {
      id: "quick-tools",
      title: "Quick Tools",
      description: "Fast, essential image edits for daily use.",
      tools: [
        { title: "Compress Image", description: "Reduce file size while maintaining quality.", icon: Minimize2, to: "/tools/compress" },
        { title: "Resize Image", description: "Change dimensions by pixels or percentage.", icon: Maximize2, to: "/tools/resize" },
        { title: "Crop Image", description: "Crop your images to the exact size you need.", icon: CropIcon, to: "/tools/crop" },
        { title: "Rotate Image", description: "Rotate your images to any angle.", icon: RotateCw, to: "/tools/rotate" },
        { title: "Flip Image", description: "Mirror your images horizontally or vertically.", icon: FlipHorizontal, to: "/tools/flip" },
        { title: "Convert to JPG", description: "Convert any image format to JPG.", icon: FileType2, to: "/tools/to-jpg" },
        { title: "Convert from JPG", description: "Convert JPG images to other formats.", icon: ImageIcon, to: "/tools/from-jpg" },
        { title: "WebP Converter", description: "Convert to and from modern WebP format.", icon: Zap, to: "/tools/webp-converter" },
      ],
    },
    {
      id: "document-tools",
      title: "Document-style Image Tools",
      description: "Manage images for documents and PDF workflows.",
      tools: [
        { title: "Image to PDF", description: "Convert images into a single PDF document.", icon: FileText, to: "/tools/image-to-pdf" },
        { title: "Merge Images to PDF", description: "Combine multiple images into one PDF.", icon: FileStack, to: "/tools/merge-to-pdf" },
        { title: "PDF to Image", description: "Extract images from PDF files.", icon: ImageIcon, to: "/tools/pdf-to-image" },
      ],
    },
    {
      id: "creator-tools",
      title: "Creator Tools",
      description: "Visual content creation for social media and design.",
      tools: [
        { title: "Thumbnail Generator", description: "Create professional thumbnails with text and effects.", icon: Youtube, to: "/tools/thumbnail" },
        { title: "Watermark Image", description: "Protect your work with text or logo watermarks.", icon: Droplet, to: "/tools/watermark" },
        { title: "Merge Images", description: "Combine multiple images into one layout.", icon: Layers, to: "/tools/merge" },
        { title: "Social Media Resizer", description: "Resize images for all social platforms.", icon: Smartphone, to: "/tools/social-resizer" },
        { title: "Instagram Grid Splitter", description: "Split images into a grid for your feed.", icon: Grid, to: "/tools/grid-splitter" },
        { title: "Text to Image", description: "Create graphics from text with custom styles.", icon: TextIcon, to: "/tools/text-to-image" },
      ],
    },
    {
      id: "developer-tools",
      title: "Developer Image Tools",
      description: "Technical utilities for developers and power users.",
      tools: [
        { title: "Favicon Generator", description: "Create multi-size icons for websites.", icon: Sparkles, to: "/tools/favicon" },
        { title: "Metadata Viewer", description: "View detailed EXIF and hidden metadata.", icon: Info, to: "/tools/metadata" },
        { title: "Metadata Remover", description: "Strip EXIF data and hidden info from images.", icon: Shield, to: "/tools/remove-metadata" },
        { title: "Format Detector", description: "Identify the real format of any image file.", icon: Search, to: "/tools/format-detector" },
        { title: "QR Code Generator", description: "Create custom QR codes for URLs and more.", icon: QrCode, to: "/tools/qr-generator" },
        { title: "QR Code Scanner", description: "Scan and decode QR codes from images.", icon: Scan, to: "/tools/qr-scanner" },
      ],
    },
    {
      id: "hosting-utility",
      title: "Hosting / Utility",
      description: "Utilities for image hosting and web integration.",
      tools: [
        { title: "Image to URL", description: "Host your images and get shareable links.", icon: LinkIcon, to: "/tools/image-to-url" },
        { title: "Base64 Converter", description: "Convert images to Base64 strings for web.", icon: Code, to: "/tools/base64" },
      ],
    },
    {
      id: "coming-soon",
      title: "Coming Soon",
      description: "Exciting new tools currently in development.",
      tools: [
        { title: "Background Remover", description: "AI-powered background removal.", icon: Scissors, to: "#" },
        { title: "Image Enhancer", description: "Upscale and improve image quality.", icon: Sparkles, to: "#" },
        { title: "Image Translator", description: "Translate text within images.", icon: ScanText, to: "#" },
        { title: "OCR Advanced", description: "Handwriting and complex layout OCR.", icon: ScanText, to: "#" },
      ],
    },
  ];

  const handleToolClick = (sectionId: string, sectionTitle: string) => {
    sessionStorage.setItem("lastSection", sectionId);
    sessionStorage.setItem("lastScroll", window.scrollY.toString());
    sessionStorage.setItem("lastSectionTitle", sectionTitle);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
          All <span className="text-amber-500 text-stroke-sm text-transparent">Tools</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg font-medium text-zinc-400">
          Explore our complete suite of professional image processing tools.
          All processing happens in your browser for maximum privacy.
        </p>
      </div>

      <div className="space-y-20">
        {categories.map((category) => (
          <div 
            key={category.id} 
            id={category.id}
            ref={(el) => (categoryRefs.current[category.id] = el)}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-24"
          >
            <div className="mb-8 border-l-4 border-amber-500 pl-6">
              <h2 className="text-3xl font-black tracking-tight text-white">
                {category.title}
              </h2>
              <p className="mt-2 text-zinc-400 font-medium">
                {category.description}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.tools.map((tool) => (
                <div key={tool.title} onClick={() => handleToolClick(category.id, category.title)}>
                  <ToolCard {...tool} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
