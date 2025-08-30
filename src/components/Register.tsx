//import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;
}

export default function Register() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const navigate = useNavigate();

  const validatingForm = () => {
    if (!email || !password || !confirmPassword || !name) {
      alert("Por favor, preencha todos os campos.");
      return false;
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return false;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return false;
    }

    return true;
  };

  const createUser = async () => {
    if (!validatingForm()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          password,
          role,
          is_active: true,
          created_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
      throw new Error("Falha ao registrar usuário");
    }

      const newUser: User = await response.json();
      localStorage.setItem("user", JSON.stringify(newUser));
      console.log("log done or not done: ", newUser);
      // Optionally navigate to another page or show a success message
      navigate("/");
    } catch (e) {
      console.error("Error creating user:", e);
      alert("Erro ao registrar. Possível email já cadastrado.");
    }
  };

  function navigateToLogin() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center overflow-hidden whitespace-nowrap border-gray-800 font-mono">
          Registre-se
        </h2>
        <hr></hr>
        <h2 className="text-sm mt-3 font-bold text-gray-800 mt-2 mb-6 text-center overflow-hidden whitespace-nowrap border-r-4 border-gray-800 animate-typing font-mono">
          Baldussi Telecom
        </h2>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="mb-1 text-gray-700 font-medium font-mono"
            >
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <label
              htmlFor="text"
              className="mt-3 mb-1 text-gray-700 font-medium font-mono"
            >
              Nome Completo
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="mb-1 text-gray-700 font-medium font-mono"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label
              htmlFor="password"
              className="mb-1 text-gray-700 font-medium font-mono mt-2"
            >
              Confirme a Senha
            </label>
            <input
              id="confirmpassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <input
            id="role"
            type="checkbox"
            value={role}
            onChange={(e) => setRole(e.target.checked ? "admin" : "user")}
            className="h-5 w-5 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
          />
          <label
            htmlFor="role"
            className="text-gray-700 font-medium font-mono cursor-pointer"
          >
            Sou um administrador?
          </label>
        </div>

        <button
          onClick={createUser}
          className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg transition font-mono"
        >
          Registrar
        </button>

        <p className="mt-4 text-center text-gray-500 text-sm">
          Lembrou o login?{" "}
          <button onClick={navigateToLogin}>
            <span className="text-pink-500 font-semibold cursor-pointer hover:underline">
              Login
            </span>
          </button>
        </p>
      </div>
    </div>
  );
}
