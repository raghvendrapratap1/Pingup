import toast from "react-hot-toast";

const httpAction = async (data) => {
  try {
    const response = await fetch(data.url, {
      method: data.method || "GET",
      body: data.body ? JSON.stringify(data.body) : null,
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ cookie send & receive ke liye
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result?.message || "Something went wrong");
    return result;
  } catch (error) {
    toast.error(error.message);
    return null;
  }
};

export default httpAction;
