import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Baseurl } from '../constant/url';

const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useMutation({
        mutationFn: async (formData) => {
            console.log("formData:", formData); // ✅ Should show { profileImg, coverImg }
            try {
                const res = await fetch(`${Baseurl}user/update`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }
                return data;
            } catch (error) {
                console.error("updateProfile error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            queryClient.invalidateQueries(["authUser"]);
            queryClient.invalidateQueries(["userProfile"]);
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update profile");
        }
    });

    return { updateProfile, isUpdatingProfile };
};

export default useUpdateUserProfile;
