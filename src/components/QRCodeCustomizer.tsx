import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Palette, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toPng, toSvg } from "html-to-image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface QRCodeCustomizerProps {
  userId: string;
  userName: string;
}

export const QRCodeCustomizer = ({ userId, userName }: QRCodeCustomizerProps) => {
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [schoolName, setSchoolName] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  const profileUrl = `${window.location.origin}/profile/${userId}`;

  const downloadAsPNG = async () => {
    if (!qrRef.current) return;
    
    try {
      const dataUrl = await toPng(qrRef.current, {
        quality: 1,
        pixelRatio: 3,
      });
      
      const link = document.createElement("a");
      link.download = `${userName}-profile-qr.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading PNG:", error);
    }
  };

  const downloadAsSVG = async () => {
    if (!qrRef.current) return;
    
    try {
      const dataUrl = await toSvg(qrRef.current);
      
      const link = document.createElement("a");
      link.download = `${userName}-profile-qr.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading SVG:", error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    alert("Profile link copied to clipboard!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Share Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Share your profile with study room participants
          </p>
          
          <div
            ref={qrRef}
            className="p-6 rounded-lg inline-flex flex-col items-center gap-4"
            style={{ backgroundColor: bgColor }}
          >
            <QRCodeSVG
              value={profileUrl}
              size={200}
              level="H"
              fgColor={fgColor}
              bgColor={bgColor}
            />
            {schoolName && (
              <div 
                className="text-center font-semibold px-4 py-2 rounded"
                style={{ color: fgColor }}
              >
                {schoolName}
              </div>
            )}
          </div>

          {/* Download Buttons */}
          <div className="flex gap-2">
            <Button onClick={downloadAsPNG} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button onClick={downloadAsSVG} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
            <Button onClick={copyLink} size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="fgColor">QR Code Color</Label>
            <div className="flex gap-2">
              <Input
                id="fgColor"
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="flex-1 font-mono"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bgColor"
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 font-mono"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolName">School/Organization Name (Optional)</Label>
            <Input
              id="schoolName"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g., Stanford University"
              maxLength={30}
            />
            <p className="text-xs text-muted-foreground">
              Add your school or organization name below the QR code
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  Quick Themes
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setFgColor("#1e40af");
                      setBgColor("#dbeafe");
                    }}
                    className="w-full p-3 rounded text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Blue Academic</div>
                    <div className="text-xs text-muted-foreground">Classic university theme</div>
                  </button>
                  <button
                    onClick={() => {
                      setFgColor("#7c3aed");
                      setBgColor("#f3e8ff");
                    }}
                    className="w-full p-3 rounded text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Purple Innovation</div>
                    <div className="text-xs text-muted-foreground">Modern and creative</div>
                  </button>
                  <button
                    onClick={() => {
                      setFgColor("#059669");
                      setBgColor("#d1fae5");
                    }}
                    className="w-full p-3 rounded text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Green Sustainability</div>
                    <div className="text-xs text-muted-foreground">Eco-friendly vibe</div>
                  </button>
                  <button
                    onClick={() => {
                      setFgColor("#000000");
                      setBgColor("#ffffff");
                    }}
                    className="w-full p-3 rounded text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-medium">Classic Black & White</div>
                    <div className="text-xs text-muted-foreground">High contrast, professional</div>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
