import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  MdOutlineMail,
  MdPassword,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { Baseurl } from "../../../constant/url";
import toast from "react-hot-toast";
import XSvg from "../../../components/svgs/X";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    fullName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signup, isPending } = useMutation({
    mutationFn: async ({ email, userName, fullName, password }) => {
      const res = await fetch(`${Baseurl}auth/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, userName, fullName, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong!");
      return data;
    },
    onSuccess: () => {
      toast.success("Signup successful!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Signup failed!");
    },
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1e1e1e] flex justify-center items-center px-4 py-10">
      <div className="bg-[#181818] shadow-xl rounded-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <XSvg className="w-14 fill-white mb-2" />
          <h2 className="text-white text-3xl text-center md:text-start font-bold">Create your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded px-4 py-2 focus-within:ring-2 ring-blue-600">
            <MdOutlineMail className="text-white text-xl" />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="bg-transparent w-full text-white outline-none placeholder-gray-400"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-[#2a2a2a] rounded px-4 py-2 flex-1 focus-within:ring-2 ring-blue-600">
              <FaUser className="text-white text-xl" />
              <input
                type="text"
                name="userName"
                required
                value={formData.userName}
                onChange={handleChange}
                placeholder="Username"
                className="bg-transparent w-full text-white outline-none placeholder-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 bg-[#2a2a2a] rounded px-4 py-2 flex-1 focus-within:ring-2 ring-blue-600">
              <MdDriveFileRenameOutline className="text-white text-xl" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name"
                className="bg-transparent w-full text-white outline-none placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded px-4 py-2 focus-within:ring-2 ring-blue-600">
            <MdPassword className="text-white text-xl" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="bg-transparent w-full text-white outline-none placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-white"
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full transition duration-200"
          >
            {isPending ? <LoadingSpinner /> : "Sign Up"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
