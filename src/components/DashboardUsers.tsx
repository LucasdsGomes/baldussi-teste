import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function DashboardUsers() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  // Recuperar usuário do localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
      else {
        listUsers();
      }
    } catch (err) {
      console.error("Erro ao recuperar usuário:", err);
      setError("Falha ao carregar dados do usuário");
    }
  }, []);

  //Função para editar usuário
  const editUser = async (user_id: number, updatedData: Partial<User>) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/users/${user_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erro na resposta do servidor");
      }
      const updatedUser = await response.json();
      setUsers(users.map((user) => (user.id === user_id ? updatedUser : user)));
      setError(null);
    } catch (err: any) {
      console.error("Erro ao editar usuário:", err);
      setError(err.message || "Falha ao editar usuário");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (u: User) => {
    setEditingUserId(u.id);
    setEditFormData(u); // carrega os dados atuais do usuário
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const saveEdit = async (user_id: number) => {
    await editUser(user_id, editFormData);
    const updatedUsers = users.map((u) =>
      u.id === user_id ? { ...u, ...editFormData } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    if (user?.id === user_id) {
      const updatedLoggedUser = { ...user, ...editFormData };
      setUser(updatedLoggedUser);
      localStorage.setItem("user", JSON.stringify(updatedLoggedUser));
    }

    setEditingUserId(null);
  };

  // Função para deletar usuário
  const deleteUser = async (user_id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/users/${user_id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erro na resposta do servidor");
      }
      console.log(setUsers);
      setUsers(users.filter((user) => user.id !== user_id));
      console.log(setUsers);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao deletar usuário:", err);
      setError(err.message || "Falha ao deletar usuário");
    } finally {
      setLoading(false);
    }
  };

  // Chamada dos Usuários
  const listUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/users/`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Erro na resposta do servidor");
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao listar usuários:", err);
      setError(err.message || "Falha ao listar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listUsers();
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  function navigateToLogin() {
    navigate("/login");
  }
  function navigateToRegister() {
    navigate("/register");
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
          <button
            onClick={() => navigate(-1)}
            className="bg-green-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base"
          >
            Voltar
          </button>
          <h2 className="text-3xl font-bold text-gray-800 font-mono">
            Bem-vindo(a), {user.name}
          </h2>
          <button
            onClick={navigateToRegister}
            className="bg-blue-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base"
          >
            Registrar Novo Usuário
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-mono shadow-lg transition text-sm sm:text-base"
          >
            Sair
          </button>
        </div>

        <hr className="mb-6" />

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
                    ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Função
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-800">
                    Data de Criação
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-800">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-purple-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-gray-600">{u.id}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {editingUserId === u.id ? (
                          <input
                            type="text"
                            value={editFormData.name || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                name: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded w-full"
                          />
                        ) : (
                          u.name
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {editingUserId === u.id ? (
                          <input
                            type="email"
                            value={editFormData.email || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                email: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded w-full"
                          />
                        ) : (
                          u.email
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editingUserId === u.id ? (
                          <select
                            value={editFormData.role || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                role: e.target.value,
                              })
                            }
                            className="border px-2 py-1 rounded"
                          >
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.role === "admin"
                                ? "bg-purple-200 text-purple-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.is_active
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {u.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {u.created_at.split("T")[0]}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        {editingUserId === u.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(u.id)}
                              className="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600 transition-colors text-xs"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-400 text-white px-3 py-1 rounded-lg shadow hover:bg-gray-500 transition-colors text-xs"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            {user.role === "user" ? (
                              <span className="text-gray-500 italic text-xs">
                                Você precisa ser admin para poder excluir e
                                editar
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(u)}
                                  className="bg-yellow-400 text-white px-3 py-1 rounded-lg shadow hover:bg-yellow-500 transition-colors text-xs"
                                >
                                  Editar
                                </button>

                                {u.id === user?.id ? (
                                  <button
                                    disabled
                                    className="bg-gray-300 text-gray-600 px-3 py-1 rounded-lg shadow cursor-not-allowed text-xs"
                                  >
                                    Excluir
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => deleteUser(u.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg shadow hover:bg-red-600 transition-colors text-xs"
                                  >
                                    Excluir
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-600 font-semibold"
                    >
                      Nenhum usuário encontrado.
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
