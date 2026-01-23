import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchJobsFeed } from "../Redux/JobsFeed";

export const useJobFeedSearch = () => {
    const dispatch = useDispatch();
    const [search, setSearch] = useState("");

    useEffect(() => {
        const delay = setTimeout(() => {
            dispatch(fetchJobsFeed({ search }));
        }, 500); // debounce

        return () => clearTimeout(delay);
    }, [search, dispatch]);

    return {
        search,
        setSearch,
    };
};
