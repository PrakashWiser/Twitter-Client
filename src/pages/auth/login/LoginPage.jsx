import { useState } from "react";
import { Link } from "react-router-dom";
import XSvg from "../../../components/svgs/X";
import { MdPassword } from "react-icons/md";
import { Baseurl } from "../../../constant/url";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaUserTie } from "react-icons/fa";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ userName, password }) => {
      const res = await fetch(`${Baseurl}auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Login Successful!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setFormData({ userName: "", password: "" });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1e1e1e] flex justify-center items-center px-4 py-10">
      <div className="bg-[#181818] shadow-xl rounded-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <XSvg className="w-14 fill-white mb-2" />
          <h2 className="text-white text-3xl font-bold">Welcome back</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded px-4 py-2 focus-within:ring-2 ring-blue-600">
            <FaUserTie className="text-white text-xl" />
            <input
              type="text"
              name="userName"
              required
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="Username"
              className="bg-transparent w-full text-white outline-none placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded px-4 py-2 focus-within:ring-2 ring-blue-600">
            <MdPassword className="text-white text-xl" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="bg-transparent w-full text-white outline-none placeholder-gray-400"
            />
          </div>

          {isError && <p className="text-red-500">{error.message}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full transition duration-200"
          >
            {isPending ? <LoadingSpinner /> : "Login"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
