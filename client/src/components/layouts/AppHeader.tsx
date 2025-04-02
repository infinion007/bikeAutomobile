import { useState } from "react";
import { useLocation } from "wouter";

interface AppHeaderProps {
  toggleSideNav: () => void;
  toggleSearch: () => void;
  searchOpen: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function AppHeader({ 
  toggleSideNav, 
  toggleSearch, 
  searchOpen,
  searchTerm,
  setSearchTerm
}: AppHeaderProps) {
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="bg-primary text-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleSideNav}
            className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span className="material-icons">menu</span>
          </button>
          <h1 className="text-xl font-bold">AutoShop Manager</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleSearch}
            className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span className="material-icons">search</span>
          </button>
          <button className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white">
            <span className="material-icons">account_circle</span>
          </button>
        </div>
      </div>
      
      {searchOpen && (
        <div className="px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              placeholder="Search customers or vehicles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 rounded-md text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <span className="material-icons absolute left-2 top-2 text-neutral-600">search</span>
          </form>
        </div>
      )}
    </header>
  );
}
