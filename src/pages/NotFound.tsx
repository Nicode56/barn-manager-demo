import React from "react";
import { Link } from "react-router-dom";

export const NotFound: React.FC = () => (
  <div className="p-8 text-center">
    <h1 className="text-4xl font-bold mb-4 page-title-banner mx-auto">Page Not Found</h1>
    <p className="mb-6 text-lg wood-text-box mx-auto">The page you’re looking for doesn’t exist.</p>
    <Link to="/" className="inline-block rounded-md bg-slate-800 px-4 py-2 text-white">
      Return home
    </Link>
  </div>
);
