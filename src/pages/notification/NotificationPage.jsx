import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Baseurl } from "../../constant/url";

const NotificationPage = () => {
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            try {
                const res = await fetch(`${Baseurl}notifications`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Something went wrong");
                return data;
            } catch (error) {
                throw new Error(error?.message || "Something went wrong");
            }
        },
    });

    const { mutate: deleteNotifications } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch(`${Baseurl}notifications`, {
                    method: "DELETE",
                    credentials: "include"
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Something went wrong");
                return data;
            } catch (error) {
                throw new Error(error?.message || "Something went wrong");
            }
        },
        onSuccess: () => {
            toast.success("Notifications deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return (
        <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <p className="font-bold">Notifications</p>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost">
                        <IoSettingsOutline className="w-4" />
                    </div>
                    <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => deleteNotifications()}
                                className="w-full text-left"
                            >
                                Delete all notifications
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
            {isLoading && (
                <div className="flex justify-center h-full items-center">
                    <LoadingSpinner size="lg" />
                </div>
            )}

            {!isLoading && notifications?.length === 0 && (
                <div className="text-center p-4 font-bold text-gray-400">
                    No notifications yet <span className="text-lg">🤔</span>
                </div>
            )}

            {notifications?.map((notification) => (
                <div className="border-b border-gray-700" key={notification?._id}>
                    <div className="flex gap-2 p-4 items-center">
                        {notification?.type === "like" && <FaHeart className="w-7 h-7 text-red-500" />}
                        <Link to={`/profile/${notification?.from?.userName}`} className="flex gap-2 items-center">
                            <div className="avatar">
                                <div className="w-8 rounded-full">
                                    <img
                                        src={notification?.from?.profileImg || "/avatar-placeholder.png"}
                                        alt="avatar"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <span className="font-bold">@{notification?.from?.userName}</span>
                                {notification?.type === "follow" ? "followed you" : "liked your post"}
                            </div>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationPage;
