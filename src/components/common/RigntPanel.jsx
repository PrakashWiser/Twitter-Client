import { useState } from "react";
import useFollow from "../../hooks/useFollow";
import { Link } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";

const RightPanel = ({ suggestedUsers = [], isLoading }) => {
    const [followedIds, setFollowedIds] = useState([]);
    const [loadingUserId, setLoadingUserId] = useState(null);

    const { follow } = useFollow();

    const handleFollow = (e, userId) => {
        e.preventDefault();
        setLoadingUserId(userId);
        follow(userId, {
            onSuccess: () => setFollowedIds((prev) => [...prev, userId]),
            onSettled: () => setLoadingUserId(null),
        });
    };

    if (!isLoading && suggestedUsers.length === 0) {
        return null;
    }

    return (
        <div className="hidden lg:block my-4 mx-2">
            <div className="p-4 rounded-md sticky top-2">
                <p className="font-bold">Who to follow</p>
                <div className="flex flex-col gap-4">
                    {isLoading && (
                        <>
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                            <RightPanelSkeleton />
                        </>
                    )}
                    {!isLoading &&
                        suggestedUsers.map((user) => {
                            const isFollowed = followedIds.includes(user._id);
                            const isThisLoading = loadingUserId === user._id;

                            return (
                                <Link
                                    to={`/profile/${user.userName}`}
                                    className="flex items-center justify-between gap-4"
                                    key={user._id}
                                >
                                    <div className="flex gap-2 items-center">
                                        <div className="avatar">
                                            <div className="w-8 rounded-full">
                                                <img src={user.profileImg || "/avatar-placeholder.png"} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold tracking-tight truncate w-28">
                                                {user.fullName}
                                            </span>
                                            <span className="text-sm text-slate-500">@{user.userName}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                                            onClick={(e) => handleFollow(e, user._id)}
                                            disabled={isFollowed || isThisLoading}
                                        >
                                            {isThisLoading ? (
                                                <LoadingSpinner size="sm" />
                                            ) : isFollowed ? (
                                                "Following"
                                            ) : (
                                                "Follow"
                                            )}
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                </div>
            </div>
        </div>
    );
};

export default RightPanel;
