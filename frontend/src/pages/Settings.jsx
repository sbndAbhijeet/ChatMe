import { useEffect, useState } from "react";
import { useAuth } from "../hooks/AuthContext";
import { useError } from "../hooks/ErrorContext";
import { getCurrentUserProfile, saveOpenRouterApiKey } from "../api/userApi";

const Settings = () => {
  const { userId } = useAuth();
  const { showError } = useError();

  const [profile, setProfile] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const res = await getCurrentUserProfile();
      setLoading(false);

      if (!res.status) {
        showError(res.error || "Unable to load settings");
        return;
      }

      setProfile(res.data);
    };

    loadProfile();
  }, [showError]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!apiKey.trim()) {
      showError("Please enter your OpenRouter API key");
      return;
    }

    setSaving(true);
    const res = await saveOpenRouterApiKey(apiKey.trim());
    setSaving(false);

    if (!res.status) {
      showError(res.error || "Failed to save API key");
      return;
    }

    setApiKey("");
    setProfile((prev) => ({
      ...(prev || {}),
      has_openrouter_api_key: true,
    }));
  };

  return (
    <div className="min-h-full bg-[#F2E3BC]/10 p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-[#96BBBB]/30 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-[#414535] mb-2">Settings</h1>
        <p className="text-sm text-[#414535]/70 mb-6">
          Add your OpenRouter API key so chat requests use your own key.
        </p>

        <div className="mb-6 rounded-lg bg-[#F2E3BC]/40 px-4 py-3 text-sm text-[#414535]">
          <div><span className="font-semibold">User:</span> {profile?.email || userId || "Unknown"}</div>
          <div>
            <span className="font-semibold">API key status:</span>{" "}
            {loading ? "Loading..." : profile?.has_openrouter_api_key ? "Saved" : "Not set"}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#414535] mb-1">
              OpenRouter API key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full rounded-lg border border-[#96BBBB]/40 px-3 py-2 outline-none focus:ring-2 focus:ring-[#618985]/40"
            />
            <p className="mt-2 text-xs text-[#414535]/60">
              This will be stored against your account and used for your chat requests.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="bg-[#618985] hover:bg-[#96BBBB] text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save API key"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
