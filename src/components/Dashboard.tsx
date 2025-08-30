import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Call {
  id: string; // mapeado de chamada_id
  empresa_id: string;
  data_inicio: string;
  duracao: string;
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
        console.error("Erro ao verificar health check:", err);
        setError("Falha ao verificar status da API");
      } finally {
        setLoading(false);
      }
    };
    resHealth();
  }, []);

  // Recuperar usuário do localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (err) {
      console.error("Erro ao recuperar usuário:", err);
      setError("Falha ao carregar dados do usuário");
    }
  }, []);

  // Função para deletar chamada
  const deleteCall = async (callId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/calls/${callId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erro na resposta do servidor");
      }
      await fetchCalls(isFiltering ? company_name_filter : undefined);
    } catch (err: any) {
      console.error("Erro ao deletar chamada:", err);
      setError(err.message || "Falha ao deletar chamada");
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar chamadas
  const fetchCalls = async (filterName?: string) => {
    try {
      setLoading(true);
      let url = "http://217.196.61.183:8080/calls/";
      if (filterName) {
        url = `http://217.196.61.183:8080/calls?empresa_id=${encodeURIComponent(
          filterName
        )}&page=1&limit=100`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Erro na resposta do servidor");
      const result: CallsResponse = await response.json();

      // Mapear chamada_id para id
      const callsMapped = result.data.map((call: any) => ({
        ...call,
        id: call.chamada_id,
      }));

      setCalls(callsMapped || []);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
      });
      setIsFiltering(!!filterName);
    } catch (err) {
      console.error("Erro ao buscar chamadas:", err);
      setError("Falha ao carregar chamadas");
    } finally {
      setLoading(false);
    }
  };

  const filterByName = async () => {
    if (company_name_filter.trim()) await fetchCalls(company_name_filter);
  };

  const clearFilter = async () => {
    setCompanyNameFilter("");
    await fetchCalls();
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  function navigateToLogin() {
    navigate("/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-purple-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2 font-mono">
              Nenhum usuário logado
            </h2>
            <p className="text-gray-600 mb-6 font-mono">
              Você precisa estar autenticado para acessar o Dashboard.
            </p>
            <button
              onClick={navigateToLogin}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors font-mono"
            >
              Ir para Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-7xl p-6 sm:p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 font-mono">
            Bem-vindo(a), {user.name}
          </h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base"
          >
            Sair
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-800 font-mono">
            Health Check da API
            <ul className="text-sm text-gray-600">
              <li>
                <span className="font-semibold">Status:</span>{" "}
                {healthCheck?.status || "N/A"}
              </li>
              <li>
                <span className="font-semibold">Seed:</span>{" "}
                {healthCheck?.seed || "N/A"}
              </li>
              <li>
                <span className="font-semibold">Timezone Offset (min):</span>{" "}
                {healthCheck?.tz_offset_min || "N/A"}
              </li>
            </ul>
          </h2>
        </div>
        <hr className="mb-6" />

        {/* Filtros */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h3 className="text-md text-gray-700 mr-3">Filtrar Por Empresa:</h3>
            <select
              id="company_name_filter"
              value={company_name_filter}
              onChange={(e) => setCompanyNameFilter(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">Selecione a empresa</option>
              <option value="DEVBALDUSSI">DEVBALDUSSI</option>
              <option value="BALDUSSI">BALDUSSI</option>
            </select>
            <button
              onClick={filterByName}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base ml-2"
            >
              Filtrar
            </button>
            {isFiltering && (
              <button
                onClick={clearFilter}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base ml-2"
              >
                Limpar Filtro
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-300 text-sm sm:text-base">
              <thead className="bg-gradient-to-r from-purple-300 via-pink-300 to-red-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Empresa
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Duração
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Origem
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Destino
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    SIP Code
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-800">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.length > 0 ? (
                  calls.map((call, index) => (
                    <tr
                      key={call.id}
                      className="hover:bg-purple-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {call.empresa_id}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {call.cliente_nome || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {call.data_inicio
                          ? call.data_inicio.split("T")[0]
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {call.duracao}s
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{call.origem}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {call.destino}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            call.sip_code.startsWith("2")
                              ? "bg-green-200 text-green-800"
                              : call.sip_code.startsWith("4")
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {call.sip_code}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-500 transition-colors text-xs">
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCall(call.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors text-xs"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-gray-600 font-semibold"
                    >
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
      </div>
    </div>
  );
}
