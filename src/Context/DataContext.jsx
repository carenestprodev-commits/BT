import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useToast } from "./ToastContext";
import {fetchWithAuth} from "../lib/fetchWithAuth.js";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    invoices: [],
    transactions: [],
  });
  const [authorData, setAuthorData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalSales, setTotalSales] = useState(null);
  const [todayMoney, setTodayMoney] = useState(null);
  const [orders, setOrders] = useState([]);

  // Toast helper (show toast messages instead of alert())
  const { showToast } = useToast();

  const API_URL = "http://192.168.10.210:8000/api";

  const getToken = () => {
    const rememberMe = JSON.parse(
      localStorage.getItem("rememberMe") ||
        sessionStorage.getItem("rememberMe") ||
        "false"
    );
    const storage = rememberMe ? localStorage : sessionStorage;
    return storage.getItem("accessToken");
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      // console.log("🌀 fetchSalesData called");

      const token = getToken();
      // console.log("🔐 Token:", token);
      if (!token) {
        // console.error("⛔ No access token found.");
        return;
      }

      try {
        const res = await fetch(
          "https://novel-fresh-spaniel.ngrok-free.app/api/projects_finance/sales-overview/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "any",
            },
          }
        );

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          // console.log("✅ API Response Data:", data);
          setSalesData(data.sales_overview || data);
        } else {
          const text = await res.text();
          // console.warn("❌ Got HTML instead of JSON", text.slice(0, 300));
        }
      } catch (err) {
        // console.error("🚨 Fetch failed:", err);
      }
    };

    const fetchAuthorData = async () => {
      // console.log("🌀 fetchAuthorData called");

      const token = getToken();
      // console.log("🔐 Token:", token);
      if (!token) {
        // console.error("⛔ No access token found.");
        return;
      }

      try {
        const res = await fetch(
          "https://novel-fresh-spaniel.ngrok-free.app/api/author/authors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "ngrok-skip-browser-warning": "any",
            },
          }
        );

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          // console.log("✅ Author Data:", data);
          setAuthorData(data);
        } else {
          const text = await res.text();
          // console.warn("❌ Unexpected content-type (not JSON):", text.slice(0, 300));
        }
      } catch (err) {
        // console.error("🚨 Author fetch failed:", err);
      }
    };

    fetchSalesData();
    fetchAuthorData();
    fetchProjects();
    fetchInvoices();
    fetchTransactions();
    fetchTotalSales();
    fetchTodayMoney();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        "https://novel-fresh-spaniel.ngrok-free.app/api/projects_finance/orders/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "any",
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.orders) {
        setOrders(data.orders);
      } else {
        console.error("❌ Failed to fetch orders:", data);
      }
    } catch (err) {
      console.error("🚨 Error fetching orders:", err);
    }
  };

  const fetchTodayMoney = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        "https://novel-fresh-spaniel.ngrok-free.app/api/projects_finance/today-money/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "any",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (res.ok && typeof data.today_money !== "undefined") {
        setTodayMoney(data.today_money);
      } else {
        console.error("❌ Failed to fetch today's money.");
      }
    } catch (err) {
      console.error("🚨 Error fetching today's money:", err);
    }
  };

  // In context/DataContext.jsx or wherever your context is defined

  const fetchTotalSales = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        "https://novel-fresh-spaniel.ngrok-free.app/api/projects_finance/total-sales/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "any",
            Accept: "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok && data.total_sales !== undefined) {
        setTotalSales(data.total_sales);
      } else {
        console.error("❌ Failed to fetch total sales.");
      }
    } catch (err) {
      console.error("🚨 Error fetching total sales:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = getToken(); // Assume this returns your access token
      const res = await fetch(
        "https://novel-fresh-spaniel.ngrok-free.app/api/projects_finance/transactions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "any",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("transaction data: ", data);
      if (res.ok && data.transactions) {
        setTransactions(data.transactions);
      } else {
        // console.error("❌ Failed to fetch transactions");
      }
    } catch (err) {
      // console.error("🚨 Error fetching transactions:", err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = getToken();

      const res = await fetch(
        "https://novel-fresh-spaniel.ngrok-free.app/api/projects_finance/invoices/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "any",
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      console.log("invoice data: ", data);
      if (res.ok && data.invoices) {
        setInvoiceData(data.invoices);
      } else {
        console.error("❌ Failed to fetch invoices");
      }
    } catch (err) {
      console.error("🚨 Error fetching invoices:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = getToken();

      const res = await fetch(
        "https://novel-fresh-spaniel.ngrok-free.app/api/author/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "ngrok-skip-browser-warning": "any",
          },
        }
      );

      // console.log("Project token: ", token);

      const data = await res.json();
      if (res.ok && data.projects) {
        setProjectData(data.projects);
      } else {
        // console.error("❌ Failed to load project data");
      }
    } catch (err) {
      // console.error("🚨 Error fetching project data:", err);
    }
  };

  const deleteAuthor = async (authorId) => {
    try {
      const token = getToken();
      // console.log("🔐 Token for deleteAuthor:", token);
      if (!token) {
        throw new Error("No access token found");
      }

      const res = await fetch(
        `https://novel-fresh-spaniel.ngrok-free.app/api/author/authors/${authorId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "any",
          },
        }
      );

      if (!res.ok) {
        const errorMessage = await res.text();
        // console.error("Delete failed response:", errorMessage);
        throw new Error("Failed to delete author");
      }

      setAuthorData((prevData) => ({
        ...prevData,
        authors: prevData.authors.filter((author) => author.id !== authorId),
      }));

      // console.log(`Author ${authorId} deleted successfully.`);
    } catch (error) {
      // console.error("Error deleting author:", error);
    }
  };

  const addPost = async (newPost) => {
    const token = getToken();
    if (!token) {
      // show toast instead of alert
      if (typeof showToast === "function")
        showToast("Not authorized", { type: "error" });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", newPost.name);
      formData.append("description", newPost.description);
      formData.append("price", newPost.price);

      if (newPost.image instanceof File) {
        formData.append("image", newPost.image);
      } else {
        if (typeof showToast === "function")
          showToast("Please upload a valid image.", { type: "error" });
        return;
      }

      const res = await fetchWithAuth(`${API_URL}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add post");

      const savedPost = await res.json();
      setData((prev) => [...prev, savedPost]);
    } catch (error) {
      // console.error("Add post failed:", error);
      if (typeof showToast === "function")
        showToast("Add post failed. Please check your inputs or server.", {
          type: "error",
        });
    }
  };

  const updatePost = async (id, updatedPost) => {
    const token = getToken();
    if (!token) {
      alert("Not authorized");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", updatedPost.name);
      formData.append("description", updatedPost.description);
      formData.append("price", updatedPost.price);

      if (updatedPost.image instanceof File) {
        formData.append("image", updatedPost.image);
      }

      const res = await fetchWithAuth(`${API_URL}/${id}/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setData((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (error) {
      // console.error("Update post failed:", error);
    }
  };

  const deletePost = useCallback(async (id) => {
    const token = getToken();
    if (!token) {
      alert("Not authorized");
      return;
    }
    try {
      if (!window.confirm("Are you sure you want to delete this post?")) return;

      await fetchWithAuth(`${API_URL}/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setData((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      // console.error("Delete failed:", error);
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        loading,
        addPost,
        updatePost,
        deletePost,
        salesData,
        authorData,
        deleteAuthor,
        projectData,
        fetchProjects,
        fetchInvoices,
        invoiceData,
        transactions,
        fetchTransactions,
        totalSales,
        fetchTotalSales,
        todayMoney,
        fetchTodayMoney,
        orders,
        fetchOrders,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useSales = () => useContext(DataContext);
