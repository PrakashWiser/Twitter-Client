import { Baseurl } from "../constant/url";
export const fetchAuthUser = async () => {
    const res = await fetch(`${Baseurl}auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch user");
    return data;
};

export const fetchSuggestedUsers = async () => {
    const res = await fetch(`${Baseurl}user/suggested`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong!");
    return data;
};
