import XSvg from "../svgs/X";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { PiSmileySadDuotone } from "react-icons/pi";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Baseurl } from "../../constant/url";
import { fetchAuthUser } from "../../api/FetchauthUser";

const Sidebar = () => {
    const queryClient = useQueryClient();
    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
        queryFn: fetchAuthUser,
        refetchOnWindowFocus: false,
        enabled: true,
        retry: false,
    });

    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${Baseurl}auth/logout`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Something went wrong");
            } catch (error) {
                throw new Error(error.message || "Logout failed");
            }
        },
        onSuccess: () => {
            queryClient.setQueryData(["authUser"], null);
            toast.success("Logout Successfully");
        },
        onError: () => {
            toast.error("Logout failed");
        },
    });

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
    };

    return (
        <div className="md:flex-[1_1_0]  md:w-20 md:max-w-50">
            <div className="hidden md:flex sticky top-0 left-0 h-screen flex-col border-r border-gray-700 w-20 md:w-full">
                <Link to="/" className="flex justify-center md:justify-start">
                    <XSvg className="px-2 w-12 h-12 rounded-full fill-white" />
                </Link>
                <ul className="flex flex-col gap-3 mt-4">
                    <li className="flex justify-center md:justify-start">
                        <Link
                            to="/"
                            className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
                        >
                            <MdHomeFilled className="w-8 h-8" />
                            <span className="text-lg hidden md:block">Home</span>
                        </Link>
                    </li>
                    <li className="flex justify-center md:justify-start">
                        <Link
                            to="/notifications"
                            className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
                        >
                            <IoNotifications className="w-6 h-6" />
                            <span className="text-lg hidden md:block">Notifications</span>
                        </Link>
                    </li>
                    {authUser && (
                        <li className="flex justify-center md:justify-start">
                            <Link
                                to={`/profile/${authUser?.userName}`}
                                className="flex gap-3 items-center transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
                            >
                                <FaUser className="w-6 h-6" />
                                <span className="text-lg hidden md:block">Profile</span>
                            </Link>
                        </li>
                    )}
                </ul>

                {authUser ? (
                    <Link
                        to={`/profile/${authUser?.userName}`}
                        className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 py-2 px-4 rounded-full"
                    >
                        <div className="avatar hidden md:inline-flex">
                            <div className="w-8 rounded-full">
                                <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
                            </div>
                        </div>
                        <div className="flex justify-between flex-1">
                            <div className="hidden md:block">
                                <p className="text-white font-bold text-sm w-20 truncate">{authUser?.fullName}</p>
                                <p className="text-slate-500 text-sm">@{authUser?.userName}</p>
                            </div>
                            <BiLogOut
                                className="w-5 h-5 cursor-pointer"
                                onClick={handleLogout}
                            />
                        </div>
                    </Link>
                ) : (
                    <div className="mt-auto mb-10 px-4">
                        <Link to="/login">
                            <button className="btn btn-primary rounded-full btn-sm text-white px-8">
                                <PiSmileySadDuotone className="mr-1" />
                                Login
                            </button>
                        </Link>
                    </div>
                )}
            </div>
            <div className="md:hidden fixed bottom-0 left-0 w-full h-16 bg-[#111827] border-t border-gray-700 flex justify-around items-center  z-50">
                <Link to="/" className="flex flex-col items-center gap-0.5">
                    <MdHomeFilled className="w-6 h-6" />
                    <span className="text-xs">Home</span>
                </Link>

                <Link to="/notifications" className="flex flex-col items-center gap-0.5">
                    <IoNotifications className="w-6 h-6 " />
                    <span className="text-xs">Notify</span>
                </Link>
                {authUser ? (
                    <>
                        <Link to={`/profile/${authUser?.userName}`} className="flex flex-col items-center gap-0.5">
                            <FaUser className="w-6 h-6" />
                            <span className="text-xs">Profile</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex flex-col items-center gap-0.5"
                        >
                            <BiLogOut className="w-6 h-6" />
                            <span className="text-xs ">Logout</span>
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="flex flex-col items-center gap-0.5">
                        <PiSmileySadDuotone className="w-6 h-6" />
                        <span className="text-xs">Login</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
