import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
interface AtividadeGestor extends Tables<'atividades'> {}
const Gestor = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [atividades, setAtividades] = useState<AtividadeGestor[]>([]);

  // Carregar atividades do Supabase
  useEffect(() => {
    loadAtividades();
  }, []);
  const loadAtividades = async () => {
    const {
      data,
      error
    } = await supabase.from('atividades').select('*').eq('status', 'concluido').order('id_sequencial', {
      ascending: false
    });
    if (error) {
      console.error('Erro ao carregar atividades:', error);
      toast({
        title: "Erro ao carregar atividades",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Converter status para o formato esperado pelo gestor
      const atividadesFormatadas = data.map(atividade => ({
        ...atividade,
        status: 'pendente' as const // Atividades concluídas ficam pendentes para aprovação do gestor
      }));
      setAtividades(atividadesFormatadas);
    }
  };
  const handleAprovar = async (id: string) => {
    const {
      error
    } = await supabase.from('atividades').update({
      status: 'aprovado'
    }).eq('id', id);
    if (error) {
      console.error('Erro ao aprovar atividade:', error);
      toast({
        title: "Erro ao aprovar atividade",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAtividades(prev => prev.map(atividade => atividade.id === id ? {
        ...atividade,
        status: 'aprovado' as const
      } : atividade));
      toast({
        title: "Atividade aprovada",
        description: "A atividade foi aprovada com sucesso"
      });
    }
  };
  const handleRejeitar = async (id: string) => {
    const {
      error
    } = await supabase.from('atividades').update({
      status: 'rejeitado'
    }).eq('id', id);
    if (error) {
      console.error('Erro ao rejeitar atividade:', error);
      toast({
        title: "Erro ao rejeitar atividade",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAtividades(prev => prev.map(atividade => atividade.id === id ? {
        ...atividade,
        status: 'rejeitado' as const
      } : atividade));
      toast({
        title: "Atividade rejeitada",
        description: "A atividade foi rejeitada",
        variant: "destructive"
      });
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-500';
      case 'rejeitado':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'aprovado':
        return 'Aprovado';
      case 'rejeitado':
        return 'Rejeitado';
      default:
        return 'Pendente';
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-gray-300 hover:bg-white/10 mr-3 hover:text-white">
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
            <div className="grid grid-cols-10 gap-2 p-3 text-xs font-medium">
              <div>ID</div>
              <div>OPERADOR</div>
              <div>ETAPA</div>
              <div>INÍCIO</div>
              <div>PLANEJADO</div>
              <div>FIM</div>
              <div>TEMPO</div>
              <div>QTD</div>
              <div>MOTIVO</div>
              <div>AÇÕES</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {atividades.length === 0 ? <div className="p-8 text-center text-gray-400">
                <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhuma atividade para aprovação</p>
              </div> : atividades.map((atividade, index) => <div key={atividade.id} className={`grid grid-cols-10 gap-2 p-3 border-b border-gray-700 items-center hover:bg-gray-700/30 ${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800/80'}`}>
                  {/* ID Sequencial */}
                  <div className="text-xs font-mono text-gray-300 font-bold">
                    {atividade.id_sequencial}
                  </div>
                  
                  {/* Operador */}
                  <div className="text-xs font-medium text-gray-200">
                    {atividade.operador}
                  </div>
                  
                  {/* Etapa */}
                  <div className="text-xs">
                    <div className="font-medium text-blue-400">{atividade.transportadora_nome}</div>
                    <div className="text-xs text-gray-400">{atividade.etapa}</div>
                  </div>
                  
                  {/* Início */}
                  <div className="text-xs font-medium text-gray-200">
                    {atividade.horario_salvo}
                  </div>
                  
                  {/* Planejado */}
                  <div className="text-xs font-medium text-gray-400">
                    {atividade.horario_planejado}
                  </div>
                  
                  {/* Fim */}
                  <div className="text-xs font-medium text-gray-200">
                    {atividade.horario_finalizacao || '-'}
                  </div>
                  
                  {/* Tempo */}
                  <div className="text-xs font-medium text-gray-200">
                    {atividade.horario_finalizacao && atividade.horario_salvo ? (() => {
                const inicio = new Date(`2000-01-01 ${atividade.horario_salvo}`);
                const fim = new Date(`2000-01-01 ${atividade.horario_finalizacao}`);
                const diffMs = fim.getTime() - inicio.getTime();
                const diffMin = Math.round(diffMs / (1000 * 60));
                return `${diffMin} min`;
              })() : '-'}
                  </div>
                  
                  {/* Quantidade */}
                  <div className="text-xs font-medium text-gray-200">
                    {atividade.volume}
                  </div>
                  
                  {/* Motivo */}
                  <div className="text-xs">
                    {atividade.motivo_atraso ? <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-red-900/30 text-red-300 hover:bg-red-900/50">
                            <FileText className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 bg-gray-800 border-gray-700">
                          <div className="space-y-2">
                            <h4 className="font-medium text-white">Motivo do Atraso</h4>
                            <p className="text-sm text-gray-300">{atividade.motivo_atraso}</p>
                          </div>
                        </PopoverContent>
                      </Popover> : <div className="flex items-center justify-center">
                        <div className="w-6 h-6 bg-green-900/30 rounded flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-400" />
                        </div>
                      </div>}
                  </div>
                  
                  {/* Ações */}
                  <div className="flex space-x-1">
                    {atividade.status === 'pendente' && <>
                        <Button size="sm" onClick={() => handleAprovar(atividade.id)} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs h-7">
                          <Check className="h-2 w-2 mr-1" />
                          Aprovar
                        </Button>
                        
                      </>}
                    {atividade.status === 'aprovado' && <Badge className="bg-green-600 text-white text-xs">
                        Aprovado
                      </Badge>}
                  </div>
                </div>)}
          </CardContent>
        </Card>

        {/* Summary Stats - Apenas Aprovadas e Pendentes */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>
      </div>
    </div>;
};
export default Gestor;