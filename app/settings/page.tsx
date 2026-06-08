"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Bell, 
  Users, 
  Settings as SettingsIcon, 
  Trash2, 
  ShieldAlert, 
  Mail, 
  Tag, 
  Globe,
  Plus
} from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { toast } from "sonner";
import { useAuth } from "../../lib/hooks/useAuth";
import { Avatar } from "@/components/ui/custom-avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "../../lib/utils";

type SettingsTab = "profile" | "notifications" | "team" | "stages-tags" | "danger";

export default function SettingsPage() {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  
  // Profile Form States
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Invite Team States
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);

  // Tags States
  const [newTag, setNewTag] = useState("");
  const [tagsList, setTagsList] = useState(["VIP", "Enterprise", "Follow-up", "Seed", "Partner", "Tech"]);

  // Danger zone Dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.displayName || "");
      setPhotoUrl(userProfile.photoURL || "");
      setTimezone(userProfile.timezone || "UTC");
    }
  }, [userProfile]);

  useEffect(() => {
    // Listen to users collection for Team member listing
    const unsubscribe = onSnapshot(collection(db, "users"), (snap) => {
      const list: any[] = [];
      snap.forEach((doc) => {
        list.push(doc.data());
      });
      setTeamUsers(list);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Display name cannot be empty.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        displayName: name,
        photoURL: photoUrl,
        timezone: timezone,
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    // Mock invitation delay
    setTimeout(() => {
      toast.success(`Invitation successfully sent to "${inviteEmail}"!`);
      setInviteEmail("");
      setIsInviting(false);
    }, 1000);
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const cleaned = newTag.trim();
    if (tagsList.includes(cleaned)) {
      toast.error("Tag already exists.");
      return;
    }
    setTagsList([...tagsList, cleaned]);
    setNewTag("");
    toast.success(`Tag "${cleaned}" added.`);
  };

  const handleDeleteTag = (tag: string) => {
    setTagsList(tagsList.filter((t) => t !== tag));
    toast.success(`Tag "${tag}" removed.`);
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion is disabled for safety in this version.");
    setIsDeleteOpen(false);
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "team", label: "Team Members", icon: Users },
    { id: "stages-tags", label: "Pipeline & Tags", icon: SettingsIcon },
    { id: "danger", label: "Danger Zone", icon: ShieldAlert },
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col md:flex-row h-full min-h-[500px] overflow-hidden select-none">
      
      {/* Settings Navigation Column */}
      <aside className="w-full md:w-56 bg-sidebar border-b md:border-b-0 md:border-r border-border shrink-0 p-4 space-y-1 select-none">
        <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
          CRM Settings
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-secondary-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Settings Panel Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* PANEL: Profile */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-bold text-foreground">Profile Settings</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your account details and settings.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Account Email (read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ""}
                  className="w-full bg-muted border border-border text-muted-foreground px-3 py-2 rounded-md text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-background border border-border text-foreground px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT+1)</option>
                  <option value="Asia/Kolkata">Kolkata (IST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isSavingProfile && (
                  <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                )}
                <span>Save Changes</span>
              </button>
            </form>

            {/* Developer utilities: Only render in development mode */}
            {typeof window !== "undefined" && (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEV_MODE === "true" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && (
              <div className="border border-border rounded-md p-4 bg-muted/20 mt-6 max-w-lg">
                <h4 className="text-sm font-bold text-foreground">Developer Utilities</h4>
                <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                  Populate your workspace with realistic mock companies, contacts, deals, and activities.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!user?.uid) {
                      toast.error("User session not found.");
                      return;
                    }
                    const toastId = toast.loading("Seeding mock CRM data...");
                    try {
                      const res = await fetch(`/api/seed?uid=${user.uid}`);
                      const data = await res.json();
                      if (data.success) {
                        toast.success("Database seeded successfully!", { id: toastId });
                      } else {
                        toast.error(data.error || "Failed to seed database.", { id: toastId });
                      }
                    } catch (err) {
                      toast.error("Failed to seed database.", { id: toastId });
                    }
                  }}
                  className="px-4 py-2 bg-secondary text-foreground hover:bg-accent border border-border font-semibold rounded-md text-sm cursor-pointer shadow-sm"
                >
                  Seed Mock CRM Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* PANEL: Notifications (UI Only) */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-bold text-foreground">Notification Preferences</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure when and where you want to receive alerts (UI demonstration).
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="border border-border rounded-md p-4 space-y-4 bg-muted/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-foreground block">Email Notifications</span>
                    <span className="text-xs text-muted-foreground">Receive daily digests of task reminders</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <span className="text-sm font-semibold text-foreground block">In-App Alerts</span>
                    <span className="text-xs text-muted-foreground">Show popup toasts for task deadlines</span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  />
                </div>
              </div>
              
              <button
                onClick={() => toast.success("Preferences updated (mock update).")}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:opacity-90 shadow-sm cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* PANEL: Team Members List */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-bold text-foreground">Team &amp; Invitations</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invite team members and view CRM users in your workspace.
              </p>
            </div>

            {/* Invite Form */}
            <form onSubmit={handleInviteUser} className="flex gap-3 max-w-md">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isInviting}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
              >
                Invite
              </button>
            </form>

            {/* Registered Users List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Active CRM Users ({teamUsers.length})
              </h4>
              
              <div className="divide-y divide-border border border-border rounded-lg max-w-lg">
                {teamUsers.map((member) => (
                  <div key={member.uid} className="p-3 flex items-center gap-3">
                    <Avatar
                      name={member.displayName || "User"}
                      avatarUrl={member.photoURL}
                      size="sm"
                    />
                    <div>
                      <span className="font-bold text-foreground text-xs block">
                        {member.displayName || "Unregistered User"}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {member.email}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL: Pipeline Stages & Tags */}
        {activeTab === "stages-tags" && (
          <div className="space-y-6">
            {/* Deal Stages order list */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Pipeline Deal Stages (UI drag placeholder)
              </h3>
              <div className="space-y-2 max-w-xs font-semibold text-xs text-secondary-foreground">
                {["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"].map((stage, i) => (
                  <div key={stage} className="p-2 border border-border bg-muted/40 rounded flex items-center gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags Manager */}
            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Global Tag Manager
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Configure tags for sorting contacts and deals.
                </p>
              </div>

              {/* Tag creation input */}
              <div className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="Add custom tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 bg-background border border-border text-foreground px-2 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-primary text-primary-foreground font-semibold rounded-md text-xs hover:opacity-90 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Tags grid */}
              <div className="flex flex-wrap gap-2 max-w-md">
                {tagsList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary"
                  >
                    <Tag className="h-3 w-3 text-primary/80" />
                    <span>{tag}</span>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="text-muted-foreground hover:text-red-500 font-bold ml-1 cursor-pointer focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PANEL: Danger Zone */}
        {activeTab === "danger" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Destructive account management options.
              </p>
            </div>

            <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-5 bg-red-50/10 max-w-md space-y-4">
              <div>
                <span className="text-sm font-bold text-foreground block">Delete CRM Workspace Account</span>
                <span className="text-xs text-muted-foreground block mt-1">
                  Permanently delete all workspace data (contacts, deals, activities, and corporate configurations).
                </span>
              </div>
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md text-sm transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Danger Account Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete CRM Workspace Account"
        description="Are you absolutely sure you want to delete your CRM Account? This will destroy all pipeline opportunities, log records, and profiles, and CANNOT be restored."
        confirmText="Permanently Delete Workspace"
        cancelText="Cancel"
      />
    </div>
  );
}
