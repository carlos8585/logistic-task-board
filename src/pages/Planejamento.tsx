
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Check, Edit } from "lucide-react";
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
            <h1 className="text-2xl font-bold text-white">PLANEJAMENTO DE ATIVIDADES</h1>
          </div>
          <div className="bg-red-600 text-white px-4 py-2 rounded">3M</div>
        </div>

        {/* Top Form Section */}
        <Card className="mb-6 bg-white/95">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="transportadora" className="text-blue-900 font-semibold">
                  * TRANSPORTADORA
                </Label>
                <Input
                  id="transportadora"
                  value={nomeTransportadora}
                  onChange={(e) => setNomeTransportadora(e.target.value)}
                  placeholder="Nome da transportadora"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="horaSaida" className="text-blue-900 font-semibold">
                  * HORA DE SAÍDA
                </Label>
                <Input
                  id="horaSaida"
                  type="time"
                  value={horaSaida}
                  onChange={(e) => setHoraSaida(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-blue-900 font-semibold">CARGA PARA:</Label>
                <Select value={cargaPara} onValueChange={setCargaPara}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOJE">HOJE</SelectItem>
                    <SelectItem value="AMANHÃ">AMANHÃ</SelectItem>
                    <SelectItem value="3 DIAS">3 DIAS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleAddTransportadora}
                className="bg-gray-400 hover:bg-gray-500 text-black font-semibold"
              >
                ADICIONAR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Transportadoras List */}
          <Card className="bg-white/95">
            <CardHeader className="bg-blue-900 text-white">
              <CardTitle className="text-center">TRANSPORTADORA | HORA SAÍDA</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transportadoras.map((transportadora) => (
                <div 
                  key={transportadora.id}
                  className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${
                    transportadora.selected ? 'bg-blue-100 border-l-4 border-l-blue-600' : ''
                  }`}
                  onClick={() => handleSelectTransportadora(transportadora)}
                >
                  <div className="flex items-center justify-between">
                    <Edit className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">{transportadora.dataAdicao}</span>
                  </div>
                  <div className="font-semibold text-blue-900 mt-1">
                    {transportadora.nome}
                  </div>
                  <div className="text-lg font-bold mt-1">
                    {transportadora.horaSaida}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right Side - Activities */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95">
              <CardHeader className="bg-green-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>ADICIONAR ATIVIDADE</CardTitle>
                  <Button 
                    onClick={handleAddAtividade}
                    variant="outline"
                    size="sm"
                    className="border-white text-white hover:bg-white hover:text-green-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    +
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Activities Header */}
                <div className="bg-blue-800 text-white p-3 grid grid-cols-5 gap-2 text-sm font-semibold">
                  <div>ETAPA</div>
                  <div>OPERADOR</div>
                  <div>HORA INÍCIO / TÉRMINO PLAN</div>
                  <div>QTD</div>
                  <div></div>
                </div>
                
                {/* Activities List */}
                {atividades.map((atividade) => (
                  <div 
                    key={atividade.id}
                    className="p-3 border-b grid grid-cols-5 gap-2 items-center hover:bg-gray-50"
                  >
                    <div className="text-sm">
                      <div className="font-semibold text-blue-900">{atividade.etapa}</div>
                      <div className="text-xs text-gray-600">{atividade.transportadoraNome}</div>
                    </div>
                    <div className="text-sm font-semibold">{atividade.operador}</div>
                    <div className="text-sm">
                      <div>{atividade.horarioSalvo}</div>
                      <div className="text-gray-600">{atividade.horarioPlaneado}</div>
                    </div>
                    <div className="text-sm font-semibold">{atividade.volume}</div>
                    <div className="flex justify-center">
                      {atividade.status === 'concluido' ? (
                        <div className="bg-green-500 rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFinalizarAtividade(atividade)}
                          className="text-xs"
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAtividadeDialog} onOpenChange={setShowAtividadeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-900">ADICIONAR ETAPA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>TRANSPORTADORA</Label>
                <Input 
                  value={selectedTransportadora?.nome || ""} 
                  disabled 
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label>HORA DE SAÍDA</Label>
                <Input 
                  value={selectedTransportadora?.horaSaida || ""} 
                  disabled 
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="operador">* OPERADOR</Label>
                <Input
                  id="operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  placeholder="Nome do operador"
                />
              </div>
              <div>
                <Label htmlFor="etapa">* ETAPA</Label>
                <Select value={etapa} onValueChange={setEtapa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a etapa" />
                  </SelectTrigger>
                  <SelectContent>
                    {etapasDisponiveis.map((etapaOption) => (
                      <SelectItem key={etapaOption} value={etapaOption}>
                        {etapaOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="volume">* VOLUME</Label>
                <Input
                  id="volume"
                  type="number"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Qtd pallets"
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleSaveAtividade}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                INICIAR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Finalize Activity Dialog */}
      <Dialog open={showFinalizarDialog} onOpenChange={setShowFinalizarDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-blue-900">Finalizar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p>Deseja finalizar a tarefa {atividadeToFinalize?.etapa}?</p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFinalizarDialog(false)}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              Não
            </Button>
            <Button 
              onClick={confirmFinalizarAtividade}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sim
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planejamento;
