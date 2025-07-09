
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Ship, Users, Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background container image inspired design */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/5926c171-d1a4-48f1-9fb7-2ae0a2ee8bde.png')] bg-cover bg-center opacity-20"></div>
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Ship className="h-16 w-16 text-white mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">LATAM Logistics</h1>
              <p className="text-xl text-blue-200">ORDER TO ORDER CHECK - ITAPETININGA</p>
            </div>
          </div>
          <div className="flex justify-end mb-4">
            <span className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold">AVALIAR APP</span>
          </div>
        </div>

        {/* Main Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Usuário</h2>
              <p className="text-blue-200 mb-6">Acesso para planejamento e controle de atividades operacionais</p>
              <Button 
                onClick={() => navigate('/planejamento')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
              >
                Acessar Sistema
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105">
            <CardContent className="p-8 text-center">
              <Settings className="h-16 w-16 text-green-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Gestor</h2>
              <p className="text-blue-200 mb-6">Acesso para verificação e aprovação de atividades planejadas</p>
              <Button 
                onClick={() => navigate('/gestor')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg"
              >
                Acessar Gestão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="flex justify-center items-center space-x-8">
            <span className="text-white font-semibold">PT</span>
            <span className="text-white font-semibold">ESP</span>
            <span className="text-white font-semibold">ENG</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
