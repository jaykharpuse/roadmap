import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Network, Edit3, Download, Search } from "lucide-react";

export function RoadmapGenerator() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/roadmaps?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate("/roadmaps");
    }
  };

  const features = [
    {
      title: "Ready-Made",
      description: "Access pre-built roadmaps for various topics",
      icon: Network,
      action: () => navigate("/roadmaps"),
    },
    {
      title: "Customizable",
      description: "Build your own roadmap with our easy-to-use editor",
      icon: Edit3,
      action: () => navigate("/generate-roadmap"),
    },
    {
      title: "Download & Share",
      description: "Export your roadmaps to PDF and share them with others",
      icon: Download,
      action: () => navigate("/roadmaps"),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">
        Generate a Roadmap for Any Topic
      </h1>
      
      <p className="text-center text-gray-600 mb-8">
        Create and explore detailed roadmaps for your chosen subject:
      </p>
      
      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-2xl">
          <Input 
            placeholder="Search a topic..." 
            className="pl-10 pr-4 py-6 text-lg"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mb-12">
        <Button 
          className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/generate-roadmap")}
        >
          Create Your Roadmap
        </Button>
        <Button 
          variant="outline" 
          className="px-8 py-6 text-lg"
          onClick={() => navigate("/roadmaps")}
        >
          Browse Roadmaps
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index}
            className="hover:shadow-lg transition-all cursor-pointer hover:border-blue-400 group"
            onClick={feature.action}
          >
            <CardHeader>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-500 transition-colors">
                <feature.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}