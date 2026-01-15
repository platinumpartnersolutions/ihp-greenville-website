import { useParams } from "wouter";
import { getCategoryBySlug, getServiceBySlug } from "@/data/services";
import CategoryPage from "./category";
import ServicePage from "./service";

export default function ServiceRouter() {
  const { slug } = useParams<{ slug: string }>();
  
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Page not found</p>
      </div>
    );
  }

  const category = getCategoryBySlug(slug);
  if (category) {
    return <CategoryPage />;
  }

  const service = getServiceBySlug(slug);
  if (service) {
    return <ServicePage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Page not found</p>
    </div>
  );
}
