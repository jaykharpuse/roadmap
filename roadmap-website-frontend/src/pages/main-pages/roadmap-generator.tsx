import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoadmapGenerator() {
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
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            Q
          </span>
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mb-12">
        <Button className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700">
          Create Your Roadmap
        </Button>
        <Button variant="outline" className="px-8 py-6 text-lg">
          Browse Roadmaps
        </Button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Ready-Made</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Access pre-built roadmaps for various topics
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Customizable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Build your own roadmap with our easy-to-use editor
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl">Download & Share</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Export your roadmaps to PDF and share them with others
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}