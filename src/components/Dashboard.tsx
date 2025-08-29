import { useState, useEffect } from "react";
import { parse, format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
}

interface Call {
  id: number;
  empresa_id: number;
  data_inicio: string;
  data_fim: string;
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<Call[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 100,
    total: 0
  });
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    
    // Tenta converter a string para Date
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      // Se não for válida, tenta parse manualmente
      const isoString = dateString.replace(' ', 'T') + 'Z';
      const correctedDate = new Date(isoString);
      
      if (!isNaN(correctedDate.getTime())) {
        return correctedDate.toLocaleString('pt-BR');
      }
      return "N/A"; // Retorna N/A se a data ainda for inválida
    }
    return date.toLocaleString('pt-BR');
  };
  

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Erro ao recuperar usuário:", err);
      setError("Falha ao carregar dados do usuário");
    }
  }, []);

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://217.196.61.183:8080/calls/");
        
        if (!response.ok) {
          throw new Error("Erro na resposta do servidor");
        }
        
        const data: CallsResponse = await response.json();
        setCalls(data.data || []);
        setPagination({
          page: data.page,
          limit: data.limit,
          total: data.total
        });
      } catch (err) {
        console.error("Erro ao buscar chamadas:", err);
        setError("Falha ao carregar chamadas");
      } finally {
        setLoading(false);
      }
    };

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
            Bem-vindo, {user.email}
          </h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base"
          >
            Sair
          </button>
        </div>

        <hr className="mb-6" />

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-700">
            Lista de Chamadas ({pagination.total} registros)
          </h3>
          <div className="text-sm text-gray-600">
            Página {pagination.page} de {Math.ceil(pagination.total / pagination.limit)}
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
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-200/50">
                <tr>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Empresa ID
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Início
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fim
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="py-3 px-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SIP Code
                  </th>
                  <th className="py-3 px-3 text-center text-xs font-semibold text-gray-700 bg-red-400 uppercase tracking-wider">
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calls.length > 0 ? (
                  calls.map((call) => (
                    <tr key={call.id} className="hover:bg-purple-50 transition-colors duration-200">
                      <td className="py-4 px-3 text-sm text-gray-600">{call.empresa_id}</td>
                      <td className="py-4 px-3 text-sm text-gray-600">{call.cliente_nome || "N/A"}</td>
                      <td className="py-4 px-3 text-sm text-gray-600">
                        {formatDate(call.data_inicio)}
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-600">
                        {formatDate(call.data_fim)}
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-600">{call.duracao}s</td>
                      <td className="py-4 px-3 text-sm text-gray-600">{call.origem}</td>
                      <td className="py-4 px-3 text-sm text-gray-600">{call.destino}</td>
                      <td className="py-4 px-3 text-sm text-gray-600">{call.sip_code}</td>
                      <td className="py-4 px-3 text-sm text-gray-600 text-center flex justify-center gap-2">
                        <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-500 transition-colors text-xs">
                          Editar
                        </button>
                        <button className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors text-xs">
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-4 text-center text-gray-500">
                      Nenhuma chamada encontrada
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