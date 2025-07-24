import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import XSvg from "../../../components/svgs/X";
import { MdOutlineMail, MdPassword, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { Baseurl } from "../../../constant/url";
import toast from "react-hot-toast";
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

  const { mutate: signup, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, userName, fullName, password }) => {
      try {
        const res = await fetch(`${Baseurl}auth/signup`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email, userName, fullName, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong!");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Signup successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Signup error!");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col items-center">
            <XSvg className="w-24 lg:hidden fill-white" />
            <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          </div>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
              required
            />
          </label>

          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="userName"
                onChange={handleInputChange}
                value={formData.userName}
                required
              />
            </label>

            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
                required
              />
            </label>
          </div>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type={showPassword ? "text" : "password"}
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <MdVisibilityOff className="text-gray-500" />
              ) : (
                <MdVisibility className="text-gray-500" />
              )}
            </button>
          </label>

          <button className="btn rounded-full btn-primary text-white">
            {isPending ? <LoadingSpinner /> : "Sign up"}
          </button>

          {isError && <p className="text-red-500">{error.message}</p>}
        </form>

        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
