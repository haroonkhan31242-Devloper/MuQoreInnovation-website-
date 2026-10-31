import React, { useState } from 'react';
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Upload,
  ArrowRight,
  Loader2,
  Download,
  AlertCircle,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const AILabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

  // Image Generation State (gemini-nano-banana-2.1)
  const [imagePrompt, setImagePrompt] = useState('Futuristic cybernetic core with glowing electric blue circuitry and floating holographic nodes');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [inputImageBase64, setInputImageBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Video Animation State (gemini-omni-1.1-flash)
  const [videoPrompt, setVideoPrompt] = useState('Smooth cinematic camera push-in with pulsating quantum particles and subtle ambient light flares');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoInputBase64, setVideoInputBase64] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Handle image upload for editing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'image') {
        setInputImageBase64(result);
      } else {
        setVideoInputBase64(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Image Generation
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImage(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: imageAspectRatio,
          base64Image: inputImageBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Image generation failed');
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      setImageError(err.message || 'Failed to generate image. Please check API credentials or try a different prompt.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Submit Video Generation (gemini-omni-1.1-flash via Interactions API)
  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) return;
    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideo(null);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
          base64Image: videoInputBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Video generation failed');
      }

      setGeneratedVideo(data.videoUrl);
    } catch (err: any) {
      setVideoError(err.message || 'Failed to animate video. Video generation requires an active Gemini API key with Omni access.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MuQore AI Innovation Studio</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Next-Gen Multimodal AI Sandbox
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
            Experience our integrated artificial intelligence capabilities in action: synthesize high-resolution imagery with <strong className="text-cyan-500 font-mono">gemini-nano-banana-2.1</strong> and animate photos into cinema-grade video via <strong className="text-cyan-500 font-mono">gemini-omni-1.1-flash</strong>.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('image')}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'image'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Create & Edit Images (gemini-nano-banana-2.1)</span>
            </button>

            <button
              onClick={() => setActiveTab('video')}
              className={`px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'video'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Animate Image into Video (gemini-omni-1.1-flash)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Image Generation & Editing */}
        {activeTab === 'image' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-500 block mb-1">
                  Model: gemini-nano-banana-2.1
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  High-Fidelity Image Generation & Editing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Generate hyper-detailed visuals or upload an existing image to modify it with descriptive natural language.
                </p>
              </div>

              {/* Prompt Input */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Creative Prompt
                </label>
                <textarea
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate or how to edit the uploaded reference..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Sample Prompts */}
              <div>
                <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Try prompt preset:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Futuristic quantum core with glowing electric blue cybernetic rings and deep navy backdrop',
                    'High-tech server room with sleek glass reflections and data stream filaments',
                    'Ultra-modern digital agency workspace with ambient 3D hologram projections',
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImagePrompt(p)}
                      className="text-[10px] text-left p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                    >
                      {p.slice(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setImageAspectRatio(ratio)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono transition-colors ${
                        imageAspectRatio === ratio
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Reference Image Upload for Editing */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Upload Reference Photo (Optional - for image editing)
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-500" />
                    <span>Choose File...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'image')}
                    />
                  </label>
                  {inputImageBase64 && (
                    <div className="flex items-center gap-2">
                      <img
                        src={inputImageBase64}
                        alt="Reference thumbnail"
                        className="w-10 h-10 object-cover rounded-lg border border-cyan-500"
                      />
                      <button
                        onClick={() => setInputImageBase64(null)}
                        className="text-[11px] text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="w-full py-3.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Image with gemini-nano-banana-2.1...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Image</span>
                  </>
                )}
              </button>

              {imageError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{imageError}</span>
                </div>
              )}
            </div>

            {/* Output Visual Area */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[380px] bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
              {isGeneratingImage ? (
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto" />
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Running neural synthesis via gemini-nano-banana-2.1...
                  </p>
                </div>
              ) : generatedImage ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="w-full max-h-[440px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center bg-black">
                    <img
                      src={generatedImage}
                      alt="AI Generated"
                      className="max-h-[440px] w-auto object-contain"
                    />
                  </div>
                  <a
                    href={generatedImage}
                    download="muqore-ai-generated.png"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-3 text-slate-400 dark:text-slate-500 max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-xs">
                    Your generated image will be rendered here at high resolution.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Animate Image into Video */}
        {activeTab === 'video' && (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070c18] p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-500 block mb-1">
                  Model: gemini-omni-1.1-flash via Interactions API
                </span>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Animate Image into Cinema Video
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Upload a photo or concept frame, define camera motion and environmental kinetics, and generate a fluid video.
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  1. Upload Photo to Animate *
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="cursor-pointer px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-cyan-500 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4 text-cyan-500" />
                    <span>Upload Image Frame...</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'video')}
                    />
                  </label>

                  {/* Or use logo as preset */}
                  <button
                    type="button"
                    onClick={() => {
                      setVideoInputBase64('/public/assets/aistudio/WhatsApp_Image_2026-10-28_at_11.23.39_AM__1__32561e21.jpeg');
                    }}
                    className="text-xs font-mono text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Use MuQore 3D Logo Crest
                  </button>
                </div>

                {videoInputBase64 && (
                  <div className="mt-3 flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={videoInputBase64}
                      alt="Initial Frame"
                      className="w-14 h-14 object-cover rounded-lg border border-cyan-500/50"
                    />
                    <div className="flex-1">
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold block">
                        Source Frame Ready
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Starting frame for Omni video synthesis
                      </span>
                    </div>
                    <button
                      onClick={() => setVideoInputBase64(null)}
                      className="text-xs text-red-500 hover:underline px-2"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Motion Prompt */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  2. Motion & Camera Trajectory Prompt *
                </label>
                <textarea
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe camera movement (pan, push-in, orbital) and animation kinetics..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Aspect Ratio (strictly 16:9 or 9:16 as requested) */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  3. Video Aspect Ratio (Landscape / Portrait)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-mono transition-colors ${
                      videoAspectRatio === '16:9'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    16:9 (Landscape HD)
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`py-2.5 px-4 rounded-xl text-xs font-mono transition-colors ${
                      videoAspectRatio === '9:16'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    9:16 (Portrait Mobile)
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateVideo}
                disabled={isGeneratingVideo || !videoPrompt.trim()}
                className="w-full py-3.5 rounded-xl font-semibold text-xs text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 shadow-md shadow-cyan-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGeneratingVideo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Video with gemini-omni-1.1-flash...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" />
                    <span>Animate Video</span>
                  </>
                )}
              </button>

              {videoError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{videoError}</span>
                </div>
              )}
            </div>

            {/* Video Player Output Area */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center min-h-[380px] bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
              {isGeneratingVideo ? (
                <div className="text-center space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto" />
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    Executing gemini-omni-1.1-flash video diffusion via Interactions API...
                  </p>
                  <span className="text-[11px] text-slate-400 block">
                    (Generating temporal keyframes; may take 30-90 seconds)
                  </span>
                </div>
              ) : generatedVideo ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  <video
                    src={generatedVideo}
                    controls
                    autoPlay
                    loop
                    className="w-full max-h-[440px] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-black"
                  />
                  <a
                    href={generatedVideo}
                    download="muqore-animated-video.mp4"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4 Video</span>
                  </a>
                </div>
              ) : (
                <div className="text-center space-y-3 text-slate-400 dark:text-slate-500 max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400">
                    <Video className="w-8 h-8" />
                  </div>
                  <p className="text-xs">
                    Your generated video will appear here with native HTML5 playback controls.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
