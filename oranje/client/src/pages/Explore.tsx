import { useParams } from "react-router-dom";
import CategoryList from "./CategoryList";
import CategoryDetail from "./CategoryDetail";

export default function Explore() {
  const { slug } = useParams<{ slug?: string }>();


  if (slug) {
    return <CategoryDetail slug={slug} />;
  }

  return <CategoryList />;
}
