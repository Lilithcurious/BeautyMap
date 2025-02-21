import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Sparkles, Award } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-primary mb-4">
          Discover Your Perfect Makeup Look
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered facial analysis for personalized beauty recommendations
        </p>
        <Button 
          size="lg" 
          onClick={() => setLocation("/assessment")}
          className="animate-pulse"
        >
          Start Your Beauty Journey
        </Button>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardContent className="p-6 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
            <p className="text-gray-600">
              Advanced AI technology analyzes your facial features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Personalized Tips</h3>
            <p className="text-gray-600">
              Get makeup recommendations tailored to your features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-600">
              Professional beauty advice at your fingertips
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
