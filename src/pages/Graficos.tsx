
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

interface AtividadeGraficos extends Tables<'atividades'> {}

const Graficos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [atividades, setAtividades] = useState<AtividadeGraficos[]>([]);
  const [transportadoras, setTransportadoras] = useState<Tables<'transportadoras'>[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filteredAtividades, setFilteredAtividades] = useState<AtividadeGraficos[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAtividadesByDate();
  }, [selectedDate, atividades]);

  const loadData = async () => {
    // Carregar atividades
    const { data: atividadesData, error: atividadesError } = await supabase
      .from('atividades')
      .select('*')
      .order('id_sequencial', { ascending: false });

    if (atividadesError) {
      console.error('Erro ao carregar atividades:', atividadesError);
      toast({
        title: "Erro ao carregar atividades",
        description: atividadesError.message,
        variant: "destructive"
      });
    } else {
      setAtividades(atividadesData);
    }

    // Carregar transportadoras
    const { data: transportadorasData, error: transportadorasError } = await supabase
      .from('transportadoras')
      .select('*');

    if (transportadorasError) {
      console.error('Erro ao carregar transportadoras:', transportadorasError);
      toast({
        title: "Erro ao carregar transportadoras",
        description: transportadorasError.message,
        variant: "destructive"
      });
    } else {
      setTransportadoras(transportadorasData);
    }
  };

  const filterAtividadesByDate = () => {
    if (!selectedDate) {
      setFilteredAtividades(atividades);
      return;
    }

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const filtered = atividades.filter(atividade => {
      const createdDate = format(new Date(atividade.created_at), 'yyyy-MM-dd');
      return createdDate === dateString;
    });
    setFilteredAtividades(filtered);
  };

  // Dados para o gráfico de totais
  const totalsData = [
    {
      name: 'Transportadoras',
      value: transportadoras.length,
      fill: '#3b82f6'
    },
    {
      name: 'Atividades',
      value: atividades.length,
      fill: '#10b981'
    }
  ];

  // Dados para o gráfico de tempo
  const tempoData = () => {
    let tempoAtingido = 0;
    let tempoNaoAtingido = 0;

    filteredAtividades.forEach(atividade => {
      if (atividade.tempo_match === true) {
        tempoAtingido++;
      } else if (atividade.tempo_match === false) {
        tempoNaoAtingido++;
      }
    });

    return [
      { name: 'Tempo Atingido', value: tempoAtingido, fill: '#10b981' },
      { name: 'Tempo Não Atingido', value: tempoNaoAtingido, fill: '#ef4444' }
    ];
  };

  // Dados para o gráfico de aprovação
  const aprovacaoData = () => {
    const aprovadas = filteredAtividades.filter(a => a.status === 'aprovado').length;
    const pendentes = filteredAtividades.filter(a => a.status === 'concluido' || a.status === 'pendente').length;

    return [
      { name: 'Aprovadas', value: aprovadas, fill: '#10b981' },
      { name: 'Pendentes', value: pendentes, fill: '#f59e0b' }
    ];
  };

  const chartConfig = {
    value: {
      label: "Valor",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/gestor')}
              className="text-gray-300 hover:bg-white/10 mr-3 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-white">Gráficos - CHECK FAC / COO</h1>
          </div>
          <div className="bg-red-600 text-white px-3 py-1 rounded text-sm">3M</div>
        </div>

        {/* Filtro de Data */}
        <Card className="bg-gray-800/95 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <label className="text-gray-300 text-sm">Filtrar por data:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-gray-700 border-gray-600 text-gray-300",
                      !selectedDate && "text-gray-500"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="bg-gray-800 text-white"
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(undefined)}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  Limpar filtro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Totais */}
          <Card className="bg-gray-800/95 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Total de Transportadoras e Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={totalsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Tempo */}
          <Card className="bg-gray-800/95 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Tempo Atingido vs Não Atingido
                {selectedDate && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({format(selectedDate, "dd/MM/yyyy")})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tempoData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tempoData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Aprovação */}
          <Card className="bg-gray-800/95 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Atividades Aprovadas vs Pendentes
                {selectedDate && (
                  <span className="text-sm font-normal text-gray-400 ml-2">
                    ({format(selectedDate, "dd/MM/yyyy")})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aprovacaoData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {aprovacaoData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Estatísticas Resumidas */}
          <Card className="bg-gray-800/95 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Resumo Estatístico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {transportadoras.length}
                    </div>
                    <div className="text-blue-300 text-sm">Total Transportadoras</div>
                  </div>
                  <div className="bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {atividades.length}
                    </div>
                    <div className="text-green-300 text-sm">Total Atividades</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">
                      {filteredAtividades.filter(a => a.status === 'aprovado').length}
                    </div>
                    <div className="text-emerald-300 text-sm">Atividades Aprovadas</div>
                  </div>
                  <div className="bg-yellow-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {filteredAtividades.filter(a => a.status === 'concluido' || a.status === 'pendente').length}
                    </div>
                    <div className="text-yellow-300 text-sm">Atividades Pendentes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Graficos;
