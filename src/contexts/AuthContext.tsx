import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { buildRoleList, getPrimaryRole, normalizeRole } from "@/lib/authRoles";

type AppRole = Database["public"]["Enums"]["app_role"];

type Profile = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean | null;
  email?: string | null;
  role?: AppRole | null;
  bio?: string | null;
  phone?: string | null;
  country?: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  refreshAll: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const clearAuthState = () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
  };

  const ensureUserRecords = async (authUser: User) => {
    const fullName =
      typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name.trim()
        ? authUser.user_metadata.full_name.trim()
        : typeof authUser.user_metadata?.name === "string" && authUser.user_metadata.name.trim()
          ? authUser.user_metadata.name.trim()
          : authUser.email?.split("@")[0] ?? "User";

    const requestedRole = normalizeRole(
      authUser.user_metadata?.requested_role ?? authUser.user_metadata?.role ?? authUser.user_metadata?.account_type
    );
    const avatarUrl =
      typeof authUser.user_metadata?.avatar_url === "string"
        ? authUser.user_metadata.avatar_url
        : typeof authUser.user_metadata?.picture === "string"
          ? authUser.user_metadata.picture
          : null;

    const { data: existingProfile, error: profileLookupError } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, email, role, onboarding_completed")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (profileLookupError) {
      console.error("ensureUserRecords profile lookup error:", profileLookupError);
    }

    const shouldPromoteRole = requestedRole !== "learner" && (!existingProfile?.role || existingProfile.role === "learner");
    const profilePayload: Record<string, any> = {
      user_id: authUser.id,
      email: authUser.email ?? existingProfile?.email ?? null,
      full_name: existingProfile?.full_name?.trim() ? existingProfile.full_name : fullName,
      avatar_url: existingProfile?.avatar_url || avatarUrl,
      onboarding_completed: existingProfile?.onboarding_completed ?? false,
      status: "active",
    };

    if (!existingProfile || shouldPromoteRole) {
      profilePayload.role = requestedRole;
    }

    const { error: upsertProfileError } = await supabase.from("profiles").upsert(profilePayload as any, {
      onConflict: "user_id",
    });

    if (upsertProfileError) {
      console.error("ensureUserRecords upsert profile error:", upsertProfileError);
    }

    const { data: existingRoles, error: rolesLookupError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", authUser.id);

    if (rolesLookupError) {
      console.error("ensureUserRecords roles lookup error:", rolesLookupError);
      return;
    }

    const roleList = buildRoleList(existingRoles?.map((item) => item.role) ?? [], requestedRole || existingProfile?.role);
    if (!roleList.includes(requestedRole)) {
      roleList.unshift(requestedRole);
    }

    for (const role of Array.from(new Set(roleList))) {
      const { error: createRoleError } = await supabase.from("user_roles").upsert(
        {
          user_id: authUser.id,
          role,
        } as any,
        { onConflict: "user_id,role" }
      );

      if (createRoleError) {
        console.error("ensureUserRecords create role error:", createRoleError);
      }
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "user_id, full_name, avatar_url, onboarding_completed, email, role, bio, phone, country"
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("fetchProfile error:", error);
      setProfile(null);
      return;
    }

    setProfile((data as Profile | null) ?? null);
  };

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("fetchRoles error:", error);
      setRoles([]);
      return;
    }

    const nextRoles = (data?.map((item) => item.role).filter(Boolean) ?? []) as AppRole[];
    setRoles(nextRoles);
  };

  const syncAuthState = async (nextSession: Session | null) => {
    setSession(nextSession ?? null);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setProfile(null);
      setRoles([]);
      return;
    }

    await ensureUserRecords(nextSession.user);
    await Promise.allSettled([
      fetchProfile(nextSession.user.id),
      fetchRoles(nextSession.user.id),
    ]);
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchProfile(user.id);
  };

  const refreshRoles = async () => {
    if (!user?.id) return;
    await fetchRoles(user.id);
  };

  const refreshAll = async () => {
    if (!user?.id) return;
    await Promise.allSettled([fetchProfile(user.id), fetchRoles(user.id)]);
  };

  const logout = async () => {
    setLoading(true);
    clearAuthState();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("logout error:", error);
    }

    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("getSession error:", error);
      }

      if (!mounted) return;

      await syncAuthState(session ?? null);

      if (mounted) {
        setLoading(false);
      }
    };

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        clearAuthState();
        setLoading(false);
        return;
      }

      await syncAuthState(session ?? null);

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const primaryRole = useMemo<AppRole>(() => getPrimaryRole(roles, profile?.role), [roles, profile?.role]);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      roles,
      primaryRole,
      loading,
      refreshProfile,
      refreshRoles,
      refreshAll,
      logout,
    }),
    [user, session, profile, roles, primaryRole, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
