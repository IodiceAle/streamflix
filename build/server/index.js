import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, Meta, Links, ScrollRestoration, Scripts, useNavigate, Link, NavLink, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { QueryClient, useQuery, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { createContext, useState, useEffect, useContext, forwardRef, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { HiMail, HiLockClosed, HiPlay, HiInformationCircle, HiCheck, HiPlus, HiChevronLeft, HiChevronRight, HiSearch, HiUser, HiHome, HiBookmark, HiCog, HiX, HiLogout, HiPause, HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { createPortal } from "react-dom";
import Hls from "hls.js";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const TMDB_API_KEY = "1029d9bda1a93a8aece8dbb8e6e48950";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});
const getImageUrl = (path, size = "w500") => {
  if (!path) return "/placeholder-poster.png";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};
const getBackdropUrl = (path, size = "w1280") => {
  if (!path) return "/placeholder-backdrop.png";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};
const formatRuntime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};
const getYear = (dateString) => {
  return new Date(dateString).getFullYear().toString();
};
async function getTrending(mediaType = "all", timeWindow = "day") {
  const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
  return response.data;
}
async function getPopular(type, page = 1) {
  const response = await tmdbApi.get(`/${type}/popular`, { params: { page } });
  return response.data;
}
async function discover$1(type, filters = {}) {
  const response = await tmdbApi.get(`/discover/${type}`, { params: filters });
  return response.data;
}
async function search$1(query, page = 1) {
  const response = await tmdbApi.get("/search/multi", {
    params: {
      query,
      page,
      include_adult: false
    }
  });
  const filteredResults = response.data.results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );
  return {
    ...response.data,
    results: filteredResults
  };
}
async function getMovieDetails(id) {
  const response = await tmdbApi.get(`/movie/${id}`, {
    params: {
      append_to_response: "videos,similar,credits"
    }
  });
  return response.data;
}
async function getTVDetails(id) {
  const response = await tmdbApi.get(`/tv/${id}`, {
    params: {
      append_to_response: "videos,similar,credits"
    }
  });
  return response.data;
}
async function getGenres(type) {
  const response = await tmdbApi.get(`/genre/${type}/list`);
  return response.data.genres;
}
async function getByGenre(type, genreId, page = 1) {
  return discover$1(type, {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
    page
  });
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1e3,
      // 5 minutes
      gcTime: 10 * 60 * 1e3,
      // 10 minutes (previously cacheTime)
      retry: 2,
      refetchOnWindowFocus: false
    }
  }
});
function useTrending(mediaType = "all", timeWindow = "day") {
  return useQuery({
    queryKey: ["trending", mediaType, timeWindow],
    queryFn: () => getTrending(mediaType, timeWindow)
  });
}
function usePopular(type, page = 1) {
  return useQuery({
    queryKey: ["popular", type, page],
    queryFn: () => getPopular(type, page)
  });
}
function useDiscover(type, filters = {}) {
  return useQuery({
    queryKey: ["discover", type, filters],
    queryFn: () => discover$1(type, filters)
  });
}
function useSearch(query, page = 1) {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: () => search$1(query, page),
    enabled: query.length > 0
  });
}
function useMovieDetails(id, options) {
  return useQuery({
    queryKey: ["movie-details", id],
    queryFn: () => getMovieDetails(id),
    ...options
  });
}
function useTVDetails(id, options) {
  return useQuery({
    queryKey: ["tv-details", id],
    queryFn: () => getTVDetails(id),
    ...options
  });
}
function useGenres(type) {
  return useQuery({
    queryKey: ["genres", type],
    queryFn: () => getGenres(type)
  });
}
function useByGenre(type, genreId, page = 1) {
  return useQuery({
    queryKey: ["by-genre", type, genreId, page],
    queryFn: () => getByGenre(type, genreId, page)
  });
}
const supabaseUrl = "https://cvhcbhsazfynuvxnsvaf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aGNiaHNhemZ5bnV2eG5zdmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDc0NzAsImV4cCI6MjA3OTMyMzQ3MH0.qWWp8bs4RiycTKRsuPeBhf4YTj5LYZAfYlnq3wdHwSU";
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return {
    user: data.user,
    session: data.session,
    error
  };
}
async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback((session == null ? void 0 : session.user) ?? null);
  });
  return subscription;
}
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    const subscription = onAuthStateChange((newUser) => {
      setUser(newUser);
      setLoading(false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const handleSignIn = async (email, password) => {
    const { user: newUser, error } = await signIn(email, password);
    if (!error && newUser) {
      setUser(newUser);
    }
    return { error };
  };
  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };
  const value = {
    user,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
async function getMyList(userId) {
  const { data, error } = await supabase.from("my_list").select("*").eq("user_id", userId).order("added_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
async function addToList(userId, tmdbId, type, metadata) {
  const { data, error } = await supabase.from("my_list").insert({
    user_id: userId,
    tmdb_id: tmdbId,
    type,
    ...metadata
  }).select().single();
  if (error) throw error;
  return data;
}
async function removeFromList(userId, tmdbId, type) {
  const { error } = await supabase.from("my_list").delete().eq("user_id", userId).eq("tmdb_id", tmdbId).eq("type", type);
  if (error) throw error;
}
function subscribeToMyList(userId, callback) {
  return supabase.channel("my_list_changes").on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "my_list",
      filter: `user_id=eq.${userId}`
    },
    callback
  ).subscribe();
}
const MyListContext = createContext(void 0);
function MyListProvider({ children }) {
  const { user } = useAuth();
  const [myList2, setMyList] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) {
      loadMyList();
      const subscription = subscribeToMyList(user.id, () => {
        loadMyList();
      });
      return () => {
        subscription.unsubscribe();
      };
    } else {
      setMyList([]);
    }
  }, [user]);
  const loadMyList = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await getMyList(user.id);
      setMyList(list);
    } catch (error) {
      console.error("Error loading my list:", error);
    } finally {
      setLoading(false);
    }
  };
  const addToList$1 = async (item) => {
    if (!user) return;
    const isMovie = "title" in item;
    const type = isMovie ? "movie" : "tv";
    const title = isMovie ? item.title : item.name;
    try {
      const tempItem = {
        id: `temp-${item.id}`,
        user_id: user.id,
        tmdb_id: item.id,
        type,
        title,
        poster_path: item.poster_path || "",
        backdrop_path: item.backdrop_path || void 0,
        added_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      setMyList((prev) => [tempItem, ...prev]);
      await addToList(user.id, item.id, type, {
        title,
        poster_path: item.poster_path || "",
        backdrop_path: item.backdrop_path || void 0
      });
      await loadMyList();
    } catch (error) {
      console.error("Error adding to list:", error);
      setMyList((prev) => prev.filter((i) => i.id !== `temp-${item.id}`));
    }
  };
  const removeFromList$1 = async (tmdbId, type) => {
    if (!user) return;
    try {
      setMyList((prev) => prev.filter((item) => item.tmdb_id !== tmdbId));
      await removeFromList(user.id, tmdbId, type);
    } catch (error) {
      console.error("Error removing from list:", error);
      await loadMyList();
    }
  };
  const isInList = (tmdbId) => {
    return myList2.some((item) => item.tmdb_id === tmdbId);
  };
  const value = {
    myList: myList2,
    loading,
    addToList: addToList$1,
    removeFromList: removeFromList$1,
    isInList
  };
  return /* @__PURE__ */ jsx(MyListContext.Provider, { value, children });
}
function useMyList() {
  const context = useContext(MyListContext);
  if (context === void 0) {
    throw new Error("useMyList must be used within a MyListProvider");
  }
  return context;
}
async function getContinueWatching(userId) {
  const { data, error } = await supabase.from("continue_watching").select("*").eq("user_id", userId).order("last_watched_at", { ascending: false }).limit(20);
  if (error) throw error;
  return data || [];
}
async function updateProgress(userId, progressData) {
  const { data, error } = await supabase.from("continue_watching").upsert({
    user_id: userId,
    ...progressData,
    ...progressData.metadata,
    last_watched_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "user_id,tmdb_id,type,season,episode"
  }).select().single();
  if (error) throw error;
  return data;
}
async function removeFromContinueWatching(userId, tmdbId, type) {
  const { error } = await supabase.from("continue_watching").delete().eq("user_id", userId).eq("tmdb_id", tmdbId).eq("type", type);
  if (error) throw error;
}
function subscribeToContinueWatching(userId, callback) {
  return supabase.channel("continue_watching_changes").on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "continue_watching",
      filter: `user_id=eq.${userId}`
    },
    callback
  ).subscribe();
}
const ContinueWatchingContext = createContext(void 0);
function ContinueWatchingProvider({ children }) {
  const { user } = useAuth();
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) {
      loadContinueWatching();
      const subscription = subscribeToContinueWatching(user.id, () => {
        loadContinueWatching();
      });
      return () => {
        subscription.unsubscribe();
      };
    } else {
      setContinueWatching([]);
    }
  }, [user]);
  const loadContinueWatching = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getContinueWatching(user.id);
      setContinueWatching(items);
    } catch (error) {
      console.error("Error loading continue watching:", error);
    } finally {
      setLoading(false);
    }
  };
  const updateProgress$1 = async (data) => {
    if (!user) return;
    try {
      await updateProgress(user.id, data);
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };
  const removeFromContinueWatching$1 = async (tmdbId, type) => {
    if (!user) return;
    try {
      setContinueWatching((prev) => prev.filter((item) => item.tmdb_id !== tmdbId));
      await removeFromContinueWatching(user.id, tmdbId, type);
    } catch (error) {
      console.error("Error removing from continue watching:", error);
      await loadContinueWatching();
    }
  };
  const getProgress = (tmdbId, type, season, episode) => {
    return continueWatching.find((item) => {
      if (item.tmdb_id !== tmdbId || item.type !== type) return false;
      if (type === "tv" && season && episode) {
        return item.season === season && item.episode === episode;
      }
      return true;
    }) || null;
  };
  const value = {
    continueWatching,
    loading,
    updateProgress: updateProgress$1,
    removeFromContinueWatching: removeFromContinueWatching$1,
    getProgress
  };
  return /* @__PURE__ */ jsx(ContinueWatchingContext.Provider, { value, children });
}
function useContinueWatching() {
  const context = useContext(ContinueWatchingContext);
  if (context === void 0) {
    throw new Error("useContinueWatching must be used within a ContinueWatchingProvider");
  }
  return context;
}
function Layout$1({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx("meta", {
        name: "theme-color",
        content: "#E50914"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx(QueryClientProvider, {
        client: queryClient,
        children: /* @__PURE__ */ jsx(AuthProvider, {
          children: /* @__PURE__ */ jsx(MyListProvider, {
            children: /* @__PURE__ */ jsx(ContinueWatchingProvider, {
              children
            })
          })
        })
      }), /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function Root() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Layout: Layout$1,
  default: root
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
const Button = forwardRef(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-primary hover:bg-primary-dark text-white active:scale-95",
      secondary: "bg-dark-card hover:bg-gray-700 text-white active:scale-95",
      ghost: "hover:bg-dark-card text-white",
      icon: "hover:bg-dark-card text-white rounded-full p-2"
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-2.5 text-base",
      lg: "px-8 py-3 text-lg"
    };
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        className: cn(
          baseStyles,
          variants[variant],
          variant !== "icon" && sizes[size],
          className
        ),
        disabled: disabled || isLoading,
        ...props,
        children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ] }),
          "Loading..."
        ] }) : children
      }
    );
  }
);
Button.displayName = "Button";
const Input = forwardRef(
  ({ className, label, error, icon, type = "text", ...props }, ref) => {
    return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
      label && /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-text-secondary mb-2", children: label }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        icon && /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary", children: icon }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref,
            type,
            className: cn(
              "w-full px-4 py-3 bg-dark-card border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500",
              className
            ),
            ...props
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-red-500", children: error })
    ] });
  }
);
Input.displayName = "Input";
const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DISCOVER: "/discover",
  SEARCH: "/search",
  MY_LIST: "/my-list",
  SETTINGS: "/settings",
  DETAIL: (type, id) => `/detail/${type}/${id}`,
  WATCH: (type, id, season, episode) => type === "tv" && season && episode ? `/watch/tv/${id}/${season}/${episode}` : `/watch/${type}/${id}`
};
const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity Descending" },
  { value: "popularity.asc", label: "Popularity Ascending" },
  { value: "release_date.desc", label: "Release Date Descending" },
  { value: "release_date.asc", label: "Release Date Ascending" },
  { value: "vote_average.desc", label: "Rating Descending" },
  { value: "title.asc", label: "Title A-Z" }
];
const DEBOUNCE_DELAYS = {
  SEARCH: 300
};
function meta$7({}) {
  return [{
    title: "Login - StreamFlix"
  }, {
    name: "description",
    content: "Sign in to your StreamFlix account"
  }];
}
const login = UNSAFE_withComponentProps(function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const {
        error: error2
      } = await signIn(email, password);
      if (error2) {
        setError(error2.message);
      } else {
        navigate(ROUTES.HOME);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "min-h-screen flex items-center justify-center bg-dark px-4",
    children: [/* @__PURE__ */ jsx("div", {
      className: "absolute inset-0 overflow-hidden opacity-5",
      children: /* @__PURE__ */ jsx("div", {
        className: "absolute inset-0",
        style: {
          backgroundImage: "radial-gradient(circle, #E50914 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "relative w-full max-w-md",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "bg-dark-card rounded-lg shadow-2xl p-8 md:p-10 border border-gray-800",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "text-center mb-8",
          children: [/* @__PURE__ */ jsx("h1", {
            className: "text-4xl font-bold text-primary mb-2",
            children: "StreamFlix"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-text-secondary text-sm",
            children: "Sign in to continue watching"
          })]
        }), /* @__PURE__ */ jsxs("form", {
          onSubmit: handleSubmit,
          className: "space-y-6",
          children: [error && /* @__PURE__ */ jsx("div", {
            className: "bg-red-500/10 border border-red-500 rounded-md p-3 text-sm text-red-500",
            children: error
          }), /* @__PURE__ */ jsx(Input, {
            label: "Email",
            type: "email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            placeholder: "you@example.com",
            icon: /* @__PURE__ */ jsx(HiMail, {
              className: "w-5 h-5"
            }),
            required: true,
            autoComplete: "email"
          }), /* @__PURE__ */ jsx(Input, {
            label: "Password",
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "••••••••",
            icon: /* @__PURE__ */ jsx(HiLockClosed, {
              className: "w-5 h-5"
            }),
            required: true,
            autoComplete: "current-password"
          }), /* @__PURE__ */ jsx(Button, {
            type: "submit",
            variant: "primary",
            size: "lg",
            className: "w-full",
            isLoading,
            children: "Sign In"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "mt-6 text-center text-sm text-text-secondary",
          children: [/* @__PURE__ */ jsx("p", {
            children: "Need help accessing your account?"
          }), /* @__PURE__ */ jsx("p", {
            className: "mt-2",
            children: "Contact your administrator"
          })]
        })]
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-6 text-center text-xs text-text-secondary",
        children: "This is a demo application. Use your Supabase credentials to sign in."
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: login,
  meta: meta$7
}, Symbol.toStringTag, { value: "Module" }));
function HeroCarousel({ items, autoPlay = true, interval = 5e3 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    if (!autoPlay || isHovered || items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isHovered, items.length]);
  if (!items || items.length === 0) return null;
  const currentItem = items[currentIndex];
  const isMovie = "title" in currentItem;
  const title = isMovie ? currentItem.title : currentItem.name;
  const overview = currentItem.overview;
  getBackdropUrl(currentItem.backdrop_path, "original");
  const type = isMovie ? "movie" : "tv";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative h-[56.25vw] max-h-[600px] md:max-h-[700px] lg:max-h-[800px] w-full overflow-hidden",
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: items.map((item, index) => {
          const itemBackdrop = getBackdropUrl(item.backdrop_path, "original");
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: cn(
                "absolute inset-0 transition-opacity duration-1000",
                index === currentIndex ? "opacity-100" : "opacity-0"
              ),
              children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: itemBackdrop,
                    alt: isMovie ? item.title : item.name,
                    className: "h-full w-full object-cover",
                    loading: index === 0 ? "eager" : "lazy"
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent" })
              ]
            },
            item.id
          );
        }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-end md:items-center", children: /* @__PURE__ */ jsx("div", { className: "w-full px-4 pb-12 md:px-8 lg:px-12 md:pb-20 lg:pb-24 max-w-2xl", children: /* @__PURE__ */ jsxs("div", { className: "animate-slide-up", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg", children: title }),
          overview && /* @__PURE__ */ jsx("p", { className: "text-sm md:text-base lg:text-lg text-white/90 mb-6 line-clamp-3 md:line-clamp-4 drop-shadow-lg max-w-xl", children: overview }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm md:text-base mb-6 text-white/80", children: [
            currentItem.vote_average > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "text-yellow-500", children: "★" }),
              currentItem.vote_average.toFixed(1)
            ] }),
            isMovie && currentItem.release_date && /* @__PURE__ */ jsx("span", { children: new Date(currentItem.release_date).getFullYear() }),
            !isMovie && currentItem.first_air_date && /* @__PURE__ */ jsx("span", { children: new Date(currentItem.first_air_date).getFullYear() })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsx(Link, { to: ROUTES.DETAIL(type, currentItem.id), children: /* @__PURE__ */ jsxs(Button, { variant: "primary", size: "lg", className: "gap-2", children: [
              /* @__PURE__ */ jsx(HiPlay, { className: "w-5 h-5" }),
              "Play"
            ] }) }),
            /* @__PURE__ */ jsx(Link, { to: ROUTES.DETAIL(type, currentItem.id), children: /* @__PURE__ */ jsxs(Button, { variant: "secondary", size: "lg", className: "gap-2", children: [
              /* @__PURE__ */ jsx(HiInformationCircle, { className: "w-5 h-5" }),
              "More Info"
            ] }) })
          ] })
        ] }) }) }),
        items.length > 1 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 right-4 md:bottom-8 md:right-8 flex gap-2", children: items.map((_, index) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setCurrentIndex(index),
            className: cn(
              "h-1 rounded-full transition-all",
              index === currentIndex ? "w-8 bg-white" : "w-6 bg-white/50 hover:bg-white/75"
            ),
            "aria-label": `Go to slide ${index + 1}`
          },
          index
        )) })
      ]
    }
  );
}
function ContentCard({
  item,
  showProgress = false,
  progress = 0,
  hideListButton = false
}) {
  var _a;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToList: addToList2, removeFromList: removeFromList2, isInList } = useMyList();
  const isMovie = "title" in item;
  const title = isMovie ? item.title : item.name;
  const type = isMovie ? "movie" : "tv";
  const posterUrl = getImageUrl(item.poster_path, "w342");
  const inList = isInList(item.id);
  const genres = ((_a = item.genre_ids) == null ? void 0 : _a.slice(0, 2)) || [];
  const handleAddToList = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inList) {
      await removeFromList2(item.id, type);
    } else {
      await addToList2(item);
    }
  };
  return /* @__PURE__ */ jsx(
    Link,
    {
      to: ROUTES.DETAIL(type, item.id),
      className: "group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 hover:z-10",
      children: /* @__PURE__ */ jsxs("div", { className: "relative aspect-poster bg-dark-card", children: [
        !imageError ? /* @__PURE__ */ jsxs(Fragment, { children: [
          !imageLoaded && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 skeleton" }),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: posterUrl,
              alt: title,
              className: cn(
                "h-full w-full object-cover transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              ),
              onLoad: () => setImageLoaded(true),
              onError: () => setImageError(true),
              loading: "lazy"
            }
          )
        ] }) : /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center bg-dark-card text-text-secondary", children: /* @__PURE__ */ jsx("span", { className: "text-center px-4", children: title }) }),
        showProgress && progress > 0 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 h-1 bg-gray-700", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-primary transition-all",
            style: { width: `${progress}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300", children: [
          /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "flex h-12 w-12 items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all transform scale-0 group-hover:scale-100",
                "aria-label": "Play",
                children: /* @__PURE__ */ jsx(HiPlay, { className: "h-6 w-6 text-black ml-1" })
              }
            ),
            !hideListButton && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleAddToList,
                className: "flex h-10 w-10 items-center justify-center rounded-full bg-dark-card/80 hover:bg-dark-card border border-gray-600 hover:border-white transition-all transform scale-0 group-hover:scale-100",
                "aria-label": inList ? "Remove from list" : "Add to list",
                children: inList ? /* @__PURE__ */ jsx(HiCheck, { className: "h-5 w-5 text-white" }) : /* @__PURE__ */ jsx(HiPlus, { className: "h-5 w-5 text-white" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-white text-sm line-clamp-2 mb-1", children: title }),
            item.vote_average > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-text-secondary", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx("span", { className: "text-yellow-500", children: "★" }),
                item.vote_average.toFixed(1)
              ] }),
              genres.length > 0 && /* @__PURE__ */ jsxs("span", { children: [
                "• ",
                genres.length,
                " genres"
              ] })
            ] })
          ] })
        ] })
      ] })
    }
  );
}
function ContentRow({
  title,
  items,
  showSeeAll = false,
  onSeeAll,
  seeAllLink,
  showProgress = false,
  progressData,
  onAddToList,
  isInList
}) {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    const targetScroll = direction === "left" ? scrollRef.current.scrollLeft - scrollAmount : scrollRef.current.scrollLeft + scrollAmount;
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: "smooth"
    });
  };
  if (!items || items.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: "group relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center justify-between px-4 md:px-8", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold text-white", children: title }),
      showSeeAll && /* @__PURE__ */ jsx("div", { children: seeAllLink ? /* @__PURE__ */ jsx(
        Link,
        {
          to: seeAllLink,
          className: "text-sm text-text-secondary hover:text-white transition-colors",
          children: "See All →"
        }
      ) : /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onSeeAll,
          className: "text-sm text-text-secondary hover:text-white transition-colors",
          children: "See All →"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => scroll("left"),
          className: cn(
            "absolute left-0 top-0 bottom-0 z-10 hidden md:flex items-center justify-center w-12 bg-gradient-to-r from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:from-dark/90"
          ),
          "aria-label": "Scroll left",
          children: /* @__PURE__ */ jsx(HiChevronLeft, { className: "w-8 h-8 text-white" })
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          ref: scrollRef,
          className: "flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-8 pb-4 hide-scrollbar scroll-smooth snap-x snap-mandatory",
          children: items.map((item) => /* @__PURE__ */ jsx("div", { className: "w-[150px] md:w-[185px] lg:w-[200px] flex-shrink-0 snap-start", children: /* @__PURE__ */ jsx(
            ContentCard,
            {
              item,
              showProgress,
              progress: progressData == null ? void 0 : progressData[item.id],
              onAddToList: () => onAddToList == null ? void 0 : onAddToList(item),
              isInList: isInList == null ? void 0 : isInList(item.id)
            }
          ) }, item.id))
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => scroll("right"),
          className: cn(
            "absolute right-0 top-0 bottom-0 z-10 hidden md:flex items-center justify-center w-12 bg-gradient-to-l from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
            "hover:from-dark/90"
          ),
          "aria-label": "Scroll right",
          children: /* @__PURE__ */ jsx(HiChevronRight, { className: "w-8 h-8 text-white" })
        }
      )
    ] })
  ] });
}
const navLinks = [
  { to: ROUTES.HOME, label: "Home" },
  { to: ROUTES.DISCOVER, label: "Discover" },
  { to: ROUTES.MY_LIST, label: "My List" }
];
function Header() {
  return /* @__PURE__ */ jsx("header", { className: "fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-dark to-transparent transition-all", children: /* @__PURE__ */ jsx("div", { className: "px-4 md:px-8 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx(Link, { to: ROUTES.HOME, className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("span", { className: "text-2xl md:text-3xl font-bold text-primary", children: "StreamFlix" }) }),
    /* @__PURE__ */ jsx("nav", { className: "hidden md:flex items-center gap-6", children: navLinks.map(({ to, label }) => /* @__PURE__ */ jsx(
      NavLink,
      {
        to,
        className: ({ isActive }) => cn(
          "text-sm font-medium transition-colors hover:text-white",
          isActive ? "text-white" : "text-gray-400"
        ),
        children: label
      },
      to
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          to: ROUTES.SEARCH,
          className: "text-white hover:text-gray-300 transition-colors",
          "aria-label": "Search",
          children: /* @__PURE__ */ jsx(HiSearch, { className: "w-6 h-6" })
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: ROUTES.SETTINGS,
          className: "hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors",
          "aria-label": "Profile",
          children: /* @__PURE__ */ jsx(HiUser, { className: "w-5 h-5" })
        }
      )
    ] })
  ] }) }) });
}
const navItems = [
  { to: ROUTES.HOME, icon: HiHome, label: "Home" },
  { to: ROUTES.SEARCH, icon: HiSearch, label: "Search" },
  { to: ROUTES.MY_LIST, icon: HiBookmark, label: "My List" },
  { to: ROUTES.SETTINGS, icon: HiCog, label: "Settings" }
];
function BottomNav() {
  return /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-gray-800 bg-dark/95 backdrop-blur-md pb-safe", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-around h-16", children: navItems.map(({ to, icon: Icon, label }) => /* @__PURE__ */ jsx(
    NavLink,
    {
      to,
      className: ({ isActive }) => cn(
        "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
        isActive ? "text-primary" : "text-gray-400 hover:text-white"
      ),
      children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Icon, { className: cn("w-6 h-6", isActive && "animate-scale-in") }),
        /* @__PURE__ */ jsx("span", { className: cn("text-[10px] font-medium", isActive && "font-bold"), children: label })
      ] })
    },
    to
  )) }) });
}
function Layout() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-dark text-white", children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx("main", { className: "pt-16 pb-20 md:pb-8", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}
function Spinner({ size = "md", className }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };
  return /* @__PURE__ */ jsx("div", { className: cn("flex items-center justify-center", className), children: /* @__PURE__ */ jsxs(
    "svg",
    {
      className: cn("animate-spin text-primary", sizes[size]),
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ jsx(
          "circle",
          {
            className: "opacity-25",
            cx: "12",
            cy: "12",
            r: "10",
            stroke: "currentColor",
            strokeWidth: "4"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            className: "opacity-75",
            fill: "currentColor",
            d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          }
        )
      ]
    }
  ) });
}
function meta$6({}) {
  return [{
    title: "StreamFlix - Watch Movies & TV Shows"
  }, {
    name: "description",
    content: "Stream your favorite movies and TV shows"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  var _a;
  const {
    data: trending,
    isLoading: trendingLoading
  } = useTrending("all", "day");
  const {
    data: popularMovies,
    isLoading: popularMoviesLoading
  } = usePopular("movie");
  const {
    data: popularTV,
    isLoading: popularTVLoading
  } = usePopular("tv");
  const {
    data: actionMovies
  } = useByGenre("movie", 28);
  const {
    data: comedyMovies
  } = useByGenre("movie", 35);
  const {
    data: dramaMovies
  } = useByGenre("movie", 18);
  const isLoading = trendingLoading || popularMoviesLoading || popularTVLoading;
  if (isLoading) {
    return /* @__PURE__ */ jsx(Layout, {
      children: /* @__PURE__ */ jsx("div", {
        className: "flex items-center justify-center min-h-screen",
        children: /* @__PURE__ */ jsx(Spinner, {
          size: "lg"
        })
      })
    });
  }
  const heroItems = ((_a = trending == null ? void 0 : trending.results) == null ? void 0 : _a.slice(0, 5)) || [];
  return /* @__PURE__ */ jsx(Layout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "space-y-8 md:space-y-12",
      children: [heroItems.length > 0 && /* @__PURE__ */ jsx(HeroCarousel, {
        items: heroItems,
        autoPlay: true,
        interval: 6e3
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-8",
        children: [trending && trending.results.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "Trending Now",
          items: trending.results,
          showSeeAll: true
        }), popularMovies && popularMovies.results.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "Popular Movies",
          items: popularMovies.results,
          showSeeAll: true
        }), popularTV && popularTV.results.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "Popular TV Shows",
          items: popularTV.results,
          showSeeAll: true
        }), actionMovies && actionMovies.results.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "Action & Adventure",
          items: actionMovies.results,
          showSeeAll: true
        }), comedyMovies && comedyMovies.results.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "Comedy",
          items: comedyMovies.results,
          showSeeAll: true
        }), dramaMovies && dramaMovies.results.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "Drama",
          items: dramaMovies.results,
          showSeeAll: true
        })]
      })]
    })
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$6
}, Symbol.toStringTag, { value: "Module" }));
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
function useLocalStorage(key, initialValue) {
  const readValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };
  const [storedValue, setStoredValue] = useState(readValue);
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  const removeValue = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);
  return [storedValue, setValue, removeValue];
}
function meta$5({}) {
  return [{
    title: "Search - StreamFlix"
  }, {
    name: "description",
    content: "Search for movies and TV shows"
  }];
}
const search = UNSAFE_withComponentProps(function Search() {
  var _a, _b, _c;
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches, clearRecentSearches] = useLocalStorage("streamflix-recent-searches", []);
  const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH);
  const {
    data: searchResults,
    isLoading: searchLoading
  } = useSearch(debouncedSearch);
  const {
    data: trendingData
  } = useTrending("all", "day");
  const topSearches = ((_a = trendingData == null ? void 0 : trendingData.results) == null ? void 0 : _a.slice(0, 10)) || [];
  useEffect(() => {
    if (debouncedSearch && searchResults) {
      setRecentSearches((prev) => {
        const updated = [debouncedSearch, ...prev.filter((s) => s !== debouncedSearch)];
        return updated.slice(0, 10);
      });
    }
  }, [debouncedSearch, searchResults]);
  const handleClearSearch = () => {
    setSearchQuery("");
  };
  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
  };
  const handleRemoveRecentSearch = (query, e) => {
    e.stopPropagation();
    setRecentSearches((prev) => prev.filter((s) => s !== query));
  };
  const movies = ((_b = searchResults == null ? void 0 : searchResults.results) == null ? void 0 : _b.filter((item) => "title" in item)) || [];
  const tvShows = ((_c = searchResults == null ? void 0 : searchResults.results) == null ? void 0 : _c.filter((item) => "name" in item)) || [];
  const showResults = debouncedSearch && searchResults;
  const showEmpty = debouncedSearch && searchResults && searchResults.results.length === 0;
  return /* @__PURE__ */ jsx(Layout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto",
      children: [/* @__PURE__ */ jsx("div", {
        className: "mb-8",
        children: /* @__PURE__ */ jsxs("div", {
          className: "relative max-w-2xl mx-auto",
          children: [/* @__PURE__ */ jsx(Input, {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Search for movies and TV shows...",
            icon: /* @__PURE__ */ jsx(HiSearch, {
              className: "w-5 h-5"
            }),
            className: "text-lg pr-12",
            autoFocus: true
          }), searchQuery && /* @__PURE__ */ jsx("button", {
            onClick: handleClearSearch,
            className: "absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-dark-card rounded-full transition-colors",
            "aria-label": "Clear search",
            children: /* @__PURE__ */ jsx(HiX, {
              className: "w-5 h-5 text-text-secondary"
            })
          })]
        })
      }), searchLoading && /* @__PURE__ */ jsx("div", {
        className: "flex justify-center py-12",
        children: /* @__PURE__ */ jsx(Spinner, {
          size: "lg"
        })
      }), showResults && !searchLoading && /* @__PURE__ */ jsxs("div", {
        className: "space-y-12",
        children: [movies.length > 0 && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("h2", {
            className: "text-2xl font-bold text-white mb-6",
            children: ["Movies (", movies.length, ")"]
          }), /* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
            children: movies.map((movie) => /* @__PURE__ */ jsx(ContentCard, {
              item: movie
            }, movie.id))
          })]
        }), tvShows.length > 0 && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("h2", {
            className: "text-2xl font-bold text-white mb-6",
            children: ["TV Shows (", tvShows.length, ")"]
          }), /* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
            children: tvShows.map((show) => /* @__PURE__ */ jsx(ContentCard, {
              item: show
            }, show.id))
          })]
        })]
      }), showEmpty && /* @__PURE__ */ jsxs("div", {
        className: "text-center py-12",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-xl text-text-secondary mb-2",
          children: "No results found"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-text-secondary",
          children: "Try searching for something else"
        })]
      }), !searchQuery && /* @__PURE__ */ jsxs("div", {
        className: "space-y-12",
        children: [recentSearches.length > 0 && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between mb-6",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-2xl font-bold text-white",
              children: "Recent Searches"
            }), /* @__PURE__ */ jsx("button", {
              onClick: () => clearRecentSearches(),
              className: "text-sm text-text-secondary hover:text-white transition-colors",
              children: "Clear All"
            })]
          }), /* @__PURE__ */ jsx("div", {
            className: "space-y-2",
            children: recentSearches.map((query, index) => /* @__PURE__ */ jsxs("div", {
              onClick: () => handleRecentSearchClick(query),
              className: "flex items-center justify-between p-3 bg-dark-card hover:bg-dark-lighter rounded-lg cursor-pointer transition-colors group",
              children: [/* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-3",
                children: [/* @__PURE__ */ jsx(HiSearch, {
                  className: "w-5 h-5 text-text-secondary"
                }), /* @__PURE__ */ jsx("span", {
                  className: "text-white",
                  children: query
                })]
              }), /* @__PURE__ */ jsx("button", {
                onClick: (e) => handleRemoveRecentSearch(query, e),
                className: "p-1 opacity-0 group-hover:opacity-100 hover:bg-dark rounded-full transition-all",
                "aria-label": "Remove",
                children: /* @__PURE__ */ jsx(HiX, {
                  className: "w-4 h-4 text-text-secondary"
                })
              })]
            }, index))
          })]
        }), topSearches.length > 0 && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-2xl font-bold text-white mb-6",
            children: "Top Searches Today"
          }), /* @__PURE__ */ jsx("div", {
            className: "grid grid-cols-1 md:grid-cols-2 gap-4",
            children: topSearches.map((item, index) => {
              const title = "title" in item ? item.title : item.name;
              return /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-4 p-4 bg-dark-card hover:bg-dark-lighter rounded-lg transition-colors cursor-pointer",
                onClick: () => setSearchQuery(title),
                children: [/* @__PURE__ */ jsx("span", {
                  className: "text-4xl font-bold text-gray-600",
                  children: index + 1
                }), /* @__PURE__ */ jsx(ContentCard, {
                  item
                })]
              }, item.id);
            })
          })]
        })]
      })]
    })
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: search,
  meta: meta$5
}, Symbol.toStringTag, { value: "Module" }));
function meta$4({}) {
  return [{
    title: "Discover - StreamFlix"
  }, {
    name: "description",
    content: "Discover movies and TV shows"
  }];
}
const discover = UNSAFE_withComponentProps(function Discover() {
  const [mediaType, setMediaType] = useState("movie");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const {
    data: genresData
  } = useGenres(mediaType);
  const {
    data: discoverData,
    isLoading
  } = useDiscover(mediaType, {
    with_genres: selectedGenres.join(","),
    sort_by: sortBy
  });
  const genres = genresData || [];
  const results = (discoverData == null ? void 0 : discoverData.results) || [];
  const toggleGenre = (genreId) => {
    setSelectedGenres((prev) => prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]);
  };
  const clearFilters = () => {
    setSelectedGenres([]);
    setSortBy("popularity.desc");
  };
  return /* @__PURE__ */ jsx(Layout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "px-4 md:px-8 lg:px-12 py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl md:text-4xl font-bold text-white mb-6",
          children: "Discover"
        }), /* @__PURE__ */ jsxs("div", {
          className: "space-y-6",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex gap-2",
            children: [/* @__PURE__ */ jsx("button", {
              onClick: () => setMediaType("movie"),
              className: `px-6 py-2 rounded-md font-medium transition-colors ${mediaType === "movie" ? "bg-primary text-white" : "bg-dark-card text-text-secondary hover:text-white"}`,
              children: "Movies"
            }), /* @__PURE__ */ jsx("button", {
              onClick: () => setMediaType("tv"),
              className: `px-6 py-2 rounded-md font-medium transition-colors ${mediaType === "tv" ? "bg-primary text-white" : "bg-dark-card text-text-secondary hover:text-white"}`,
              children: "TV Shows"
            })]
          }), genres.length > 0 && /* @__PURE__ */ jsxs("div", {
            children: [/* @__PURE__ */ jsx("label", {
              className: "block text-sm font-medium text-text-secondary mb-3",
              children: "Genres"
            }), /* @__PURE__ */ jsx("div", {
              className: "flex flex-wrap gap-2",
              children: genres.map((genre) => /* @__PURE__ */ jsx("button", {
                onClick: () => toggleGenre(genre.id),
                className: `px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedGenres.includes(genre.id) ? "bg-primary text-white" : "bg-dark-card text-white hover:bg-dark-lighter"}`,
                children: genre.name
              }, genre.id))
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-wrap items-center gap-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center gap-3",
              children: [/* @__PURE__ */ jsx("label", {
                className: "text-sm font-medium text-text-secondary",
                children: "Sort by:"
              }), /* @__PURE__ */ jsx("select", {
                value: sortBy,
                onChange: (e) => setSortBy(e.target.value),
                className: "px-4 py-2 bg-dark-card border border-gray-700 rounded-md text-white",
                children: SORT_OPTIONS.map((option) => /* @__PURE__ */ jsx("option", {
                  value: option.value,
                  children: option.label
                }, option.value))
              })]
            }), (selectedGenres.length > 0 || sortBy !== "popularity.desc") && /* @__PURE__ */ jsx("button", {
              onClick: clearFilters,
              className: "text-sm text-primary hover:text-primary-dark transition-colors",
              children: "Clear Filters"
            })]
          }), results.length > 0 && /* @__PURE__ */ jsxs("p", {
            className: "text-text-secondary text-sm",
            children: ["Showing ", results.length, " results"]
          })]
        })]
      }), isLoading && /* @__PURE__ */ jsx("div", {
        className: "flex justify-center py-12",
        children: /* @__PURE__ */ jsx(Spinner, {
          size: "lg"
        })
      }), !isLoading && results.length > 0 && /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
        children: results.map((item) => /* @__PURE__ */ jsx(ContentCard, {
          item
        }, item.id))
      }), !isLoading && results.length === 0 && /* @__PURE__ */ jsxs("div", {
        className: "text-center py-12",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-xl text-text-secondary mb-2",
          children: "No results found"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-sm text-text-secondary",
          children: "Try adjusting your filters"
        })]
      })]
    })
  });
});
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: discover,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
function meta$3({}) {
  return [{
    title: "My List - StreamFlix"
  }, {
    name: "description",
    content: "Your saved movies and TV shows"
  }];
}
const myList = UNSAFE_withComponentProps(function MyList() {
  const [myList2, setMyList] = useState([]);
  const [sortBy, setSortBy] = useState("date-added");
  const sortedList = [...myList2].sort((a, b) => {
    switch (sortBy) {
      case "title":
        const titleA = "title" in a ? a.title : a.name;
        const titleB = "title" in b ? b.title : b.name;
        return titleA.localeCompare(titleB);
      case "release":
        const dateA = "release_date" in a ? a.release_date : a.first_air_date;
        const dateB = "release_date" in b ? b.release_date : b.first_air_date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      default:
        return 0;
    }
  });
  return /* @__PURE__ */ jsx(Layout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "px-4 md:px-8 lg:px-12 py-8",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl md:text-4xl font-bold text-white mb-4",
          children: "My List"
        }), myList2.length > 0 && /* @__PURE__ */ jsxs("div", {
          className: "flex items-center gap-4",
          children: [/* @__PURE__ */ jsx("span", {
            className: "text-text-secondary",
            children: "Sort by:"
          }), /* @__PURE__ */ jsxs("select", {
            value: sortBy,
            onChange: (e) => setSortBy(e.target.value),
            className: "px-4 py-2 bg-dark-card border border-gray-700 rounded-md text-white",
            children: [/* @__PURE__ */ jsx("option", {
              value: "date-added",
              children: "Date Added"
            }), /* @__PURE__ */ jsx("option", {
              value: "title",
              children: "Title A-Z"
            }), /* @__PURE__ */ jsx("option", {
              value: "release",
              children: "Release Date"
            })]
          })]
        })]
      }), sortedList.length > 0 ? /* @__PURE__ */ jsx("div", {
        className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
        children: sortedList.map((item) => /* @__PURE__ */ jsx(ContentCard, {
          item
        }, item.id))
      }) : (
        /* Empty State */
        /* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center justify-center py-20",
          children: [/* @__PURE__ */ jsx("div", {
            className: "mb-6 p-6 bg-dark-card rounded-full",
            children: /* @__PURE__ */ jsx(HiPlus, {
              className: "w-16 h-16 text-text-secondary"
            })
          }), /* @__PURE__ */ jsx("h2", {
            className: "text-2xl font-bold text-white mb-2",
            children: "Your list is empty"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-text-secondary mb-6 text-center max-w-md",
            children: "Add movies and TV shows to your list to watch them later"
          }), /* @__PURE__ */ jsx(Link, {
            to: ROUTES.HOME,
            children: /* @__PURE__ */ jsx(Button, {
              variant: "primary",
              children: "Browse Content"
            })
          })]
        })
      )]
    })
  });
});
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: myList,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
function meta$2({}) {
  return [{
    title: "Settings - StreamFlix"
  }, {
    name: "description",
    content: "Manage your account settings"
  }];
}
const settings = UNSAFE_withComponentProps(function Settings() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };
  return /* @__PURE__ */ jsx(Layout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "px-4 md:px-8 lg:px-12 py-8 max-w-4xl mx-auto",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "mb-8",
        children: [/* @__PURE__ */ jsx("h1", {
          className: "text-3xl md:text-4xl font-bold text-white mb-2",
          children: "Settings"
        }), /* @__PURE__ */ jsx("p", {
          className: "text-text-secondary",
          children: "Manage your account and preferences"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "space-y-6",
        children: [/* @__PURE__ */ jsx("div", {
          className: "bg-dark-card rounded-lg p-6 border border-gray-800",
          children: /* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-4 mb-4",
            children: [/* @__PURE__ */ jsx("div", {
              className: "w-16 h-16 bg-primary rounded-full flex items-center justify-center",
              children: /* @__PURE__ */ jsx(HiUser, {
                className: "w-8 h-8 text-white"
              })
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("h2", {
                className: "text-xl font-bold text-white",
                children: "Profile"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-text-secondary text-sm",
                children: "Manage your profile information"
              })]
            })]
          })
        }), /* @__PURE__ */ jsxs("div", {
          className: "bg-dark-card rounded-lg p-6 border border-gray-800",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-3 mb-4",
            children: [/* @__PURE__ */ jsx(HiCog, {
              className: "w-6 h-6 text-primary"
            }), /* @__PURE__ */ jsx("h2", {
              className: "text-xl font-bold text-white",
              children: "Playback Settings"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "text-white font-medium",
                  children: "Auto-play next episode"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-text-secondary text-sm",
                  children: "Automatically play the next episode"
                })]
              }), /* @__PURE__ */ jsxs("label", {
                className: "relative inline-flex items-center cursor-pointer",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "checkbox",
                  className: "sr-only peer",
                  defaultChecked: true
                }), /* @__PURE__ */ jsx("div", {
                  className: "w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "text-white font-medium",
                  children: "Auto-play previews"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-text-secondary text-sm",
                  children: "Play trailers automatically while browsing"
                })]
              }), /* @__PURE__ */ jsxs("label", {
                className: "relative inline-flex items-center cursor-pointer",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "checkbox",
                  className: "sr-only peer"
                }), /* @__PURE__ */ jsx("div", {
                  className: "w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                })]
              })]
            }), /* @__PURE__ */ jsxs("div", {
              className: "flex items-center justify-between",
              children: [/* @__PURE__ */ jsxs("div", {
                children: [/* @__PURE__ */ jsx("p", {
                  className: "text-white font-medium",
                  children: "Data saver"
                }), /* @__PURE__ */ jsx("p", {
                  className: "text-text-secondary text-sm",
                  children: "Use less data with lower video quality"
                })]
              }), /* @__PURE__ */ jsxs("label", {
                className: "relative inline-flex items-center cursor-pointer",
                children: [/* @__PURE__ */ jsx("input", {
                  type: "checkbox",
                  className: "sr-only peer"
                }), /* @__PURE__ */ jsx("div", {
                  className: "w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                })]
              })]
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "bg-dark-card rounded-lg p-6 border border-gray-800",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center gap-3 mb-4",
            children: [/* @__PURE__ */ jsx(HiInformationCircle, {
              className: "w-6 h-6 text-primary"
            }), /* @__PURE__ */ jsx("h2", {
              className: "text-xl font-bold text-white",
              children: "Account"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "space-y-4",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("p", {
                className: "text-text-secondary text-sm mb-2",
                children: "App Version"
              }), /* @__PURE__ */ jsx("p", {
                className: "text-white",
                children: "StreamFlix v1.0.0"
              })]
            }), /* @__PURE__ */ jsx("div", {
              className: "pt-4 border-t border-gray-700",
              children: /* @__PURE__ */ jsxs(Button, {
                variant: "secondary",
                onClick: handleLogout,
                isLoading: isLoggingOut,
                className: "w-full gap-2",
                children: [/* @__PURE__ */ jsx(HiLogout, {
                  className: "w-5 h-5"
                }), "Sign Out"]
              })
            })]
          })]
        }), /* @__PURE__ */ jsxs("div", {
          className: "text-center py-4",
          children: [/* @__PURE__ */ jsx("p", {
            className: "text-text-secondary text-sm",
            children: "© 2025 StreamFlix. All rights reserved."
          }), /* @__PURE__ */ jsx("p", {
            className: "text-text-secondary text-xs mt-2",
            children: "This is a demo application built with React Router v7 and Tailwind CSS v4"
          })]
        })]
      })]
    })
  });
});
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: settings,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true
}) {
  const modalRef = useRef(null);
  useEffect(() => {
    var _a;
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const focusableElements = (_a = modalRef.current) == null ? void 0 : _a.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements == null ? void 0 : focusableElements[0];
      firstElement == null ? void 0 : firstElement.focus();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full mx-4"
  };
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center animate-fade-in",
        onClick: onClose,
        children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              ref: modalRef,
              className: cn(
                "relative bg-dark-card rounded-lg shadow-2xl w-full animate-scale-in",
                sizes[size]
              ),
              onClick: (e) => e.stopPropagation(),
              children: [
                (title || showCloseButton) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-700", children: [
                  title && /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-white", children: title }),
                  showCloseButton && /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: onClose,
                      className: "p-1 hover:bg-dark-lighter rounded-full transition-colors",
                      "aria-label": "Close modal",
                      children: /* @__PURE__ */ jsx(HiX, { className: "w-6 h-6 text-text-secondary" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { className: "px-6 py-4 max-h-[80vh] overflow-y-auto", children })
              ]
            }
          )
        ]
      }
    ),
    document.body
  );
}
function meta$1({
  params
}) {
  return [{
    title: `Details - StreamFlix`
  }, {
    name: "description",
    content: "View content details"
  }];
}
const detail_$type_$id = UNSAFE_withComponentProps(function Detail() {
  var _a, _b, _c, _d, _e, _f;
  const {
    type,
    id
  } = useParams();
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const isMovie = type === "movie";
  const contentId = Number(id);
  const {
    data: movieData,
    isLoading: movieLoading
  } = useMovieDetails(contentId, {
    enabled: isMovie
  });
  const {
    data: tvData,
    isLoading: tvLoading
  } = useTVDetails(contentId, {
    enabled: !isMovie
  });
  const data = isMovie ? movieData : tvData;
  const isLoading = movieLoading || tvLoading;
  if (isLoading) {
    return /* @__PURE__ */ jsx(Layout, {
      children: /* @__PURE__ */ jsx("div", {
        className: "flex items-center justify-center min-h-screen",
        children: /* @__PURE__ */ jsx(Spinner, {
          size: "lg"
        })
      })
    });
  }
  if (!data) {
    return /* @__PURE__ */ jsx(Layout, {
      children: /* @__PURE__ */ jsxs("div", {
        className: "flex flex-col items-center justify-center min-h-screen",
        children: [/* @__PURE__ */ jsx("p", {
          className: "text-xl text-text-secondary mb-4",
          children: "Content not found"
        }), /* @__PURE__ */ jsx(Button, {
          onClick: () => navigate(ROUTES.HOME),
          children: "Go Home"
        })]
      })
    });
  }
  const title = isMovie ? data.title : data.name;
  const backdropUrl = getBackdropUrl(data.backdrop_path, "original");
  getImageUrl(data.poster_path, "w500");
  const releaseYear = isMovie ? getYear(data.release_date) : getYear(data.first_air_date);
  const trailer = (_b = (_a = data.videos) == null ? void 0 : _a.results) == null ? void 0 : _b.find((v) => v.type === "Trailer" && v.site === "YouTube");
  const genres = data.genres || [];
  const similar = ((_c = data.similar) == null ? void 0 : _c.results) || [];
  const cast = ((_e = (_d = data.credits) == null ? void 0 : _d.cast) == null ? void 0 : _e.slice(0, 10)) || [];
  const collection = isMovie ? data.belongs_to_collection : null;
  const seasons = !isMovie ? data.seasons : [];
  return /* @__PURE__ */ jsx(Layout, {
    children: /* @__PURE__ */ jsxs("div", {
      className: "relative",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "relative h-[70vh] md:h-[80vh] w-full",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "absolute inset-0",
          children: [/* @__PURE__ */ jsx("img", {
            src: backdropUrl,
            alt: title,
            className: "h-full w-full object-cover"
          }), /* @__PURE__ */ jsx("div", {
            className: "absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent"
          }), /* @__PURE__ */ jsx("div", {
            className: "absolute inset-0 bg-gradient-to-r from-dark via-transparent to-transparent"
          })]
        }), /* @__PURE__ */ jsx("button", {
          onClick: () => navigate(-1),
          className: "absolute top-4 left-4 z-10 p-2 bg-dark/80 hover:bg-dark rounded-full transition-colors",
          "aria-label": "Go back",
          children: /* @__PURE__ */ jsx(HiChevronLeft, {
            className: "w-6 h-6 text-white"
          })
        }), /* @__PURE__ */ jsx("div", {
          className: "absolute inset-0 flex items-end",
          children: /* @__PURE__ */ jsx("div", {
            className: "w-full px-4 pb-12 md:px-8 lg:px-12 md:pb-16",
            children: /* @__PURE__ */ jsxs("div", {
              className: "max-w-4xl",
              children: [/* @__PURE__ */ jsx("h1", {
                className: "text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg",
                children: title
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex items-center gap-4 text-sm md:text-base mb-6 text-white/90",
                children: [data.vote_average > 0 && /* @__PURE__ */ jsxs("span", {
                  className: "flex items-center gap-1 font-semibold",
                  children: [/* @__PURE__ */ jsx("span", {
                    className: "text-yellow-500",
                    children: "★"
                  }), data.vote_average.toFixed(1)]
                }), /* @__PURE__ */ jsx("span", {
                  children: releaseYear
                }), isMovie && data.runtime && /* @__PURE__ */ jsx("span", {
                  children: formatRuntime(data.runtime)
                }), !isMovie && data.number_of_seasons && /* @__PURE__ */ jsxs("span", {
                  children: [data.number_of_seasons, " Seasons"]
                })]
              }), genres.length > 0 && /* @__PURE__ */ jsx("div", {
                className: "flex flex-wrap gap-2 mb-6",
                children: genres.map((genre) => /* @__PURE__ */ jsx("span", {
                  className: "px-3 py-1 bg-dark-card/80 rounded-full text-sm text-white/90",
                  children: genre.name
                }, genre.id))
              }), /* @__PURE__ */ jsxs("div", {
                className: "flex flex-wrap gap-3",
                children: [/* @__PURE__ */ jsx(Link, {
                  to: ROUTES.WATCH(type, contentId),
                  children: /* @__PURE__ */ jsxs(Button, {
                    variant: "primary",
                    size: "lg",
                    className: "gap-2",
                    children: [/* @__PURE__ */ jsx(HiPlay, {
                      className: "w-5 h-5"
                    }), "Play"]
                  })
                }), trailer && /* @__PURE__ */ jsx(Button, {
                  variant: "secondary",
                  size: "lg",
                  onClick: () => setShowTrailer(true),
                  children: "Watch Trailer"
                }), /* @__PURE__ */ jsx(Button, {
                  variant: "icon",
                  className: "!p-3",
                  children: /* @__PURE__ */ jsx(HiPlus, {
                    className: "w-6 h-6"
                  })
                })]
              })]
            })
          })
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "px-4 md:px-8 lg:px-12 py-8 space-y-12",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "max-w-4xl",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-2xl font-bold text-white mb-4",
            children: "Overview"
          }), /* @__PURE__ */ jsx("p", {
            className: "text-lg text-text-secondary leading-relaxed",
            children: data.overview || "No overview available."
          }), cast.length > 0 && /* @__PURE__ */ jsxs("div", {
            className: "mt-6",
            children: [/* @__PURE__ */ jsx("h3", {
              className: "text-lg font-semibold text-white mb-3",
              children: "Cast"
            }), /* @__PURE__ */ jsx("div", {
              className: "flex flex-wrap gap-2",
              children: cast.map((actor) => /* @__PURE__ */ jsxs("span", {
                className: "text-text-secondary",
                children: [actor.name, actor !== cast[cast.length - 1] && ","]
              }, actor.id))
            })]
          })]
        }), collection && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-2xl font-bold text-white mb-6",
            children: collection.name
          }), /* @__PURE__ */ jsx("div", {
            className: "flex gap-4 overflow-x-auto pb-4 hide-scrollbar",
            children: /* @__PURE__ */ jsx("div", {
              className: "w-48 flex-shrink-0",
              children: /* @__PURE__ */ jsx("img", {
                src: getImageUrl(collection.poster_path, "w342"),
                alt: collection.name,
                className: "w-full rounded-lg"
              })
            })
          })]
        }), !isMovie && seasons.length > 0 && /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsxs("div", {
            className: "flex items-center justify-between mb-6",
            children: [/* @__PURE__ */ jsx("h2", {
              className: "text-2xl font-bold text-white",
              children: "Episodes"
            }), /* @__PURE__ */ jsx("select", {
              value: selectedSeason,
              onChange: (e) => setSelectedSeason(Number(e.target.value)),
              className: "px-4 py-2 bg-dark-card border border-gray-700 rounded-md text-white",
              children: seasons.map((season) => /* @__PURE__ */ jsxs("option", {
                value: season.season_number,
                children: ["Season ", season.season_number]
              }, season.id))
            })]
          }), /* @__PURE__ */ jsxs("p", {
            className: "text-text-secondary",
            children: [((_f = seasons.find((s) => s.season_number === selectedSeason)) == null ? void 0 : _f.episode_count) || 0, " episodes"]
          })]
        }), similar.length > 0 && /* @__PURE__ */ jsx(ContentRow, {
          title: "More Like This",
          items: similar,
          showSeeAll: false
        })]
      }), trailer && /* @__PURE__ */ jsx(Modal, {
        isOpen: showTrailer,
        onClose: () => setShowTrailer(false),
        size: "xl",
        showCloseButton: false,
        children: /* @__PURE__ */ jsx("div", {
          className: "relative pt-[56.25%]",
          children: /* @__PURE__ */ jsx("iframe", {
            className: "absolute inset-0 w-full h-full",
            src: `https://www.youtube.com/embed/${trailer.key}?autoplay=1`,
            title: trailer.name,
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true
          })
        })
      })]
    })
  });
});
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: detail_$type_$id,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  onProgress,
  startTime = 0
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const progressInterval = useRef();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hlsRef.current = hls;
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play();
          if (startTime > 0) video.currentTime = startTime;
        });
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        if (autoPlay) video.play();
        if (startTime > 0) video.currentTime = startTime;
      }
    } else {
      video.src = src;
      if (autoPlay) video.play();
      if (startTime > 0) video.currentTime = startTime;
    }
  }, [src, autoPlay, startTime]);
  useEffect(() => {
    if (isPlaying && onProgress) {
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          onProgress(videoRef.current.currentTime, videoRef.current.duration);
        }
      }, 5e3);
      return () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
      };
    }
  }, [isPlaying, onProgress]);
  useEffect(() => {
    let timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3e3);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };
  const progress = duration > 0 ? currentTime / duration * 100 : 0;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "relative w-full h-full bg-black group",
      onMouseMove: () => setShowControls(true),
      onMouseLeave: () => isPlaying && setShowControls(false),
      children: [
        /* @__PURE__ */ jsx(
          "video",
          {
            ref: videoRef,
            className: "w-full h-full",
            poster,
            onTimeUpdate: handleTimeUpdate,
            onLoadedMetadata: handleLoadedMetadata,
            onPlay: () => setIsPlaying(true),
            onPause: () => setIsPlaying(false),
            onClick: togglePlay
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "absolute inset-0 bg-gradient-to-t from-black via-transparent to-black transition-opacity duration-300",
              showControls || !isPlaying ? "opacity-100" : "opacity-0"
            ),
            children: [
              !isPlaying && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: togglePlay,
                  className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all",
                  children: /* @__PURE__ */ jsx(HiPlay, { className: "w-10 h-10 text-white ml-2" })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "absolute bottom-0 left-0 right-0 p-4 space-y-2", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "range",
                    min: "0",
                    max: duration || 0,
                    value: currentTime,
                    onChange: handleSeek,
                    className: "w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0",
                    style: {
                      background: `linear-gradient(to right, #E50914 0%, #E50914 ${progress}%, #4B5563 ${progress}%, #4B5563 100%)`
                    }
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx("button", { onClick: togglePlay, className: "text-white hover:text-primary transition-colors", children: isPlaying ? /* @__PURE__ */ jsx(HiPause, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(HiPlay, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => skip(-10),
                      className: "text-white text-sm hover:text-primary transition-colors",
                      children: "-10s"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => skip(10),
                      className: "text-white text-sm hover:text-primary transition-colors",
                      children: "+10s"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("button", { onClick: toggleMute, className: "text-white hover:text-primary transition-colors", children: isMuted || volume === 0 ? /* @__PURE__ */ jsx(HiVolumeOff, { className: "w-6 h-6" }) : /* @__PURE__ */ jsx(HiVolumeUp, { className: "w-6 h-6" }) }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "range",
                        min: "0",
                        max: "1",
                        step: "0.1",
                        value: isMuted ? 0 : volume,
                        onChange: handleVolumeChange,
                        className: "w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-white text-sm", children: [
                    formatTime(currentTime),
                    " / ",
                    formatTime(duration)
                  ] })
                ] }) })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function meta({
  params
}) {
  return [{
    title: `Watch - StreamFlix`
  }];
}
const watch_$type_$id = UNSAFE_withComponentProps(function Watch() {
  const {
    type,
    id,
    season,
    episode
  } = useParams();
  const navigate = useNavigate();
  const {
    updateProgress: updateProgress2,
    getProgress
  } = useContinueWatching();
  const [streamUrl, setStreamUrl] = useState("");
  const isMovie = type === "movie";
  const contentId = Number(id);
  const seasonNum = season ? Number(season) : void 0;
  const episodeNum = episode ? Number(episode) : void 0;
  const {
    data: movieData,
    isLoading: movieLoading
  } = useMovieDetails(contentId, {
    enabled: isMovie
  });
  const {
    data: tvData,
    isLoading: tvLoading
  } = useTVDetails(contentId, {
    enabled: !isMovie
  });
  const data = isMovie ? movieData : tvData;
  const isLoading = movieLoading || tvLoading;
  const progress = getProgress(contentId, type, seasonNum, episodeNum);
  const startTime = progress ? progress.progress_seconds : 0;
  useEffect(() => {
    const demoUrl = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    setStreamUrl(demoUrl);
  }, [contentId, type, seasonNum, episodeNum]);
  const handleProgress = async (currentTime, duration) => {
    if (!data) return;
    const title2 = isMovie ? data.title : data.name;
    const posterPath = data.poster_path || "";
    const backdropPath = data.backdrop_path || void 0;
    await updateProgress2({
      tmdb_id: contentId,
      type,
      season: seasonNum,
      episode: episodeNum,
      progress_seconds: currentTime,
      duration_seconds: duration,
      metadata: {
        title: title2,
        poster_path: posterPath,
        backdrop_path: backdropPath
      }
    });
  };
  const handleBack = () => {
    navigate(ROUTES.DETAIL(type, contentId));
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", {
      className: "fixed inset-0 flex items-center justify-center bg-dark",
      children: /* @__PURE__ */ jsx(Spinner, {
        size: "lg"
      })
    });
  }
  if (!streamUrl) {
    return /* @__PURE__ */ jsxs("div", {
      className: "fixed inset-0 flex flex-col items-center justify-center bg-dark",
      children: [/* @__PURE__ */ jsx(Spinner, {
        size: "lg"
      }), /* @__PURE__ */ jsx("p", {
        className: "mt-4 text-text-secondary",
        children: "Loading stream..."
      })]
    });
  }
  const title = isMovie ? data == null ? void 0 : data.title : data == null ? void 0 : data.name;
  const backdropUrl = getBackdropUrl(data == null ? void 0 : data.backdrop_path, "original");
  return /* @__PURE__ */ jsxs("div", {
    className: "fixed inset-0 bg-black",
    children: [/* @__PURE__ */ jsx("button", {
      onClick: handleBack,
      className: "absolute top-4 left-4 z-50 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors",
      "aria-label": "Go back",
      children: /* @__PURE__ */ jsx(HiChevronLeft, {
        className: "w-6 h-6 text-white"
      })
    }), /* @__PURE__ */ jsx(VideoPlayer, {
      src: streamUrl,
      poster: backdropUrl,
      autoPlay: true,
      startTime,
      onProgress: handleProgress
    }), /* @__PURE__ */ jsx("div", {
      className: "absolute top-4 left-16 right-4 z-40 pointer-events-none",
      children: /* @__PURE__ */ jsxs("h1", {
        className: "text-2xl font-bold text-white drop-shadow-lg",
        children: [title, !isMovie && seasonNum && episodeNum && /* @__PURE__ */ jsxs("span", {
          className: "text-lg ml-2",
          children: ["S", seasonNum, ":E", episodeNum]
        })]
      })
    })]
  });
});
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: watch_$type_$id,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-zYSDrDc8.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/index-B4kw1FQh.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/root-D3DDZcP9.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/index-B4kw1FQh.js", "/assets/queryClient-Cl4QybsW.js", "/assets/AuthContext-ptcK52gC.js", "/assets/MyListContext-5igJ5HcZ.js", "/assets/ContinueWatchingContext-YOydi_Rh.js", "/assets/authService-DrHcuxuP.js"], "css": ["/assets/root-CLyTZxBO.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/login": { "id": "routes/login", "parentId": "root", "path": "login", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/login-C7aZgjZ-.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/authService-DrHcuxuP.js", "/assets/Button-BY9HOT0q.js", "/assets/Input-DDT7X6mM.js", "/assets/constants-BUH_e5Fg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-CJwq7QFX.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/constants-BUH_e5Fg.js", "/assets/AuthContext-ptcK52gC.js", "/assets/Button-BY9HOT0q.js", "/assets/ContentRow-BkpTUu6A.js", "/assets/Layout-RATiDw-i.js", "/assets/Spinner-SIkNXKuu.js", "/assets/queryClient-Cl4QybsW.js", "/assets/authService-DrHcuxuP.js", "/assets/ContentCard-DyUPJMvH.js", "/assets/MyListContext-5igJ5HcZ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/search": { "id": "routes/search", "parentId": "root", "path": "search", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/search-CEuvFRvG.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/constants-BUH_e5Fg.js", "/assets/Layout-RATiDw-i.js", "/assets/Input-DDT7X6mM.js", "/assets/ContentCard-DyUPJMvH.js", "/assets/Spinner-SIkNXKuu.js", "/assets/queryClient-Cl4QybsW.js", "/assets/AuthContext-ptcK52gC.js", "/assets/authService-DrHcuxuP.js", "/assets/MyListContext-5igJ5HcZ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/discover": { "id": "routes/discover", "parentId": "root", "path": "discover", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/discover-Jylx6UTe.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/Layout-RATiDw-i.js", "/assets/ContentCard-DyUPJMvH.js", "/assets/Spinner-SIkNXKuu.js", "/assets/queryClient-Cl4QybsW.js", "/assets/constants-BUH_e5Fg.js", "/assets/AuthContext-ptcK52gC.js", "/assets/authService-DrHcuxuP.js", "/assets/MyListContext-5igJ5HcZ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/my-list": { "id": "routes/my-list", "parentId": "root", "path": "my-list", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/my-list-BsgRtiAw.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/Layout-RATiDw-i.js", "/assets/ContentCard-DyUPJMvH.js", "/assets/Button-BY9HOT0q.js", "/assets/constants-BUH_e5Fg.js", "/assets/AuthContext-ptcK52gC.js", "/assets/authService-DrHcuxuP.js", "/assets/MyListContext-5igJ5HcZ.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/settings": { "id": "routes/settings", "parentId": "root", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/settings-BidL0EB0.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/Layout-RATiDw-i.js", "/assets/Button-BY9HOT0q.js", "/assets/authService-DrHcuxuP.js", "/assets/constants-BUH_e5Fg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/detail.$type.$id": { "id": "routes/detail.$type.$id", "parentId": "root", "path": "detail/:type/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/detail._type._id-BsONUUcd.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/constants-BUH_e5Fg.js", "/assets/Layout-RATiDw-i.js", "/assets/Button-BY9HOT0q.js", "/assets/Spinner-SIkNXKuu.js", "/assets/ContentRow-BkpTUu6A.js", "/assets/index-B4kw1FQh.js", "/assets/queryClient-Cl4QybsW.js", "/assets/AuthContext-ptcK52gC.js", "/assets/ContentCard-DyUPJMvH.js", "/assets/MyListContext-5igJ5HcZ.js", "/assets/authService-DrHcuxuP.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/watch.$type.$id": { "id": "routes/watch.$type.$id", "parentId": "root", "path": "watch/:type/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/watch._type._id-D808xHio.js", "imports": ["/assets/chunk-4WY6JWTD-sCzo2NUW.js", "/assets/constants-BUH_e5Fg.js", "/assets/ContinueWatchingContext-YOydi_Rh.js", "/assets/queryClient-Cl4QybsW.js", "/assets/AuthContext-ptcK52gC.js", "/assets/Spinner-SIkNXKuu.js", "/assets/authService-DrHcuxuP.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-fda3c30e.js", "version": "fda3c30e", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/login": {
    id: "routes/login",
    parentId: "root",
    path: "login",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route2
  },
  "routes/search": {
    id: "routes/search",
    parentId: "root",
    path: "search",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/discover": {
    id: "routes/discover",
    parentId: "root",
    path: "discover",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/my-list": {
    id: "routes/my-list",
    parentId: "root",
    path: "my-list",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/settings": {
    id: "routes/settings",
    parentId: "root",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/detail.$type.$id": {
    id: "routes/detail.$type.$id",
    parentId: "root",
    path: "detail/:type/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/watch.$type.$id": {
    id: "routes/watch.$type.$id",
    parentId: "root",
    path: "watch/:type/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
