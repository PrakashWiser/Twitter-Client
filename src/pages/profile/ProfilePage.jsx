import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { formatMemberSinceDate } from "../../utils/date";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import { Baseurl } from "../../constant/url";
import { fetchAuthUser } from "../../api/FetchauthUser";
import EditProfileModal from "./EditProfileModel";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import ChatOffcanvas from "../../components/common/ChatOffcanvas";

const ProfilePage = () => {
  const [showChat, setShowChat] = useState(false);
  const handleOpenChat = () => setShowChat(true);
  const handleCloseChat = () => setShowChat(false);
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const { username } = useParams();
  const { follow, isPending } = useFollow();

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
    queryFn: fetchAuthUser,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`${Baseurl}user/profile/${username}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
  });

  const isMyProfile = authUser?._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following?.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { updateProfile, isUpdatingProfile } = useUpdateUserProfile();

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  return (
    <>
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}

        <div className="flex flex-col">
          {!isLoading && !isRefetching && user && (
            <>
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
                      alt="profile"
                    />
                    {isMyProfile && (
                      <div
                        className="absolute top-5 right-3 p-1 bg-primary rounded-full bg-opacity-75 cursor-pointer"
                        onClick={() => profileImgRef.current.click()}
                      >
                        <MdEdit className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-4 gap-3 mt-5">
                {isMyProfile && <EditProfileModal authUser={authUser} />}
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={() => follow(user._id)}
                  >
                    {isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
                  </button>
                )}
                {authUser._id !== user._id && <button
                  className="btn btn-primary rounded-full btn-sm text-white px-4"
                  onClick={handleOpenChat}
                >
                  Message
                </button>}
                {(coverImg || profileImg) && (
                  <button
                    className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2"
                    onClick={async () => {
                      await updateProfile({ coverImg, profileImg });
                      setProfileImg(null);
                      setCoverImg(null);
                    }}
                  >
                    {isUpdatingProfile ? <LoadingSpinner /> : "Update"}
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{user?.fullName}</span>
                  <span className="text-sm text-slate-500">@{user?.userName}</span>
                  <span className="text-sm my-1">{user?.bio}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user?.link && (
                    <div className="flex gap-1 items-center">
                      <FaLink className="w-3 h-3 text-slate-500" />
                      <a
                        href={user?.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {user?.link}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">{memberSinceDate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">{user?.following?.length}</span>
                    <span className="text-slate-500 text-xs">Following</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-xs">{user?.followers?.length}</span>
                    <span className="text-slate-500 text-xs">Followers</span>
                  </div>
                </div>
              </div>

              <div className="flex w-full border-b border-gray-700 mt-4">
                <div
                  className={`flex justify-center flex-1 p-3 relative cursor-pointer ${feedType === "posts" ? "text-primary" : ""
                    }`}
                  onClick={() => setFeedType("posts")}
                >
                  Posts
                  {feedType === "posts" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <div
                  className={`flex justify-center flex-1 p-3 relative cursor-pointer ${feedType === "likes" ? "text-primary" : ""
                    }`}
                  onClick={() => setFeedType("likes")}
                >
                  Likes
                  {feedType === "likes" && (
                    <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </>
          )}

          <Posts feedType={feedType} username={username} userId={user?._id} />
        </div>

        <ChatOffcanvas
          show={showChat}
          handleClose={handleCloseChat}
          username={user?.userName}
          recipientUserId={user?._id}
          currentUserId={authUser?._id}
          profileImg={user?.profileImg}
        />
      </div>
    </>
  );
};

export default ProfilePage;
