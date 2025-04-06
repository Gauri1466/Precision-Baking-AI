interface FeaturedRecipeCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

export default function FeaturedRecipeCard({ title, description, imageUrl }: FeaturedRecipeCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-neutral-200 h-full flex flex-col">
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
        />
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-700 mb-3 flex-grow">{description}</p>
        <a href="#" className="inline-flex items-center text-primary font-medium text-sm mt-auto">
          View Recipe <i className="ri-arrow-right-line ml-1"></i>
        </a>
      </div>
    </div>
  );
}
