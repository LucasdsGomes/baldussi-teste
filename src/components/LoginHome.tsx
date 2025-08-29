import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  email: string;
  password: string;
}

export default function LoginHome() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  //const [loggedIn, setLoggedIn] = useState(false);

  function navigateToRegister() {
    navigate("/register");
  }

  const validatingForm = () => {
    if (!email || !password) {
      alert("Por favor, preencha todos os campos.");
      return false;
    }
    return true;
  };

  const loginUser = async () => {
    if (!validatingForm()) return;
    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const dataUser: User = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(dataUser));
        navigate("/");
      } else {
        alert("Email ou senha inválidos. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao fazer login. Por favor, Fale com o suporte.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center whitespace-nowrap font-mono">
        Login
        </h2>
        <hr></hr>
        <h2 className="text-sm mt-3 font-bold text-gray-800 mb-6 text-center overflow-hidden whitespace-nowrap border-r-4 border-gray-800 animate-typing font-mono">
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <button onClick={loginUser} className="mt-6 w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg transition font-mono">
          Login
        </button>

        <p className="mt-4 text-center text-gray-500 text-sm">
          Não tem uma conta? {" "}
          <button onClick={navigateToRegister}>
            <span className="text-pink-500 font-semibold cursor-pointer hover:underline">
            Registre-se
            </span>
          </button>
        </p>
      </div>
    </div>
  );
}
