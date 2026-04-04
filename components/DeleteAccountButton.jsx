"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { deleteUserAccount, getUserDataSummary } from "@/actions/user.actions";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteAccountButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSummary, setDataSummary] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { signOut } = useClerk();

  const handleOpenDialog = async () => {
    setIsOpen(true);
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
    setIsLoading(true);
    setError(null);

    try {
      await deleteUserAccount();
      
      // Sign out and redirect to home
      await signOut();
      router.push("/");
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenDialog}
        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 size={18} />
        <span>Delete Account</span>
      </button>

      {isOpen && (
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
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? (
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
    </>
  );
}
