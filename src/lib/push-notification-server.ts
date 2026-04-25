import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export type PushNotificationPreferences = {
  notify_new_catch: boolean;
  notify_new_achievement: boolean;
  notify_new_all_time_high: boolean;
};

export const defaultPushNotificationPreferences: PushNotificationPreferences = {
  notify_new_catch: true,
  notify_new_achievement: true,
  notify_new_all_time_high: true,
};

export type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
};

type PushSupabaseDatabase = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string | null;
          is_active: boolean | null;
          is_admin: boolean | null;
          is_super_admin: boolean | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      catches: {
        Row: {
          id: string;
          caught_for: string | null;
          fish_type: string | null;
          fine_fish_type: string | null;
          weight_g: number | null;
          status: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          member_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          user_agent: string | null;
          notify_new_catch: boolean;
          notify_new_achievement: boolean;
          notify_new_all_time_high: boolean;
          is_active: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          endpoint: string;
          p256dh_key: string;
          auth_key: string;
          user_agent?: string | null;
          notify_new_catch?: boolean;
          notify_new_achievement?: boolean;
          notify_new_all_time_high?: boolean;
          is_active?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          endpoint?: string;
          p256dh_key?: string;
          auth_key?: string;
          user_agent?: string | null;
          notify_new_catch?: boolean;
          notify_new_achievement?: boolean;
          notify_new_all_time_high?: boolean;
          is_active?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type PushSupabaseClient = SupabaseClient<PushSupabaseDatabase>;

export type PushMemberContext = {
  userId: string;
  member: {
    id: string;
    name: string | null;
    is_active: boolean | null;
    is_admin: boolean | null;
    is_super_admin: boolean | null;
  } | null;
  supabase: PushSupabaseClient;
};

function getRequiredSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return { supabaseUrl, supabaseAnonKey };
}

function getRequiredServiceRoleEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return { supabaseUrl, serviceRoleKey };
}

export function createPushServiceRoleSupabaseClient(): PushSupabaseClient | null {
  const env = getRequiredServiceRoleEnv();

  if (!env) {
    return null;
  }

  return createClient<PushSupabaseDatabase>(
    env.supabaseUrl,
    env.serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export function getRequiredVapidEnv() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    return null;
  }

  return {
    publicKey,
    privateKey,
    subject,
  };
}

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function createPushSupabaseClient(token: string): PushSupabaseClient {
  const { supabaseUrl, supabaseAnonKey } = getRequiredSupabaseEnv();

  return createClient<PushSupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export function normalizePushPreferences(
  value: Record<string, unknown> | null | undefined
): PushNotificationPreferences {
  return {
    notify_new_catch:
      typeof value?.notify_new_catch === "boolean"
        ? value.notify_new_catch
        : defaultPushNotificationPreferences.notify_new_catch,
    notify_new_achievement:
      typeof value?.notify_new_achievement === "boolean"
        ? value.notify_new_achievement
        : defaultPushNotificationPreferences.notify_new_achievement,
    notify_new_all_time_high:
      typeof value?.notify_new_all_time_high === "boolean"
        ? value.notify_new_all_time_high
        : defaultPushNotificationPreferences.notify_new_all_time_high,
  };
}

export async function getAuthenticatedPushMemberContext(
  request: Request
): Promise<PushMemberContext | null> {
  const token = getBearerToken(request);

  if (!token) {
    return null;
  }

  const supabase = createPushSupabaseClient(token);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return null;
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, name, is_active, is_admin, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  return {
    userId: user.id,
    member:
      member && typeof member === "object"
        ? {
            id: String(member.id),
            name: typeof member.name === "string" ? member.name : null,
            is_active:
              typeof member.is_active === "boolean" ? member.is_active : null,
            is_admin:
              typeof member.is_admin === "boolean" ? member.is_admin : null,
            is_super_admin:
              typeof member.is_super_admin === "boolean"
                ? member.is_super_admin
                : null,
          }
        : null,
    supabase,
  };
}