import { useParams, useNavigate, Link } from "react-router-dom";
import { trpc } from "@/lib/trpc";
import SiteLayout from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";

export default function SiteBlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: article, isLoading, error } = trpc.articles.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">Carregando artigo...</p>
        </div>
      </SiteLayout>
    );
  }

  if (error || !article) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#004D40] mb-4">Artigo não encontrado</h1>
            <Button
              onClick={() => navigate("/blog")}
              className="bg-[#E65100] hover:bg-[#D84500]"
            >
              Voltar ao Blog
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Header */}
      <section className="bg-gradient-to-b from-[#004D40] to-[#00251A] text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            onClick={() => navigate("/blog")}
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-4 font-montserrat">{article.title}</h1>
          <div className="flex flex-wrap gap-4 text-gray-200">
            {article.category && (
              <span className="bg-[#E65100] px-3 py-1 rounded text-sm">
                {article.category}
              </span>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                {article.publishedAt &&
                  new Date(article.publishedAt).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {article.coverImageUrl && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <article className="prose prose-lg max-w-none">
            <div
              className="text-gray-700 leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .split("\n")
                  .map((line: string) => {
                    if (line.startsWith("# ")) {
                      return `<h1 class="text-4xl font-bold text-[#004D40] mt-8 mb-4">${line.substring(2)}</h1>`;
                    }
                    if (line.startsWith("## ")) {
                      return `<h2 class="text-3xl font-bold text-[#004D40] mt-6 mb-3">${line.substring(3)}</h2>`;
                    }
                    if (line.startsWith("### ")) {
                      return `<h3 class="text-2xl font-bold text-[#004D40] mt-4 mb-2">${line.substring(4)}</h3>`;
                    }
                    if (line.startsWith("- ")) {
                      return `<li class="ml-6">${line.substring(2)}</li>`;
                    }
                    if (line.trim() === "") {
                      return "<br />";
                    }
                    return `<p>${line}</p>`;
                  })
                  .join(""),
              }}
            />
          </article>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-bold text-[#004D40] mb-4 flex items-center gap-2">
              <Share2 size={18} />
              Compartilhe este artigo
            </h3>
            <div className="flex gap-3">
              <Button
                asChild
                variant="outline"
                className="border-[#E65100] text-[#E65100]"
              >
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#E65100] text-[#E65100]"
              >
                <a
                  href={`https://twitter.com/intent/tweet?url=${window.location.href}&text=${article.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#E65100] text-[#E65100]"
              >
                <a
                  href={`https://wa.me/?text=${article.title} ${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-[#F5F5DC] rounded-lg border-2 border-[#E65100]">
            <h3 className="text-2xl font-bold text-[#004D40] mb-4">
              Quer explorar mais Holambra?
            </h3>
            <p className="text-gray-700 mb-6">
              Baixe o app Oranje e tenha acesso a todos os lugares, eventos e roteiros da cidade.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#E65100] hover:bg-[#D84500]"
            >
              <Link to="/app">Abrir App</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
