import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AtividadeGestor {
  id: string;
  nome: string;
  etapa: string;
  inicioReal: string;
  fimReal: string;
  planejado: string;
  tempo: string;
  qtd: number;
  motivo: string;
  status: 'aprovado' | 'pendente' | 'rejeitado';
  tempoMatch: boolean;
}

const Gestor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [atividades, setAtividades] = useState<AtividadeGestor[]>([
    {
      id: "58975",
      nome: "ROBERTO NERCELI LEMES JUNIOR",
      etapa: "SULAMERICANO #15h01 Carregamento - Fracionado",
      inicioReal: "10:50",
      fimReal: "11:14",
      planejado: "11:22",
      tempo: "24 min",
      qtd: 16,
      motivo: "",
      status: 'pendente',
      tempoMatch: true
    },
    {
      id: "58974",
      nome: "AILTON RODRIGUES DE OLIVEIRA",
      etapa: "LOVATO #15 Carga fracionada - Etiquetagem",
      inicioReal: "10:49",
      fimReal: "11:06",
      planejado: "11:08",
      tempo: "17 min",
      qtd: 15,
      motivo: "",
      status: 'pendente',
      tempoMatch: true
    },
    {
      id: "58973",
      nome: "AILTON RODRIGUES DE OLIVEIRA",
      etapa: "SULAMERICANO #15h01 Carga fracionada - Etiquetagem",
      inicioReal: "10:38",
      fimReal: "10:49",
      planejado: "10:57",
      tempo: "11 min",
      qtd: 15,
      motivo: "",
      status: 'pendente',
      tempoMatch: true
    },
    {
      id: "58972",
      nome: "ROBERTO NERCELI LEMES JUNIOR",
      etapa: "MC - SW1871/2025 #15h50 Carregamento - Transferência",
      inicioReal: "10:31",
      fimReal: "10:50",
      planejado: "10:57",
      tempo: "19 min",
      qtd: 13,
      motivo: "",
      status: 'pendente',
      tempoMatch: false
    },
    {
      id: "58971",
      nome: "AILTON RODRIGUES DE OLIVEIRA",
      etapa: "LOVATO #15 Conferência - Carga Fracionada",
      inicioReal: "10:29",
      fimReal: "10:38",
      planejado: "10:42",
      tempo: "9 min",
      qtd: 13,
      motivo: "",
      status: 'pendente',
      tempoMatch: true
    },
    {
      id: "58970",
      nome: "EVALDO SERGIO DA SILVA",
      etapa: "TRANSVOAR - JAM #12 Manifesto",
      inicioReal: "10:15",
      fimReal: "10:15",
      planejado: "10:16",
      tempo: "0 min",
      qtd: 1,
      motivo: "",
      status: 'aprovado',
      tempoMatch: true
    },
    {
      id: "58969",
      nome: "EVALDO SERGIO DA SILVA",
      etapa: "TRANSVOAR - REALDESC #12h10 Manifesto",
      inicioReal: "10:14",
      fimReal: "10:15",
      planejado: "10:16",
      tempo: "1 min",
      qtd: 2,
      motivo: "",
      status: 'aprovado',
      tempoMatch: true
    }
  ]);

  const handleAprovar = (id: string) => {
    setAtividades(prev => 
      prev.map(atividade => 
        atividade.id === id 
          ? { ...atividade, status: 'aprovado' as const }
          : atividade
      )
    );
    
    toast({
      title: "Atividade aprovada",
      description: "A atividade foi aprovada com sucesso"
    });
  };

  const handleRejeitar = (id: string) => {
    setAtividades(prev => 
      prev.map(atividade => 
        atividade.id === id 
          ? { ...atividade, status: 'rejeitado' as const }
          : atividade
      )
    );
    
    toast({
      title: "Atividade rejeitada",
      description: "A atividade foi rejeitada",
      variant: "destructive"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-500';
      case 'rejeitado': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado': return 'Aprovado';
      case 'rejeitado': return 'Rejeitado';
      default: return 'Pendente';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:bg-white/10 mr-3 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold text-white">CHECK - FAC / COO</h1>
          </div>
          <div className="bg-red-600 text-white px-3 py-1 rounded text-sm">3M</div>
        </div>

        {/* Main Content */}
        <Card className="bg-gray-800/95 border-gray-700">
          <CardHeader className="bg-gray-900 text-white p-0">
            <div className="grid grid-cols-9 gap-2 p-3 text-xs font-medium">
              <div>ID</div>
              <div>NOME</div>
              <div>ETAPA</div>
              <div>INÍCIO / FIM / PLANEJADO</div>
              <div>TEMPO</div>
              <div>QTD</div>
              <div>MOTIVO</div>
              <div>FAC|COO</div>
              <div>AÇÕES</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {atividades.map((atividade, index) => (
              <div 
                key={atividade.id}
                className={`grid grid-cols-9 gap-2 p-3 border-b border-gray-700 items-center hover:bg-gray-700/30 ${
                  index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/80'
                }`}
              >
                {/* ID */}
                <div className="text-xs font-mono text-gray-300">{atividade.id}</div>
                
                {/* Nome */}
                <div className="text-xs font-medium text-gray-200">{atividade.nome}</div>
                
                {/* Etapa */}
                <div className="text-xs">
                  <div className="font-medium text-blue-400">{atividade.etapa.split(' ')[0]}</div>
                  <div className="text-xs text-gray-400">
                    {atividade.etapa.substring(atividade.etapa.indexOf(' ') + 1)}
                  </div>
                </div>
                
                {/* Horários */}
                <div className="text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-200">{atividade.inicioReal}</span>
                    <span className="text-gray-200">{atividade.fimReal}</span>
                    <span className="text-gray-400">{atividade.planejado}</span>
                  </div>
                </div>
                
                {/* Tempo */}
                <div className="text-xs font-medium text-gray-200">{atividade.tempo}</div>
                
                {/* Quantidade */}
                <div className="text-xs font-medium text-gray-200">{atividade.qtd}</div>
                
                {/* Motivo */}
                <div className="text-xs">
                  <FileText className="h-3 w-3 text-gray-400" />
                </div>
                
                {/* Status Visual */}
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(atividade.status)} text-white border-0 text-xs`}
                  >
                    {getStatusText(atividade.status)}
                  </Badge>
                  {atividade.tempoMatch ? (
                    <div className="flex space-x-1">
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="h-2 w-2 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="bg-red-500 rounded-full p-1">
                        <X className="h-2 w-2 text-white" />
                      </div>
                      <div className="bg-yellow-500 rounded-full p-1">
                        <Clock className="h-2 w-2 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Ações */}
                <div className="flex space-x-1">
                  {atividade.status === 'pendente' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAprovar(atividade.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs h-7"
                      >
                        <Check className="h-2 w-2 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejeitar(atividade.id)}
                        className="px-2 py-1 text-xs h-7"
                      >
                        <X className="h-2 w-2 mr-1" />
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="bg-green-900/20 border-green-700/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-green-400">
                {atividades.filter(a => a.status === 'aprovado').length}
              </div>
              <div className="text-green-300 text-xs">Atividades Aprovadas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-900/20 border-yellow-700/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {atividades.filter(a => a.status === 'pendente').length}
              </div>
              <div className="text-yellow-300 text-xs">Atividades Pendentes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-900/20 border-red-700/50">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-red-400">
                {atividades.filter(a => a.status === 'rejeitado').length}
              </div>
              <div className="text-red-300 text-xs">Atividades Rejeitadas</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gestor;
