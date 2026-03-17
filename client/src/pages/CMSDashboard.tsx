import { useState } from "react";
import { LogOut, FileText, Settings, BookOpen, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CMSEditor from "./CMSEditor";
import CMSPages from "../components/CMSPages";
import CMSBlog from "../components/CMSBlog";
import CMSSEO from "../components/CMSSEO";

export default function CMSDashboard() {
  const [activeTab, setActiveTab] = useState("content");

  const handleLogout = async () => {
    try {
      await fetch("/api/cms/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (error) {
      toast.error("Erro ao desconectar");
    }
  };

  const tabs = [
    { id: "content", label: "Conteúdo", icon: FileText },
    { id: "pages", label: "Páginas", icon: BookOpen },
    { id: "blog", label: "Blog", icon: Globe },
    { id: "seo", label: "SEO", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Oranje" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-[#004D40]">CMS Oranje</h1>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? "text-[#E65100] border-b-2 border-[#E65100]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "content" && (
              <CMSEditor />
            )}

            {activeTab === "pages" && (
              <CMSPages />
            )}

            {activeTab === "blog" && (
              <CMSBlog />
            )}

            {activeTab === "seo" && (
              <CMSSEO />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
