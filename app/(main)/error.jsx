"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border-2 border-stone-200 p-8 rounded-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-stone-900 mb-2">
            Something went wrong
          </h1>

          <p className="text-stone-600 mb-6">
            We encountered an error while loading this page. This might be a
            temporary issue.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => reset()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Link href="/dashboard">
              <Button
                variant="outline"
                className="border-2 border-stone-300 w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && error?.message && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
