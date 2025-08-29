import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  //const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  function navigateToLogin() {
    navigate("/login");
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // useEffect(() => {
  //   fetch("http://127.0.0.1:8000/users/")
  //     .then(res => res.json())
  //     .then((data: User[]) => setUsers(data));
  // }, []);

  return user ? (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-5xl p-6 sm:p-10">
        <button
          onClick={() => {
            localStorage.removeItem("user");
            navigateToLogin();
          }}
          className="top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base"
        >
          Sair
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center font-mono">
          Bem-vindo ao Dashboard {user.email}
          <hr></hr>
        </h2>

        <div className="flex justify-start mb-4">
          <button className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition-colors">
            Adicionar Usuário
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-purple-200/50">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tl-lg">
                  Páginas
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Limite de Registros
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  ID da Empresa
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Data Inicial
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Data Final
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Destino
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Código SIP
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Busca Textual
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 bg-red-400 uppercase tracking-wider rounded-tr-lg">
                  AÇÕES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-purple-50 transition-colors duration-200">
                <td className="py-4 px-6 text-sm text-gray-600">1</td>
                <td className="py-4 px-6 text-sm text-gray-600">João Silva</td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  joao@example.com
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  joao@example.com
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  joao@example.com
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  joao@example.com
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  joao@example.com
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  joao@example.com
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 text-center flex justify-center gap-2">
                  <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-500 transition-colors">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors">
                    Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
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
            onClick={() => navigateToLogin()}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-colors font-mono"
          >
            Ir para Login
          </button>
        </div>
      </div>
    </div>
  );
}
