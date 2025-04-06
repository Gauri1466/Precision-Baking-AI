import { useState } from "react";
import Header from "@/components/Header";
import MeasurementConverter from "../components/MeasurementConverter";
import Footer from "@/components/Footer";

export default function MeasurementPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Header />
      
      <div className="my-8">
        <h1 className="text-3xl font-bold text-center mb-2">Cooking Measurement Converter</h1>
        <p className="text-center text-gray-600 mb-8">
          Convert any cooking measurement with precision using our AI-powered tool
        </p>
        
        <MeasurementConverter />
      </div>
      
      <Footer />
    </div>
  );
}