
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">CHECK - FAC / COO</h1>
          </div>
          <div className="bg-red-600 text-white px-4 py-2 rounded">3M</div>
        </div>

        {/* Main Content */}
        <Card className="bg-white/95">
          <CardHeader className="bg-blue-800 text-white p-0">
            <div className="grid grid-cols-9 gap-2 p-4 text-sm font-semibold">
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
                className={`grid grid-cols-9 gap-2 p-4 border-b items-center hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-green-50' : 'bg-white'
                }`}
              >
                {/* ID */}
                <div className="text-sm font-mono">{atividade.id}</div>
                
                {/* Nome */}
                <div className="text-sm font-semibold">{atividade.nome}</div>
                
                {/* Etapa */}
                <div className="text-sm">
                  <div className="font-semibold text-blue-900">{atividade.etapa.split(' ')[0]}</div>
                  <div className="text-xs text-gray-600">
                    {atividade.etapa.substring(atividade.etapa.indexOf(' ') + 1)}
                  </div>
                </div>
                
                {/* Horários */}
                <div className="text-sm">
                  <div className="flex items-center space-x-1">
                    <span>{atividade.inicioReal}</span>
                    <span>{atividade.fimReal}</span>
                    <span className="text-gray-600">{atividade.planejado}</span>
                  </div>
                </div>
                
                {/* Tempo */}
                <div className="text-sm font-semibold">{atividade.tempo}</div>
                
                {/* Quantidade */}
                <div className="text-sm font-semibold">{atividade.qtd}</div>
                
                {/* Motivo */}
                <div className="text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                </div>
                
                {/* Status Visual */}
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(atividade.status)} text-white border-0`}
                  >
                    {getStatusText(atividade.status)}
                  </Badge>
                  {atividade.tempoMatch ? (
                    <div className="flex space-x-1">
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-green-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="bg-red-500 rounded-full p-1">
                        <X className="h-3 w-3 text-white" />
                      </div>
                      <div className="bg-yellow-500 rounded-full p-1">
                        <Clock className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Ações */}
                <div className="flex space-x-2">
                  {atividade.status === 'pendente' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAprovar(atividade.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejeitar(atividade.id)}
                        className="px-3 py-1 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-100 border-green-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {atividades.filter(a => a.status === 'aprovado').length}
              </div>
              <div className="text-green-600">Atividades Aprovadas</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-100 border-yellow-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {atividades.filter(a => a.status === 'pendente').length}
              </div>
              <div className="text-yellow-600">Atividades Pendentes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-100 border-red-300">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-700">
                {atividades.filter(a => a.status === 'rejeitado').length}
              </div>
              <div className="text-red-600">Atividades Rejeitadas</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Gestor;
