import { useParams } from "react-router-dom";
import CategoryList from "./CategoryList";
import CategoryDetail from "./CategoryDetail";

export default function Explore() {
  const { slug } = useParams<{ slug?: string }>();

  console.log("[EXPLORE] render", { hash: window.location.hash, slug });

  if (slug) {
    return <CategoryDetail slug={slug} />;
  }

  return <CategoryList />;
}
