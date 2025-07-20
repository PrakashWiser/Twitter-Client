import toast from "react-hot-toast";
import { Baseurl } from "../constant/url";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
    const queryClient = useQueryClient()
    const { mutate: follow, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`${Baseurl}user/follow/${userId}`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Typ": "application/json"
                    }
                })
                const data = await res?.json();
                if (!res.ok) {
                    throw new Error(data?.error || "Something went wrong");
                }
                return data;
            } catch (error) {
                throw error
            }
        }, onSuccess: () => {
            toast.success("follow Sucessfully")
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
                queryClient.invalidateQueries({
                    queryKey: ["suggested"
                    ]
                })
            ])
        }, onError: (error) => {
            toast.error(error.message)
        }
    })
    return { follow, isPending }
}
export default useFollow