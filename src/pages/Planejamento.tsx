import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, Edit, Clock, User, Package, Calendar as CalendarIcon, AlertTriangle, Filter, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

interface Transportadora extends Tables<'transportadoras'> {
  selected?: boolean;
}

interface Atividade extends Tables<'atividades'> {}

const etapasDisponiveis = [
  "Picking - Área de Saída",
  "Picking - Reserva", 
  "Picking - Cons",
  "Picking - Troca de Palete",
  "Conferência - Carga Fracionada",
  "Conferência - Carga Matriz",
  "Conferência - Carga Direta",
  "Contagem Cega do Box",
  "Carregamento - Fracionado",
  "Carregamento - Transferência",
  "Emissão de Nota Fiscal - Fracionado",
  "Emissão de Nota Fiscal - Transferência",
  "Emissão de Nota Fiscal - Carga Direta",
  "Manifesto",
  "Pre. de carga exportação",
  "Carga fracionada -Etiquetagem",
  "END. Bertolini",
  "END. 97",
  "Armagenamento Bertolini",
  "Armagenamento 97",
  "Vistoria de container",
  "Invetário dos corredores",
  "Descarga Bertoline",
  "Preenchimento Mapa Bertolini",
  "Preenchimento RR Bertolini",
  "Inspeção/Foto/Checklist/ container 40",
  "Inspeção/Foto/Checklist/ container 20",
  "Liberação de container/ Lacre / Foto"
];

// Tempos por etapa (em minutos)
const temposPorEtapa: Record<string, number> = {
  "Picking - Área de Saída": 0.5, // 30 segundos por unidade
  "Picking - Reserva": 2, // 2 min por pallet
  "Picking - Cons": 3, // 3 min por pallet
  "Picking - Troca de Palete": 4, // 4 min por pallet
  "Conferência - Carga Fracionada": 1, // 1 min por pallet
  "Conferência - Carga Matriz": 1, // 1 min por pallet
  "Conferência - Carga Direta": 1, // 1 min por pallet
  "Contagem Cega do Box": 1, // 1 min por pallet
  "Carregamento - Fracionado": 2, // 2 min por pallet
  "Carregamento - Transferência": 2, // 2 min por pallet
  "Emissão de Nota Fiscal - Transferência": 10, // 10 min por pallet
  "Emissão de Nota Fiscal - Fracionado": 10, // 10 min por pallet
  "Emissão de Nota Fiscal - Carga Direta": 10, // 10 min por pallet
  "Pre. de carga exportação": 4, // 4 min por pallet
  "Carga fracionada -Etiquetagem": 1.5, // 1,30 min por pallet
  "END. Bertolini": 1.5, // 1,30 min por pallet
  "END. 97": 1, // 1 min por pallet
  "Armagenamento Bertolini": 2, // 2 min por pallet
  "Armagenamento 97": 2, // 2 min por pallet
  "Invetário dos corredores": 45, // 45 min fixo
  "Descarga Bertoline": 2, // 2 min por pallet
  "Preenchimento Mapa Bertolini": 1, // 1 min por pallet
  "Preenchimento RR Bertolini": 30, // 30 min fixo
  "Inspeção/Foto/Checklist/ container 40": 35, // 35 min fixo
  "Inspeção/Foto/Checklist/ container 20": 25, // 25 min fixo
  "Liberação de container/ Lacre / Foto": 7, // 7 min fixo
};

// Etapas que têm tempo fixo (não multiplicam pelo volume)
const etapasTempoFixo = [
  "Invetário dos corredores",
  "Preenchimento RR Bertolini", 
  "Inspeção/Foto/Checklist/ container 40",
  "Inspeção/Foto/Checklist/ container 20",
  "Liberação de container/ Lacre / Foto"
];

const calcularTempoTotal = (etapa: string, volume: number): number => {
  const tempoPorUnidade = temposPorEtapa[etapa] || 1;
  
  // Se é uma etapa de tempo fixo, não multiplica pelo volume
  if (etapasTempoFixo.includes(etapa)) {
    return tempoPorUnidade;
  }
  
  // Para "Picking - Área de Saída", o volume representa unidades, não pallets
  return tempoPorUnidade * volume;
};

const Planejamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [showAtividadeDialog, setShowAtividadeDialog] = useState(false);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [showAtrasoDialog, setShowAtrasoDialog] = useState(false);
  const [atividadeToFinalize, setAtividadeToFinalize] = useState<Atividade | null>(null);
  const [motivoAtraso, setMotivoAtraso] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form states
  const [nomeTransportadora, setNomeTransportadora] = useState("");
  const [horaSaida, setHoraSaida] = useState("");
  const [cargaPara, setCargaPara] = useState("");
  const [operador, setOperador] = useState("");
  const [etapa, setEtapa] = useState("");
  const [volume, setVolume] = useState("");

  // Filtrar atividades baseadas na transportadora selecionada e data
  const atividadesFiltradas = selectedTransportadora 
    ? atividades.filter(atividade => {
        const atividadeData = new Date(atividade.created_at);
        const selectedDateFormatted = format(selectedDate, 'yyyy-MM-dd');
        const atividadeDataFormatted = format(atividadeData, 'yyyy-MM-dd');
        
        return atividade.transportadora_id === selectedTransportadora.id && 
               atividadeDataFormatted === selectedDateFormatted;
      })
    : [];

  // Separar atividades em andamento e terminadas - atividades finalizadas NÃO aparecem em andamento
  const atividadesEmAndamento = atividadesFiltradas.filter(atividade => 
    atividade.status !== 'concluido' && atividade.status !== 'aprovado' && atividade.status !== 'rejeitado'
  );
  const atividadesTerminadas = atividadesFiltradas.filter(atividade => 
    atividade.status === 'concluido' || atividade.status === 'aprovado' || atividade.status === 'rejeitado'
  );

  // Carregar dados do Supabase
  useEffect(() => {
    loadTransportadoras();
    loadAtividades();
  }, []);

  const loadTransportadoras = async () => {
    const { data, error } = await supabase
      .from('transportadoras')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar transportadoras:', error);
      toast({
        title: "Erro ao carregar transportadoras",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setTransportadoras(data || []);
    }
  };

  const loadAtividades = async () => {
    const { data, error } = await supabase
      .from('atividades')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao carregar atividades:', error);
      toast({
        title: "Erro ao carregar atividades",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAtividades(data || []);
    }
  };

  // Função para verificar se uma atividade está em atraso
  const isAtrasada = (atividade: Atividade): boolean => {
    if (atividade.status === 'concluido') return false;
    
    const agora = new Date();
    const [horas, minutos] = atividade.horario_planejado.split(':').map(Number);
    const horarioPlaneado = new Date();
    horarioPlaneado.setHours(horas, minutos, 0, 0);
    
    return agora > horarioPlaneado;
  };

  const handleAddTransportadora = async () => {
    if (!nomeTransportadora || !horaSaida || !cargaPara) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da transportadora",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('transportadoras')
      .insert({
        nome: nomeTransportadora,
        hora_saida: horaSaida,
        carga_para: cargaPara
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar transportadora:', error);
      toast({
        title: "Erro ao adicionar transportadora",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setTransportadoras([data, ...transportadoras]);
      setNomeTransportadora("");
      setHoraSaida("");
      setCargaPara("");
      
      toast({
        title: "Transportadora adicionada",
        description: `${nomeTransportadora} foi adicionada com sucesso`
      });
    }
  };

  const handleSelectTransportadora = (transportadora: Transportadora) => {
    setTransportadoras(prev => 
      prev.map(t => ({ ...t, selected: t.id === transportadora.id }))
    );
    setSelectedTransportadora(transportadora);
  };

  const handleAddAtividade = () => {
    if (!selectedTransportadora) {
      toast({
        title: "Selecione uma transportadora",
        description: "Escolha uma transportadora antes de adicionar atividade",
        variant: "destructive"
      });
      return;
    }
    setShowAtividadeDialog(true);
  };

  const handleSaveAtividade = async () => {
    if (!operador || !etapa || !volume) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da atividade",
        variant: "destructive"
      });
      return;
    }

    const agora = new Date();
    const volumeNum = parseInt(volume);
    const tempoTotalMinutos = calcularTempoTotal(etapa, volumeNum);
    const horarioPlaneado = new Date(agora.getTime() + tempoTotalMinutos * 60 * 1000);

    const novaAtividade = {
      transportadora_id: selectedTransportadora!.id,
      transportadora_nome: selectedTransportadora!.nome,
      operador,
      etapa,
      volume: volumeNum,
      horario_salvo: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horario_planejado: horarioPlaneado.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'planejado' as const,
      created_at: agora.toISOString()
    };

    const { data, error } = await supabase
      .from('atividades')
      .insert(novaAtividade)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar atividade:', error);
      toast({
        title: "Erro ao adicionar atividade",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setAtividades([data, ...atividades]);
      setShowAtividadeDialog(false);
      setOperador("");
      setEtapa("");
      setVolume("");
      
      toast({
        title: "Atividade adicionada",
        description: `Atividade ${etapa} foi adicionada com sucesso`
      });
    }
  };

  const handleFinalizarAtividade = (atividade: Atividade) => {
    setAtividadeToFinalize(atividade);
    
    // Verifica se está em atraso
    if (isAtrasada(atividade)) {
      setShowAtrasoDialog(true);
    } else {
      setShowFinalizarDialog(true);
    }
  };

  const handleFinalizarComAtraso = async () => {
    if (atividadeToFinalize && motivoAtraso.trim()) {
      const agora = new Date();
      const horarioFinalizacao = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const { error } = await supabase
        .from('atividades')
        .update({ 
          status: 'concluido',
          motivo_atraso: motivoAtraso.trim(),
          horario_finalizacao: horarioFinalizacao,
          tempo_match: false
        })
        .eq('id', atividadeToFinalize.id);

      if (error) {
        console.error('Erro ao finalizar atividade:', error);
        toast({
          title: "Erro ao finalizar atividade",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Atualizar estado local
        setAtividades(prev => 
          prev.map(a => 
            a.id === atividadeToFinalize.id 
              ? { 
                  ...a, 
                  status: 'concluido' as const,
                  motivo_atraso: motivoAtraso.trim(),
                  horario_finalizacao: horarioFinalizacao,
                  tempo_match: false
                }
              : a
          )
        );
        
        setShowAtrasoDialog(false);
        setAtividadeToFinalize(null);
        setMotivoAtraso("");
        
        toast({
          title: "Atividade finalizada",
          description: `A tarefa ${atividadeToFinalize.etapa} foi finalizada com atraso registrado`
        });
      }
    } else if (!motivoAtraso.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o motivo do atraso",
        variant: "destructive"
      });
    }
  };

  const confirmFinalizarAtividade = async () => {
    if (atividadeToFinalize) {
      const agora = new Date();
      const horarioFinalizacao = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const { error } = await supabase
        .from('atividades')
        .update({ 
          status: 'concluido',
          horario_finalizacao: horarioFinalizacao,
          tempo_match: true
        })
        .eq('id', atividadeToFinalize.id);

      if (error) {
        console.error('Erro ao finalizar atividade:', error);
        toast({
          title: "Erro ao finalizar atividade",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Atualizar estado local
        setAtividades(prev => 
          prev.map(a => 
            a.id === atividadeToFinalize.id 
              ? { 
                  ...a, 
                  status: 'concluido' as const,
                  horario_finalizacao: horarioFinalizacao,
                  tempo_match: true
                }
              : a
          )
        );
        
        setShowFinalizarDialog(false);
        setAtividadeToFinalize(null);
        
        toast({
          title: "Atividade finalizada",
          description: `A tarefa ${atividadeToFinalize.etapa} foi finalizada`
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Planejamento de Atividades</h1>
              <p className="text-gray-400 text-sm mt-1">Gerencie transportadoras e organize as atividades operacionais</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Filtro de Data */}
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-600 bg-gray-700/50 text-gray-100 hover:bg-gray-600/50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setShowDatePicker(false);
                    }
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <Badge variant="destructive" className="px-3 py-1 text-xs font-semibold">
              3M
            </Badge>
          </div>
        </div>

        {/* Form Section */}
        <Card className="mb-6 shadow-lg border-gray-700 bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-100 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-400" />
              Adicionar Transportadora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="transportadora" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="text-red-400">*</span>
                  Transportadora
                </Label>
                <Input
                  id="transportadora"
                  value={nomeTransportadora}
                  onChange={(e) => setNomeTransportadora(e.target.value)}
                  placeholder="Nome da transportadora"
                  className="border-gray-600 bg-gray-700/50 text-gray-100 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaSaida" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="text-red-400">*</span>
                  <Clock className="h-3 w-3" />
                  Hora de Saída
                </Label>
                <Input
                  id="horaSaida"
                  type="time"
                  value={horaSaida}
                  onChange={(e) => setHoraSaida(e.target.value)}
                  className="border-gray-600 bg-gray-700/50 text-gray-100 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" />
                  Carga Para
                </Label>
                <Select value={cargaPara} onValueChange={setCargaPara}>
                  <SelectTrigger className="border-gray-600 bg-gray-700/50 text-gray-100 focus:border-blue-400 focus:ring-blue-400/20 text-sm">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="HOJE" className="text-gray-100 focus:bg-gray-700">Hoje</SelectItem>
                    <SelectItem value="AMANHÃ" className="text-gray-100 focus:bg-gray-700">Amanhã</SelectItem>
                    <SelectItem value="3 DIAS" className="text-gray-100 focus:bg-gray-700">3 Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddTransportadora}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 px-4 shadow-lg text-sm"
              >
                <Plus className="h-3 w-3 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Transportadoras List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-gray-700 bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <CardTitle className="text-center text-base">Transportadoras Cadastradas</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-80 overflow-y-auto">
                {transportadoras.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma transportadora cadastrada</p>
                  </div>
                ) : (
                  transportadoras.map((transportadora) => (
                    <div 
                      key={transportadora.id}
                      className={`p-3 border-b border-gray-700 cursor-pointer hover:bg-blue-900/20 transition-all duration-200 ${
                        transportadora.selected ? 'bg-blue-900/30 border-l-4 border-l-blue-500 shadow-sm' : ''
                      }`}
                      onClick={() => handleSelectTransportadora(transportadora)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Edit className="h-3 w-3 text-blue-400" />
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {new Date(transportadora.data_adicao).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                      <div className="font-medium text-gray-100 mb-1 text-sm">
                        {transportadora.nome}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-blue-400">
                          {transportadora.hora_saida}
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {transportadora.carga_para}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Atividades Em Andamento */}
            <Card className="shadow-lg border-gray-700 bg-gray-800/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Atividades Programadas
                    {selectedTransportadora && (
                      <span className="text-sm font-normal ml-2">
                        - {selectedTransportadora.nome} ({format(selectedDate, "dd/MM/yyyy", { locale: ptBR })})
                      </span>
                    )}
                  </CardTitle>
                  <Button 
                    onClick={handleAddAtividade}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Nova Atividade
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Activities Header */}
                <div className="bg-gray-900 text-gray-200 p-3 grid grid-cols-6 gap-3 text-xs font-medium">
                  <div className="col-span-2">Etapa & Transportadora</div>
                  <div>Operador</div>
                  <div>Horários</div>
                  <div className="text-center">Volume</div>
                  <div className="text-center">Status</div>
                </div>
                
                {/* Activities List */}
                <div className="max-h-80 overflow-y-auto">
                  {!selectedTransportadora ? (
                    <div className="p-8 text-center text-gray-400">
                      <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Selecione uma transportadora</p>
                      <p className="text-xs mt-2">Escolha uma transportadora para ver suas atividades</p>
                    </div>
                  ) : atividadesEmAndamento.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhuma atividade em andamento</p>
                      <p className="text-xs mt-2">Adicione uma atividade para esta transportadora na data selecionada</p>
                    </div>
                  ) : (
                    atividadesEmAndamento.map((atividade) => (
                      <div 
                        key={atividade.id}
                        className={`p-3 border-b border-gray-700 grid grid-cols-6 gap-3 items-center hover:bg-gray-700/30 transition-colors ${
                          isAtrasada(atividade) ? 'bg-red-900/20 border-red-700/50' : ''
                        }`}
                      >
                        <div className="col-span-2">
                          <div className="font-medium text-gray-100 mb-1 text-sm flex items-center gap-2">
                            {atividade.etapa}
                            {isAtrasada(atividade) && (
                              <AlertTriangle className="h-3 w-3 text-red-400" />
                            )}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {atividade.transportadora_nome}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-200 text-sm">{atividade.operador}</span>
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-green-400">Início: {atividade.horario_salvo}</div>
                          <div className={`${isAtrasada(atividade) ? 'text-red-400' : 'text-gray-400'}`}>
                            Fim: {atividade.horario_planejado}
                          </div>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="font-medium text-xs border-gray-600 text-gray-300">
                            {atividade.volume} {atividade.etapa === "Picking - Área de Saída" ? "unid." : "pallets"}
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFinalizarAtividade(atividade)}
                            className={`text-xs hover:bg-blue-900/20 hover:border-blue-400 border-gray-600 text-gray-300 ${
                              isAtrasada(atividade) ? 'border-red-400 text-red-300 hover:bg-red-900/20' : ''
                            }`}
                          >
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Atividades Terminadas */}
            {selectedTransportadora && atividadesTerminadas.length > 0 && (
              <Card className="shadow-lg border-gray-700 bg-gray-800/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Atividades Terminadas
                    <span className="text-sm font-normal ml-2">
                      - {selectedTransportadora.nome} ({format(selectedDate, "dd/MM/yyyy", { locale: ptBR })})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Activities Header */}
                  <div className="bg-gray-900 text-gray-200 p-3 grid grid-cols-7 gap-3 text-xs font-medium">
                    <div className="col-span-2">Etapa & Transportadora</div>
                    <div>Operador</div>
                    <div>Horários</div>
                    <div className="text-center">Volume</div>
                    <div className="text-center">Tempo Match</div>
                    <div className="text-center">Status</div>
                  </div>
                  
                  {/* Activities List */}
                  <div className="max-h-60 overflow-y-auto">
                    {atividadesTerminadas.map((atividade) => (
                      <div 
                        key={atividade.id}
                        className="p-3 border-b border-gray-700 grid grid-cols-7 gap-3 items-center hover:bg-gray-700/30 transition-colors"
                      >
                        <div className="col-span-2">
                          <div className="font-medium text-gray-100 mb-1 text-sm">
                            {atividade.etapa}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {atividade.transportadora_nome}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-200 text-sm">{atividade.operador}</span>
                        </div>
                        <div className="text-xs">
                          <div className="font-medium text-green-400">Início: {atividade.horario_salvo}</div>
                          <div className="text-gray-400">Fim Planejado: {atividade.horario_planejado}</div>
                          {atividade.horario_finalizacao && (
                            <div className="text-blue-400">Fim Real: {atividade.horario_finalizacao}</div>
                          )}
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="font-medium text-xs border-gray-600 text-gray-300">
                            {atividade.volume} {atividade.etapa === "Picking - Área de Saída" ? "unid." : "pallets"}
                          </Badge>
                        </div>
                        <div className="text-center">
                          {atividade.tempo_match ? (
                            <Badge variant="outline" className="text-xs border-green-600 text-green-400 bg-green-900/20">
                              No Prazo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-red-600 text-red-400 bg-red-900/20">
                              Atrasado
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-center">
                          <div className="bg-green-800/30 text-green-400 rounded-full p-2">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAtividadeDialog} onOpenChange={setShowAtividadeDialog}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-lg text-gray-100 flex items-center justify-center gap-2">
              <Plus className="h-4 w-4 text-blue-400" />
              Adicionar Nova Etapa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Transportadora</Label>
                <Input 
                  value={selectedTransportadora?.nome || ""} 
                  disabled 
                  className="bg-gray-700/50 border-gray-600 text-gray-300 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Hora de Saída</Label>
                <Input 
                  value={selectedTransportadora?.hora_saida || ""} 
                  disabled 
                  className="bg-gray-700/50 border-gray-600 text-gray-300 text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="operador" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="text-red-400">*</span>
                  <User className="h-3 w-3" />
                  Operador
                </Label>
                <Input
                  id="operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  placeholder="Nome do operador"
                  className="border-gray-600 bg-gray-700/50 text-gray-100 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="etapa" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="text-red-400">*</span>
                  Etapa
                </Label>
                <Select value={etapa} onValueChange={setEtapa}>
                  <SelectTrigger className="border-gray-600 bg-gray-700/50 text-gray-100 focus:border-blue-400 focus:ring-blue-400/20 text-sm">
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-gray-800 border-gray-600">
                    {etapasDisponiveis.map((etapaOption) => (
                      <SelectItem key={etapaOption} value={etapaOption} className="text-gray-100 focus:bg-gray-700 text-sm">
                        {etapaOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-gray-300 text-sm font-medium flex items-center gap-2">
                  <span className="text-red-400">*</span>
                  <Package className="h-3 w-3" />
                  {etapa === "Picking - Área de Saída" ? "Unidades" : "Volume (pallets)"}
                </Label>
                <Input
                  id="volume"
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder={etapa === "Picking - Área de Saída" ? "Qtd unidades" : "Qtd pallets"}
                  className="border-gray-600 bg-gray-700/50 text-gray-100 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 text-sm"
                />
              </div>
            </div>

            {etapa && volume && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3">
                <div className="text-sm text-blue-300">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">Tempo Estimado:</span>
                  </div>
                  <div className="text-blue-200">
                    {etapasTempoFixo.includes(etapa) 
                      ? `${temposPorEtapa[etapa]} minutos (tempo fixo)`
                      : `${calcularTempoTotal(etapa, parseInt(volume) || 0)} minutos (${temposPorEtapa[etapa]} min × ${volume})`
                    }
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleSaveAtividade}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 shadow-lg text-sm"
              >
                <Check className="h-3 w-3 mr-2" />
                Iniciar Atividade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finalize Activity Dialog */}
      <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-lg text-gray-100">Finalizar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <div className="bg-yellow-900/30 rounded-full p-3 w-12 h-12 mx-auto mb-3">
              <Clock className="h-6 w-6 text-yellow-400 mx-auto" />
            </div>
            <p className="text-gray-300 mb-2 text-sm">Deseja finalizar a tarefa:</p>
            <p className="font-medium text-gray-100 text-sm">{atividadeToFinalize?.etapa}?</p>
          </div>
          <div className="flex justify-center space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowFinalizarDialog(false)}
              className="px-4 text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmFinalizarAtividade}
              className="bg-blue-600 hover:bg-blue-700 px-4 text-sm"
            >
              <Check className="h-3 w-3 mr-2" />
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Atraso */}
      <Dialog open={showAtrasoDialog} onOpenChange={setShowAtrasoDialog}>
        <DialogContent className="max-w-md bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-center text-lg text-gray-100 flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Atividade em Atraso
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">A tarefa está em atraso:</p>
              <p className="font-medium text-gray-100 text-sm mb-1">{atividadeToFinalize?.etapa}</p>
              <p className="text-red-400 text-xs">
                Previsto para: {atividadeToFinalize?.horario_planejado}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivoAtraso" className="text-gray-300 text-sm font-medium">
                Motivo do atraso *
              </Label>
              <Textarea
                id="motivoAtraso"
                value={motivoAtraso}
                onChange={(e) => setMotivoAtraso(e.target.value)}
                placeholder="Descreva o motivo do atraso..."
                className="border-gray-600 bg-gray-700/50 text-gray-100 placeholder:text-gray-400 focus:border-red-400 focus:ring-red-400/20 text-sm"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAtrasoDialog(false);
                setMotivoAtraso("");
              }}
              className="px-4 text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleFinalizarComAtraso}
              className="bg-red-600 hover:bg-red-700 px-4 text-sm"
            >
              <Check className="h-3 w-3 mr-2" />
              Finalizar com Atraso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planejamento;
