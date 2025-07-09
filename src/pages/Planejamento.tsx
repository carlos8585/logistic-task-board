
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, Edit, Clock, User, Package, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transportadora {
  id: string;
  nome: string;
  horaSaida: string;
  cargaPara: string;
  dataAdicao: string;
  selected?: boolean;
}

interface Atividade {
  id: string;
  transportadoraId: string;
  transportadoraNome: string;
  operador: string;
  etapa: string;
  volume: number;
  horarioSalvo: string;
  horarioPlaneado: string;
  status: 'planejado' | 'concluido';
}

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

const Planejamento = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [showAtividadeDialog, setShowAtividadeDialog] = useState(false);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);
  const [atividadeToFinalize, setAtividadeToFinalize] = useState<Atividade | null>(null);
  
  // Form states
  const [nomeTransportadora, setNomeTransportadora] = useState("");
  const [horaSaida, setHoraSaida] = useState("");
  const [cargaPara, setCargaPara] = useState("");
  const [operador, setOperador] = useState("");
  const [etapa, setEtapa] = useState("");
  const [volume, setVolume] = useState("");

  const handleAddTransportadora = () => {
    if (!nomeTransportadora || !horaSaida || !cargaPara) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da transportadora",
        variant: "destructive"
      });
      return;
    }

    const novaTransportadora: Transportadora = {
      id: Date.now().toString(),
      nome: nomeTransportadora,
      horaSaida,
      cargaPara,
      dataAdicao: new Date().toLocaleDateString('pt-BR')
    };

    setTransportadoras([...transportadoras, novaTransportadora]);
    setNomeTransportadora("");
    setHoraSaida("");
    setCargaPara("");
    
    toast({
      title: "Transportadora adicionada",
      description: `${nomeTransportadora} foi adicionada com sucesso`
    });
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

  const handleSaveAtividade = () => {
    if (!operador || !etapa || !volume) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da atividade",
        variant: "destructive"
      });
      return;
    }

    const agora = new Date();
    const horarioPlaneado = new Date(agora.getTime() + 60 * 60 * 1000); // +1 hora

    const novaAtividade: Atividade = {
      id: Date.now().toString(),
      transportadoraId: selectedTransportadora!.id,
      transportadoraNome: selectedTransportadora!.nome,
      operador,
      etapa,
      volume: parseInt(volume),
      horarioSalvo: agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      horarioPlaneado: horarioPlaneado.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'planejado'
    };

    setAtividades([...atividades, novaAtividade]);
    setShowAtividadeDialog(false);
    setOperador("");
    setEtapa("");
    setVolume("");
    
    toast({
      title: "Atividade adicionada",
      description: `Atividade ${etapa} foi adicionada com sucesso`
    });
  };

  const handleFinalizarAtividade = (atividade: Atividade) => {
    setAtividadeToFinalize(atividade);
    setShowFinalizarDialog(true);
  };

  const confirmFinalizarAtividade = () => {
    if (atividadeToFinalize) {
      setAtividades(prev => 
        prev.map(a => 
          a.id === atividadeToFinalize.id 
            ? { ...a, status: 'concluido' as const }
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-900 hover:bg-white/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Planejamento de Atividades</h1>
              <p className="text-slate-600 mt-1">Gerencie transportadoras e organize as atividades operacionais</p>
            </div>
          </div>
          <Badge variant="destructive" className="px-4 py-2 text-sm font-semibold">
            3M
          </Badge>
        </div>

        {/* Form Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Adicionar Transportadora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <Label htmlFor="transportadora" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Transportadora
                </Label>
                <Input
                  id="transportadora"
                  value={nomeTransportadora}
                  onChange={(e) => setNomeTransportadora(e.target.value)}
                  placeholder="Nome da transportadora"
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaSaida" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  <Clock className="h-4 w-4" />
                  Hora de Saída
                </Label>
                <Input
                  id="horaSaida"
                  type="time"
                  value={horaSaida}
                  onChange={(e) => setHoraSaida(e.target.value)}
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Carga Para
                </Label>
                <Select value={cargaPara} onValueChange={setCargaPara}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOJE">Hoje</SelectItem>
                    <SelectItem value="AMANHÃ">Amanhã</SelectItem>
                    <SelectItem value="3 DIAS">3 Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddTransportadora}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Transportadoras List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
                <CardTitle className="text-center text-lg">Transportadoras Cadastradas</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-96 overflow-y-auto">
                {transportadoras.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma transportadora cadastrada</p>
                  </div>
                ) : (
                  transportadoras.map((transportadora) => (
                    <div 
                      key={transportadora.id}
                      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
                        transportadora.selected ? 'bg-blue-100 border-l-4 border-l-blue-600 shadow-sm' : ''
                      }`}
                      onClick={() => handleSelectTransportadora(transportadora)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Edit className="h-4 w-4 text-blue-600" />
                        <Badge variant="secondary" className="text-xs">
                          {transportadora.dataAdicao}
                        </Badge>
                      </div>
                      <div className="font-semibold text-slate-900 mb-1">
                        {transportadora.nome}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">
                          {transportadora.horaSaida}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {transportadora.cargaPara}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Activities */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Atividades Programadas</CardTitle>
                  <Button 
                    onClick={handleAddAtividade}
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Atividade
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Activities Header */}
                <div className="bg-slate-800 text-white p-4 grid grid-cols-6 gap-4 text-sm font-medium">
                  <div className="col-span-2">Etapa & Transportadora</div>
                  <div>Operador</div>
                  <div>Horários</div>
                  <div>Volume</div>
                  <div className="text-center">Status</div>
                </div>
                
                {/* Activities List */}
                <div className="max-h-96 overflow-y-auto">
                  {atividades.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma atividade programada</p>
                      <p className="text-sm mt-2">Selecione uma transportadora e adicione uma atividade</p>
                    </div>
                  ) : (
                    atividades.map((atividade) => (
                      <div 
                        key={atividade.id}
                        className="p-4 border-b border-slate-100 grid grid-cols-6 gap-4 items-center hover:bg-slate-50 transition-colors"
                      >
                        <div className="col-span-2">
                          <div className="font-semibold text-slate-900 mb-1">{atividade.etapa}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {atividade.transportadoraNome}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span className="font-medium text-slate-800">{atividade.operador}</span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-green-600">Início: {atividade.horarioSalvo}</div>
                          <div className="text-slate-600">Fim: {atividade.horarioPlaneado}</div>
                        </div>
                        <div className="text-center">
                          <Badge variant="outline" className="font-semibold">
                            {atividade.volume} pallets
                          </Badge>
                        </div>
                        <div className="flex justify-center">
                          {atividade.status === 'concluido' ? (
                            <div className="bg-green-100 text-green-800 rounded-full p-2">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleFinalizarAtividade(atividade)}
                              className="text-xs hover:bg-blue-50 hover:border-blue-300"
                            >
                              Finalizar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAtividadeDialog} onOpenChange={setShowAtividadeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-slate-800 flex items-center justify-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Adicionar Nova Etapa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Transportadora</Label>
                <Input 
                  value={selectedTransportadora?.nome || ""} 
                  disabled 
                  className="bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Hora de Saída</Label>
                <Input 
                  value={selectedTransportadora?.horaSaida || ""} 
                  disabled 
                  className="bg-slate-50 border-slate-200"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operador" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  <User className="h-4 w-4" />
                  Operador
                </Label>
                <Input
                  id="operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  placeholder="Nome do operador"
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="etapa" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  Etapa
                </Label>
                <Select value={etapa} onValueChange={setEtapa}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {etapasDisponiveis.map((etapaOption) => (
                      <SelectItem key={etapaOption} value={etapaOption}>
                        {etapaOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-red-500">*</span>
                  <Package className="h-4 w-4" />
                  Volume
                </Label>
                <Input
                  id="volume"
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Qtd pallets"
                  className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-6">
              <Button 
                onClick={handleSaveAtividade}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-2 shadow-lg"
              >
                <Check className="h-4 w-4 mr-2" />
                Iniciar Atividade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finalize Activity Dialog */}
      <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl text-slate-800">Finalizar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto" />
            </div>
            <p className="text-slate-700 mb-2">Deseja finalizar a tarefa:</p>
            <p className="font-semibold text-slate-900">{atividadeToFinalize?.etapa}?</p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFinalizarDialog(false)}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmFinalizarAtividade}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planejamento;
