
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Ship, Users, Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background container image with darker overlay */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/5926c171-d1a4-48f1-9fb7-2ae0a2ee8bde.png')] bg-cover bg-center opacity-10"></div>
      
      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-8">
            <Ship className="h-20 w-20 text-blue-400 mr-6" />
            <div>
              <h1 className="text-5xl font-bold text-white mb-3 tracking-wide">LATAM Logistics</h1>
              <p className="text-xl text-gray-300 font-medium">ORDER TO ORDER CHECK - ITAPETININGA</p>
            </div>
          </div>
        </div>

        {/* Main Access Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 hover:bg-slate-800/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
            <CardContent className="p-10 text-center">
              <div className="bg-blue-500/20 rounded-full p-6 w-fit mx-auto mb-6">
                <Users className="h-20 w-20 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Usuário</h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Acesso para planejamento e controle de atividades operacionais
              </p>
              <Button 
                onClick={() => navigate('/planejamento')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 text-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
              >
                Acessar Sistema
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-lg border-slate-700/50 hover:bg-slate-800/70 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
            <CardContent className="p-10 text-center">
              <div className="bg-green-500/20 rounded-full p-6 w-fit mx-auto mb-6">
                <Settings className="h-20 w-20 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Gestor</h2>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Acesso para verificação e aprovação de atividades planejadas
              </p>
              <Button 
                onClick={() => navigate('/gestor')}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 text-xl transition-all duration-300 shadow-lg hover:shadow-green-500/30"
              >
                Acessar Gestão
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex justify-center items-center space-x-8">
            <span className="text-gray-400 font-semibold text-lg hover:text-white transition-colors cursor-pointer">PT</span>
            <span className="text-gray-400 font-semibold text-lg hover:text-white transition-colors cursor-pointer">ESP</span>
            <span className="text-gray-400 font-semibold text-lg hover:text-white transition-colors cursor-pointer">ENG</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
