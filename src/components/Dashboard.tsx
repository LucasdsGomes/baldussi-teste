import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Call {
  id: string; // chamada_id
  empresa_id: string;
  data: string;
  duracao: number;
  origem: string;
  destino: string;
  sip_code: string;
  cliente_nome: string | null;
}

interface CallsResponse {
  page: number;
  limit: number;
  total: number;
  data: Call[];
}

interface HealthCheck {
  status: string;
  seed: number;
  tz_offset_min: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [company_name_filter, setCompanyNameFilter] = useState<string>("");
  const [calls, setCalls] = useState<Call[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0,
  });
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Health check
  useEffect(() => {
    const resHealth = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://217.196.61.183:8080/health");
        if (!response.ok) throw new Error("Erro na resposta do servidor");
        const data: HealthCheck = await response.json();
        setHealthCheck(data);
      } catch (err) {
        console.error(err);
        setError("Falha ao verificar status da API");
      } finally {
        setLoading(false);
      }
    };
    resHealth();
  }, []);

  // Recuperar usuário
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar dados do usuário");
    }
  }, []);

  // Função para buscar chamadas
  const fetchCalls = async (filterName?: string, page = 1) => {
    try {
      setLoading(true);
      let url = `http://217.196.61.183:8080/calls?page=${page}&limit=${pagination.limit}`;
      if (filterName) {
        url = `http://217.196.61.183:8080/calls?empresa_id=${encodeURIComponent(
          filterName
        )}&page=${page}&limit=${pagination.limit}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro na resposta do servidor");
      const result: CallsResponse = await response.json();

      const callsMapped = result.data.map((c: any, idx: number) => ({ ...c, idx }));
      setCalls(callsMapped || []);
      setPagination({ page: result.page, limit: result.limit, total: result.total });
      setIsFiltering(!!filterName);
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar chamadas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const filterByName = async () => {
    if (company_name_filter.trim()) await fetchCalls(company_name_filter, 1);
  };

  const clearFilter = async () => {
    setCompanyNameFilter("");
    await fetchCalls(undefined, 1);
  };

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.total / pagination.limit)) return;
    fetchCalls(company_name_filter, newPage);
  };

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  function navigateToUserDash() {
    navigate("/dashboard-users");
  }

  // KPIs
  const totalCalls = calls.length;
  const atendidas = calls.filter((c) => c.sip_code.startsWith("2")).length;
  const asr = totalCalls > 0 ? ((atendidas / totalCalls) * 100).toFixed(2) : "0";
  const acd =
  totalCalls > 0
    ? (
        calls.reduce((acc, c) => acc + (Number(c.duracao) || 0), 0) /
        totalCalls
      ).toFixed(2)
    : "0";

  // Série temporal (por hora)
  const chartData = Object.values(
    calls.reduce((acc: Record<string, any>, c) => {
      const hour = new Date(c.data).getHours();
      acc[hour] = acc[hour] || { hour: `${hour}:00`, total: 0 };
      acc[hour].total += 1;
      return acc;
    }, {})
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum usuário logado</h2>
          <p className="text-gray-600 mb-6">Você precisa estar autenticado para acessar o Dashboard.</p>
          <button onClick={() => navigate("/login")} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-7xl p-6 sm:p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">{`Bem-vindo(a), ${user.name}`}</h2>
          <div className="flex gap-2">
            <button onClick={navigateToUserDash} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
              Dashboard Usuários
            </button>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
              Sair
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <h3 className="text-gray-500 font-semibold">Total</h3>
            <p className="text-2xl font-bold">{totalCalls}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <h3 className="text-gray-500 font-semibold">Atendidas</h3>
            <p className="text-2xl font-bold">{atendidas}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <h3 className="text-gray-500 font-semibold">ASR (%)</h3>
            <p className="text-2xl font-bold">{asr}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <h3 className="text-gray-500 font-semibold">ACD (s)</h3>
            <p className="text-2xl font-bold">{acd}</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <h3 className="text-gray-700 font-semibold mb-2">Chamadas por hora</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Filtros */}
        <div className="flex justify-start items-center mb-4 gap-2">
          <h3 className="text-md text-gray-700">Filtrar Por Empresa:</h3>
          <select
            value={company_name_filter}
            onChange={(e) => setCompanyNameFilter(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">Selecione a empresa</option>
            <option value="DEVBALDUSSI">DEVBALDUSSI</option>
            <option value="BALDUSSI">BALDUSSI</option>
          </select>
          <button onClick={filterByName} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
            Filtrar
          </button>
          {isFiltering && (
            <button onClick={clearFilter} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              Limpar Filtro
            </button>
          )}
        </div>

        {/* Tabela de chamadas */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-300 text-sm sm:text-base">
              <thead className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Empresa</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Data</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Duração</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Origem</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">Destino</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">SIP Code</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.length > 0 ? (
                  calls.map((call, index) => (
                    <tr key={call.id || `call-${index}`} className="hover:bg-purple-50">
                      <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{call.empresa_id}</td>
                      <td className="px-4 py-3 text-gray-600">{call.cliente_nome || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{call.data || "N/A"}</td>
                      <td className="px-4 py-3 text-gray-600">{call.duracao}s</td>
                      <td className="px-4 py-3 text-gray-600">{call.origem}</td>
                      <td className="px-4 py-3 text-gray-600">{call.destino}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          call.sip_code.startsWith("2")
                            ? "bg-green-200 text-green-800"
                            : call.sip_code.startsWith("4")
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                        }`}>{call.sip_code}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-600 font-semibold">
                      {isFiltering
                        ? `Nenhuma chamada encontrada para "${company_name_filter}"`
                        : "Nenhuma chamada encontrada"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button onClick={() => changePage(pagination.page - 1)} className="px-3 py-1 bg-gray-200 rounded">Anterior</button>
          <span>Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}</span>
          <button onClick={() => changePage(pagination.page + 1)} className="px-3 py-1 bg-gray-200 rounded">Próxima</button>
        </div>
      </div>
    </div>
  );
}
