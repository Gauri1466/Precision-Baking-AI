import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  return (
    <header className="flex flex-col items-center mb-8">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary mb-4">
        <Avatar className="w-full h-full">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80" 
            alt="Profile Picture" 
          />
          <AvatarFallback className="text-2xl bg-primary/20 text-primary">PB</AvatarFallback>
        </Avatar>
      </div>
      <h1 className="font-heading text-3xl font-bold text-center mb-2">Precision Baking</h1>
      <p className="text-center text-gray-700 max-w-md mb-4">
        Perfect measurements for perfect baking results. Explore my social links and try the recipe converter!
      </p>
      <div className="flex items-center justify-center space-x-3 mb-6">
        <span className="flex items-center text-sm">
          <i className="ri-cake-3-line text-primary mr-1"></i>
          <span>Baker</span>
        </span>
        <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
        <span className="flex items-center text-sm">
          <i className="ri-map-pin-line text-primary mr-1"></i>
          <span>New York</span>
        </span>
      </div>
    </header>
  );
}
