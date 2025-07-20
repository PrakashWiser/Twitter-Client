export const fetchAuthUser = async () => {
    const res = await fetch(`${Baseurl}auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
};