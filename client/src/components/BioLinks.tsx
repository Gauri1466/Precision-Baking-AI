import { useQuery } from "@tanstack/react-query";
import SocialCard from "./SocialCard";
import FeaturedRecipeCard from "./FeaturedRecipeCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BioLinks() {
  const { data: socialLinks, isLoading: isLoadingSocialLinks } = useQuery({
    queryKey: ["/api/social-links"],
  });

  const { data: featuredRecipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ["/api/recipes", { featured: true }],
  });

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-4">
        {isLoadingSocialLinks ? (
          // Loading skeletons for social links
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="social-card">
              <CardContent className="p-5 flex items-center">
                <Skeleton className="w-12 h-12 rounded-full mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Render actual social links
          socialLinks?.map((link: any) => (
            <SocialCard
              key={link.id}
              platform={link.platform}
              username={link.username}
              icon={link.iconClass}
              bgColorClass={link.bgColorClass}
              url={link.url}
            />
          ))
        )}
      </div>
      
      {/* Featured Content */}
      <div className="mt-8">
        <h2 className="font-heading text-2xl font-bold mb-4">Featured Recipes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {isLoadingRecipes ? (
            // Loading skeletons for featured recipes
            Array(2).fill(0).map((_, i) => (
              <Card key={i}>
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))
          ) : (
            // Render actual featured recipes
            featuredRecipes?.map((recipe: any) => (
              <FeaturedRecipeCard
                key={recipe.id}
                title={recipe.title}
                description={recipe.description}
                imageUrl={recipe.imageUrl}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
