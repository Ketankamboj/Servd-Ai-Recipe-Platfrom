"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { deleteUserAccount, getUserDataSummary } from "@/actions/user.actions";
import { Trash2, AlertTriangle, Loader2, ArrowLeft, User, Shield } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataSummary, setDataSummary] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleOpenDeleteDialog = async () => {
    setShowDeleteDialog(true);
    setError(null);
    
    try {
      const result = await getUserDataSummary();
      if (result.success) {
        setDataSummary(result.data);
      }
    } catch (err) {
      console.error("Failed to get data summary:", err);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteUserAccount();
      await signOut();
      router.push("/");
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-stone-600 hover:text-orange-600 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-stone-800">Settings</h1>
          <p className="text-stone-600 mt-2">Manage your account settings</p>
        </div>

        {/* Account Info Section */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-stone-600" size={24} />
            <h2 className="text-xl font-semibold text-stone-800">Account Information</h2>
          </div>
          <div className="space-y-3 text-stone-600">
            <p><span className="font-medium">Email:</span> {user?.primaryEmailAddress?.emailAddress}</p>
            <p><span className="font-medium">Name:</span> {user?.fullName || "Not set"}</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-red-600" size={24} />
            <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
          </div>
          
          <p className="text-stone-600 mb-4">
            Once you delete your account, there is no going back. All your data including recipes, 
            pantry items, and saved recipes will be permanently deleted.
          </p>

          <button
            onClick={handleOpenDeleteDialog}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertTriangle size={28} />
              <h2 className="text-xl font-bold">Delete Account</h2>
            </div>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>

            {dataSummary && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800 mb-2">
                  The following data will be permanently deleted:
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>- {dataSummary.pantryItems} pantry items</li>
                  <li>- {dataSummary.savedRecipes} saved recipes</li>
                  <li>- {dataSummary.recipes} created recipes</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
