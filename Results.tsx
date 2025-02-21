import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Analysis } from "@shared/schema";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Results() {
  const { data: analysis, isLoading, error } = useQuery<Analysis>({
    queryKey: ["/api/analysis/latest"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Carregando análise..." />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Nenhuma Análise Encontrada</h2>
        <p>Por favor, complete uma avaliação primeiro para ver seus resultados</p>
      </div>
    );
  }

  // Garantir que todos os arrays existam, mesmo que vazios
  const features = Array.isArray(analysis.facialFeatures) ? analysis.facialFeatures : [];
  const thirds = Array.isArray(analysis.facialThirds) ? analysis.facialThirds : [];
  const conditions = Array.isArray(analysis.skinConditions) ? analysis.skinConditions : [];
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  const palette = Array.isArray(analysis.colorPalette) ? analysis.colorPalette : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Seus Resultados da Análise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysis.analyzedImagePath && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Imagem da Análise Facial</h3>
              <img 
                src={`/uploads/${analysis.analyzedImagePath.split('/').pop()}`}
                alt="Rosto analisado"
                className="max-w-full rounded-lg shadow-md"
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Características Faciais</h3>
            <ul className="list-disc pl-6 space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="text-gray-700">{feature}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Análise dos Terços Faciais</h3>
            <ul className="list-disc pl-6 space-y-2">
              {thirds.map((third, i) => (
                <li key={i} className="text-gray-700">{third}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Condições da Pele</h3>
            <ul className="list-disc pl-6 space-y-2">
              {conditions.map((condition, i) => (
                <li key={i} className="text-gray-700">{condition}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Recomendações de Maquiagem</h3>
            <ul className="list-disc pl-6 space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Paleta de Cores</h3>
            <ul className="list-disc pl-6 space-y-2">
              {palette.map((color, i) => (
                <li key={i} className="text-gray-700">{color}</li>
              ))}
            </ul>
          </div>

          <Button className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Baixar Relatório PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}