import { useState } from "react";

export default function Dashboard() {
    const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-5xl p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center font-mono">
          Bem-vindo ao Dashboard
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
                  ID
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Nome
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider rounded-tr-lg">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-purple-50 transition-colors duration-200">
                <td className="py-4 px-6 text-sm text-gray-600">1</td>
                <td className="py-4 px-6 text-sm text-gray-600">João Silva</td>
                <td className="py-4 px-6 text-sm text-gray-600">joao@example.com</td>
                <td className="py-4 px-6 text-sm text-gray-600 text-center flex justify-center gap-2">
                  <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-500 transition-colors">
                    Editar
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors">
                    Excluir
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-purple-50 transition-colors duration-200">
                <td className="py-4 px-6 text-sm text-gray-600">2</td>
                <td className="py-4 px-6 text-sm text-gray-600">Maria Souza</td>
                <td className="py-4 px-6 text-sm text-gray-600">maria@example.com</td>
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
  );
}
