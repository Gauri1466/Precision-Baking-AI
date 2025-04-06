import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChefHat, Scale, Camera, Receipt, ArrowRight, UtensilsCrossed, Sparkles,
  Utensils, Cookie, Cake, Egg, Apple, Croissant, Sandwich, Soup, Gauge, Wheat
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  // Animation states for floating ingredients
  const [floatingElements, setFloatingElements] = useState<Array<{
    id: number;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    icon: number;
  }>>([]);

  // Animation parameters
  const icons = [
    <ChefHat className="text-primary" />,
    <Scale className="text-blue-500" />,
    <UtensilsCrossed className="text-amber-500" />,
    <Receipt className="text-green-500" />,
    <Camera className="text-purple-500" />,
    <Sparkles className="text-pink-500" />,
    <Utensils className="text-red-500" />,
    <Cookie className="text-yellow-600" />,
    <Cake className="text-pink-400" />,
    <Egg className="text-gray-300" />,
    <Apple className="text-red-400" />,
    <Croissant className="text-yellow-500" />,
    <Sandwich className="text-amber-400" />,
    <Soup className="text-orange-500" />,
    <Gauge className="text-blue-400" />,
    <Wheat className="text-yellow-400" />
  ];

  // Generate floating elements on mount
  useEffect(() => {
    const elements = [];
    // Create more elements for a fuller background
    for (let i = 0; i < 30; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100, // Distribute across the entire width
        y: Math.random() * 100, // Distribute across the entire height
        rotation: Math.random() * 360,
        scale: 0.3 + Math.random() * 1.2, // Make some smaller for better layering
        icon: Math.floor(Math.random() * icons.length)
      });
    }
    setFloatingElements(elements);
  }, []);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const cardHoverVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: 'spring', stiffness: 400, damping: 10 }
    }
  };

  return (
    <>
      {/* Floating background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {floatingElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute opacity-10 select-none"
            style={{ 
              left: `${el.x}%`, 
              top: `${el.y}%`,
              fontSize: `${el.scale * 35}px`
            }}
            animate={{
              x: [0, Math.random() * 60 - 30, 0],
              y: [0, Math.random() * 60 - 30, 0],
              rotate: [0, el.rotation, 0],
              scale: [1, 1 + Math.random() * 0.3, 1],
              opacity: [0.08, 0.15, 0.08]
            }}
            transition={{
              duration: 15 + Math.random() * 15,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror"
            }}
          >
            {icons[el.icon]}
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        <Header />
        
        {/* Hero Section with Animations */}
        <motion.section 
          className="py-16 text-center relative"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Animated circle backgrounds */}
          <motion.div 
            className="absolute -z-10 w-64 h-64 rounded-full bg-primary/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />

          <motion.div 
            className="absolute -z-10 w-96 h-96 rounded-full bg-blue-400/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />

          <motion.h1 
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent relative"
            variants={itemVariants}
          >
            <span className="block">PreciseBaker</span>
            <motion.span 
              className="text-2xl md:text-3xl block mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Your Ultimate Recipe Assistant
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Transform your cooking experience with AI-powered recipe conversion, 
            generation, and measurement precision
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            variants={itemVariants}
          >
            <Link href="/recipe">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all">
                <motion.span 
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Find & Convert Recipes <ArrowRight className="ml-2 h-4 w-4" />
                </motion.span>
              </Button>
            </Link>
            <Link href="/measurement">
              <Button size="lg" variant="outline" className="border-2 shadow-lg hover:shadow-xl transition-all">
                <motion.span 
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  Convert Measurements <Scale className="ml-2 h-4 w-4" />
                </motion.span>
              </Button>
            </Link>
          </motion.div>
        </motion.section>
        
        {/* Features Section with Animated Cards */}
        <motion.section 
          className="py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-4"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Powered by AI
          </motion.h2>
          
          <motion.p 
            className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience the perfect blend of precision and creativity with our advanced AI-powered tools
          </motion.p>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              whileHover="hover"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <motion.div variants={cardHoverVariants}>
                <Card className="shadow-md h-full border-t-4 border-t-primary overflow-hidden">
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Receipt className="h-8 w-8 text-primary" />
                    </motion.div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      Recipe Management
                    </CardTitle>
                    <CardDescription className="text-base">
                      Find, convert, and create amazing recipes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          ✓
                        </div>
                        Generate recipes from ingredient lists
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          ✓
                        </div>
                        Extract recipes from photos
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          ✓
                        </div>
                        Convert between volume and weight
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          ✓
                        </div>
                        Scale recipes to any serving size
                      </motion.li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/recipe" className="w-full">
                      <Button variant="default" className="w-full bg-primary">
                        <motion.span 
                          className="flex items-center justify-center w-full"
                          whileHover={{ x: 5 }}
                        >
                          Try Recipe Tools <ArrowRight className="ml-2 h-4 w-4" />
                        </motion.span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
            
            <motion.div 
              whileHover="hover"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div variants={cardHoverVariants}>
                <Card className="shadow-md h-full border-t-4 border-t-blue-500 overflow-hidden">
                  <CardHeader className="pb-2">
                    <motion.div 
                      className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Scale className="h-8 w-8 text-blue-500" />
                    </motion.div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      Precision Measurement
                    </CardTitle>
                    <CardDescription className="text-base">
                      Perfect measurements every time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          ✓
                        </div>
                        Convert any kitchen measurement
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          ✓
                        </div>
                        Ingredient-specific density calculations
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          ✓
                        </div>
                        Humidity and altitude adjustments
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                          ✓
                        </div>
                        Professional baker mode
                      </motion.li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link href="/measurement" className="w-full">
                      <Button variant="default" className="w-full bg-blue-500 hover:bg-blue-600">
                        <motion.span 
                          className="flex items-center justify-center w-full"
                          whileHover={{ x: 5 }}
                        >
                          Try Measurement Tools <ArrowRight className="ml-2 h-4 w-4" />
                        </motion.span>
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
        
        {/* How It Works Section with Staggered Animations */}
        <motion.section 
          className="py-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-center mb-4"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          
          <motion.p 
            className="text-center text-gray-600 max-w-2xl mx-auto mb-12"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Three simple steps to transform your cooking experience
          </motion.p>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-8 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-24 left-[calc(16.67%+8px)] right-[calc(16.67%+8px)] h-0.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500 z-0"></div>
            
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-center p-8 rounded-lg bg-white shadow-xl border border-gray-100">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-blue-400 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  1
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Capture or Input</h3>
                <p className="text-gray-600">
                  Upload a recipe photo or enter ingredients you want to convert or transform
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-center p-8 rounded-lg bg-white shadow-xl border border-gray-100">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  animate={{ 
                    boxShadow: ['0 0 0 0 rgba(79, 70, 229, 0.2)', '0 0 0 15px rgba(79, 70, 229, 0)', '0 0 0 0 rgba(79, 70, 229, 0)'] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.5 
                  }}
                >
                  2
                </motion.div>
                <h3 className="text-xl font-bold mb-2">AI Processing</h3>
                <p className="text-gray-600">
                  Our AI analyzes your input and works its magic with precision
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="text-center p-8 rounded-lg bg-white shadow-xl border border-gray-100">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  3
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Get Perfect Results</h3>
                <p className="text-gray-600">
                  Enjoy your precisely converted or generated recipe with confidence
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>
        
        {/* Call to Action */}
        <motion.section 
          className="py-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10 p-10 rounded-2xl relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            {/* Animated background elements */}
            <motion.div 
              className="absolute top-0 left-0 w-20 h-20 bg-primary/20 rounded-full blur-3xl"
              animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <motion.div 
              className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
              animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <h2 className="text-3xl font-bold mb-4 relative z-10">Ready to Transform Your Cooking?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto relative z-10">
              Start using PreciseBaker today and experience the perfect blend of precision and creativity
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative z-10"
            >
              <Link href="/recipe">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-xl">
                  Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
        
        <Footer />
      </div>
    </>
  );
}
