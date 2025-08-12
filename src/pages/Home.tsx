import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-6">
        <h1 className="text-5xl font-bold mb-8 text-gray-600">Elliott's Prototypes</h1>
        <p className="text-xl text-gray-600 mb-12">Choose a prototype to explore</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Curious Claude Prototype */}
          <div className="prototype-card flex flex-col">
            <div className="prototype-screenshot">
              <img 
                src="/curious-claude-screenshot.png" 
                alt="Curious Claude Screenshot" 
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  // Fallback if screenshot doesn't exist
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-48 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg mb-4 flex items-center justify-center';
                  fallback.innerHTML = '<span class="text-white text-lg font-semibold">Curious Claude</span>';
                  img.parentNode?.insertBefore(fallback, img);
                }}
              />
            </div>
            <p className="text-gray-600 mb-6 flex-grow">An AI learning companion that helps you explore topics with guided questions and personalized learning paths.</p>
            <Link 
              to="/curious"
              className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg mt-auto block text-center"
            >
              Launch Simulator
            </Link>
          </div>

          {/* Absence Navigator */}
          <div className="prototype-card flex flex-col">
            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">Absence Navigator</span>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">Navigate the complex world of bureaucratic processes and paperwork in this interactive simulation.</p>
            <Link 
              to="/absense"
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg mt-auto block text-center"
            >
              Launch Simulator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}