import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Droplets, Sprout, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SoilAnalysis {
  dominantColor: string;
  colorName: string;
  advice: string;
  recommendations: string[];
  phEstimate: string;
}

const analyzeSoilColor = (imageData: ImageData): SoilAnalysis => {
  const data = imageData.data;
  const colorCounts: { [key: string]: number } = {};
  let totalPixels = 0;

  // Sample pixels (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Categorize colors into soil color ranges
    let colorCategory = "";
    
    // Dark brown/black (rich organic matter)
    if (r < 80 && g < 80 && b < 80) {
      colorCategory = "dark";
    }
    // Brown (good organic matter)
    else if (r > 80 && r < 150 && g > 60 && g < 120 && b > 40 && b < 100) {
      colorCategory = "brown";
    }
    // Red/Orange (iron-rich, acidic)
    else if (r > 150 && g < 100 && b < 80) {
      colorCategory = "red";
    }
    // Yellow (sandy, low organic matter)
    else if (r > 180 && g > 150 && b < 100) {
      colorCategory = "yellow";
    }
    // Gray (poor drainage, low organic matter)
    else if (r > 100 && r < 180 && g > 100 && g < 180 && b > 100 && b < 180 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
      colorCategory = "gray";
    }
    // Light/White (sandy, low nutrients)
    else if (r > 200 && g > 200 && b > 200) {
      colorCategory = "light";
    }
    else {
      colorCategory = "mixed";
    }
    
    if (colorCategory) {
      colorCounts[colorCategory] = (colorCounts[colorCategory] || 0) + 1;
      totalPixels++;
    }
  }

  // Find dominant color
  let dominantColor = "mixed";
  let maxCount = 0;
  for (const [color, count] of Object.entries(colorCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }

  // Generate advice based on color
  const getAdvice = (color: string): Omit<SoilAnalysis, "dominantColor"> => {
    switch (color) {
      case "dark":
        return {
          colorName: "Dark Brown/Black",
          advice: "Your soil appears rich in organic matter! This is excellent for plant growth.",
          recommendations: [
            "Continue adding compost to maintain organic matter levels",
            "This soil type retains moisture well - monitor watering",
            "Ideal for most crops - maintain with regular organic amendments",
          ],
          phEstimate: "6.0 - 7.0 (Neutral to slightly acidic)",
        };
      case "brown":
        return {
          colorName: "Brown",
          advice: "Good soil quality with moderate organic matter content.",
          recommendations: [
            "Add compost or well-rotted manure to improve fertility",
            "Consider cover crops to maintain soil health",
            "Regular soil testing recommended for optimal nutrient balance",
          ],
          phEstimate: "6.5 - 7.5 (Neutral)",
        };
      case "red":
        return {
          colorName: "Red/Orange",
          advice: "Iron-rich soil, typically indicates good drainage but may be acidic.",
          recommendations: [
            "Test soil pH - may need lime to raise pH if too acidic",
            "Good for crops that prefer well-drained soil",
            "Add organic matter to improve water retention",
          ],
          phEstimate: "5.0 - 6.5 (Acidic)",
        };
      case "yellow":
        return {
          colorName: "Yellow/Sandy",
          advice: "Sandy soil with low organic matter. May need improvement for better crop yields.",
          recommendations: [
            "Add significant amounts of compost and organic matter",
            "Consider adding clay or loam to improve water retention",
            "Use mulch to prevent nutrient leaching",
            "Frequent, light watering may be needed",
          ],
          phEstimate: "6.0 - 7.0 (Variable)",
        };
      case "gray":
        return {
          colorName: "Gray",
          advice: "Gray soil may indicate poor drainage or low organic matter.",
          recommendations: [
            "Improve drainage with raised beds or soil amendments",
            "Add organic matter to improve soil structure",
            "Consider soil aeration if compacted",
            "Test for waterlogging issues",
          ],
          phEstimate: "6.5 - 7.5 (Neutral)",
        };
      case "light":
        return {
          colorName: "Light/White",
          advice: "Very sandy or chalky soil with low nutrient content.",
          recommendations: [
            "Heavy organic matter additions needed",
            "Consider adding topsoil or loam",
            "Frequent fertilization may be necessary",
            "Use slow-release fertilizers to prevent leaching",
          ],
          phEstimate: "7.0 - 8.5 (Alkaline if chalky)",
        };
      default:
        return {
          colorName: "Mixed",
          advice: "Your soil shows mixed characteristics. A professional soil test is recommended.",
          recommendations: [
            "Conduct a comprehensive soil test for accurate analysis",
            "Consider the location and drainage of the area",
            "Observe plant growth patterns for additional clues",
          ],
          phEstimate: "Variable - testing recommended",
        };
    }
  };

  const advice = getAdvice(dominantColor);
  
  return {
    dominantColor,
    ...advice,
  };
};

export const SoilPhotoCapture = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<SoilAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/jpeg");
        setImage(imageUrl);
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              setImage(img.src);
              analyzeImage(imageData);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = (imageData: ImageData) => {
    setIsAnalyzing(true);
    // Simulate analysis time
    setTimeout(() => {
      const result = analyzeSoilColor(imageData);
      setAnalysis(result);
      setIsAnalyzing(false);
    }, 1000);
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    stopCamera();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Camera className="mr-2 h-4 w-4" />
          Analyze Soil Color
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Soil Color Analysis</DialogTitle>
          <DialogDescription>
            Capture or upload a photo of your soil to get personalized farming advice based on color analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!image ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {stream && (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    <Button onClick={capturePhoto} size="lg" className="rounded-full">
                      <Camera className="h-6 w-6" />
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="destructive"
                      size="lg"
                      className="rounded-full"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img src={image} alt="Soil sample" className="w-full rounded-lg" />
                <Button
                  onClick={reset}
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isAnalyzing ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Analyzing soil color...</p>
                  </CardContent>
                </Card>
              ) : analysis ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5" />
                      Analysis Results
                    </CardTitle>
                    <CardDescription>
                      Dominant Color: <span className="font-semibold">{analysis.colorName}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">{analysis.advice}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Estimated pH Range
                      </h4>
                      <p className="text-sm text-muted-foreground">{analysis.phEstimate}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sprout className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {analysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
